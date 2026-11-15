'use strict';
/* Spielkern von Marktrausch (ohne Grafik, testbar): Laden, Kunden, Personal, Wirtschaft, Tagesablauf. */
const Sim = (() => {
  const D = typeof Data !== 'undefined' ? Data : require('./data.js');
  const DAYLEN = 600, MIN_PER_SEC = 1.2, DOW = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], RAMP_MAX = 18, rampMax = S => RAMP_MAX + 10 * S.objs.filter(o => o.k === 'lager').length, dayLen = S => S.up && S.up.spaet ? 700 : DAYLEN;
  let R = Math.random;
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1)), pick = a => a[Math.floor(R() * a.length)], clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const wpick = (items, wf) => { let t = 0; const w = items.map(i => { const x = Math.max(0, wf(i)); t += x; return x; }); if (t <= 0) return null; let x = R() * t; for (let i = 0; i < items.length; i++) { x -= w[i]; if (x <= 0) return items[i]; } return items[items.length - 1]; };
  const P = D.PRODUCTS, lvlNeed = l => Math.round(150 * Math.pow(l, 1.7));
  const GRIDS = new WeakMap();   // abgeleitete Laufgitter (nicht gespeichert)

  // ---------- Aufbau ----------
  function emptyDay() { return { rev: 0, cogs: 0, items: 0, served: 0, lost: 0, happy: 0, recipes: 0, stolen: 0, spawned: 0, units: {}, revBy: {}, miss: 0 }; }
  function create() {
    const S = { v: 1, day: 1, t: 0, simT: 0, phase: 'prep', money: 200000, xp: 0, level: 1, rep: 55, W: 18, H: 12, exp: 0, nid: 1, objs: [], ramp: [], backlog: [], orders: [], price: {}, mkt: {}, cf: {}, riv: {}, lic: {}, up: {}, staff: [], customers: [], police: [], fx: [], messes: [], regs: [], inv: [], loan: 0,
      player: { x: 3.5, y: 9.5, vx: 0, vy: 0, carry: [], yaw: 0 }, weather: 'sonne', forecast: 'sonne', rivalSale: null, ev: [], radio: { on: true, genre: 'pop', ads: {} }, quests: [], today: emptyDay(), hist: [], summary: null, wish: {}, heat: [], spawnAcc: 0, closeT: 0, ccount: 0, log: [], autoOpen: false, strike: false, blackout: false, bestRev: 0, totalRev: 0, stars: 0, shopName: 'Marktrausch', slogan: 'Frisch · Fair · Freundlich', signCol: '#0f2b5a', named: false, buzz: 0, assist: true, hints: true, promo: {}, cart: {}, rules: {}, floor: 'fliese', wall: 'beige', own: { floor: { fliese: true }, wall: { beige: true } }, reviews: [], ach: {}, tot: { recipes: 0, caught: 0, served: 0, refused: 0, viol: 0, paper: 0, mis: 0, pre: 0 }, paper: 0, cardManual: true, loose: [], wh: { lvl: 0, list: [0, 1] } };
    Object.keys(D.CATS).forEach(c => { if (D.CATS[c].cost === 0) S.lic[c] = true; });
    Object.values(P).forEach(p => { S.mkt[p.id] = 1; S.cf[p.id] = 1; S.riv[p.id] = .97; S.price[p.id] = Math.round(p.ref * 1.12 / 5) * 5; });
    add(S, 'ramp', 1, 1); add(S, 'container', 4, 1); add(S, 'pc', 2, 4); add(S, 'obst', 5, 2); add(S, 'obst', 8, 2); add(S, 'regal', 11, 2); add(S, 'kuehl', 14, 2); add(S, 'regal', 5, 6); add(S, 'kasse', 11, 7); add(S, 'radio', 15, 5);
    const set = (o, p, q) => { o.p = p; o.qty = q; o.age = 0; }, ob = byKind(S, 'obst'), rg = byKind(S, 'regal'); set(ob[0], 'apfel', 14); set(ob[1], 'broetchen', 18); set(rg[0], 'wasser', 12); set(byKind(S, 'kuehl')[0], 'milch', 8);
    ['banane', 'limo', 'wasser', 'milch', 'broetchen', 'apfel'].forEach(p => S.ramp.push({ p, n: P[p].box, age: 0 }));
    S.objs.forEach(o => { if (isShelf(o) && o.p) { o.tag = true; o.tagp = effPrice(S, o); } }); S.heat = new Array(S.W * S.H).fill(0); rebuild(S); newQuests(S); rollDeals(S); S.pre = []; S.forecast = rollWeather(0); S.weather = 'sonne'; note(S, 'Willkommen bei Marktrausch! Bestelle Ware im Markt und fülle die Regale.', 'info');
    return extDefaults(S);
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
  const wholesale = (S, p) => Math.max(5, Math.round(P[p].cost * S.cf[p] * (S.deals && S.deals[p] ? S.deals[p] : 1)));
  const trend = (S, p) => S.mktPrev && S.mktPrev[p] ? S.mkt[p] / S.mktPrev[p] - 1 : 0;
  const rival = (S, p) => Math.round(ref(S, p) * S.riv[p] * (S.rivalSale && S.rivalSale === P[p].cat ? .82 : 1) * (S.rv && S.rv.k === 'kopie' && S.rv.p === p ? .85 : 1));
  const effPrice = (S, o) => Math.max(1, Math.round(S.price[o.p] * (o.disc ? .7 : 1) * (S.promo[o.p] ? .8 : 1)));
  const offered = S => { const m = {}; S.objs.forEach(o => { if (isShelf(o) && o.p && o.qty > 0) m[o.p] = (m[o.p] || 0) + o.qty; }); return m; };

  // ---------- Wetter, Märkte, Tageswechsel ----------
  function season(S, day) {
    const dd = (day == null ? S.day : day) - 1, i = Math.floor((dd % 112) / 28), d = dd % 28 + 1, sn = D.SEASONS[i], h = sn.hol && d >= sn.hol.from && d <= sn.hol.to ? sn.hol : null; return { i, d, n: sn.n, e: sn.e, hol: h, prod: sn.prod };
  }
  function rollWeather(si) { const w = D.SEASONS[si || 0].w; return wpick(Object.keys(w), x => w[x]); }
  function newQuests(S) { S.quests = []; const ids = D.QUESTS.slice().sort(() => R() - .5).slice(0, 3); ids.forEach(q => { const n = ri(q.n[0], q.n[1]); S.quests.push({ id: q.id, n: q.div ? Math.round(n / 10) * 10 : n, done: false }); }); }
  function questVal(S, q) { const d = D.QUESTS.find(x => x.id === q.id), v = S.today[d.key] || 0; return d.div ? Math.floor(v / d.div) : v; }
  // Großhandel-Angebote des Tages (3 Waren mit Rabatt) und Kunden-Vorbestellungen
  function rollDeals(S) { S.deals = {}; Object.keys(P).filter(p => S.lic[P[p].cat]).sort(() => R() - .5).slice(0, 3).forEach(p => { S.deals[p] = [.7, .75, .8][ri(0, 2)]; }); }
  const PRE_NAMES = ['Kita Sonnenschein', 'Sportverein Blau-Weiß', 'Familie Krause', 'Café Eckbank', 'Seniorentreff Lindenhof', 'Grillclub Glut', 'Schule am Park', 'Hochzeit Yilmaz', 'Büro Pixelwerk', 'Frau Özdemir'];
  function rollPre(S) {
    S.pre = (S.pre || []).filter(o => { if (S.day > o.due) { S.rep = clamp(S.rep - 1.5, 5, 100); note(S, `📋 Vorbestellung von ${o.name} verpasst – der Kunde ist enttäuscht.`, 'bad'); return false; } return true; });
    if (S.day < 2 || S.pre.length >= 2 || R() > .5) return; const ps = Object.keys(offered(S)).filter(p => !S.pre.some(o => o.p === p)); if (!ps.length) return; const p = pick(ps), n = P[p].box * ri(1, S.level > 5 ? 3 : 2);
    S.pre.push({ id: S.nid++, p, n, name: pick(PRE_NAMES), pay: Math.round(ref(S, p) * n * (1.3 + R() * .25)), due: S.day + 1 }); note(S, `📋 Neue Vorbestellung: ${P[p].e} ${n}× ${P[p].name} bis morgen Abend (unter „Ziele“).`, 'good');
  }
  const preStock = (S, p) => S.objs.filter(o => isShelf(o) && o.p === p).reduce((a, o) => a + o.qty, 0) + S.ramp.concat(S.loose || []).filter(b => b.p === p && !b.empty).reduce((a, b) => a + b.n, 0);
  function preDeliver(S, id) {
    const o = (S.pre || []).find(x => x.id === id); if (!o || preStock(S, o.p) < o.n) return false; let need = o.n;
    S.ramp = S.ramp.filter(b => { if (!need || b.p !== o.p) return true; const k = Math.min(need, b.n); b.n -= k; need -= k; return b.n > 0; });
    (S.loose || []).slice().sort((a, b) => b.h - a.h).forEach(b => { if (!need || b.p !== o.p || b.empty) return; const k = Math.min(need, b.n); b.n -= k; need -= k; if (b.n <= 0) removeLoose(S, b); });
    S.objs.forEach(sh => { if (need && isShelf(sh) && sh.p === o.p) { const k = Math.min(need, sh.qty); sh.qty -= k; need -= k; } });
    S.money += o.pay; S.today.rev += o.pay; S.today.cogs += wholesale(S, o.p) * o.n; S.xp += 25; S.rep = clamp(S.rep + 1, 5, 100); S.tot.pre = (S.tot.pre || 0) + 1; S.pre = S.pre.filter(x => x !== o); S.fx.push({ t: 'cash' }); note(S, `📋 ${o.name} hat die Bestellung abgeholt: +${D.fmt(o.pay)}`, 'good'); return true;
  }
  function nextDay(S) {
    S.police = []; S.fx = []; S.paper = 0; S.day++; S.t = 0; S.phase = 'prep'; S.summary = null; S.customers = []; S.closeT = 0; S.spawnAcc = 0; S.today = emptyDay(); S.weather = S.forecast; S.forecast = rollWeather(season(S, S.day + 1).i); S.promo = {}; S.rivalSale = null; S.ev = []; S.blackout = false; S.radio.ads = {};
    S.mktPrev = Object.assign({}, S.mkt); Object.keys(P).forEach(p => { S.mkt[p] = clamp(S.mkt[p] + (R() - .5) * .08 + (1 - S.mkt[p]) * .25, .88, 1.18); S.cf[p] = clamp(S.cf[p] + (R() - .5) * .06 + (1 - S.cf[p]) * .3, .9, 1.12); S.riv[p] = clamp(.9 + R() * .12 + (S.level > 4 ? -.02 : 0), .86, 1.04); });
    if (R() < .22) S.ev.push({ k: 'ausflug', t0: 150, t1: 260 }); if (R() < .15) S.ev.push({ k: 'stromausfall', t0: 200, t1: 320 }); if (R() < .15) S.ev.push({ k: 'promi', t0: 220, t1: 221 });
    if (R() < .14) { const t0 = ri(120, 460); S.ev.push({ k: 'kontrolle', t0, t1: t0 + 1 }); } if (R() < .15) { S.rivalSale = pick(Object.keys(D.CATS).filter(c => S.lic[c])); S.ev.push({ k: 'rivalsale', t0: 0, t1: 600 }); }
    if (S.strike) { S.strike = false; note(S, 'Lieferstreik! Heute kam nichts an – die Bestellung kommt morgen.', 'bad'); } else deliver(S, 'day');
    if (R() < .1 && S.level > 2) { S.strike = true; S.ev.push({ k: 'streik', t0: 0, t1: 0 }); }
    bake(S); flush(S); newQuests(S); rollDeals(S); rollPre(S); if (S.up.auto) autoOrder(S); S.buzz *= .85; S.player.carry.forEach(b => b.age = (b.age || 0)); S.heat = S.heat.map(h => h * .5);
    const sz = season(S); note(S, `Tag ${S.day} (${DOW[(S.day - 1) % 7]}) · ${sz.e} ${sz.n}: ${D.WEATHER[S.weather].name}.`, 'info'); if (sz.hol && (sz.d === sz.hol.from)) note(S, `${sz.hol.e} ${sz.hol.n} beginnt! Die Kunden wollen besondere Ware – stock rechtzeitig auf.`, 'good'); else if (season(S, S.day + 1).hol && !sz.hol) note(S, `${season(S, S.day + 1).hol.e} Morgen beginnt die ${season(S, S.day + 1).hol.n}.`, 'info');
    extDay(S);
  }
  function bake(S) {
    S.objs.forEach(o => { if (D.OBJ[o.k].bake && o.p) { const n = cap(S, o) - o.qty, cost = Math.round(wholesale(S, o.p) * .5) * n; if (n > 0 && S.money >= cost) { S.money -= cost; o.age = (o.age * o.qty) / Math.max(1, o.qty + n); o.qty += n; if (!S.today.baked) S.today.baked = 0; S.today.baked += cost; } } });
  }
  function deliver(S, when) { S.orders = S.orders.filter(o => { if (o.when !== when && !(when === 'express' && o.when === 'express' && S.simT >= o.eta)) return true; if (when === 'express' && S.simT < o.eta) return true; for (let i = 0; i < o.boxes; i++) S.backlog.push({ p: o.p, n: P[o.p].box, age: 0 }); return false; }); }
  function flush(S) { while (S.backlog.length && S.ramp.length < rampMax(S)) S.ramp.push(S.backlog.shift()); }
  // ---------- Bestell-PC: Warenkorb, Lagerübersicht, Nachbestell-Regeln ----------
  const unitsOf = (S, p) => S.objs.filter(o => isShelf(o) && o.p === p).reduce((a, o) => a + o.qty, 0) + S.ramp.concat(S.backlog, S.player.carry, S.p2 ? S.p2.carry : [], S.loose || []).filter(b => b.p === p && !b.empty).reduce((a, b) => a + b.n, 0) + S.orders.filter(o => o.p === p).reduce((a, o) => a + o.boxes * P[p].box, 0);
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
    const T = S.today, bills = [], waste = []; let wasteVal = 0, expN = 0; extRette(S);
    S.objs.forEach(o => { if (!isShelf(o) || !o.p) return; const pr = P[o.p]; o.age += 1; if (pr.life && o.age > pr.life && o.qty > 0) { if (o.exp) { wasteVal += o.qty * wholesale(S, o.p); waste.push(pr.name + ' ×' + o.qty); S.rep = clamp(S.rep - 2, 5, 100); o.qty = 0; o.age = 0; o.exp = false; o.disc = false; } else { o.exp = true; expN++; } } else if (!o.qty) o.exp = false; });
    S.ramp = S.ramp.filter(b => { b.age++; const l = P[b.p].life; if (l && b.age > l) { wasteVal += b.n * wholesale(S, b.p); waste.push(P[b.p].name + ' ×' + b.n); return false; } return true; });
    (S.loose || []).slice().sort((a, b) => b.h - a.h).forEach(b => { if (b.empty) return; b.age = (b.age || 0) + 1; const l = P[b.p].life; if (l && b.age > l) { wasteVal += b.n * wholesale(S, b.p); waste.push(P[b.p].name + ' ×' + b.n); removeLoose(S, b); } });
    bills.push(['Miete', rent(S)], ['Strom', power(S)]); if (S.objs.some(o => o.k === 'container')) bills.push(['Müllabfuhr', 500]); const wages = S.staff.reduce((a, s) => a + wageOf(s), 0); if (wages) bills.push(['Löhne', wages]); if (S.loan) bills.push(['Zinsen', Math.round(S.loan * .03)]);
    const ins = S.ev.find(e => e.k === 'inspektion'); if (ins && S.messes.length > 2) bills.push(['Hygiene-Strafe', 5000 * (S.messes.length - 2)]); extEnd(S, bills, waste, v => { wasteVal += v; });
    const tot = bills.reduce((a, b) => a + b[1], 0); S.money -= tot; const profit = T.rev - T.cogs - tot - wasteVal - T.stolen;
    const done = []; S.quests.forEach(q => { const d = D.QUESTS.find(x => x.id === q.id), v = questVal(S, q); q.ok = d.max ? (v <= q.n && T.served >= 10) : v >= q.n; if (q.ok) { S.money += d.r; S.xp += 40; done.push(d.t.replace('{n}', q.n) + ' (+' + D.fmt(d.r) + ')'); } });
    S.xp += Math.max(0, Math.round(profit / 120)); let lv = 0; while (S.xp >= lvlNeed(S.level) && S.level < 20) { S.level++; lv++; }
    S.hist.push({ d: S.day, rev: T.rev, profit, cust: T.served }); if (S.hist.length > 14) S.hist.shift(); S.totalRev += T.rev; S.bestRev = Math.max(S.bestRev, T.rev);
    const top = Object.keys(T.units).sort((a, b) => T.units[b] - T.units[a]).slice(0, 3).map(p => P[p].e + ' ' + P[p].name + ' ×' + T.units[p]);
    const ach = checkAch(S); S.summary = { ext: Object.assign({ exp: expN }, T.ext || {}), ach, day: S.day, rev: T.rev, cogs: T.cogs, bills, waste, wasteVal, stolen: T.stolen, profit, served: T.served, lost: T.lost, items: T.items, top, done, lv, level: S.level, stars: stars(S) }; S.phase = 'summary';
    S.customers = []; S.messes = S.messes.slice(0, 2);
  }
  const stars = S => Math.round(S.rep / 20 * 10) / 10;
  const ACHK = { tag1: S => S.day >= 1 && S.hist.length >= 1, stufe5: S => S.level >= 5, stufe10: S => S.level >= 10, umsatz500: S => S.bestRev >= 50000, umsatz2000: S => S.bestRev >= 200000, team3: S => S.staff.length >= 3, ruf4: S => S.rep >= 80, rezept10: S => S.tot.recipes >= 10, dieb5: S => S.tot.caught >= 5, anbau2: S => S.exp >= 2, radio: S => !!S.up.radio, stamm25: S => S.regs.length >= 25, buzz: S => S.buzz >= .2, jugend5: S => S.tot.refused >= 5, recycling: S => S.tot.paper >= 50, kunden1000: S => S.tot.served >= 1000, reich: S => S.money >= 1000000, pre10: S => (S.tot.pre || 0) >= 10, retter: S => S.tot.saved >= 50, regional: S => S.tot.stall >= 200, kaffee: S => S.tot.cafe >= 300, wunsch: S => S.tot.wishes >= 15, platzhirsch: S => S.rv.share >= .65, siegel: S => S.tot.siegel >= 3, koop: S => S.tot.koop >= 1, team: S => S.staff.filter(s => s.k !== 'robo' && s.mood > 80).length >= 3 };
  function checkAch(S) { const out = []; D.ACH.forEach(a => { if (!S.ach[a[0]] && ACHK[a[0]](S)) { S.ach[a[0]] = true; S.money += a[4]; out.push(a[2] + ' ' + a[1] + ' (+' + D.fmt(a[4]) + ')'); } }); return out; }
  const achDone = S => D.ACH.filter(a => S.ach[a[0]]).length;

  // ---------- Spawnen & Kunden ----------
  const curve = t => .55 + .45 * (Math.exp(-(((t - 230) / 110) ** 2)) + Math.exp(-(((t - 440) / 90) ** 2)));
  function demandMul(S, p) {
    const pr = P[p], w = D.WEATHER[S.weather], sz = season(S); let m = pr.pop * (w.cat[pr.cat] || 1) * ((w.prod && w.prod[p]) || 1) * (sz.prod[p] || 1) * (sz.hol && sz.hol.prod[p] || 1) * (S.promo[p] ? 1.8 : 1) * (S.t > DAYLEN ? (pr.cat === 'alk' ? 1.7 : pr.cat === 'snack' ? 1.3 : 1) : 1); if (S.radio.on && S.up.radio && S.radio.ads[p]) m *= 2.6; return m;
  }
  function spawnRate(S) {
    const off = offered(S), n = Object.keys(off).length; if (!n) return 0; let sum = 0, cnt = 0; Object.keys(off).forEach(p => { sum += S.price[p] / ref(S, p); cnt++; }); const idx = sum / cnt;
    const ap = clamp(1 + (1.05 - idx) * 1.5, .5, 1.35), as = clamp(.45 + .05 * n, .45, 1.9), dow = [1, 1, 1, 1.05, 1.15, 1.4, .85][(S.day - 1) % 7], deko = 1 + Math.min(10, byKind(S, 'deko').length) * .02, size = .85 + S.W * S.H / 216 * .15;
    const ev = S.ev.find(e => e.k === 'ausflug' && S.t >= e.t0 && S.t <= e.t1) ? 1.5 : 1; const clean = 1 - Math.min(.3, S.messes.length * .04);
    return (.16 + .016 * S.level) * curve(S.t) * (.55 + S.rep / 100 * .9) * ap * as * dow * deko * size * D.WEATHER[S.weather].spawn * (S.up.neon ? 1.15 : 1) * (1 + (D.FLOORS[S.floor || 'fliese'].appeal || 0)) * (S.up.tuer ? 1.03 : 1) * (S.up.park ? 1.06 : 1) * (1 + clamp(S.buzz, -.25, .5)) * (1 + .03 * Object.keys(S.promo).length) * (season(S).hol ? 1.1 : 1) * (1 + Math.min(.12, byKind(S, 'ofen').filter(o => o.qty > 0).length * .06)) * ev * clean * (S.radio.on && S.up.radio ? 1.05 : 1) * extSpawn(S);
  }
  function makeList(S, type, age) {
    const T = D.TYPES[type], unl = Object.values(P).filter(p => S.lic[p.cat]), n = ri(T.n[0], T.n[1]), list = [], off = offered(S); let recipe = null;
    if (R() < T.recipe && S.level >= 2) { const rs = D.RECIPES.filter(r => r.items.filter(i => S.lic[P[i].cat]).length >= 3); if (rs.length) { const r = pick(rs); recipe = { id: r.id, need: r.items.filter(i => S.lic[P[i].cat]) }; recipe.need.forEach(i => list.push({ p: i, q: 1, got: 0 })); } }
    while (list.length < n && list.length < unl.length) { const p = wpick(unl, x => demandMul(S, x.id) * (T.likes[x.cat] || 1) * (off[x.id] ? 1 : .2) * (list.some(l => l.p === x.id) ? 0 : 1) * (age < 18 && x.age ? 1.7 : 1)); if (!p) break; list.push({ p: p.id, q: ri(T.q[0], T.q[1]), got: 0 }); }
    return { list, recipe };
  }
  function spawn(S, forceType) {
    const music = S.radio.on && S.up.radio ? S.radio.genre : null; const types = Object.keys(D.TYPES).filter(t => !D.TYPES[t].minLvl || S.level >= D.TYPES[t].minLvl);
    const ausflug = S.ev.some(e => e.k === 'ausflug' && S.t >= e.t0 && S.t <= e.t1), type = forceType || wpick(types, t => D.TYPES[t].w * (music && D.TYPES[t].music === music ? 1.35 : 1) * (ausflug && t === 'stud' ? 4 : 1) * todMul(S, t)); if (!type) return null;
    let reg = -1; if (S.regs.length && R() < (S.up.treue ? .55 : .4)) { const cand = S.regs.map((r, i) => i).filter(i => S.regs[i].t === type); const i = wpick(cand, i => 1 + S.regs[i].loy); if (i != null) reg = i; }
    const name = reg >= 0 ? S.regs[reg].n : pick(D.FIRST) + ' ' + pick(D.LAST)[0] + '.', age = ri(D.TYPES[type].age[0], D.TYPES[type].age[1]), L = makeList(S, type, age), door = doorTile(S);
    const c = { id: S.ccount++, type, age, name, reg, x: door[0] + .5, y: door[1] + .5, path: [], pi: 0, spd: D.TYPES[type].spd * (.9 + R() * .2), st: 'shop', list: L.list, li: 0, recipe: L.recipe, basket: [], mood: 80, wait: 0, tim: 0, shelf: null, thief: R() < (.03 + .002 * S.level) * thiefMul(S) && type !== 'krit' && type !== 'sen' && type !== 'insp', stole: 0, hits: 0, miss: 0, reg_q: null, slot: -1, bub: null, bt: 0, svc: 0, pay: 0, found: 0, want: 0 };
    spawnExt(S, c); c.list.forEach(l => { c.want += l.q; }); S.customers.push(c); S.today.spawned++; return c;
  }
  function follow(c, d) { if (c.pi >= c.path.length) return true; const tx = c.path[c.pi][0] + .5, ty = c.path[c.pi][1] + .5, dx = tx - c.x, dy = ty - c.y, dist = Math.hypot(dx, dy), step = c.spd * d; if (dist <= step) { c.x = tx; c.y = ty; c.pi++; return c.pi >= c.path.length; } c.x += dx / dist * step; c.y += dy / dist * step; return false; }
  const bub = (c, e) => { c.bub = e; c.bt = 2.2; };
  const setPath = (c, p) => { c.path = p || []; c.pi = 0; };
  function nextItem(S, c) {
    while (c.li < c.list.length) { const it = c.list[c.li]; const shelves = S.objs.filter(o => isShelf(o) && o.p === it.p && o.qty > 0).sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y)); const o = shelves.find(s => pathToObj(S, c.x, c.y, s)); if (!o) { c.miss += it.q; S.wish[it.p] = (S.wish[it.p] || 0) + 1; bub(c, '❓'); askFor(S, c, it.p); c.mood -= 8; S.today.miss++; c.li++; continue; } c.shelf = o.id; const pth = pathToObj(S, c.x, c.y, o); setPath(c, pth); c.tim = .5 + R() * .8; return true; }
    return false;
  }
  function priceCheck(S, c, o) {
    const T = D.TYPES[c.type], r = ref(S, o.p), pr = effPrice(S, o), ratio = pr / r, tol = T.tol + (c.reg >= 0 ? S.regs[c.reg].loy * .0006 : 0), riv = rival(S, o.p);
    if (!o.tag && R() < (T.hunt ? .6 : .3)) return { ok: false, why: '❓' };
    if (!S.rv.guar && (T.hunt || R() < .3)) { if (pr > riv * 1.06 && R() < clamp((pr / riv - 1.06) * 3 + .15, 0, .85)) return { ok: false, why: '🏪' }; }
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
    const pl = S.player, p2 = S.p2; const st = serviceTile(r); if (Math.hypot(pl.x - (st[0] + .5), pl.y - (st[1] + .5)) < 1.25 || (p2 && Math.hypot(p2.x - (st[0] + .5), p2.y - (st[1] + .5)) < 1.25)) return .45;
    if (r.k === 'sco') return .55; const s = S.staff.find(x => x.k === 'kasse' && x.reg === r.id && Math.hypot(x.x - (st[0] + .5), x.y - (st[1] + .5)) < .6); return s ? s.rate * moodF(s) : 0;
  }
  const operated = (S, r) => opRate(S, r) > 0;
  function leaveFor(S, c, why) { c.st = 'leave'; const d = doorTile(S); setPath(c, path(S, c.x, c.y, d[0], d[1]) || []); if (why) bub(c, why); }
  function review(S, c, sat, abandoned) {
    if (c.type === 'insp' || (c.type !== 'infl' && c.type !== 'krit' && R() > .3)) return; const stars = clamp(Math.round(sat * 4 + 1), 1, 5), miss = c.list.find(l => l.got === 0); let t;
    if (stars >= 4) t = pick(['Alles da, nette Preise, gerne wieder!', 'Frische Ware und schnelle Kasse.', 'Mein neuer Lieblingsladen!', 'Sauber, übersichtlich und fair.']);
    else if (miss && c.miss) t = pick([`Schon wieder kein ${P[miss.p].name}!`, `Regal leer: ${P[miss.p].name} fehlte.`, `Ohne ${P[miss.p].name} kein Einkauf.`]);
    else if (c.fbad) t = pick(['Abgelaufene Ware im Regal – geht gar nicht!', 'Das Obst war schon drüber.', 'Bitte mal aufs MHD achten!']); else if (c.hits) t = pick(['Viel zu teuer, Billigo ist günstiger.', 'Die Preise sind frech.', 'Für das Geld erwarte ich mehr.']);
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
    let sat = clamp(.45 * found + .2 * qs + .15 * ps + .1 * clean + .1 * clamp(c.mood / 100, 0, 1), 0, 1); if (S.staff.some(s => !s.off && (s.trait === 'freundlich' || s.trait === 'plauder'))) sat = Math.min(1, sat + .04); if (abandoned || !units) sat = Math.min(sat, .3); if (c.type !== 'insp') rateUpd(S, { preis: ps, auswahl: found, sauber: clean, service: qs, frische: c.fbad ? Math.max(0, 1 - c.fbad * .5) : 1 }); if (!abandoned && units && c.type !== 'insp') cafeVisit(S, 1);
    const w = c.type === 'krit' ? 4 : c.type === 'insp' ? 0 : 1; S.rep = clamp(S.rep + (sat * 100 - S.rep) * .045 * w, 5, 100); if (sat > .8) { T.happy++; if (c.reg >= 0) S.regs[c.reg].loy = Math.min(100, S.regs[c.reg].loy + 6); else if (S.regs.length < 120 && R() < .35 && c.type !== 'insp') S.regs.push({ n: c.name, t: c.type, loy: 10, fav: favOf(c) }); } if (sat < .45 && c.reg >= 0) S.regs[c.reg].loy = Math.max(0, S.regs[c.reg].loy - 8);
    if (abandoned || !units) T.lost++; if (c.recipe && !abandoned && c.recipe.need.every(i => c.list.some(l => l.p === i && l.got > 0))) { const bonus = Math.round(total * .12); S.money += bonus; T.rev += bonus; T.recipes++; S.xp += 6; bub(c, '🎉'); }
    c.sat = sat; S.tot.served += abandoned || !units ? 0 : 1; if (c.recipe && !abandoned && c.recipe.need.every(i => c.list.some(l => l.p === i && l.got > 0))) S.tot.recipes++; review(S, c, sat, abandoned);
  }
  const WANTED = ['flee', 'stun', 'held', 'arrest', 'flee2', 'change', 'card', 'id'], cost = (S, list) => list.reduce((a, b) => a + wholesale(S, b.p) * b.q, 0);
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
    if (c.type === 'insp') inspect(S, c);
    if (c.thief && c.basket.length && (c.stole || R() < .6)) { startFlee(S, c); return; }
    if (!c.basket.length) { finish(S, c, true); leaveFor(S, c, c.miss ? '😞' : null); } else heading(S, c);
  }
  const pending = S => S.customers.find(c => c.st === 'change') || null, pendingCard = S => S.customers.find(c => c.st === 'card') || null;

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
  function cardPay(S, amt, auto) {   // Kartenzahlung: Betrag am Terminal eintippen (Cent); auto = zu langsam
    const c = pendingCard(S); if (!c) return null; amt = Math.round(+amt || 0);
    if (!auto && amt !== c.total) { c.tries = (c.tries || 0) + 1; c.mood -= 8; S.fx.push({ t: 'bad' }); return { ok: false, msg: amt > c.total ? '💳 Zu viel eingetippt – der Kunde bricht ab. Noch mal!' : '💳 Zu wenig eingetippt – noch mal!' }; }
    const r = obj(S, c.reg_q); if (r) r.q = r.q.filter(i => i !== c.id); finish(S, c, false); let msg;
    if (auto) { c.sat = Math.min(c.sat, .55); S.rep = clamp(S.rep - .3, 5, 100); msg = '⏱️ Kartenzahlung dauerte zu lange – Kunde ist genervt.'; }
    else { S.xp += c.tries ? 0 : .5; msg = c.tries ? '💳 Bezahlt.' : '💳 Bezahlt – flott getippt!'; }
    leaveFor(S, c, auto ? '😒' : '😊'); S.fx.push({ t: auto ? 'bad' : 'cash' }); note(S, msg, auto ? 'bad' : 'good'); return { ok: true, msg };
  }
  function setIdentity(S, o) { const cl = s => String(s || '').replace(/[<>&"]/g, '').trim(); if (o.name != null) S.shopName = cl(o.name).slice(0, 22) || 'Marktrausch'; if (o.slogan != null) S.slogan = cl(o.slogan).slice(0, 36); if (o.col && D.SIGNCOLS.some(x => x[0] === o.col)) S.signCol = o.col; S.named = true; }
  function tickCustomer(S, c, d) {
    c.bt = Math.max(0, c.bt - d); if (!c.bt) c.bub = null;
    if (WANTED.includes(c.st)) {
      if (c.st === 'id') { c.wait += d * .3; c.idT += d; if (c.idT > 30) idApply(S, c, false, 'timeout'); }
      else if (c.st === 'flee') { if (S.up.kamera) { c.bub = '🚨'; c.bt = 1; } if (follow(c, d)) { const lost = cost(S, c.basket); S.today.stolen += lost; S.rep = clamp(S.rep - .8, 5, 100); c.basket = []; c.dead = true; note(S, '😠 Ein Dieb ist mit Ware im Wert von ' + D.fmt(lost) + ' entkommen!', 'bad'); } }
      else if (c.st === 'flee2') { if (follow(c, d)) c.dead = true; }
      else if (c.st === 'change') { c.wait += d * .5; c.chW += d; if (c.chW > 28) giveChange(S, c.given - c.total, true); }
      else if (c.st === 'card') { c.wait += d * .5; c.chW += d; if (c.chW > 28) cardPay(S, c.total, true); }
      else if (c.st === 'stun') { c.stun -= d; c.stars = 1; if (c.stun <= 0) { c.stars = 0; c.st = 'flee2'; c.spd *= 1.1; leaveFor(S, c); c.st = 'flee2'; bub(c, '😖'); } }
      else if (c.st === 'held') { c.held += d; if (c.held > 25 && !S.police.some(p => p.tgt === c.id)) { c.stars = 0; c.st = 'flee2'; leaveFor(S, c); c.st = 'flee2'; } }
      return;
    } const hx = Math.floor(c.x), hy = Math.floor(c.y); if (S.heat[hy * S.W + hx] != null) S.heat[hy * S.W + hx] += d;
    if (c.st === 'shop') {
      if (c.shelf == null) { if (c.li < c.list.length && !nextItem(S, c)) c.li = c.list.length; if (c.li >= c.list.length) { doneShopping(S, c); return; } }
      if (c.shelf != null) {
        if (!follow(c, d)) return; c.tim -= d; if (c.tim > 0) return; const o = obj(S, c.shelf), it = c.list[c.li]; c.shelf = null;
        if (o && o.p === it.p && o.qty > 0) { const pc = freshGate(S, c, o) || priceCheck(S, c, o); if (pc.ok) { const q = Math.min(o.qty, Math.max(1, Math.round(it.q * pc.mul))); o.qty -= q; it.got += q; c.basket.push({ p: it.p, q, price: effPrice(S, o) }); bought(S, c, o, q); if (o.tag && o.tagp !== effPrice(S, o)) { if (effPrice(S, o) > o.tagp * 1.01) { c.mood -= 22; c.hits++; bub(c, '😠'); S.tot.mis++; } else c.mood = Math.min(100, c.mood + 6); } if (R() < .004 && S.messes.length < 12) S.messes.push({ x: Math.floor(c.x), y: Math.floor(c.y), id: S.nid++, k: 'trash' }); if (c.thief && !c.stole && R() < .5) c.stole = it.p; } else { if (!pc.fresh) { c.hits++; c.mood -= 12; } bub(c, pc.why); S.today.miss++; } } else { c.miss += it.q; bub(c, '❓'); c.mood -= 8; S.wish[it.p] = (S.wish[it.p] || 0) + 1; askFor(S, c, it.p); }
        c.li++; if (R() < .012 * (D.WEATHER[S.weather].mess || 1) && S.messes.length < 12) S.messes.push({ x: Math.floor(c.x), y: Math.floor(c.y), id: S.nid++ });
      }
    } else if (c.st === 'queue') {
      const r = obj(S, c.reg_q); if (!r) { leaveFor(S, c, '😡'); return; } const idx = r.q.indexOf(c.id); c.wait += d; c.mood -= d * (S.up.klima ? .12 : .2) * (S.weather === 'heiss' && !S.up.klima ? 1.6 : 1); if (idx !== c.slot) { c.slot = idx; const sp = slotPos(S, r, idx); setPath(c, path(S, c.x, c.y, sp[0], sp[1])); }
      follow(c, d); if (c.wait > D.TYPES[c.type].pat * (S.staff.some(s => s.trait === 'freundlich') ? 1.1 : 1)) { r.q.splice(r.q.indexOf(c.id), 1); bub(c, '😡'); finish(S, c, true); leaveFor(S, c); return; }
      if (idx === 0 && c.pi >= c.path.length) { c.st = 'pay'; c.units = c.basket.reduce((a, b) => a + b.q, 0); c.svc = 1.1 + c.units * .75; c.total = c.basket.reduce((a, b) => a + b.q * b.price, 0); c.cash = R() < (c.type === 'sen' ? .75 : c.type === 'stud' ? .3 : .5); const notes = [500, 1000, 2000, 5000, 10000], ex = R() < .25; c.given = c.cash ? (ex ? c.total : (notes.find(n => n >= c.total) || Math.ceil(c.total / 1000) * 1000)) : c.total; }
    } else if (c.st === 'pay') {
      const r = obj(S, c.reg_q); if (!r) { leaveFor(S, c); return; } const rate = opRate(S, r); c.wait += rate > 0 ? d * .3 : d; if (c.wait > D.TYPES[c.type].pat * 1.4) { r.q.shift(); bub(c, '😡'); finish(S, c, true); leaveFor(S, c); return; } c.svc -= d * rate; if (c.svc <= 0) { if (!c.idDone && idGate(S, c, r)) return; const manual = c.cash && c.given > c.total && !S.up.kassensys && r.k === 'kasse' && !S.staff.some(x => x.k === 'kasse' && x.reg === r.id); const cardM = !c.cash && S.cardManual !== false && !S.up.kassensys && r.k === 'kasse' && !S.staff.some(x => x.k === 'kasse' && x.reg === r.id); if (manual) { c.st = 'change'; c.chW = 0; } else if (cardM) { c.st = 'card'; c.chW = 0; c.tries = 0; bub(c, '💳'); c.bt = 30; S.fx.push({ t: 'id' }); } else { r.q.shift(); finish(S, c, false); leaveFor(S, c, c.sat > .8 ? '😊' : null); } }
    } else if (c.st === 'leave') { if (follow(c, d)) c.dead = true; }
  }

  // ---------- Personal ----------
  function hire(S, k) {
    const t = D.STAFF[k]; if (S.level < t.lvl) return false; const price = t.buy || 0; if (S.money < price) { note(S, 'Nicht genug Geld.', 'bad'); return false; } S.money -= price;
    const trait = k === 'robo' ? 'fleissig' : pick(D.TRAITS)[0], s = { id: S.nid++, k, name: k === 'robo' ? 'Bot-' + ri(10, 99) : pick(D.FIRST), trait, x: 2.5, y: S.H - 1.5, path: [], pi: 0, carry: null, task: null, reg: null, mood: 80, shift: 'ganz', rate: 1 * (trait === 'flink' ? 1.25 : 1) * (trait === 'plauder' ? .9 : 1), spd: 2.4 * (trait === 'flink' ? 1.25 : 1) * (k === 'robo' ? .9 : 1), idle: 0 };
    s.lv = 1; s.bspd = s.spd; S.staff.push(s); return s;
  }
  const wageOf = s => Math.round(D.STAFF[s.k].wage * (1 + .12 * ((s.lv || 1) - 1)) * ((D.SHIFTS[s.shift] || D.SHIFTS.ganz).f));
  function train(S, id) { const s = S.staff.find(x => x.id === id); if (!s) return false; const lv = s.lv || 1, cost = 15000 * lv; if (lv >= 5 || S.money < cost) return false; S.money -= cost; s.lv = lv + 1; const f = (s.trait === 'flink' ? 1.25 : 1); s.rate = f * (1 + .12 * (s.lv - 1)); s.spd = (s.k === 'robo' ? 2.4 * .9 : 2.4) * f * (1 + .1 * (s.lv - 1)); s.bspd = s.spd; s.mood = clamp((s.mood == null ? 80 : s.mood) + 8, 0, 100); note(S, `🎓 ${s.name} ist jetzt Stufe ${s.lv}.`, 'good'); return true; }
  function togglePromo(S, p) { if (S.promo[p]) { delete S.promo[p]; return true; } if (Object.keys(S.promo).length >= 2) { note(S, 'Höchstens 2 Tagesangebote gleichzeitig.', 'bad'); return false; } S.promo[p] = true; return true; }
  function fire(S, id) { const s = S.staff.find(x => x.id === id); if (!s) return; if (s.carry) S.ramp.push(s.carry); S.staff = S.staff.filter(x => x !== s); }
  function sfollow(s, d) { if (s.pi >= s.path.length) return true; const tx = s.path[s.pi][0] + .5, ty = s.path[s.pi][1] + .5, dx = tx - s.x, dy = ty - s.y, dist = Math.hypot(dx, dy), step = s.spd * d * moodF(s); if (dist <= step) { s.x = tx; s.y = ty; s.pi++; return s.pi >= s.path.length; } s.x += dx / dist * step; s.y += dy / dist * step; return false; }
  function tickStaff(S, s, d) {
    if (staffGate(S, s, d)) return;
    if (s.k === 'kasse') { const mine = S.objs.filter(o => o.k === 'kasse'); if (!obj(S, s.reg)) s.reg = null; if (!s.reg) { const free = mine.find(r => !S.staff.some(x => x.reg === r.id)); if (free) s.reg = free.id; } if (s.reg) { const r = obj(S, s.reg), st = serviceTile(r); if (!s.path.length && Math.hypot(s.x - (st[0] + .5), s.y - (st[1] + .5)) > .4) setPath(s, path(S, s.x, s.y, st[0], st[1]) || []); sfollow(s, d); } return; }
    if (s.k === 'putz') { if (!s.path.length || s.pi >= s.path.length) { const m = S.messes.slice().sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0]; if (m && !s.task) { const p = path(S, s.x, s.y, m.x, m.y); if (p) { setPath(s, p); s.task = m; } } else if (s.task && s.pi >= s.path.length) { S.messes = S.messes.filter(x => x !== s.task && x.id !== s.task.id); s.task = null; s.path = []; } } sfollow(s, d); if (s.trait === 'schusselig' && R() < .0008 && S.messes.length < 12) S.messes.push({ x: Math.floor(s.x), y: Math.floor(s.y), id: S.nid++ }); return; }
    if (s.k === 'baecker') { const ov = S.objs.filter(o => D.OBJ[o.k].bake && o.p).sort((a, b) => ratio(S, a) - ratio(S, b))[0]; if (!ov) return; const tg = accessTiles(S, ov)[0]; if (!tg) return; const dist = Math.hypot(s.x - tg[0] - .5, s.y - tg[1] - .5); if (dist > .6 && (!s.path.length || s.pi >= s.path.length)) setPath(s, path(S, s.x, s.y, tg[0], tg[1]) || []); sfollow(s, d); if (dist <= .9 && ratio(S, ov) < .5) { s.bk = (s.bk || 0) + d * (s.rate || 1) * moodF(s); if (s.bk > 6) { s.bk = 0; bakeOne(S, ov); } } return; }
    if (s.k === 'wache') { if (!s.bspd) s.bspd = s.spd; const th = S.customers.find(c => c.st === 'flee' && Math.hypot(s.x - c.x, s.y - c.y) < (S.up.kamera ? 16 : 9)); if (th) { s.spd = 3.5; s.cd = (s.cd || 0) - d; if (s.cd <= 0 || !s.path.length) { s.cd = .3; setPath(s, path(S, s.x, s.y, Math.floor(th.x), Math.floor(th.y)) || []); } if (Math.hypot(s.x - th.x, s.y - th.y) < 1.05) { hold(S, th, 'guard'); s.path = []; } sfollow(s, d); return; } s.spd = s.bspd; const door = doorTile(S); if (!s.path.length && Math.hypot(s.x - 3.5, s.y - (S.H - 2.5)) > .6) setPath(s, path(S, s.x, s.y, 3, S.H - 2) || []); sfollow(s, d); return; }
    // Regalauffüller / Bot
    if (s.path.length && s.pi < s.path.length) { sfollow(s, d); return; } s.path = []; s.pi = 0;
    if (s.task && s.task.t === 'pick') { const b = s.task.box, i = S.ramp.indexOf(b); if (i >= 0) { S.ramp.splice(i, 1); s.carry = b; flush(S); } s.task = null; }
    else if (s.task && s.task.t === 'drop') { const o = obj(S, s.task.shelf); if (o && s.carry && o.p === s.carry.p && !o.exp) addStock(S, o, s.carry); if (s.carry && s.carry.n <= 0) s.carry = null; s.task = null; }
    else if (s.task && s.task.t === 'sort') { sortOut(S, obj(S, s.task.shelf)); s.task = null; }
    if (s.task) return; s.idle += d; if (s.idle < .4) return; s.idle = 0;
    if (s.carry) { const o = S.objs.filter(x => isShelf(x) && x.p === s.carry.p && x.qty < cap(S, x) && !x.exp).sort((a, b) => a.qty / cap(S, a) - b.qty / cap(S, b))[0]; if (o) { const p = pathToObj(S, s.x, s.y, o); if (p) { setPath(s, p); s.task = { t: 'drop', shelf: o.id }; return; } } S.ramp.push(s.carry); s.carry = null; return; }
    const ex = S.objs.find(o => o.exp && o.qty > 0); if (ex) { const p = pathToObj(S, s.x, s.y, ex); if (p) { setPath(s, p); s.task = { t: 'sort', shelf: ex.id }; return; } }
    const ramp = byKind(S, 'ramp')[0]; if (!ramp || !S.ramp.length) return; let best = null, bs = 9; S.ramp.forEach(b => { const o = S.objs.filter(x => isShelf(x) && x.p === b.p && x.qty < cap(S, x) && !x.exp).sort((a, c) => a.qty / cap(S, a) - c.qty / cap(S, c))[0]; if (o) { const r = o.qty / cap(S, o); if (r < bs && r < .85) { bs = r; best = b; } } });
    if (best) { const p = pathToObj(S, s.x, s.y, ramp); if (p) { setPath(s, p); s.task = { t: 'pick', box: best }; } }
  }
  function addStock(S, o, box, n) { const room = cap(S, o) - o.qty; if (room <= 0) return 0; const mv = Math.min(room, box.n, n == null ? 1e9 : n); o.age = (o.age * o.qty + (box.age || 0) * mv) / (o.qty + mv); o.qty += mv; box.n -= mv; return mv; }

  // ---------- Spieler ----------
  const pl_run = S => !!S.player.run;
  function movePlayer(S, d, p) {
    const pl = p || S.player, sp = 3.4 * (pl_run(S) ? 1.55 : 1); let vx = pl.vx, vy = pl.vy; const l = Math.hypot(vx, vy); if (l > 1) { vx /= l; vy /= l; }
    const mv = (dx, dy) => { const nx = pl.x + dx, ny = pl.y + dy, r = .28; for (const [cx, cy] of [[nx - r, ny - r], [nx + r, ny - r], [nx - r, ny + r], [nx + r, ny + r]]) if (pBlocked(S, cx, cy)) return false; pl.x = nx; pl.y = ny; return true; };
    mv(vx * sp * d, 0); mv(0, vy * sp * d);
  }
  const rectDist = (px, py, o) => { const dx = Math.max(o.x - px, 0, px - (o.x + o.w)), dy = Math.max(o.y - py, 0, py - (o.y + o.h)); return Math.hypot(dx, dy); };
  const carryCap = S => S.up.wagen ? 3 : 1;
  // ---------- Hof, Lagerhalle, lose Kartons (nur der Spieler läuft hier; Kunden und Personal bleiben im Laden-Gitter) ----------
  // Welt-Koordinaten in Feldern: Laden x 1..W-1, y 1..H-1 · Hof nördlich (y < 1) hinter dem Tor an der Rampe · Lagerhalle westlich vom Hof (x < 0).
  const BH = .32, YARD_Y = -8, DZ = { x: 4.4, y: -3.4, w: 5.4, h: 2.9 }, TRUCK = { x: 5, y: -7.6, w: 5, h: 2.3 }, RACK = { w: 2, d: .6, lv: [0, .55, 1.1], n: 4 };
  const rampObj = S => S.objs.find(o => o.k === 'ramp'), inR = (x, y, r, m) => { m = m || 0; return x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.h + m; };
  const spotOf = id => { const c = Math.floor(id / 100), r = id % 100; return { id, x: -1.4 - RACK.w - c * 2.6, y: YARD_Y + .6 + r * 1.9, w: RACK.w, h: RACK.d }; };
  function whLayout(S) {   // Regal-Plätze sind fest (Ost-Rand + Nord-Rand), damit gekaufte Regale beim Vergrößern stehen bleiben
    const wh = S.wh || { lvl: 0, list: [] }, L = D.WAREHOUSE[wh.lvl] || D.WAREHOUSE[0], x0 = -L.w, y1 = YARD_Y + L.d, spots = [];
    for (let c = 0; c < 9; c++) for (let r = 0; r < 12; r++) { const sp = spotOf(c * 100 + r); if (sp.x >= x0 + .8 - 1e-6 && sp.y + sp.h <= y1 - .5 + 1e-6) spots.push(sp); }
    const ok = new Set(spots.map(sp => sp.id)); return { L, x0, y0: YARD_Y, x1: 0, y1, door: [-3.8, -2], spots, racks: (wh.list || []).filter(id => ok.has(id)).map(spotOf) };
  }
  const rackSlot = (r, s) => ({ x: r.x + .27 + (s % RACK.n) * .49, y: r.y + r.h / 2, h: RACK.lv[Math.floor(s / RACK.n)] + .06 });
  const rampSpot = i => ({ x: DZ.x + .35 + (i % 10) * .52, y: DZ.y + DZ.h - .4 - (Math.floor(i / 10) % 4) * .62, h: Math.floor(i / 40) * BH });
  function pBlocked(S, x, y) {   // Laufbarkeit für den Spieler: Laden (Gitter) + Tor an der Rampe + Hof + Lagerhalle + Gehweg vor dem Laden
    if (y >= S.H && y < S.H + OUT_D && x > .3 && x < S.W - .3) return outBlocked(S, x, y);
    if (x >= 0 && y >= .84) { const rp = rampObj(S); if (rp && x >= rp.x && x <= rp.x + rp.w && y < rp.y + rp.h) return false; return solid(S, Math.floor(x), Math.floor(y)); }
    if (y < .84 && y > YARD_Y + .2 && x > .25 && x < S.W - .25) return inR(x, y, TRUCK);
    const L = whLayout(S); if (x > -.45 && x < .45 && y > L.door[0] && y < L.door[1]) return false;
    if (x > L.x0 + .08 && x < -.2 && y > L.y0 + .08 && y < L.y1 - .08) return L.racks.some(r => inR(x, y, r, .04));
    return true;
  }
  const boxById = (S, id) => id == null ? null : S.ramp.find(b => b.id === id) || (S.loose || []).find(b => b.id === id) || null;
  function boxIds(S) { S.ramp.forEach(b => { if (!b.id) b.id = S.nid++; }); (S.loose || []).forEach(b => { if (!b.id) b.id = S.nid++; }); }
  function boxPos(S, b) { const i = S.ramp.indexOf(b); if (i >= 0) return rampSpot(i); if (b.rk != null) return rackSlot(spotOf(b.rk), b.sl); return { x: b.x, y: b.y, h: b.h || 0 }; }
  const inDZ = (S, m) => inR(S.player.x, S.player.y, DZ, m == null ? .8 : m);
  const atRamp = S => { const rp = rampObj(S); return inDZ(S) || !!(rp && rectDist(S.player.x, S.player.y, rp) < 1.5); };
  function removeLoose(S, b) {   // nimmt einen losen Karton weg; was darauf gestapelt war, rutscht nach
    S.loose = S.loose.filter(x => x !== b); if (b.rk == null) S.loose.forEach(o => { if (o.rk == null && Math.hypot(o.x - b.x, o.y - b.y) < .05 && o.h > b.h) o.h = Math.max(0, o.h - BH); });
    ['x', 'y', 'h', 'rk', 'sl'].forEach(k => delete b[k]);
  }
  function pickBox(S, id) {   // id = gezielter Karton (Fadenkreuz/Antippen); ohne id der passendste von der Rampe
    const pl = S.player; let b = boxById(S, id);
    if (b) { const i = S.ramp.indexOf(b); if (i >= 0) S.ramp.splice(i, 1); else removeLoose(S, b); }
    else { if (!S.ramp.length) return null; b = S.ramp.splice(boxIdx(S), 1)[0]; }
    pl.carry.push(b); S.fx.push({ t: 'pick', p: b.p, empty: !!b.empty }); flush(S); return b;
  }
  function dropBox(S) {   // stellt den obersten getragenen Karton ab: ins Lager-Regal, an die Rampe oder frei auf den Boden (stapelbar)
    const pl = S.player; if (!pl.carry.length) return null; const b = pl.carry[pl.carry.length - 1], fw = pl._fw || [0, -1], tgt = pl._drop || [pl.x + fw[0] * .7, pl.y + fw[1] * .7], loose = S.loose || (S.loose = []), L = whLayout(S);
    let best = null; L.racks.forEach(r => { const d = Math.hypot(Math.max(r.x - tgt[0], 0, tgt[0] - r.x - r.w), Math.max(r.y - tgt[1], 0, tgt[1] - r.y - r.h)); if (d > 1.1 || rectDist(pl.x, pl.y, r) > 1.6) return; for (let s = 0; s < RACK.n * RACK.lv.length; s++) { if (loose.some(o => o.rk === r.id && o.sl === s)) continue; const p = rackSlot(r, s), dd = d + Math.abs(p.x - tgt[0]) * .6 + Math.floor(s / RACK.n) * .15; if (!best || dd < best.d) best = { d: dd, rk: r.id, sl: s }; } });
    const clear = (x, y) => { for (let k = 1; k <= 6; k++) if (pBlocked(S, pl.x + (x - pl.x) * k / 6, pl.y + (y - pl.y) * k / 6)) return false; return true; };
    let spot = best ? { rk: best.rk, sl: best.sl } : null;
    if (!spot) for (const [x, y] of [tgt, [pl.x + fw[0] * .45, pl.y + fw[1] * .45], [pl.x, pl.y]]) {
      if (!clear(x, y)) continue; if (inR(x, y, DZ)) { spot = 'ramp'; break; }
      const st = loose.filter(o => o.rk == null && Math.hypot(o.x - x, o.y - y) < .3); if (st.length) { const top = st.reduce((a, o) => o.h > a.h ? o : a); if (top.h + BH > 3 * BH + .01) continue; spot = { x: top.x, y: top.y, h: top.h + BH }; } else spot = { x, y, h: 0 }; break;
    }
    if (!spot) { S.fx.push({ t: 'nodrop' }); return null; }
    pl._dropT = S.simT + 4; pl.carry.pop(); if (spot === 'ramp') S.ramp.push(b); else { Object.assign(b, spot); loose.push(b); } S.fx.push({ t: 'drop', p: b.p, rk: spot.rk != null, ramp: spot === 'ramp' }); return b;
  }
  function whUp(S) {
    const n = D.WAREHOUSE[S.wh.lvl + 1]; if (!n) return false; if (S.level < (n.lvl || 1)) { note(S, `${n.n} gibt es ab Stufe ${n.lvl}.`, 'bad'); return false; } if (S.money < n.price) { note(S, 'Nicht genug Geld für den Ausbau.', 'bad'); return false; }
    S.money -= n.price; S.wh.lvl++; note(S, `🏭 ${n.n} fertig – Platz für ${whLayout(S).spots.length} Lager-Regale.`, 'good'); return true;
  }
  function whRack(S) {
    const L = whLayout(S), sp = L.spots.find(x => !S.wh.list.includes(x.id)); if (!sp) { note(S, 'Kein Platz mehr – vergrößere zuerst die Lagerhalle.', 'bad'); return false; } if (S.money < D.RACK_PRICE) { note(S, 'Nicht genug Geld für ein Lager-Regal.', 'bad'); return false; }
    if (inR(S.player.x, S.player.y, sp, .35)) { note(S, 'Geh kurz zur Seite – genau dort kommt das neue Regal hin.', 'bad'); return false; }
    S.money -= D.RACK_PRICE; S.wh.list.push(sp.id); S.loose.forEach(o => { if (o.rk == null && inR(o.x, o.y, sp, .1)) { o.x = sp.x + sp.w / 2; o.y = sp.y + sp.h + .5; o.h = 0; } }); return true;
  }
  function context(S, focus) {
    const pl = S.player; for (const c of S.customers) { if ((c.st === 'flee' || c.st === 'stun') && Math.hypot(pl.x - c.x, pl.y - c.y) < 1.6) return { a: 'stop', c, label: c.st === 'flee' ? '👊 Dieb schubsen!' : '🚔 Festhalten & Polizei rufen' }; }
    for (const r of S.objs) { if (r.k !== 'kasse') continue; const st = serviceTile(r); if (Math.hypot(pl.x - (st[0] + .5), pl.y - (st[1] + .5)) > 1.25) continue; const c = S.customers.find(x => x.st === 'pay' && x.reg_q === r.id); if (c) { const left = Math.ceil((c.svc - 1.1) / .75 - 1e-6); return { a: 'scan', c, label: left > 0 ? `📟 Scannen (${left} Artikel)` : '💶 Kassieren' }; } }
    const ab = boxById(S, pl._aim); if (ab && pl.carry.length < carryCap(S)) { const bp = boxPos(S, ab); if (Math.hypot(bp.x - pl.x, bp.y - pl.y) < 2.4) return { a: 'pickb', b: ab, label: ab.empty ? '📦 Leeren Karton nehmen' : `📦 ${P[ab.p].e} ${P[ab.p].name.split(' ').slice(0, 2).join(' ')} nehmen` }; }
    const no = nearOut(S); if (no) { const b = pl.carry.find(x => !x.empty); if (no.k === 'stall') { const st = S.out.stalls[no.i]; if (b && st && st.p === b.p && st.qty < D.STALL_CAP) return { a: 'stallput', i: no.i, label: `🧺 Am Marktstand auslegen (${b.n})` }; if (!b || !pl.carry.length) return { a: 'out', label: st && st.p ? `🧺 Marktstand: ${P[st.p].e} ${st.qty}/${D.STALL_CAP}` : '🧺 Marktstand einrichten' }; } else { if (b && D.CAFE_FILL[b.p]) return { a: 'cafefill', label: `☕ Café auffüllen (${P[b.p].e} ${b.n})` }; if (!pl.carry.length) return { a: 'out', label: `☕ Café · ${S.out.cup} Tassen · ${S.out.cake} Stück` }; } }
    const near = S.objs.filter(o => rectDist(pl.x, pl.y, o) < 1.5), fd = o => rectDist(pl.x, pl.y, o) - (focus && o.id === focus.id ? 5 : 0);
    const exs = near.filter(o => o.exp && o.qty > 0).sort((a, c) => fd(a) - fd(c))[0]; if (exs) return { a: 'sort', o: exs, label: `🗑️ Abgelaufenes aussortieren (${P[exs.p].e} ${exs.qty})` };
    const eb = pl.carry.find(b => b.empty); if (eb) { const ct = near.find(o => o.k === 'container'); if (ct) return { a: 'trash', o: ct, label: S.paper >= CONT_MAX ? '🗑️ Container voll!' : '🗑️ Leeren Karton entsorgen' }; }
    const nb = pl.carry.find(b => !b.empty); if (nb) { const b = nb, sh = near.filter(o => isShelf(o) && !o.exp && ((o.p === b.p && o.qty < cap(S, o)) || (!o.p && fits(o, b.p)) || (o.p && o.qty === 0 && fits(o, b.p) && o.p !== b.p))).sort((a, c) => fd(a) - fd(c))[0]; if (sh) return { a: 'stock', o: sh, label: `${P[b.p].e} einräumen (${b.n} im Karton)` }; }
    const stk = near.filter(o => needsSticker(S, o)).sort((a, c) => fd(a) - fd(c))[0]; if (stk && !pl.carry.length) return { a: 'sticker', o: stk, label: `🏷️ Rabattaufkleber −30 % (${P[stk.p].e} MHD ${fresh(S, stk) === 'mhd' ? 'heute' : 'morgen'})` };
    const tgc = near.filter(o => needsTag(S, o)).sort((a, c) => fd(a) - fd(c))[0]; if (tgc) return { a: 'tag', o: tgc, label: `🏷️ Preisschild aufstecken (${D.fmt(effPrice(S, tgc))})` };
    const m = S.messes.find(m => Math.hypot(m.x + .5 - pl.x, m.y + .5 - pl.y) < 1.2); if (m) return { a: 'clean', m, label: m.k === 'trash' ? '🧹 Müll aufheben' : '🧽 Pfütze wischen' };
    if (atRamp(S)) { if (pl.carry.length < carryCap(S) && S.ramp.length) return { a: 'pick', label: '📦 Karton nehmen' }; if (pl.carry.some(b => !b.empty)) return { a: 'back', label: '↩️ Karton zurückstellen' }; }
    const pcn = near.find(o => o.k === 'pc'); if (pcn) return { a: 'pc', o: pcn, label: '💻 Bestell-PC benutzen' };
    const rd = near.find(o => o.k === 'radio'); if (rd) return { a: 'radio', o: rd, label: '📻 Radio an/aus' };
    if (pl.carry.length) return { a: 'drop', label: '⬇️ Karton abstellen' };
    return null;
  }
  // ---------- Einräumen: Hilfsfunktionen, Einräum-Hilfe, Wegweiser ----------
  const ratio = (S, o) => o.qty / Math.max(1, cap(S, o));
  function shelfFor(S, b) {
    const c = S.objs.filter(o => isShelf(o) && !o.exp && ((o.p === b.p && o.qty < cap(S, o)) || (!o.p && fits(o, b.p)) || (o.p && o.qty === 0 && o.p !== b.p && fits(o, b.p))));
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
  function assistTick(S, d) {
    if (S.assist === false || S.phase === 'summary') return; const pl = S.player; let busy = false, eb = pl.carry.find(b => b.empty), nb = pl.carry.find(b => !b.empty);
    if (eb) { const ct = S.objs.find(o => o.k === 'container'); if (ct && rectDist(pl.x, pl.y, ct) < 1.4) { busy = true; pl.dw = (pl.dw || 0) + d; if (pl.dw > .3) { trashBox(S); pl.dw = 0; } } }
    else if (nb) { const sh = shelfFor(S, nb); if (sh && rectDist(pl.x, pl.y, sh) < 1.4) { busy = true; pl.dw = (pl.dw || 0) + d; if (pl.dw > .3) { pl.acc = (pl.acc || 0) + d * 7; while (pl.acc >= 1) { pl.acc -= 1; if (!stockInto(S, sh, nb, 1) || pl.carry.indexOf(nb) < 0) { pl.acc = 0; break; } } } } }
    else if (!pl.carry.length && !boxById(S, pl._aim) && Math.hypot(pl.vx, pl.vy) < .15 && S.simT > (pl._dropT || 0)) { if (S.ramp.length && atRamp(S) && S.ramp.some(b => isNew(S, b) || S.objs.some(o => isShelf(o) && o.p === b.p && ratio(S, o) < .75))) { busy = true; pl.dw = (pl.dw || 0) + d; if (pl.dw > 1.2) { pickBox(S); pl.dw = 0; } } }   // nur wenn kein Karton angezielt ist – sonst wählt der Spieler selbst
    if (!busy) { const tg = S.objs.find(o => needsTag(S, o) && rectDist(pl.x, pl.y, o) < 1.2); if (tg) { busy = true; pl.dw = (pl.dw || 0) + d; if (pl.dw > .9) { tagShelf(S, tg); pl.dw = 0; } } }
    if (!busy) pl.dw = 0;
  }
  function nextStep(S) {
    if (S.phase === 'summary' || S.hints === false) return null; const pl = S.player, ctr = o => ({ x: o.x + o.w / 2, y: o.y + o.h / 2 });
    const th = S.customers.find(c => c.st === 'flee' || c.st === 'stun'); if (th) return { txt: th.st === 'flee' ? '🚨 Dieb! Lauf hin und schubse ihn mit E' : '🚔 Noch mal E: festhalten & Polizei rufen', x: th.x, y: th.y, e: '🚨' };
    if (S.phase === 'open' || S.phase === 'closing') { const r = S.objs.find(o => o.k === 'kasse' && S.customers.some(c => (c.st === 'pay' || c.st === 'queue') && c.reg_q === o.id)); if (r && !S.staff.some(s => s.k === 'kasse' && s.reg === r.id)) { const st = serviceTile(r); if (Math.hypot(pl.x - st[0] - .5, pl.y - st[1] - .5) > 1.2) return { txt: '💶 Kunden warten! Geh hinter die Kasse – dort scannst du mit E', x: st[0] + .5, y: st[1] + .5, e: '💶' }; } }
    if (pl.carry.some(b => b.empty)) { const ct = S.objs.find(o => o.k === 'container'); if (ct) { const t = ctr(ct); return { txt: '🗑️ Leeren Karton in den Altpapier-Container werfen (einfach hinlaufen)', x: t.x, y: t.y, e: '🗑️' }; } }
    if (pl.carry.some(b => !b.empty)) { const b = pl.carry.find(b => !b.empty), sh = shelfFor(S, b); if (sh) { const t = ctr(sh); return { txt: `${P[b.p].e} Bring den Karton zum markierten Regal – einfach hinlaufen, es räumt sich von selbst ein`, x: t.x, y: t.y, e: P[b.p].e }; } return { txt: '🔧 Kein Regal dafür frei – baue ein passendes Regal oder stell den Karton ab (R / RB / ⬇️), z. B. in der Lagerhalle', x: null, y: null }; }
    const exo = S.objs.find(o => o.exp && o.qty > 0); if (exo) { const t = ctr(exo); return { txt: `🤢 Abgelaufen: ${P[exo.p].name} – hingehen und mit E aussortieren`, x: t.x, y: t.y, e: '🤢' }; }
    const tgs = S.objs.filter(o => needsTag(S, o)).sort((a, c) => Math.hypot(a.x - pl.x, a.y - pl.y) - Math.hypot(c.x - pl.x, c.y - pl.y)); if (tgs.length) { const o = tgs[0], t = ctr(o); return { txt: `🏷️ Preisschild ${o.tag ? 'ist veraltet' : 'fehlt'}: ${P[o.p].e} ${P[o.p].name} – hinlaufen (von selbst oder E)`, x: t.x, y: t.y, e: '🏷️' }; }
    const low = S.objs.filter(o => isShelf(o) && o.p && ratio(S, o) < (S.phase === 'prep' ? .7 : .45));
    const dz = { x: DZ.x + DZ.w / 2, y: DZ.y + DZ.h / 2 };
    if (low.length) { if (S.ramp.some(b => low.some(o => o.p === b.p))) return { txt: '📦 Hol einen Karton draußen im Hof (Tor hinten bei der Rampe) – anzielen oder antippen wählt den Karton', x: dz.x, y: dz.y, e: '📦' }; const lb = (S.loose || []).find(b => !b.empty && low.some(o => o.p === b.p)); if (lb) { const t = boxPos(S, lb); return { txt: `📦 ${P[lb.p].name}: Ein Karton steht noch ${t.x < 0 ? 'in der Lagerhalle' : t.y < 1 ? 'im Hof' : 'im Laden'} – hol ihn`, x: t.x, y: t.y, e: '📦' }; } if (S.ramp.length) return { txt: '📦 Hol einen Karton draußen im Hof (Warenannahme, markiert)', x: dz.x, y: dz.y, e: '📦' }; const pcx = S.objs.find(o => o.k === 'pc'), pt = pcx ? ctr(pcx) : { x: null, y: null }; return { txt: `💻 ${P[low[0].p].name} wird knapp – bestelle am Bestell-PC (Lieferung morgen früh)`, x: pt.x, y: pt.y, e: '💻' }; }
    const fresh = S.ramp.find(b => isNew(S, b)); if (fresh) return { txt: `📦 Neue Ware im Hof (${P[fresh.p].name}) – hol den Karton, er kommt ins freie Regal`, x: dz.x, y: dz.y, e: '📦' };
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
    else if (c.a === 'pickb') pickBox(S, c.b.id);
    else if (c.a === 'drop') dropBox(S);
    else if (c.a === 'sort') sortOut(S, c.o); else if (c.a === 'sticker') sticker(S, c.o); else if (c.a === 'stallput') stallPut(S, c.i, pl.carry.find(b => !b.empty)); else if (c.a === 'cafefill') cafeFill(S, pl.carry.find(b => !b.empty && D.CAFE_FILL[b.p])); else if (c.a === 'out') S.fx.push({ t: 'panel', n: 'draussen' });
    else if (c.a === 'back') { const i = pl.carry.findIndex(b => !b.empty); if (i >= 0) { S.ramp.push(pl.carry.splice(i, 1)[0]); pl._dropT = S.simT + 4; } }
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

  // ---------- Neue Systeme: Frische & MHD, Personal-Laune & Schichten, Kundenwünsche & Bewertung, Ereignisse, Wochenmarkt & Café, Billigo, Tag & Nacht, Koop ----------
  function extDefaults(S) {
    S.asks = S.asks || []; S.rate = Object.assign({ preis: .7, auswahl: .7, sauber: .8, frische: .85, service: .7 }, S.rate || {});
    S.out = Object.assign({ n: 0, stalls: [], cafe: 0, cup: 0, cake: 0, acc: 0, cacc: 0, sit: 0 }, S.out || {}); S.out.stalls = S.out.stalls || [];
    S.rv = Object.assign({ rep: 50, share: .5, k: null, until: 0, p: null, fly: 0, guar: false, wk: 0, wins: 0 }, S.rv || {});
    S.tot = Object.assign({ saved: 0, stall: 0, cafe: 0, wishes: 0, siegel: 0, koop: 0, insp: 0 }, S.tot || {});
    S.staff.forEach(s => { if (s.mood == null) s.mood = s.k === 'robo' ? 100 : 80; if (!s.shift) s.shift = 'ganz'; });
    if (S.coop && !S.p2) coop(S, true); if (!S.coop) S.p2 = null; return S;
  }
  // Frische: o.age = Ø Alter in Tagen, life = Haltbarkeit. 'bald' = MHD morgen, 'mhd' = MHD heute, 'exp' = abgelaufen (bleibt liegen, bis aussortiert)
  const fresh = (S, o) => { if (!o || !o.p || !P[o.p] || !P[o.p].life || !o.qty) return null; if (o.exp) return 'exp'; const l = P[o.p].life - o.age; return l < 1 ? 'mhd' : l < 2 ? 'bald' : 'ok'; };
  const needsSticker = (S, o) => { const f = fresh(S, o); return (f === 'mhd' || f === 'bald') && !o.disc; };
  function freshGate(S, c, o) {   // Kunde prüft das MHD, bevor er zugreift
    const f = fresh(S, o); if (!f || f === 'ok') return null; const sp = c.type === 'spar' || c.type === 'stud';
    if (f === 'exp') { c.fbad = (c.fbad || 0) + 1; c.mood -= 15; S.rep = clamp(S.rep - .25, 5, 100); return { ok: false, why: '🤢', fresh: 1 }; }
    if (R() < (f === 'mhd' ? (o.disc ? (sp ? 0 : .12) : .5) : (o.disc ? 0 : .15))) { c.fbad = (c.fbad || 0) + 1; c.mood -= 5; return { ok: false, why: '🤨', fresh: 1 }; }
    return null;
  }
  function bought(S, c, o, q) {
    if (o.disc && P[o.p].life && P[o.p].life - o.age < 2) S.tot.saved += q;
    if (c.reg >= 0 && S.regs[c.reg] && S.regs[c.reg].fav === o.p) S.regs[c.reg].loy = Math.min(100, S.regs[c.reg].loy + 3);
    if (!o.qty) { o.disc = false; o.exp = false; o.rette = false; }
  }
  const favOf = c => { const b = c.basket.slice().sort((a, d) => d.price - a.price)[0]; return b ? b.p : null; };
  function sortOut(S, o) {
    if (!o || !o.exp || !o.qty) return false; const T = S.today; T.wasteV = (T.wasteV || 0) + o.qty * wholesale(S, o.p); (T.wasteL = T.wasteL || []).push(P[o.p].name + ' ×' + o.qty);
    S.fx.push({ t: 'sorted', p: o.p, n: o.qty }); o.qty = 0; o.exp = false; o.disc = false; o.rette = false; o.age = 0; S.xp += 1; return true;
  }
  function sticker(S, o) { if (!o || !needsSticker(S, o)) return false; o.disc = true; o.tag = true; o.tagp = effPrice(S, o); S.fx.push({ t: 'sticker', o: o.id }); S.xp += .5; return true; }
  function markRette(S, id) { const o = obj(S, id), f = fresh(S, o); if (!o || (f !== 'mhd' && f !== 'bald')) return false; o.rette = !o.rette; return true; }
  function extRette(S) {   // abends: Rette-mich-Tüten (markierte Regale, mit App alles mit MHD heute) statt Tonne
    const T = S.today; let n = 0, v = 0;
    S.objs.forEach(o => { const f = fresh(S, o); if (f !== 'mhd' && f !== 'bald') { o.rette = false; return; } if (!(o.rette || (S.up.rette && f === 'mhd'))) return; v += Math.round(effPrice(S, o) * .35) * o.qty; n += o.qty; T.cogs += wholesale(S, o.p) * o.qty; o.qty = 0; o.age = 0; o.disc = false; o.rette = false; });
    if (n) { S.money += v; T.rev += v; S.tot.saved += n; S.rep = clamp(S.rep + Math.min(2, n * .05), 5, 100); (T.ext = T.ext || {}).rette = [n, v]; }
  }
  // Personal: Laune (wirkt auf Tempo), Schichten, Lob & Prämie
  const moodF = s => .72 + .42 * clamp((s.mood == null ? 80 : s.mood) / 100, 0, 1);
  function onShift(S, s) { const sh = D.SHIFTS[s.shift] || D.SHIFTS.ganz; if (S.phase === 'prep') return sh.a === 0; if (S.phase === 'closing') return sh.b === 1; if (S.phase !== 'open') return false; const f = S.t / dayLen(S); return f >= sh.a && f < sh.b; }
  function staffGate(S, s, d) {   // true = hat gerade frei (unsichtbar vor der Tür)
    const dt = doorTile(S);
    if (!onShift(S, s)) { if (!s.off) { s.off = true; if (s.carry) { S.ramp.push(s.carry); s.carry = null; } s.task = null; s.path = []; s.pi = 0; if (s.k === 'kasse') s.reg = null; s.x = dt[0] + .5; s.y = dt[1] - .5; } return true; }
    if (s.off) { s.off = false; s.x = dt[0] + .5; s.y = dt[1] - .5; s.path = []; s.pi = 0; if (S.phase === 'open') note(S, `${D.STAFF[s.k].e} ${s.name} beginnt die ${D.SHIFTS[s.shift].n}.`, 'info'); }
    if (S.phase === 'open' && s.k !== 'robo') { const sh = s.shift || 'ganz', tr = s.trait, k = .011 * (sh === 'ganz' ? 1.4 : .8) * (S.up.pause ? .5 : 1) * (tr === 'fleissig' ? .5 : 1) * ((tr === 'eule' && sh === 'spaet') || (tr === 'lerche' && sh === 'frueh') ? .25 : 1) * (S.weather === 'heiss' && !S.up.klima ? 1.5 : 1) * (S.t > DAYLEN ? 1.4 : 1); s.mood = clamp(s.mood - d * k, 0, 100); }
    return false;
  }
  const staffBy = (S, id) => S.staff.find(x => x.id === id && x.k !== 'robo');
  function praise(S, id) { const s = staffBy(S, id); if (!s || s.praised === S.day) return false; s.praised = S.day; s.mood = clamp(s.mood + 10, 0, 100); note(S, `👏 ${s.name} freut sich über dein Lob.`, 'good'); return true; }
  function bonus(S, id) { const s = staffBy(S, id); if (!s || s.bonusD === S.day) return false; s.bonusD = S.day; S.today.bonus = (S.today.bonus || 0) + 2500; s.mood = clamp(s.mood + 22, 0, 100); note(S, `💶 ${s.name} bekommt heute Abend 25 € Prämie – die Laune steigt!`, 'good'); return true; }
  function setShift(S, id, sh) { const s = S.staff.find(x => x.id === id); if (!s || !D.SHIFTS[sh]) return false; s.shift = sh; return true; }
  // Kundenwünsche, Bewertung nach Bereichen
  function askFor(S, c, p) {
    if (c.type === 'insp' || S.asks.length >= 4 || S.asks.some(a => a.p === p) || R() > .1) return;
    S.asks.push({ id: S.nid++, p, n: c.name, reg: c.reg, day: S.day, due: S.day + 2 }); bub(c, '🙋'); c.bt = 3; note(S, `🙋 ${c.name} fragt: „Habt ihr bald wieder ${P[p].name}?“ – bis übermorgen ins Regal (Fenster „Kunden“).`, 'info');
  }
  function rateUpd(S, v) { Object.keys(v).forEach(k => { S.rate[k] += (clamp(v[k], 0, 1) - S.rate[k]) * .04; }); }
  const rateStars = (S, k) => Math.round((1 + 4 * clamp(S.rate[k], 0, 1)) * 10) / 10;
  // Ereignisse & Wetter
  const evActive = (S, k) => S.ev.some(e => e.k === k && S.t >= e.t0 && S.t <= e.t1);
  function evIcons(S) { const out = []; S.ev.forEach(e => { const E = D.EVENTS[e.k]; if (!E || out.includes(E.e)) return; if ((S.t >= e.t0 && S.t <= e.t1 && e.k !== 'wetter' && e.k !== 'rohr') || (e.k === 'kontrolle' && S.customers.some(c => c.type === 'insp'))) out.push(E.e); }); if (S.rv.k && D.RIVAL[S.rv.k]) out.push(D.RIVAL[S.rv.k].e); return out; }
  const thiefMul = S => (evActive(S, 'bande') ? 5 : 1) * (S.t > DAYLEN ? 1.6 : 1);
  function todMul(S, ty) {   // Tageszeit: morgens Senioren, mittags Familien & Studenten, abends Berufstätige, nachts Nachtschwärmer
    const f = S.t / DAYLEN; if (f > 1) return { stud: 2, job: 1.6, sen: .15, fam: .5 }[ty] || 1;
    return ty === 'sen' ? 1.7 - 1.3 * f : ty === 'job' ? (f > .72 ? 2.2 : f < .12 ? 1.4 : .7) : ty === 'stud' ? (f > .35 && f < .8 ? 1.4 : .8) : ty === 'fam' ? (f > .3 && f < .75 ? 1.3 : .8) : 1;
  }
  function extSpawn(S) {
    const rv = S.rv, ra = rv.k && D.RIVAL[rv.k] ? D.RIVAL[rv.k].spawn : 1;
    return (.85 + .3 * clamp(rv.share, 0, 1)) * (S.up.treue && ra < 1 ? 1 - (1 - ra) / 2 : ra) * (rv.fly === S.day ? 1.1 : 1) * (evActive(S, 'ansturm') ? 1.45 : 1) * (evActive(S, 'bruecke') ? 1.5 : 1) * (S.t > DAYLEN ? .7 : 1);
  }
  function spawnExt(S, c) {
    if (c.reg >= 0 && S.regs[c.reg]) { const f = S.regs[c.reg].fav; if (f && P[f] && S.lic[P[f].cat] && !c.list.some(l => l.p === f)) c.list.unshift({ p: f, q: 1, got: 0 }); }
    if (evActive(S, 'ansturm') && c.type !== 'insp') c.list.forEach(l => { l.q += 1; });
    const w = D.WEATHER[S.weather]; if (w.wet) { c.spd *= 1.12; if (R() < .22 * w.wet * (S.up.schirm ? .25 : 1) && S.messes.length < 12) { const dt = doorTile(S), x = dt[0] + (R() < .5 ? 0 : 1), y = dt[1] - 1; if (!solid(S, x, y) && !S.messes.some(m => m.x === x && m.y === y)) S.messes.push({ x, y, id: S.nid++ }); } }
    if (c.type !== 'insp' && R() < .025 && S.asks.length < 4) { const lock = Object.values(P).filter(p => !S.lic[p.cat] && D.CATS[p.cat].lvl <= S.level + 1 && !S.asks.some(a => a.p === p.id)); if (lock.length) { const p = pick(lock); S.asks.push({ id: S.nid++, p: p.id, n: c.name, reg: c.reg, day: S.day, due: S.day + 4, lic: 1 }); note(S, `🙋 ${c.name} wünscht sich ${p.e} ${p.name} – dafür brauchst du die Lizenz „${D.CATS[p.cat].name}“.`, 'info'); } }
  }
  function inspect(S, c) {   // Lebensmittelkontrolle: abgelaufene Ware und Schmutz
    if (c.inspd) return; c.inspd = 1; S.tot.insp++; const ex = S.objs.filter(o => o.exp && o.qty > 0), ms = S.messes.length, fine = ex.length * 4000 + Math.max(0, ms - 2) * 2000;
    if (!fine) { S.tot.siegel++; S.rep = clamp(S.rep + 3, 5, 100); S.xp += 20; S.buzz = clamp(S.buzz + .03, -.25, .5); bub(c, '👍'); S.fx.push({ t: 'cash' }); note(S, '🏅 Lebensmittelkontrolle bestanden: sauber und frisch! Dein Ruf steigt.', 'good'); return; }
    S.today.fines = (S.today.fines || 0) + fine; S.rep = clamp(S.rep - 2 - ex.length, 5, 100); bub(c, '📝'); S.fx.push({ t: 'bad' });
    note(S, `🕵️‍♀️ Mängel bei der Kontrolle: ${[ex.length ? ex.length + '× abgelaufene Ware' : '', ms > 2 ? ms + ' Pfützen/Müll' : ''].filter(Boolean).join(', ')} – Bußgeld ${D.fmt(fine)} (abends).`, 'bad');
  }
  function extDay(S) {   // morgens: Ereignisse würfeln, Personal erholt sich, Billigo, Höfe liefern
    const sz = season(S), nx = season(S, S.day + 1);
    if (S.weather === 'heiss') S.ev.push({ k: 'hitze', t0: 0, t1: dayLen(S) });
    if (nx.hol && nx.d === nx.hol.from) S.ev.push({ k: 'ansturm', t0: 60, t1: 520 }); else if (R() < .06) S.ev.push({ k: 'bruecke', t0: 0, t1: 300 });
    if (S.level >= 3 && R() < .08) { const t0 = ri(120, 360); S.ev.push({ k: 'bande', t0, t1: t0 + 160 }); }
    if (R() < .05) S.ev.push({ k: 'rohr', t0: ri(100, 450), t1: 0 });
    if (S.weather === 'gewitter' && R() < .45 && !S.ev.some(e => e.k === 'stromausfall')) { const t0 = ri(150, 400); S.ev.push({ k: 'stromausfall', t0, t1: t0 + 50 }); }
    S.wx2 = null; if (R() < .25) { const w = D.SEASONS[sz.i].w, to = wpick(Object.keys(w).filter(k => k !== S.weather), k => w[k]); if (to) { const t = ri(180, 420); S.wx2 = { t, to }; S.ev.push({ k: 'wetter', t0: t, t1: t }); } }
    S.staff.slice().forEach(s => { s.off = false; if (s.k === 'robo') { s.mood = 100; return; } s.mood = clamp((s.mood == null ? 80 : s.mood) + 6, 0, 100); if (s.mood < 12) { fire(S, s.id); note(S, `😤 ${s.name} hat gekündigt – zu schlechte Laune. Lob, Prämien, passende Schichten und ein Pausenraum helfen.`, 'bad'); } });
    rivalDay(S); outDay(S);
  }
  function extTick(S, d) {
    S.ev.forEach(e => {
      if (e.done || S.t < e.t0) return; const E = D.EVENTS[e.k];
      if (e.k === 'kontrolle') { e.done = 1; if (spawn(S, 'insp')) note(S, '🕵️‍♀️ Lebensmittelkontrolle! Die Kontrolleurin prüft Sauberkeit und Haltbarkeit – schnell aussortieren und wischen.', 'bad'); }
      else if (e.k === 'rohr') { e.done = 1; for (let i = 0; i < 6 && S.messes.length < 14; i++) { const x = ri(1, S.W - 2), y = ri(1, S.H - 2); if (!solid(S, x, y)) S.messes.push({ x, y, id: S.nid++ }); } S.fx.push({ t: 'bad' }); note(S, `${E.e} ${E.n}! Überall Pfützen – schnell wischen.`, 'bad'); }
      else if (e.k === 'wetter') { e.done = 1; if (S.wx2) { S.weather = S.wx2.to; note(S, `🌦️ Wetterumschwung: jetzt ${D.WEATHER[S.weather].e} ${D.WEATHER[S.weather].name}.`, 'info'); if (S.weather === 'heiss' && !S.ev.some(x => x.k === 'hitze')) S.ev.push({ k: 'hitze', t0: S.t, t1: dayLen(S), done: 1 }); } }
      else if (e.k === 'bande' || e.k === 'hitze' || e.k === 'ansturm' || e.k === 'bruecke') { e.done = 1; note(S, `${E.e} ${E.n}: ${E.d}`, e.k === 'bande' ? 'bad' : 'info'); }
    });
    outTick(S, d);
  }
  function extEnd(S, bills, waste, addWaste) {   // abends: Rechnungen, Kundenwünsche, Stände, Marktanteil, Wochenduell
    const T = S.today, X = T.ext = T.ext || {};
    if (T.wasteV) { addWaste(T.wasteV); (T.wasteL || []).forEach(w => waste.push(w + ' (aussortiert)')); }
    if (S.up.spaet) bills.push(['Spätverkauf (Strom & Zuschlag)', 1500]); if (T.bonus) bills.push(['Prämien', T.bonus]); if (T.fines) bills.push(['Bußgeld Lebensmittelkontrolle', T.fines]);
    if (T.flyer) bills.push(['Flyer gegen Billigo', T.flyer]); if (S.rv.guar) bills.push(['Preisgarantie', 2500]); if (S.out.n) bills.push(['Standgebühr Wochenmarkt', 300 * S.out.n]); if (S.out.cafe) bills.push(['Café-Betrieb', 600 * S.out.cafe]);
    const off = offered(S); X.asks = [];
    S.asks = S.asks.filter(a => {
      if (off[a.p]) { let n = Math.min(4, off[a.p]), pay = 0; S.objs.forEach(o => { if (n && isShelf(o) && o.p === a.p && o.qty > 0) { const k = Math.min(n, o.qty); o.qty -= k; n -= k; pay += k * effPrice(S, o); T.cogs += k * wholesale(S, a.p); } }); pay = Math.round(pay * 1.1); S.money += pay; T.rev += pay; S.rep = clamp(S.rep + 1, 5, 100); S.xp += 8; S.tot.wishes++; if (a.reg >= 0 && S.regs[a.reg]) S.regs[a.reg].loy = Math.min(100, S.regs[a.reg].loy + 10); else if (S.regs.length < 120) S.regs.push({ n: a.n, t: 'fam', loy: 25, fav: a.p }); X.asks.push('✔ ' + a.n + ': ' + P[a.p].name + ' (+' + D.fmt(pay) + ')'); return false; }
      if (S.day >= a.due) { S.rep = clamp(S.rep - .6, 5, 100); X.asks.push('✖ ' + a.n + ' wartet vergeblich auf ' + P[a.p].name); return false; } return true;
    });
    S.out.stalls.forEach(st => { if (!st.qty || !st.p) return; st.age += 1; const l = P[st.p].life; if (l && st.age > l) { addWaste(st.qty * P[st.p].cost); waste.push(P[st.p].name + ' ×' + st.qty + ' (Marktstand)'); st.qty = 0; st.age = 0; } });
    if (T.stall) X.stall = T.stall; if (T.cafe) X.cafe = T.cafe;
    const rv = S.rv, idx = priceIdx(S), me = S.rep * (1 + clamp(S.buzz, -.25, .5)) * clamp(1.6 - idx * .6, .7, 1.3) * (rv.guar ? 1.08 : 1) * (S.up.treue ? 1.05 : 1), them = rv.rep * (rv.k === 'skandal' ? .6 : rv.k ? 1.08 : 1);
    rv.share = clamp(rv.share + (me / (me + them) - rv.share) * .35, .05, .95); rv.wk += T.served;
    if (S.day % 7 === 0) { const win = rv.share >= .5; X.duel = { win, share: rv.share, cust: rv.wk }; if (win) { rv.wins++; S.money += 10000; S.rep = clamp(S.rep + 1, 5, 100); } rv.wk = 0; }
    S.lastTop = Object.keys(T.units).sort((a, b) => T.units[b] - T.units[a])[0] || null; if (S.coop) S.tot.koop++;
  }
  // Billigo: Marktanteil, Aktionen, Gegenmaßnahmen
  function priceIdx(S) { const off = Object.keys(offered(S)); if (!off.length) return 1; return off.reduce((a, p) => a + S.price[p] / ref(S, p), 0) / off.length; }
  function rivalDay(S) {
    const rv = S.rv; if (rv.until <= S.day) { rv.k = null; rv.p = null; } rv.rep = clamp(rv.rep + (52 + S.level * 1.2 - rv.rep) * .12 + (R() - .5) * 6, 20, 95);
    if (rv.k || S.day < 4 || R() > .3) return; const k = pick(Object.keys(D.RIVAL)), a = D.RIVAL[k];
    if (k === 'kopie') { if (!S.lastTop) return; rv.p = S.lastTop; } rv.k = k; rv.until = S.day + a.days; if (k === 'skandal') rv.rep = clamp(rv.rep - 12, 20, 95);
    note(S, `${a.e} ${a.n}: ${k === 'kopie' ? 'Billigo verkauft ' + P[rv.p].name + ' heute 15 % billiger.' : a.d}`, k === 'skandal' ? 'good' : 'bad');
    if (k === 'abwerben') S.staff.filter(s => s.k !== 'robo' && s.mood < 45 && R() < (S.up.treue ? .3 : .5)).forEach(s => { fire(S, s.id); note(S, `🤝 ${s.name} wechselt zu Billigo – mit besserer Laune wäre das nicht passiert.`, 'bad'); });
  }
  function flyer(S) { if (S.rv.fly === S.day) return false; S.rv.fly = S.day; S.today.flyer = (S.today.flyer || 0) + 15000; S.rv.share = clamp(S.rv.share + .03, .05, .95); note(S, '📰 Deine Flyer sind verteilt: heute mehr Kundschaft (abends 150 €).', 'good'); return true; }
  function guarantee(S) { S.rv.guar = !S.rv.guar; note(S, S.rv.guar ? '🤝 Preisgarantie an: Niemand geht mehr wegen Billigo-Preisen (25 €/Tag).' : 'Preisgarantie beendet.', 'info'); return true; }
  // Wochenmarkt & Café vor dem Laden (Gehweg y ≥ H): nur der Spieler läuft hier, Kunden kaufen im Vorbeigehen
  const OUT_D = 3.4, stallRect = (S, i) => ({ x: 4.6 + i * 2.55, y: S.H + .45, w: 2.1, h: .95 }), cafeRect = S => ({ x: S.W - 5.2, y: S.H + .4, w: 2.3, h: .85 });
  const tablesOf = S => { const n = [0, 1, 3, 5][S.out.cafe] || 0, out = []; for (let j = 0; j < n; j++) out.push({ x: S.W - 5.6 + (j % 3) * 1.45, y: S.H + 1.85 + Math.floor(j / 3) * 1.15, r: .36 }); return out; };
  function outBlocked(S, x, y) { for (let i = 0; i < S.out.n; i++) if (inR(x, y, stallRect(S, i), .04)) return true; if (S.out.cafe) { if (inR(x, y, cafeRect(S), .04)) return true; if (tablesOf(S).some(t => Math.hypot(x - t.x, y - t.y) < t.r)) return true; } return false; }
  function nearOut(S) { const pl = S.player; if (pl.y < S.H - .25) return null; for (let i = 0; i < S.out.n; i++) if (rectDist(pl.x, pl.y, stallRect(S, i)) < 1.1) return { k: 'stall', i }; if (S.out.cafe && rectDist(pl.x, pl.y, cafeRect(S)) < 1.1) return { k: 'cafe' }; return null; }
  const wxOut = S => ({ sonne: 1.3, heiss: 1.15, wolke: 1, regen: .45, gewitter: .25, schnee: .45, kalt: .7, nebel: .8 }[S.weather] || 1);
  function buyStall(S) { const n = S.out.n, t = D.STALLS[n]; if (!t) return false; if (S.level < t.lvl) { note(S, `Der nächste Marktstand kommt ab Stufe ${t.lvl}.`, 'bad'); return false; } if (S.money < t.price) { note(S, 'Nicht genug Geld für den Marktstand.', 'bad'); return false; } S.money -= t.price; S.out.n++; if (!S.out.stalls[n]) S.out.stalls[n] = { farm: null, p: null, qty: 0, age: 0, price: 0, sold: 0 }; note(S, '🧺 Neuer Marktstand vor dem Laden! Wähle einen Hof, der jeden Morgen liefert.', 'good'); return true; }
  function toRamp(S, st) { if (st.qty && st.p) S.ramp.push({ p: st.p, n: st.qty, age: st.age }); st.qty = 0; st.age = 0; }
  function setFarm(S, i, fid) { const st = S.out.stalls[i], f = D.FARMS.find(x => x.id === fid); if (!st || i >= S.out.n || !f || S.level < f.lvl) return false; if (!f.p.includes(st.p)) { toRamp(S, st); st.p = f.p[0]; st.price = Math.round(ref(S, st.p) * 1.25 / 5) * 5; } st.farm = fid; return true; }
  function stallProd(S, i) { const st = S.out.stalls[i], f = st && D.FARMS.find(x => x.id === st.farm); if (!f || f.p.length < 2) return false; toRamp(S, st); st.p = f.p[(f.p.indexOf(st.p) + 1) % f.p.length]; st.price = Math.round(ref(S, st.p) * 1.25 / 5) * 5; return true; }
  function stallPrice(S, i, dv) { const st = S.out.stalls[i]; if (!st || !st.p) return false; st.price = clamp(Math.round(st.price + dv), Math.round(P[st.p].cost * 1.2), P[st.p].ref * 3); return true; }
  function buyCafe(S) { const n = D.CAFE[S.out.cafe + 1]; if (!n) return false; if (S.level < n.lvl) { note(S, `${n.n} gibt es ab Stufe ${n.lvl}.`, 'bad'); return false; } if (S.money < n.price) { note(S, 'Nicht genug Geld fürs Café.', 'bad'); return false; } S.money -= n.price; S.out.cafe++; note(S, `☕ ${n.n} eröffnet! Bring Kaffee- und Kuchen-Kartons an die Theke vor dem Laden.`, 'good'); return true; }
  function emptyBox(S, b) { if (b.n > 0) return; const pl = S.player; if (S.objs.some(x => x.k === 'container')) b.empty = true; else { const i = pl.carry.indexOf(b); if (i >= 0) pl.carry.splice(i, 1); } }
  function stallPut(S, i, b) { const st = S.out.stalls[i]; if (!st || !b || b.empty || b.p !== st.p) return false; const k = Math.min(D.STALL_CAP - st.qty, b.n); if (k <= 0) return false; st.age = (st.age * st.qty + (b.age || 0) * k) / (st.qty + k); st.qty += k; b.n -= k; S.fx.push({ t: 'put', p: b.p }); emptyBox(S, b); return true; }
  function cafeFill(S, b) {
    const f = b && !b.empty && D.CAFE_FILL[b.p]; if (!f || !S.out.cafe) return false; const key = f[0], max = key === 'cup' ? 240 : 140, k = Math.min(b.n, Math.floor((max - S.out[key]) / f[1]));
    if (k <= 0) { note(S, '☕ Im Café ist dafür kein Platz mehr.', 'info'); return false; } S.out[key] += k * f[1]; b.n -= k; S.today.cogs += k * wholesale(S, b.p); S.fx.push({ t: 'put', p: b.p }); emptyBox(S, b); return true;
  }
  function cafeVisit(S, mul, force) {
    const o = S.out, L = D.CAFE[o.cafe]; if (!o.cafe || (!force && R() > L.p * mul * wxOut(S))) return; let v = 0, n = 0; if (o.cup > 0) { o.cup--; v += D.CUP; n++; } if (o.cake > 0 && (!v || R() < .5)) { o.cake--; v += D.CAKE; n++; }
    if (!v) { o.miss = (o.miss || 0) + 1; if (o.miss % 6 === 1) note(S, '☕ Das Café ist leer – bring Kaffee oder Kuchen an die Theke vor dem Laden.', 'bad'); return; }
    S.money += v; S.today.rev += v; S.today.cafe = (S.today.cafe || 0) + v; S.tot.cafe += n; o.sit = Math.min(L.seats, o.sit + 1);
  }
  function outTick(S, d) {
    const o = S.out, wf = wxOut(S); o.sit = Math.max(0, o.sit - d * .03); const live = o.stalls.slice(0, o.n).filter(s => s.p && s.qty > 0);
    if (live.length) { o.acc += d * .05 * live.length * wf * (.6 + S.rep / 100 * .8) * curve(Math.min(S.t, DAYLEN)) * (S.t > DAYLEN ? .4 : 1);
      while (o.acc >= 1) { o.acc -= 1; const st = wpick(live, s => s.qty > 0 ? Math.pow(ref(S, s.p) / Math.max(1, s.price), 2) : 0); if (!st) break; if (R() > clamp(1.9 - st.price / ref(S, st.p), .08, 1)) continue; const q = Math.min(st.qty, ri(1, 3)), v = q * st.price, T = S.today; st.qty -= q; st.sold = (st.sold || 0) + q; S.money += v; T.rev += v; T.items += q; T.units[st.p] = (T.units[st.p] || 0) + q; T.revBy[st.p] = (T.revBy[st.p] || 0) + v; T.stall = (T.stall || 0) + v; S.tot.stall += q; S.xp += .4; } }
    if (o.cafe) { o.cacc += d * .012 * o.cafe * wf * (S.t > DAYLEN ? .5 : 1); while (o.cacc >= 1) { o.cacc -= 1; cafeVisit(S, 1, true); } }
  }
  function outDay(S) {
    const o = S.out, got = []; o.sit = 0; o.miss = 0;
    o.stalls.forEach((st, i) => { st.sold = 0; if (i >= o.n || !st.farm || !st.p) return; const n = Math.min(D.STALL_DELIV, D.STALL_CAP - st.qty); if (n <= 0) return; const c = Math.round(P[st.p].cost * 1.15) * n, f = D.FARMS.find(x => x.id === st.farm); if (S.money < c) { note(S, `🧑‍🌾 ${f.n}: Zu wenig Geld – heute keine Lieferung.`, 'bad'); return; } S.money -= c; S.today.cogs += c; st.age = st.qty ? st.age * st.qty / (st.qty + n) : 0; st.qty += n; got.push(P[st.p].e + ' ' + n); });
    if (got.length) note(S, `🧑‍🌾 Die Höfe haben geliefert (${got.join(', ')}) – an deinen Wochenmarkt-Ständen vor dem Laden.`, 'good');
    if (o.cafe && S.staff.some(s => s.k === 'baecker')) { const k = Math.min(12, 140 - o.cake); if (k > 0) { o.cake += k; S.today.cogs += k * 60; } }
  }
  // Koop: zweite Spielfigur; Aktionen laufen über dieselben Funktionen (S.player wird kurz getauscht)
  function coop(S, on) {
    if (on) { if (!S.p2) { const p = S.player; S.p2 = { x: p.x + .7, y: p.y, vx: 0, vy: 0, carry: [], yaw: 0 }; if (pBlocked(S, S.p2.x, S.p2.y)) { S.p2.x = p.x; S.p2.y = p.y; } } S.coop = true; }
    else { if (S.p2) S.p2.carry.forEach(b => { if (!b.empty) S.ramp.push(b); }); S.p2 = null; S.coop = false; } return S.coop;
  }
  function as2(S, fn) { if (!S.p2) return null; const p = S.player; S.player = S.p2; try { return fn(); } finally { S.player = p; } }

  // ---------- Hauptschritt ----------
  function openShop(S) { if (S.phase !== 'prep') return false; if (!S.objs.some(o => o.k === 'kasse' || o.k === 'sco')) { note(S, 'Ohne Kasse kein Geschäft!', 'bad'); return false; } if (!Object.keys(offered(S)).length) { note(S, 'Fülle erst ein Regal mit Ware.', 'bad'); return false; } S.phase = 'open'; S.t = 0; S.spawnAcc = 0; return true; }
  function tick(S, d) {
    S.simT += d; boxIds(S); movePlayer(S, d); if (S.p2) movePlayer(S, d, S.p2);
    if (S.phase === 'open') {
      S.t += d; S.spawnAcc += spawnRate(S) * d; const cap0 = 10 + 2 * S.level; while (S.spawnAcc >= 1) { S.spawnAcc -= 1; if (S.customers.length < cap0) spawn(S); }
      S.ev.forEach(e => { if (e.k === 'promi' && !e.done && S.t >= e.t0) { e.done = 1; const c = spawn(S, 'krit'); if (c) note(S, '🧐 Eine Testerin ist im Laden – gib dein Bestes!', 'info'); } if (e.k === 'stromausfall') { const on = S.t >= e.t0 && S.t <= e.t1; if (on && !S.blackout) { S.blackout = true; note(S, '⚡ Stromausfall! Kühlung ist aus.', 'bad'); } if (!on && S.blackout && S.t > e.t1) { S.blackout = false; if (!S.up.notstrom) { S.objs.forEach(o => { if (isShelf(o) && o.p && (o.k === 'kuehl' || o.k === 'frost')) { const l = Math.round(o.qty * .4); o.qty -= l; S.today.stolen += l * wholesale(S, o.p); } }); note(S, 'Kühlware ist teilweise verdorben.', 'bad'); } else note(S, 'Notstrom hat alles gerettet.', 'good'); } } });
      extTick(S, d); if (S.t >= dayLen(S)) { S.phase = 'closing'; S.closeT = 0; note(S, 'Feierabend! Letzte Kunden werden bedient.', 'info'); }
    }
    if (S.phase === 'closing') { S.closeT += d; if (S.closeT > 40) S.customers.forEach(c => { if (c.st !== 'leave' && c.st !== 'pay' && !WANTED.includes(c.st)) { const r = obj(S, c.reg_q); if (r) r.q = r.q.filter(i => i !== c.id); finish(S, c, true); leaveFor(S, c); } }); }
    S.orders.some(o => o.when === 'express') && deliver(S, 'express'); if (S.backlog.length) flush(S);
    while (S.xp >= lvlNeed(S.level) && S.level < 20) { S.level++; note(S, `⭐ Stufe ${S.level} erreicht! Neue Möglichkeiten im Menü.`, 'good'); }
    assistTick(S, d); if (S.p2) as2(S, () => assistTick(S, d)); S.customers.forEach(c => tickCustomer(S, c, d)); S.customers = S.customers.filter(c => !c.dead); S.police.forEach(p => tickPolice(S, p, d)); S.police = S.police.filter(p => !p.dead); S.staff.forEach(s => tickStaff(S, s, d));
    if (S.phase === 'closing' && !S.customers.length) endDay(S);
  }
  function step(S, dt) { if (S.phase === 'summary') return; const n = Math.max(1, Math.ceil(dt / .1)), d = dt / n; for (let i = 0; i < n; i++) { tick(S, d); if (S.phase === 'summary') break; } }
  const clock = S => { const m = Math.floor(8 * 60 + Math.min(S.t, dayLen(S)) * MIN_PER_SEC); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const save = S => JSON.stringify(S, (k, v) => k[0] === '_' ? undefined : v);
  const load = js => { const S = JSON.parse(js); if (S.buzz == null) S.buzz = 0; if (S.shopName === 'Markthalle 24') S.shopName = 'Marktrausch'; if (!S.shopName) { S.shopName = 'Marktrausch'; S.slogan = 'Frisch · Fair · Freundlich'; S.signCol = '#0f2b5a'; S.named = true; } S.cart = S.cart || {}; S.rules = S.rules || {}; if (!S.floor) { S.floor = 'fliese'; S.wall = 'beige'; S.own = { floor: { fliese: true }, wall: { beige: true } }; } if (S.assist == null) S.assist = true; if (S.hints == null) S.hints = true; S.reviews = S.reviews || []; S.ach = S.ach || {}; S.tot = Object.assign({ recipes: 0, caught: 0, served: 0, refused: 0, viol: 0, paper: 0, mis: 0 }, S.tot || {}); S.paper = S.paper || 0; S.loose = S.loose || []; S.wh = S.wh || { lvl: 0, list: [0, 1] }; S.pre = S.pre || []; if (!S.deals) rollDeals(S); if (S.cardManual == null) S.cardManual = true; S.customers.forEach(c => { if (c.st === 'card') c.chW = 99; }); S.objs.forEach(o => { if (isShelf(o) && o.p && o.tag == null) { o.tag = true; o.tagp = effPrice(S, o); } }); S.promo = S.promo || {}; S.staff.forEach(s => { if (!s.lv) s.lv = 1; }); S.police = S.police || []; S.fx = []; S.customers.forEach(c => { if (c.st === 'arrest' || c.st === 'held') { c.dead = true; } }); S.police = []; rebuild(S); if (!S.objs.some(o => o.k === 'radio')) for (const [x, y] of [[15, 5], [15, 8], [3, 8], [9, 9], [6, 9], [4, 4], [16, 9]]) if (place(S, 'radio', x, y, false, {})) break; if (!S.objs.some(o => o.k === 'container')) for (const [x, y] of [[4, 1], [4, 2], [3, 3], [16, 3], [16, 8], [1, 9]]) if (place(S, 'container', x, y, false, {})) break; if (!S.objs.some(o => o.k === 'pc')) for (const [x, y] of [[2, 4], [3, 6], [2, 8], [4, 9], [13, 9], [15, 9]]) if (place(S, 'pc', x, y, false, {})) break; extDefaults(S); const pl = S.player; if (pBlocked(S, pl.x, pl.y)) { pl.x = 3.5; pl.y = Math.min(9.5, S.H - 2.5); } if (S.p2 && pBlocked(S, S.p2.x, S.p2.y)) { S.p2.x = pl.x; S.p2.y = pl.y; } return S; };
  return { create, step, openShop, nextDay, order, hire, fire, place, pickUp, sell, setPrice, assign, buyLic, buyUp, expand, borrow, repay, act, context, layoutOK, rebuild, spawn, path, cap, fits, ref, rival, wholesale, effPrice, offered, isShelf, byKind, obj, clock, stars, save, load, rent, power, lvlNeed, loanMax, solid, doorTile, serviceTile, questVal, spawnRate, setRng: f => { R = f; }, pending, pendingCard, cardPay, pendingId, idDecision, trend, preDeliver, preStock, rollDeals, giveChange, setIdentity, cartSet, cartCost, cartOrder, suggest, unitsOf, capOf, rule, setRule, nearPC, buyFloor, buyWall, stockInto, season, train, togglePromo, wageOf, nextStep, shelfFor, DAYLEN, RAMP_MAX, rampMax, achDone, DOW, endDay, note, addStock, whLayout, pBlocked, boxById, boxPos, rampSpot, rackSlot, spotOf, pickBox, dropBox, whUp, whRack, boxIds, DZ, TRUCK, BH, RACK, YARD_Y, dayLen, fresh, needsSticker, sortOut, sticker, markRette, rateStars, buyStall, setFarm, stallProd, stallPrice, buyCafe, stallPut, cafeFill, stallRect, cafeRect, tablesOf, nearOut, OUT_D, wxOut, coop, as2, praise, bonus, setShift, onShift, moodF, flyer, guarantee, evIcons, evActive, priceIdx };
})();
if (typeof module !== 'undefined') module.exports = Sim;
