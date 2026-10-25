/* Sonnenhof – Spielkern ohne Browser (auch in Node testbar): Pflanzen, Tiere, Werkstätten, Markt, Bestellungen, Level,
 * Wetter und Jahreszeiten, Erfolge, Speichern/Laden. Zeiten in Millisekunden echter Zeit – Pflanzen wachsen auch weiter,
 * während niemand spielt (bis sie wieder Wasser brauchen). */
(function (root) {
  'use strict';
  const MIN = 60000, W = 18, H = 14;
  // Pflanzen: lv = ab Level, seed = Saatpreis, sell = Verkaufspreis, min = Wachstum in Minuten, xp, s = Lieblingsjahreszeiten (0 Frühling … 3 Winter),
  // regrow = trägt erneut nach x Minuten, col = Farbe der Frucht
  const CROPS = {
    zwiebel: { n: 'Frühlingszwiebel', e: '🧅', lv: 1, seed: 2, sell: 6, min: 1.5, xp: 1, s: [0, 2], col: '#e8d8a8' },
    salat: { n: 'Salat', e: '🥬', lv: 1, seed: 3, sell: 9, min: 2, xp: 1, s: [0, 2], col: '#6bcf4a' },
    karotte: { n: 'Karotte', e: '🥕', lv: 1, seed: 4, sell: 12, min: 3, xp: 2, s: [0, 1, 2], col: '#ff8a1e' },
    weizen: { n: 'Weizen', e: '🌾', lv: 2, seed: 2, sell: 7, min: 4, xp: 2, s: [1, 2], col: '#e8c04a' },
    kartoffel: { n: 'Kartoffel', e: '🥔', lv: 2, seed: 5, sell: 15, min: 5, xp: 2, s: [0, 2], col: '#c8955a' },
    erdbeere: { n: 'Erdbeere', e: '🍓', lv: 3, seed: 12, sell: 14, min: 6, xp: 3, s: [0, 1], regrow: 3, col: '#ff3a5a' },
    tomate: { n: 'Tomate', e: '🍅', lv: 3, seed: 8, sell: 26, min: 8, xp: 4, s: [1], col: '#ff4a2a' },
    mais: { n: 'Mais', e: '🌽', lv: 4, seed: 6, sell: 20, min: 9, xp: 4, s: [1, 2], col: '#ffd23a' },
    sonnenblume: { n: 'Sonnenblume', e: '🌻', lv: 4, seed: 7, sell: 24, min: 9, xp: 4, s: [1], col: '#ffc21a' },
    kuerbis: { n: 'Kürbis', e: '🎃', lv: 5, seed: 15, sell: 60, min: 15, xp: 7, s: [2], col: '#ff7a1a' },
    blaubeere: { n: 'Blaubeere', e: '🫐', lv: 6, seed: 20, sell: 16, min: 10, xp: 5, s: [1], regrow: 5, col: '#4a5aff' },
    gruenkohl: { n: 'Grünkohl', e: '🥦', lv: 6, seed: 9, sell: 32, min: 12, xp: 5, s: [2, 3], col: '#2e8a3a' },
    melone: { n: 'Melone', e: '🍉', lv: 8, seed: 25, sell: 95, min: 20, xp: 10, s: [1], col: '#3ab04a' }
  };
  // Tiere: Futter wird aus dem Lager genommen (eins der Futter-Sorten)
  const ANIMALS = {
    huhn: { n: 'Huhn', e: '🐔', lv: 2, cost: 60, out: 'ei', min: 4, feed: ['weizen', 'mais'], max: 6, xp: 2 },
    biene: { n: 'Bienenstock', e: '🐝', lv: 3, cost: 120, out: 'honig', min: 8, feed: null, max: 4, xp: 3 },
    kuh: { n: 'Kuh', e: '🐄', lv: 4, cost: 220, out: 'milch', min: 8, feed: ['weizen', 'mais'], max: 4, xp: 4 },
    schaf: { n: 'Schaf', e: '🐑', lv: 5, cost: 300, out: 'wolle', min: 10, feed: ['weizen', 'mais', 'salat'], max: 4, xp: 5 },
    schwein: { n: 'Schwein', e: '🐖', lv: 7, cost: 420, out: 'trueffel', min: 14, feed: ['kartoffel', 'mais', 'kuerbis'], max: 3, xp: 7 }
  };
  // Waren (Ernte, Tierprodukte, Verarbeitetes) mit Verkaufspreis
  const GOODS = { ei: { n: 'Ei', e: '🥚', sell: 10 }, honig: { n: 'Honig', e: '🍯', sell: 30 }, milch: { n: 'Milch', e: '🥛', sell: 24 }, wolle: { n: 'Wolle', e: '🧶', sell: 38 }, trueffel: { n: 'Trüffel', e: '🍄', sell: 90 },
    mehl: { n: 'Mehl', e: '🌾', sell: 28 }, marmelade: { n: 'Marmelade', e: '🫙', sell: 70 }, sosse: { n: 'Tomatensoße', e: '🥫', sell: 95 }, kaese: { n: 'Käse', e: '🧀', sell: 75 },
    brot: { n: 'Brot', e: '🍞', sell: 60 }, kuchen: { n: 'Kuchen', e: '🍰', sell: 160 }, pullover: { n: 'Pullover', e: '🧥', sell: 130 }, popcorn: { n: 'Popcorn', e: '🍿', sell: 64 },
    kuerbissuppe: { n: 'Kürbissuppe', e: '🍲', sell: 150 }, oel: { n: 'Sonnenblumenöl', e: '🧴', sell: 90 } };
  Object.keys(CROPS).forEach(k => { GOODS[k] = { n: CROPS[k].n, e: CROPS[k].e, sell: CROPS[k].sell, crop: true }; });
  // Werkstätten mit Rezepten (in → out, Minuten)
  const SHOPS = {
    muehle: { n: 'Mühle', e: '🌬️', lv: 3, cost: 150, rec: [{ in: { weizen: 3 }, out: 'mehl', min: 2 }, { in: { mais: 2 }, out: 'popcorn', min: 3 }] },
    kueche: { n: 'Einkochküche', e: '🍳', lv: 4, cost: 260, rec: [{ in: { erdbeere: 3 }, out: 'marmelade', min: 4 }, { in: { blaubeere: 3 }, out: 'marmelade', min: 4 }, { in: { tomate: 3 }, out: 'sosse', min: 5 }, { in: { kuerbis: 1, milch: 1 }, out: 'kuerbissuppe', min: 6 }] },
    molkerei: { n: 'Molkerei', e: '🧀', lv: 5, cost: 380, rec: [{ in: { milch: 2 }, out: 'kaese', min: 5 }] },
    baeckerei: { n: 'Bäckerei', e: '🥖', lv: 6, cost: 520, rec: [{ in: { mehl: 2 }, out: 'brot', min: 4 }, { in: { mehl: 1, ei: 2, milch: 1, erdbeere: 1 }, out: 'kuchen', min: 8 }] },
    spinnrad: { n: 'Spinnrad', e: '🧵', lv: 6, cost: 480, rec: [{ in: { wolle: 2 }, out: 'pullover', min: 7 }] },
    presse: { n: 'Ölpresse', e: '⚙️', lv: 7, cost: 600, rec: [{ in: { sonnenblume: 3 }, out: 'oel', min: 5 }] }
  };
  const SEASONS = [{ n: 'Frühling', e: '🌷' }, { n: 'Sommer', e: '☀️' }, { n: 'Herbst', e: '🍂' }, { n: 'Winter', e: '❄️' }];
  const WEATHER = { sonne: { n: 'Sonnig', e: '☀️' }, wolken: { n: 'Bewölkt', e: '⛅' }, regen: { n: 'Regen', e: '🌧️' }, gewitter: { n: 'Gewitter', e: '⛈️' }, schnee: { n: 'Schnee', e: '🌨️' } };
  const DAY_MS = 4 * MIN, SEASON_DAYS = 7;
  const lvXp = lv => Math.round(20 * Math.pow(lv, 1.6) + 15 * lv);   // XP für das nächste Level
  // Hof-Karte: Felder (x 2–9, y 2–9 = 8×8, anfangs 6×4 frei), Gebäude rechts, Ställe unten
  const FIELD = { x0: 2, y0: 2, w: 8, h: 8 };
  const EXPAND = [{ cost: 0, rows: [0, 4], cols: [0, 6] }, { cost: 120, lv: 2, rows: [0, 4], cols: [0, 8] }, { cost: 250, lv: 3, rows: [0, 6], cols: [0, 8] }, { cost: 500, lv: 5, rows: [0, 8], cols: [0, 8] }];
  const PLACES = {   // feste Plätze auf der Karte (x, y, w, h)
    haus: { x: 13, y: 1, w: 3, h: 3 }, markt: { x: 11, y: 2, w: 1, h: 1 }, brett: { x: 11, y: 4, w: 1, h: 1 }, teich: { x: 15, y: 10, w: 2, h: 2 },
    muehle: { x: 11, y: 6, w: 2, h: 2 }, kueche: { x: 13, y: 6, w: 2, h: 2 }, molkerei: { x: 15, y: 6, w: 2, h: 2 }, baeckerei: { x: 11, y: 8, w: 2, h: 2 }, spinnrad: { x: 13, y: 8, w: 2, h: 2 }, presse: { x: 11, y: 10, w: 2, h: 2 },
    huhn: { x: 2, y: 11, w: 3, h: 2 }, biene: { x: 13, y: 10, w: 2, h: 2 }, kuh: { x: 5, y: 11, w: 3, h: 2 }, schaf: { x: 8, y: 11, w: 3, h: 2 }, schwein: { x: 15, y: 12, w: 2, h: 1 } };

  function rng(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const goodsName = k => (GOODS[k] || { n: k }).n, goodsIcon = k => (GOODS[k] || { e: '❔' }).e;

  function newGame(o) {
    o = o || {}; const now = o.now || Date.now();
    const g = { v: 1, name: o.name || 'Sonnenhof', farmer: o.farmer || 'Bauer', coins: 60, xp: 0, lv: 1, day: 1, dayT: DAY_MS * .25, weather: 'sonne', next: 'sonne', expand: 0,
      tiles: {}, inv: { zwiebel: 0 }, seeds: { zwiebel: 6, karotte: 4 }, animals: {}, shops: {}, orders: [], orderN: 0, stats: { harvest: 0, earned: 0, orders: 0, sold: 0, crafted: 0, products: 0 },
      day0: { harvest: 0, earned: 0, orders: 0 }, ach: [], seed: (o.seed || now) >>> 0, last: now, created: now, tut: 0, fert: 3 };
    for (let i = 0; i < 3; i++) newOrder(g, now);
    return g;
  }
  const season = g => Math.floor((g.day - 1) / SEASON_DAYS) % 4;
  const fieldOpen = (g, fx, fy) => { const e = EXPAND[g.expand]; return fx >= e.cols[0] && fx < e.cols[1] && fy >= e.rows[0] && fy < e.rows[1]; };
  const tileKey = (x, y) => x + ',' + y;
  function inField(x, y) { return x >= FIELD.x0 && x < FIELD.x0 + FIELD.w && y >= FIELD.y0 && y < FIELD.y0 + FIELD.h; }
  function placeAt(x, y) { for (const k in PLACES) { const p = PLACES[k]; if (x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h) return k; } return null; }
  function tile(g, x, y) { return g.tiles[tileKey(x, y)] || null; }
  function canUse(g, x, y) { return inField(x, y) && fieldOpen(g, x - FIELD.x0, y - FIELD.y0); }

  // ---------- Felder ----------
  // Feld-Zustand: { soil: 1, crop, p (Wachstum ms), wet (gegossen für die aktuelle Stufe), fert, stage, dead }
  const STAGE = [0, .25, .6, 1];
  const growMs = (c) => c.min * MIN;
  function stageOf(t) { if (!t || !t.crop) return -1; const f = t.p / growMs(CROPS[t.crop]); return f >= 1 ? 3 : f >= .6 ? 2 : f >= .25 ? 1 : 0; }
  function till(g, x, y) { if (!canUse(g, x, y)) return { err: 'Dieses Feld gehört noch nicht zu deinem Hof.' }; const t = tile(g, x, y); if (t && t.crop && !t.dead) return { err: 'Hier wächst schon etwas.' };
    g.tiles[tileKey(x, y)] = { soil: 1 }; return { ok: 1 }; }
  function plant(g, x, y, crop) { const c = CROPS[crop]; if (!c) return { err: 'Unbekannte Saat' }; if (c.lv > g.lv) return { err: c.n + ' gibt es ab Level ' + c.lv + '.' };
    const t = tile(g, x, y); if (!canUse(g, x, y)) return { err: 'Dieses Feld gehört noch nicht zu deinem Hof.' }; if (!t || !t.soil) return { err: 'Erst mit der Hacke auflockern.' }; if (t.crop) return { err: 'Hier wächst schon etwas.' };
    if (!(g.seeds[crop] > 0)) { if (g.coins < c.seed) return { err: 'Keine Saat und zu wenig Geld (' + c.seed + ' 🪙).' }; g.coins -= c.seed; } else g.seeds[crop]--;
    Object.assign(t, { crop, p: 0, wet: g.weather === 'regen' || g.weather === 'gewitter', fert: 0, stage: 0, dead: 0 }); return { ok: 1 }; }
  function water(g, x, y) { const t = tile(g, x, y); if (!t || !t.soil) return { err: 'Hier ist kein Beet.' }; if (t.wet) return { err: 'Schon gegossen.' }; t.wet = true; return { ok: 1 }; }
  function fertilize(g, x, y) { const t = tile(g, x, y); if (!t || !t.crop || t.dead) return { err: 'Dünger wirkt nur auf Pflanzen.' }; if (t.fert) return { err: 'Schon gedüngt.' }; if (!(g.fert > 0)) return { err: 'Kein Dünger mehr – im Markt nachkaufen.' }; g.fert--; t.fert = 1; return { ok: 1 }; }
  function harvest(g, x, y, now) { const t = tile(g, x, y); if (!t || !t.crop) return { err: 'Hier ist nichts zu ernten.' }; if (t.dead) { g.tiles[tileKey(x, y)] = { soil: 1 }; return { ok: 1, cleared: 1 }; }
    if (stageOf(t) < 3) return { err: CROPS[t.crop].n + ' ist noch nicht reif.' };
    const c = CROPS[t.crop], n = t.fert ? 2 : 1; g.inv[t.crop] = (g.inv[t.crop] || 0) + n; g.stats.harvest += n; g.day0.harvest += n; const xp = addXp(g, c.xp * n);
    if (c.regrow) { t.p = Math.max(.6 * growMs(c), growMs(c) - c.regrow * MIN); t.wet = false; t.fert = 0; t.stage = 2; } else g.tiles[tileKey(x, y)] = { soil: 1 };
    checkAch(g); return { ok: 1, item: t.crop, n, xp }; }
  // ---------- Zeit ----------
  // dt echter Zeit: Pflanzen wachsen nur mit Wasser und stoppen am Ende einer Wachstumsstufe, bis wieder gegossen wird (Regen gießt alles)
  function tick(g, now, playing) {
    let dt = Math.max(0, now - (g.last || now)); g.last = now; if (!dt) return [];
    const ev = [], s = season(g), away = dt > 15000, gdt = Math.min(dt, 12 * 3600 * 1000);
    for (const k in g.tiles) { const t = g.tiles[k]; if (!t.crop || t.dead) continue; const c = CROPS[t.crop], G = growMs(c);
      let rate = (c.s.includes(s) ? 1 : s === 3 ? .4 : .6) * (t.fert ? 1.6 : 1); if (g.weather === 'sonne' && s === 1) rate *= 1.1;
      let rem = gdt; while (rem > 0 && t.p < G) { if (!t.wet) break; const st = stageOf(t), end = st >= 2 ? G : STAGE[st + 1] * G, need = (end - t.p) / rate;
        if (need <= rem) { t.p = end; rem -= need; t.wet = g.weather === 'regen' || g.weather === 'gewitter'; if (t.p >= G) ev.push({ k: 'ripe', tile: k }); } else { t.p += rem * rate; rem = 0; } } }
    for (const a in g.animals) { const A = g.animals[a], D = ANIMALS[a]; A.list.forEach(x => { if (x.ready || (!x.fed && D.feed)) return; x.t += gdt; if (x.t >= D.min * MIN) { x.ready = 1; x.t = 0; x.fed = 0; ev.push({ k: 'animal', a }); } }); }
    for (const k in g.shops) { const S = g.shops[k]; S.jobs.forEach(j => { if (!j.done && now >= j.end) { j.done = 1; ev.push({ k: 'craft', shop: k, out: j.out }); } }); }
    if (playing && !away) { g.dayT += dt; if (g.dayT >= DAY_MS) { g.dayT -= DAY_MS; ev.push(Object.assign({ k: 'day' }, endDay(g, now))); } }
    if (g.orders.length < 3 && (!g.orderAt || now >= g.orderAt)) { newOrder(g, now); ev.push({ k: 'order' }); }
    return ev;
  }
  function endDay(g, now) {
    const sum = Object.assign({ day: g.day, season: season(g) }, g.day0); g.day++; g.day0 = { harvest: 0, earned: 0, orders: 0 };
    const r = rng(g.seed ^ (g.day * 7919)), s = season(g), x = r();
    g.weather = g.next; g.next = s === 3 ? (x < .45 ? 'schnee' : x < .75 ? 'wolken' : 'sonne') : x < (s === 1 ? .12 : .25) ? 'regen' : x < .3 ? 'gewitter' : x < .55 ? 'wolken' : 'sonne';
    if (g.weather === 'regen' || g.weather === 'gewitter' || g.weather === 'schnee') for (const k in g.tiles) { const t = g.tiles[k]; if (t.soil && g.weather !== 'schnee') t.wet = true; }
    if (g.weather === 'gewitter') { const ks = Object.keys(g.tiles).filter(k => g.tiles[k].crop && !g.tiles[k].dead && stageOf(g.tiles[k]) < 3); if (ks.length > 6 && r() < .5) { const k = ks[Math.floor(r() * ks.length)]; g.tiles[k].dead = 1; sum.storm = k; } }   // selten: Blitz knickt eine Pflanze
    sum.newSeason = (g.day - 1) % SEASON_DAYS === 0; sum.nextSeason = season(g); sum.weather = g.weather; return sum;
  }
  // ---------- Tiere ----------
  function buyAnimal(g, a) { const D = ANIMALS[a]; if (!D) return { err: '?' }; if (D.lv > g.lv) return { err: D.n + ' gibt es ab Level ' + D.lv + '.' }; const A = g.animals[a] || (g.animals[a] = { list: [] });
    if (A.list.length >= D.max) return { err: 'Der Stall ist voll (' + D.max + ').' }; const cost = Math.round(D.cost * (1 + A.list.length * .25)); if (g.coins < cost) return { err: 'Zu wenig Geld (' + cost + ' 🪙).' };
    g.coins -= cost; A.list.push({ t: 0, fed: D.feed ? 0 : 1, ready: 0 }); addXp(g, 5); checkAch(g); return { ok: 1, cost }; }
  const animalCost = (g, a) => Math.round(ANIMALS[a].cost * (1 + ((g.animals[a] || { list: [] }).list.length) * .25));
  // Stall antippen: fertige Produkte einsammeln und alle hungrigen Tiere füttern (Futter aus dem Lager)
  function tendAnimals(g, a) { const D = ANIMALS[a], A = g.animals[a]; if (!A || !A.list.length) return { err: 'Hier wohnen noch keine Tiere – kauf welche im Bau-Menü.' };
    let got = 0, fed = 0, hungry = 0; A.list.forEach(x => { if (x.ready) { x.ready = 0; x.t = 0; x.fed = D.feed ? 0 : 1; got++; } });
    if (got) { g.inv[D.out] = (g.inv[D.out] || 0) + got; g.stats.products += got; addXp(g, D.xp * got); }
    if (D.feed) A.list.forEach(x => { if (x.fed || x.ready) return; const f = D.feed.find(k => g.inv[k] > 0); if (!f) { hungry++; return; } g.inv[f]--; x.fed = 1; fed++; });
    checkAch(g); return { ok: 1, got, item: D.out, fed, hungry };
  }
  // ---------- Werkstätten ----------
  function buyShop(g, k) { const D = SHOPS[k]; if (g.shops[k]) return { err: 'Schon gebaut.' }; if (D.lv > g.lv) return { err: D.n + ' gibt es ab Level ' + D.lv + '.' }; if (g.coins < D.cost) return { err: 'Zu wenig Geld (' + D.cost + ' 🪙).' };
    g.coins -= D.cost; g.shops[k] = { jobs: [], slots: 2 }; addXp(g, 10); checkAch(g); return { ok: 1 }; }
  const hasAll = (g, need) => Object.keys(need).every(k => (g.inv[k] || 0) >= need[k]);
  function craft(g, k, i, now) { const S = g.shops[k], R = SHOPS[k].rec[i]; if (!S) return { err: 'Noch nicht gebaut.' }; if (S.jobs.filter(j => !j.done).length >= S.slots) return { err: 'Alle Plätze belegt – warte, bis etwas fertig ist.' };
    if (S.jobs.length >= S.slots + 2) return { err: 'Hol erst die fertigen Waren ab.' }; if (!hasAll(g, R.in)) return { err: 'Es fehlen Zutaten.' };
    Object.keys(R.in).forEach(x => { g.inv[x] -= R.in[x]; }); S.jobs.push({ out: R.out, end: now + R.min * MIN, start: now }); return { ok: 1 }; }
  function collectShop(g, k) { const S = g.shops[k]; if (!S) return { got: 0 }; let got = 0; S.jobs = S.jobs.filter(j => { if (!j.done) return true; g.inv[j.out] = (g.inv[j.out] || 0) + 1; got++; return false; });
    if (got) { g.stats.crafted += got; addXp(g, 4 * got); checkAch(g); } return { got }; }
  // ---------- Markt & Bestellungen ----------
  function priceOf(g, k) { const G = GOODS[k]; if (!G) return 0; let p = G.sell; if (G.crop) { const c = CROPS[k]; if (!c.s.includes(season(g))) p = Math.round(p * 1.25); } return p; }   // außerhalb der Saison teurer
  function sell(g, k, n) { n = Math.min(n || 1, g.inv[k] || 0); if (!n) return { err: 'Nichts davon im Lager.' }; const p = priceOf(g, k) * n; g.inv[k] -= n; g.coins += p; g.stats.earned += p; g.stats.sold += n; g.day0.earned += p; addXp(g, Math.ceil(n / 2)); checkAch(g); return { ok: 1, coins: p }; }
  function buySeed(g, k, n) { const c = CROPS[k]; n = n || 1; if (c.lv > g.lv) return { err: 'Ab Level ' + c.lv }; if (g.coins < c.seed * n) return { err: 'Zu wenig Geld.' }; g.coins -= c.seed * n; g.seeds[k] = (g.seeds[k] || 0) + n; return { ok: 1 }; }
  function buyFert(g, n) { n = n || 1; if (g.coins < 15 * n) return { err: 'Zu wenig Geld.' }; g.coins -= 15 * n; g.fert += n; return { ok: 1 }; }
  function expand(g) { const e = EXPAND[g.expand + 1]; if (!e) return { err: 'Alle Felder gehören dir schon.' }; if ((e.lv || 1) > g.lv) return { err: 'Ab Level ' + e.lv + '.' }; if (g.coins < e.cost) return { err: 'Zu wenig Geld (' + e.cost + ' 🪙).' }; g.coins -= e.cost; g.expand++; addXp(g, 8); return { ok: 1 }; }
  const NAMES = ['Oma Erna', 'Bäcker Bernd', 'Café Lotte', 'Hofladen Kim', 'Koch Luca', 'Frau Yilmaz', 'Opa Hans', 'Schule am See', 'Radio-Kantine', 'DJ Mia', 'Tante Paula', 'Gasthof Sonne'];
  function newOrder(g, now) {
    const r = rng(g.seed ^ (++g.orderN * 2654435761)), avail = Object.keys(GOODS).filter(k => { const G = GOODS[k]; if (G.crop) return CROPS[k].lv <= g.lv; const a = Object.keys(ANIMALS).find(x => ANIMALS[x].out === k); if (a) return ANIMALS[a].lv <= g.lv && g.lv > ANIMALS[a].lv; const s = Object.keys(SHOPS).find(x => SHOPS[x].rec.some(R => R.out === k)); return s && SHOPS[s].lv < g.lv; });
    const n = 1 + Math.floor(r() * Math.min(3, 1 + g.lv / 2)), items = {}; for (let i = 0; i < n; i++) { const k = avail[Math.floor(r() * avail.length)]; items[k] = (items[k] || 0) + 1 + Math.floor(r() * (GOODS[k].crop ? 4 : 2)); }
    const val = Object.keys(items).reduce((a, k) => a + GOODS[k].sell * items[k], 0);
    g.orders.push({ id: g.orderN, who: NAMES[Math.floor(r() * NAMES.length)], items, coins: Math.round(val * 1.35 + 5), xp: Math.round(4 + val / 8) }); g.orderAt = now + 2 * MIN;
  }
  function deliver(g, id, now) { const i = g.orders.findIndex(o => o.id === id); if (i < 0) return { err: '?' }; const o = g.orders[i]; if (!hasAll(g, o.items)) return { err: 'Es fehlt noch etwas.' };
    Object.keys(o.items).forEach(k => { g.inv[k] -= o.items[k]; }); g.coins += o.coins; g.stats.earned += o.coins; g.day0.earned += o.coins; g.stats.orders++; g.day0.orders++; const xp = addXp(g, o.xp); g.orders.splice(i, 1); g.orderAt = now + 45000; checkAch(g); return { ok: 1, coins: o.coins, xp }; }
  function skipOrder(g, id, now) { const i = g.orders.findIndex(o => o.id === id); if (i < 0) return { err: '?' }; g.orders.splice(i, 1); g.orderAt = now + 60000; return { ok: 1 }; }
  // ---------- Level & Erfolge ----------
  function addXp(g, n) { g.xp += n; let up = 0; while (g.xp >= lvXp(g.lv)) { g.xp -= lvXp(g.lv); g.lv++; up++; g.coins += 20 * g.lv; } if (up) g.lvUp = (g.lvUp || 0) + up; return n; }
  function unlocks(lv) { const u = []; Object.keys(CROPS).forEach(k => { if (CROPS[k].lv === lv) u.push(CROPS[k].e + ' ' + CROPS[k].n); }); Object.keys(ANIMALS).forEach(k => { if (ANIMALS[k].lv === lv) u.push(ANIMALS[k].e + ' ' + ANIMALS[k].n); }); Object.keys(SHOPS).forEach(k => { if (SHOPS[k].lv === lv) u.push(SHOPS[k].e + ' ' + SHOPS[k].n); }); EXPAND.forEach((e, i) => { if (i && e.lv === lv) u.push('🟫 Neue Felder'); }); return u; }
  const ACH = [['ernte10', '🧺', 'Erste Ernte', 'Ernte 10 Pflanzen', g => g.stats.harvest >= 10], ['ernte100', '🚜', 'Fleißiger Bauer', 'Ernte 100 Pflanzen', g => g.stats.harvest >= 100], ['ernte500', '🏆', 'Erntekönig', 'Ernte 500 Pflanzen', g => g.stats.harvest >= 500],
    ['tier1', '🐣', 'Erste Tiere', 'Kauf ein Tier', g => Object.values(g.animals).some(a => a.list.length)], ['tier4', '🐮', 'Bauernhof', 'Halte 4 Tierarten', g => Object.values(g.animals).filter(a => a.list.length).length >= 4],
    ['werk1', '🛠️', 'Handwerk', 'Bau eine Werkstatt', g => Object.keys(g.shops).length >= 1], ['werk20', '🍰', 'Feinkost', 'Stelle 20 Waren her', g => g.stats.crafted >= 20],
    ['best5', '📋', 'Zuverlässig', 'Erfülle 5 Bestellungen', g => g.stats.orders >= 5], ['best50', '🚚', 'Lieferprofi', 'Erfülle 50 Bestellungen', g => g.stats.orders >= 50],
    ['geld1000', '💰', 'Gut verdient', 'Verdiene 1.000 Münzen', g => g.stats.earned >= 1000], ['geld10000', '💎', 'Großbauer', 'Verdiene 10.000 Münzen', g => g.stats.earned >= 10000],
    ['lv5', '⭐', 'Level 5', 'Erreiche Level 5', g => g.lv >= 5], ['lv10', '🌟', 'Level 10', 'Erreiche Level 10', g => g.lv >= 10], ['jahr', '📅', 'Ein Hofjahr', 'Erlebe alle 4 Jahreszeiten', g => g.day > SEASON_DAYS * 4], ['felder', '🟫', 'Großgrundbesitz', 'Kauf alle Felder', g => g.expand >= EXPAND.length - 1]];
  function checkAch(g) { const got = []; ACH.forEach(([id, e, n, d, f]) => { if (!g.ach.includes(id) && f(g)) { g.ach.push(id); got.push({ id, e, n }); } }); if (got.length) g.newAch = (g.newAch || []).concat(got); return got; }
  // Hofwert (Rangliste): Münzen + Lagerwert + Tiere + Werkstätten + Level
  function worth(g) { let w = g.coins; Object.keys(g.inv).forEach(k => { w += (g.inv[k] || 0) * ((GOODS[k] || {}).sell || 0); }); Object.keys(g.animals).forEach(a => { w += g.animals[a].list.length * ANIMALS[a].cost; }); Object.keys(g.shops).forEach(k => { w += SHOPS[k].cost; }); EXPAND.slice(1, g.expand + 1).forEach(e => { w += e.cost; }); return Math.round(w + g.lv * 100); }

  // ---------- Speichern/Laden (prüfen & reparieren) ----------
  function repair(x, now) {
    if (!x || typeof x !== 'object' || x.v !== 1) return null; const g = newGame({ name: String(x.name || 'Sonnenhof').slice(0, 30), farmer: String(x.farmer || 'Bauer').slice(0, 20), seed: x.seed, now });
    ['coins', 'xp'].forEach(k => { g[k] = clamp(Math.round(+x[k] || 0), 0, 1e9); }); g.lv = clamp(Math.round(+x.lv || 1), 1, 99); g.day = clamp(Math.round(+x.day || 1), 1, 1e6); g.dayT = clamp(+x.dayT || 0, 0, DAY_MS); g.expand = clamp(Math.round(+x.expand || 0), 0, EXPAND.length - 1);
    g.fert = clamp(Math.round(+x.fert || 0), 0, 9999); g.weather = WEATHER[x.weather] ? x.weather : 'sonne'; g.next = WEATHER[x.next] ? x.next : 'sonne'; g.tut = clamp(+x.tut || 0, 0, 99); g.created = +x.created || now; g.last = +x.last || now; g.orderN = Math.round(+x.orderN || 0);
    ['inv', 'seeds'].forEach(f => { g[f] = {}; if (x[f]) Object.keys(x[f]).forEach(k => { if ((f === 'inv' ? GOODS : CROPS)[k]) g[f][k] = clamp(Math.round(+x[f][k] || 0), 0, 1e6); }); });
    g.tiles = {}; if (x.tiles) Object.keys(x.tiles).forEach(k => { const m = /^(\d+),(\d+)$/.exec(k), t = x.tiles[k]; if (!m || !t || !inField(+m[1], +m[2])) return; const n = { soil: 1 }; if (CROPS[t.crop]) Object.assign(n, { crop: t.crop, p: clamp(+t.p || 0, 0, 1e9), wet: !!t.wet, fert: t.fert ? 1 : 0, dead: t.dead ? 1 : 0 }); else n.wet = !!t.wet; g.tiles[k] = n; });
    g.animals = {}; if (x.animals) Object.keys(x.animals).forEach(a => { if (!ANIMALS[a] || !x.animals[a] || !Array.isArray(x.animals[a].list)) return; g.animals[a] = { list: x.animals[a].list.slice(0, ANIMALS[a].max).map(y => ({ t: clamp(+y.t || 0, 0, 1e9), fed: y.fed ? 1 : 0, ready: y.ready ? 1 : 0 })) }; });
    g.shops = {}; if (x.shops) Object.keys(x.shops).forEach(k => { if (!SHOPS[k] || !x.shops[k]) return; g.shops[k] = { slots: clamp(Math.round(+x.shops[k].slots || 2), 1, 4), jobs: (x.shops[k].jobs || []).filter(j => j && GOODS[j.out]).slice(0, 6).map(j => ({ out: j.out, end: +j.end || now, start: +j.start || now, done: j.done ? 1 : 0 })) }; });
    g.orders = Array.isArray(x.orders) ? x.orders.filter(o => o && o.items && Object.keys(o.items).every(k => GOODS[k])).slice(0, 3).map(o => ({ id: +o.id || 0, who: String(o.who || 'Kunde').slice(0, 30), items: o.items, coins: clamp(+o.coins || 0, 0, 1e6), xp: clamp(+o.xp || 0, 0, 1e5) })) : g.orders;
    if (x.stats) Object.keys(g.stats).forEach(k => { g.stats[k] = clamp(+x.stats[k] || 0, 0, 1e12); }); if (x.day0) Object.keys(g.day0).forEach(k => { g.day0[k] = clamp(+x.day0[k] || 0, 0, 1e12); });
    g.ach = Array.isArray(x.ach) ? x.ach.filter(id => ACH.some(a => a[0] === id)) : [];
    return g;
  }
  const API = { MIN, W, H, CROPS, ANIMALS, GOODS, SHOPS, SEASONS, WEATHER, DAY_MS, SEASON_DAYS, FIELD, EXPAND, PLACES, ACH, lvXp, rng, clamp, goodsName, goodsIcon, newGame, season, fieldOpen, inField, placeAt, tile, tileKey, canUse,
    stageOf, growMs, till, plant, water, fertilize, harvest, tick, endDay, buyAnimal, animalCost, tendAnimals, buyShop, hasAll, craft, collectShop, priceOf, sell, buySeed, buyFert, expand, newOrder, deliver, skipOrder, addXp, unlocks, checkAch, worth, repair };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SHCore = API;
})(typeof window !== 'undefined' ? window : globalThis);
