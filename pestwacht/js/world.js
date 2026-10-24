/* Pestwacht · Weltkarte: Sechseckgitter, Generierung aus Startwert, Wegfindung (A*), Nebel des Krieges. Ohne DOM. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const W = PW.World = {};

  // ---------- Sechseck-Geometrie (odd-r) ----------
  const ND = [[[1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]], [[1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]]];
  W.idx = (wd, c, r) => r * wd.w + c;
  W.cr = (wd, i) => [i % wd.w, Math.floor(i / wd.w)];
  W.neighbors = function (wd, i) {
    const c = i % wd.w, r = (i / wd.w) | 0, out = [];
    for (const d of ND[r & 1]) { const nc = c + d[0], nr = r + d[1]; if (nc >= 0 && nr >= 0 && nc < wd.w && nr < wd.h) out.push(nr * wd.w + nc); }
    return out;
  };
  function cube(wd, i) { const c = i % wd.w, r = (i / wd.w) | 0, x = c - (r - (r & 1)) / 2; return [x, -x - r, r]; }
  W.dist = function (wd, a, b) { const A = cube(wd, a), B = cube(wd, b); return Math.max(Math.abs(A[0] - B[0]), Math.abs(A[1] - B[1]), Math.abs(A[2] - B[2])); };
  W.pos = function (wd, i, size) { size = size || 1; const c = i % wd.w, r = (i / wd.w) | 0; return [Math.sqrt(3) * size * (c + 0.5 * (r & 1)), 1.5 * size * r]; };
  W.within = function (wd, center, rad) { const out = []; for (let i = 0; i < wd.tiles.length; i++) if (W.dist(wd, center, i) <= rad) out.push(i); return out; };

  // ---------- Rauschen ----------
  function noise2(rng, w, h, cell) {
    const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = [];
    for (let i = 0; i < gw * gh; i++) g.push(rng());
    const sm = t => t * t * (3 - 2 * t);
    return function (x, y) {
      const fx = x / cell, fy = y / cell, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = sm(fx - x0), ty = sm(fy - y0);
      const v = (a, b) => g[(b % gh) * gw + (a % gw)];
      return PW.lerp(PW.lerp(v(x0, y0), v(x0 + 1, y0), tx), PW.lerp(v(x0, y0 + 1), v(x0 + 1, y0 + 1), tx), ty);
    };
  }

  // ---------- Generierung ----------
  // opt: { seed, size:'klein'|'mittel'|'gross', bots:n, biome:'ausgewogen'|'sumpfig'|'bergig'|'waldig', story:bool }
  W.generate = function (opt) {
    const rng = PW.makeRng('welt:' + opt.seed), dim = PW.MAP_SIZES[opt.size] || PW.MAP_SIZES.mittel;
    const wd = { w: dim.w, h: dim.h, tiles: [], sites: [], caps: [] };
    const n1 = noise2(rng, wd.w, wd.h, 5), n2 = noise2(rng, wd.w, wd.h, 2.5), m1 = noise2(rng, wd.w, wd.h, 4.5), r1 = noise2(rng, wd.w, wd.h, 3.5);
    const shift = { ausgewogen: [0, 0], sumpfig: [-0.08, 0.14], bergig: [0.1, -0.05], waldig: [0, 0.1] }[opt.biome] || [0, 0];
    for (let r = 0; r < wd.h; r++) for (let c = 0; c < wd.w; c++) {
      const e = PW.clamp(0.7 * n1(c, r) + 0.3 * n2(c, r) + shift[0], 0, 1), m = PW.clamp(m1(c, r) + shift[1], 0, 1), ru = r1(c, r);
      let b = 'ebene';
      if (e > 0.66) b = 'gebirge'; else if (e < 0.36 && m > 0.48) b = 'sumpf'; else if (m > 0.56) b = 'wald'; else if (ru > 0.74) b = 'ruinen';
      wd.tiles.push({ b, e: Math.round(e * 100) / 100, riv: 0, road: 0, own: null, site: -1, pl: PW.BIOMES[b].plague });
    }
    // Flüsse: von hohen Lagen bergab zum Rand
    const nRiv = opt.size === 'klein' ? 1 : 2;
    for (let k = 0; k < nRiv; k++) {
      let best = -1, bv = -1;
      for (let t = 0; t < 30; t++) { const i = Math.floor(rng() * wd.tiles.length); if (wd.tiles[i].e > bv && wd.tiles[i].b !== 'gebirge') { bv = wd.tiles[i].e; best = i; } }
      let cur = best, steps = 0; const seen = new Set();
      while (cur >= 0 && steps++ < 40) {
        seen.add(cur); wd.tiles[cur].riv = 1;
        const [c, r] = W.cr(wd, cur);
        if (c === 0 || r === 0 || c === wd.w - 1 || r === wd.h - 1) break;
        let nx = -1, ne = 9;
        W.neighbors(wd, cur).forEach(n => { if (!seen.has(n) && wd.tiles[n].e + rng() * 0.08 < ne) { ne = wd.tiles[n].e + rng() * 0.08; nx = n; } });
        cur = nx;
      }
    }
    // Hauptstädte (Spieler + Bots) möglichst weit auseinander
    const okCap = i => { const [c, r] = W.cr(wd, i), t = wd.tiles[i]; return c >= 2 && r >= 2 && c < wd.w - 2 && r < wd.h - 2 && t.b !== 'gebirge'; };
    const cand = []; for (let i = 0; i < wd.tiles.length; i++) if (okCap(i)) cand.push(i);
    const total = 1 + opt.bots;
    // Spieler: eher mittig
    const mid = W.idx(wd, Math.floor(wd.w / 2), Math.floor(wd.h / 2));
    cand.sort((a, b) => W.dist(wd, a, mid) - W.dist(wd, b, mid) + (rng() - 0.5) * 3);
    wd.caps.push(cand[0]);
    while (wd.caps.length < total) {
      let best = -1, bd = -1;
      for (const i of cand) {
        let d = Infinity; for (const c of wd.caps) d = Math.min(d, W.dist(wd, i, c));
        d += rng() * 0.9; if (d > bd) { bd = d; best = i; }
      }
      wd.caps.push(best);
    }
    wd.caps.forEach((ci, k) => {
      const t = wd.tiles[ci]; t.b = 'ebene'; t.pl = 0.03; t.riv = 0;
      W.neighbors(wd, ci).forEach(n => { if (wd.tiles[n].b === 'sumpf') { wd.tiles[n].b = 'wald'; wd.tiles[n].pl = PW.BIOMES.wald.plague; } });
      wd.sites.push({ type: 'capital', tile: ci, owner: k === 0 ? 'P' : null, gar: null });
      t.site = wd.sites.length - 1;
    });
    // Orte verteilen
    const order = wd.tiles.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const nearCap = i => wd.caps.some(c => W.dist(wd, i, c) <= 1);
    const free = i => wd.tiles[i].site < 0 && !nearCap(i) && !W.neighbors(wd, i).some(n => wd.tiles[n].site >= 0);
    const N = wd.tiles.length;
    const want = { res: Math.round(N * 0.11), ruin: Math.round(N * 0.035), village: Math.round(N * 0.035), lair: Math.round(N * 0.04), trade: opt.size === 'gross' ? 3 : 2, boss: opt.size === 'gross' ? 2 : 1 };
    const pc = wd.caps[0], maxD = Math.max(wd.w, wd.h);
    function addSite(type, i, extra) {
      const t = wd.tiles[i], d = W.dist(wd, i, pc), lvl = 1 + Math.floor(3 * d / maxD);   // weiter weg = stärker bewacht
      const s = Object.assign({ type, tile: i, owner: null, lvl }, extra || {});
      const g = PW.SITES[type].gar || 0;
      if (PW.SITES[type].monsters) {
        const f = g * (0.6 + 0.4 * lvl);
        s.gar = { mon: type === 'boss' ? { bestie: Math.round(f / 9), gaenger: Math.round(f / 3) } : { ratte: Math.round(f * 0.9), gaenger: Math.round(f / 3), bestie: lvl >= 3 ? 1 : 0 } };
      } else if (g) {
        const f = g * (0.6 + 0.5 * lvl);
        s.gar = { units: { spear: Math.round(f * 0.6), bow: Math.round(f * 0.4) }, bandit: 1 };
      } else s.gar = null;
      wd.sites.push(s); t.site = wd.sites.length - 1;
      return s;
    }
    const resFor = b => ({ ebene: 'res_food', wald: rng() < 0.6 ? 'res_wood' : 'res_herb', sumpf: 'res_herb', gebirge: rng() < 0.55 ? 'res_iron' : 'res_stone', ruinen: 'res_stone' })[b];
    const counts = { res: 0, ruin: 0, village: 0, lair: 0, trade: 0, boss: 0 };
    for (const i of order) {
      if (!free(i)) continue;
      const t = wd.tiles[i], d = W.dist(wd, i, pc);
      if (counts.boss < want.boss && d >= maxD * 0.45 && (t.b === 'sumpf' || t.b === 'ruinen' || t.b === 'gebirge')) { addSite('boss', i); counts.boss++; continue; }
      if (counts.lair < want.lair && (t.b === 'sumpf' || t.b === 'ruinen' || rng() < 0.15) && d >= 3) { addSite('lair', i); counts.lair++; continue; }
      if (counts.trade < want.trade && t.b !== 'gebirge' && d >= 3) { addSite('trade', i); counts.trade++; continue; }
      if (counts.village < want.village && t.b !== 'gebirge' && rng() < 0.5) { addSite('village', i, { patients: 4 + Math.floor(rng() * 6) }); counts.village++; continue; }
      if (counts.ruin < want.ruin && (t.b === 'ruinen' || rng() < 0.3)) { addSite('ruin', i, { loot: 1 }); counts.ruin++; continue; }
      if (counts.res < want.res) { addSite(resFor(t.b), i); counts.res++; }
    }
    // Sicherstellen: in Spielernähe (2–4 Felder) mindestens eine Ruine, ein Rohstofffeld und eine Siedlung
    ['ruin', 'res_wood', 'village'].forEach((type, k) => {
      if (wd.sites.some(s => s.type === type && W.dist(wd, s.tile, pc) <= 4)) return;
      const opts = order.filter(i => free(i) && W.dist(wd, i, pc) >= 2 && W.dist(wd, i, pc) <= 4);
      if (opts.length) addSite(type, opts[k % opts.length], type === 'village' ? { patients: 6 } : type === 'ruin' ? { loot: 1 } : null);
    });
    // Seuchendruck um Nester
    wd.sites.forEach(s => {
      if (!PW.SITES[s.type].plagueSrc && !PW.SITES[s.type].worldBoss) return;
      W.within(wd, s.tile, 3).forEach(i => { const d = W.dist(wd, i, s.tile); wd.tiles[i].pl = Math.min(1, wd.tiles[i].pl + 0.35 / (1 + d)); });
    });
    // Straßen zwischen Hauptstädten und zu Handelsplätzen
    const links = [];
    wd.caps.forEach((a, k) => {
      const others = wd.caps.filter(b => b !== a).sort((x, y) => W.dist(wd, a, x) - W.dist(wd, a, y)).slice(0, 2);
      others.forEach(b => links.push([a, b]));
    });
    wd.sites.filter(s => s.type === 'trade').forEach(s => { const nc = wd.caps.slice().sort((x, y) => W.dist(wd, s.tile, x) - W.dist(wd, s.tile, y))[0]; links.push([s.tile, nc]); });
    links.forEach(([a, b]) => { const p = W.path(wd, a, b); if (p) p.forEach(i => { wd.tiles[i].road = 1; }); });
    wd.tiles.forEach(t => { t.pl = Math.round(t.pl * 100) / 100; });
    return wd;
  };

  // ---------- Wegfindung ----------
  W.cost = function (wd, i) {
    const t = wd.tiles[i]; let c = PW.BIOMES[t.b].cost;
    if (t.road) c *= 0.5; else if (t.riv) c *= 1.5;
    return c;
  };
  W.path = function (wd, from, to) {
    if (from === to) return [from];
    const N = wd.tiles.length, g = new Float64Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const open = [from]; g[from] = 0;
    const f = i => g[i] + W.dist(wd, i, to) * 0.5;
    while (open.length) {
      let bi = 0; for (let k = 1; k < open.length; k++) if (f(open[k]) < f(open[bi])) bi = k;
      const cur = open.splice(bi, 1)[0];
      if (cur === to) { const p = [cur]; let x = cur; while (came[x] >= 0) { x = came[x]; p.push(x); } return p.reverse(); }
      closed[cur] = 1;
      for (const n of W.neighbors(wd, cur)) {
        if (closed[n]) continue;
        const ng = g[cur] + W.cost(wd, n);
        if (ng < g[n]) { g[n] = ng; came[n] = cur; if (open.indexOf(n) < 0) open.push(n); }
      }
    }
    return null;
  };
  W.pathCost = function (wd, p) { let c = 0; for (let k = 1; k < p.length; k++) c += W.cost(wd, p[k]); return c; };

  // ---------- Nebel ----------
  W.reveal = function (S, center, rad) {
    const wd = S.world; let f = S.fog, changed = false;
    if (f.length !== wd.tiles.length) f = S.fog = '0'.repeat(wd.tiles.length);
    const arr = f.split('');
    W.within(wd, center, rad).forEach(i => { if (arr[i] !== '1') { arr[i] = '1'; changed = true; } });
    if (changed) S.fog = arr.join('');
    return changed;
  };
  W.explored = (S, i) => S.fog.charCodeAt(i) === 49;
  W.tilesOf = (S, owner) => { const o = []; S.world.tiles.forEach((t, i) => { if (t.own === owner) o.push(i); }); return o; };
  W.siteAt = (S, i) => (S.world.tiles[i].site >= 0 ? S.world.sites[S.world.tiles[i].site] : null);
  W.regionName = function (S, i) {
    const t = S.world.tiles[i], s = W.siteAt(S, i), [c, r] = W.cr(S.world, i);
    const base = s ? (s.type === 'capital' ? (s.owner === 'P' ? 'Deine Zuflucht' : 'Hauptstadt ' + (PW.FAC[s.owner] ? PW.FAC[s.owner].name : '')) : (s.name || PW.SITES[s.type].name)) : PW.BIOMES[t.b].name;
    return base + ' (' + String.fromCharCode(65 + (c % 26)) + (r + 1) + ')';
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
