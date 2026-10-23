/* Tortenschlacht – Spiellogik ohne DOM (Browser und Node).
 * Welt: y = 0 oben bis 1 unten (Bildschirmhöhe), x = 0 … WW. Bodenfiguren auf drei Ebenen (hinten, Mitte, vorn), dazu Figuren in der Luft,
 * in Fenstern und ganz nah vorn. Alle Figuren sind frei erfunden. Würfe treffen sofort (wie bei der Moorhuhn-Jagd), der Flug ist nur Optik. */
(function (root) {
  'use strict';
  const LAYERS = [{ s: .36, g: .6 }, { s: .62, g: .76 }, { s: 1, g: .985 }];
  const HMAN = .3; // Figurenhöhe vorn (Anteil Bildschirmhöhe)
  const SC = l => LAYERS[l].s * HMAN;
  // Figuren: Punkte, Art, Ebenen (Boden), Tempo, Sortier-Tiefe z (größer = weiter vorn)
  const TYPES = {
    prak: { n: 'Praktikantin', pts: 15, kind: 'ground', layers: [0, 1, 2], speed: .28 },
    mod: { n: 'Moderator', pts: 10, kind: 'ground', layers: [1, 2], speed: .1 },
    bike: { n: 'Radfahrer', pts: 25, kind: 'ground', layers: [1, 2], speed: .62 },
    chef: { n: 'Chef', pts: 40, kind: 'ground', layers: [1, 2], speed: .14 },
    kond: { n: 'Konditor', pts: 25, kind: 'ground', layers: [2], speed: .16 },
    fan: { n: 'Goldener Fan', pts: 40, kind: 'ground', layers: [1, 2], speed: .3 },
    dj: { n: 'DJ', pts: 20, kind: 'pop', z: 1 },
    board: { n: 'Aufsteller', pts: 15, kind: 'pop', z: 2, hp: 1 },
    window: { n: 'Fenstergucker', pts: 20, kind: 'pop', z: .2 },
    close: { n: 'Ganz nah', pts: 5, kind: 'pop', z: 3 },
    tech: { n: 'Techniker', pts: 30, kind: 'tower', z: .3 },
    para: { n: 'Fallschirmspringer', pts: 30, kind: 'air', z: .55 },
    balloon: { n: 'Ballonfahrer', pts: 40, kind: 'air', z: .45 },
    jet: { n: 'Jetpack', pts: 50, kind: 'air', z: .6 },
    cannon: { n: 'Kanonenkugel', pts: 40, kind: 'air', z: .65 },
    plane: { n: 'Werbeflieger', pts: 75, kind: 'air', z: .4 }
  };
  const WEAPONS = { torte: { mag: 8, dmg: 3, r: .04, cd: .11 }, spritze: { mag: 30, dmg: 1, r: .02, cd: .075 }, bombe: { dmg: 3, r: .17, cd: .3 } };
  const RELOAD = .7, BLIND = 2.2, TIME = 90;

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- Spielstand und feste Kulisse ---------- */
  function newGame(o) {
    o = o || {};
    const g = { WW: o.WW || 3.2, A: o.A || 1.78, solo: !!o.solo, t: o.time || TIME, el: 0, people: [], pies: [], splats: [], events: [], players: [], camX: 0, nextId: 1, spawnT: .3,
      rng: mulberry(o.seed || (Date.now() & 0xffffff)), over: false, chefT: 0 };
    const W = g.WW, R = mulberry(77);
    const st = g.stations = { mic: [], dj: [], tower: [], buildings: [], props: [] };
    for (let x = .45; x < W - .2; x += 1.15) st.mic.push({ x: x + .1, layer: 1 + ((x * 7 | 0) % 2) });
    for (let x = .9; x < W - .3; x += 1.5) st.dj.push({ x, busy: false });
    for (let x = .7; x < W; x += 1.9) { st.tower.push({ x }); st.props.push({ k: 'lamp', x, y: .133, w: .03, h: .03, hit: false }); }
    for (let x = .25; x < W - .3; x += 1.05) {
      const bw = .42 + R() * .12, bh = .15 + R() * .05, y = .6, b = { x, w: bw, h: bh, y, win: [] };
      for (let wx = x + .03; wx < x + bw - .06; wx += .07) b.win.push({ x: wx, y: y - bh + .03, w: .045, h: .04, busy: false });
      b.onair = { k: 'onair', x: x + bw - .06, y: y - bh + .098, w: .08, h: .025, hit: false }; st.props.push(b.onair);
      st.buildings.push(b);
    }
    g.sign = { k: 'sign', x: Math.min(W - .4, 1.25), y: LAYERS[1].g - .2, w: .26, h: .1, hit: false }; st.props.push(g.sign);
    for (const p of o.players || [{ name: 'Du' }]) addPlayer(g, p);
    return g;
  }
  function addPlayer(g, p) {
    const pl = Object.assign({ id: g.players.length, name: 'Spieler', col: '#FF4FAE', score: 0, combo: 0, best: 0, hits: 0, shots: 0, heads: 0, weapon: 'torte',
      ammo: { torte: WEAPONS.torte.mag, spritze: WEAPONS.spritze.mag }, reload: 0, bombs: 0, stun: 0, cd: 0, x: g.A / 2, y: .5, fire: false }, p);
    g.players.push(pl); return pl;
  }
  // sichtbarer Bereich (Solo: Kameraausschnitt, sonst alles)
  const view = g => g.solo ? [g.camX, g.camX + g.A] : [0, g.WW];

  /* ---------- Figuren ---------- */
  function spawn(g, type, at) {
    const T = TYPES[type], r = g.rng, [v0, v1] = view(g), vw = v1 - v0;
    const p = { id: g.nextId++, type, z: T.z || 1, layer: 1, x: 0, gy: .7, sc: SC(1), dir: r() < .5 ? -1 : 1, v: (T.speed || 0) * (.8 + r() * .5), vy: 0, hp: T.hp || 3, state: 'walk', t: 0, life: 8, up: 0, hitT: 0, rot: 0,
      splats: [], look: (r() * 1e6) | 0, by: -1, logo: 1 + ((r() * 13) | 0) };
    const inView = at != null ? at : (r() < .75 ? v0 + .08 + r() * Math.max(.1, vw - .16) : r() * g.WW);
    const edge = () => { p.dir = r() < .5 ? 1 : -1; p.x = p.dir > 0 ? v0 - .15 : v1 + .15; };
    if (T.kind === 'ground') {
      p.layer = T.layers[(r() * T.layers.length) | 0]; p.z = p.layer; p.gy = LAYERS[p.layer].g; p.sc = SC(p.layer);
      if (type === 'mod') { const ms = g.stations.mic.filter(s => s.layer === p.layer); const s = ms.length ? ms[(r() * ms.length) | 0] : { x: inView }; p.target = s.x; p.x = s.x - p.dir * (.2 + r() * .25); p.life = 5 + r() * 3; }
      else if (type === 'bike' || r() < .5) edge(); else p.x = inView - p.dir * .2;
      if (type === 'kond') { p.x = Math.max(v0 + .1, Math.min(v1 - .1, inView)); p.dir = p.x < (v0 + v1) / 2 ? 1 : -1; p.x -= p.dir * .3; p.aimT = 0; }
    } else if (type === 'dj') { const free = g.stations.dj.filter(s => !s.busy); if (!free.length) return null; const s = free[(r() * free.length) | 0]; s.busy = true; p.st = s; p.x = s.x; p.layer = 1; p.gy = LAYERS[1].g; p.sc = SC(1); p.state = 'pop'; p.life = 1.6 + r() * 1.6; }
    else if (type === 'board') { p.layer = 2; p.gy = LAYERS[2].g; p.sc = SC(2); p.x = inView; p.state = 'pop'; p.life = 1.4 + r() * .6; }
    else if (type === 'window') {
      const wins = []; for (const b of g.stations.buildings) for (const w of b.win) if (!w.busy && w.x > v0 - .05 && w.x < v1) wins.push(w);
      const w = at && at.win ? at.win : wins[(r() * wins.length) | 0]; if (!w) return null; w.busy = true; p.st = w; p.x = w.x + w.w / 2; p.win = w; p.sc = .085; p.gy = w.y + w.h; p.layer = 0; p.state = 'pop'; p.life = 1.3 + r() * 1.2;
    }
    else if (type === 'close') { p.x = Math.max(v0 + .25, Math.min(v1 - .25, inView)); p.sc = .95; p.gy = 1; p.layer = 2; p.state = 'pop'; p.life = 1.25; }
    else if (type === 'tech') { const s = g.stations.tower[(r() * g.stations.tower.length) | 0]; p.x = s.x; p.layer = 0; p.sc = SC(0); p.gy = LAYERS[0].g; p.climb = 0; p.state = 'climb'; p.life = 8; }
    else if (type === 'para') { p.x = inView; p.gy = -.05; p.sc = .14; p.vy = .07 + r() * .03; p.state = 'fly'; }
    else if (type === 'balloon') { edge(); p.gy = .2 + r() * .1; p.sc = .11; p.v = .05 + r() * .03; p.state = 'fly'; p.life = 60; }
    else if (type === 'jet') { edge(); p.base = .14 + r() * .2; p.gy = p.base; p.sc = .1; p.v = .5 + r() * .2; p.state = 'fly'; }
    else if (type === 'cannon') { edge(); p.x = p.dir > 0 ? v0 - .05 : v1 + .05; p.gy = .62; p.sc = .11; p.v = .45 + r() * .25; p.vy = -(.75 + r() * .2); p.state = 'fly'; }
    else if (type === 'plane') { edge(); p.gy = .09; p.sc = .07; p.v = .28; p.state = 'fly'; p.life = 60; }
    g.people.push(p); return p;
  }
  // Rumpf und Kopf in Weltkoordinaten (für Treffer und Zeichnung); gy = Fußpunkt
  function body(p) {
    const s = p.sc; let gy = p.gy, clip = 9;
    if (p.type === 'dj') { gy = p.gy + (1 - p.up) * s * .62; clip = p.gy - s * .32; }
    else if (p.type === 'board') { gy = p.gy + (1 - p.up) * s * 1.02; clip = p.gy - s * .08; }
    else if (p.type === 'window') { gy = p.gy + (.55 - p.up * .55) * s + s * .5; clip = p.win.y + p.win.h; }
    else if (p.type === 'close') { gy = p.gy + (1 - p.up) * s * .45 + s * .58; clip = 1.2; }
    else if (p.type === 'tech') gy = p.gy - p.climb * .3;
    else if (p.type === 'balloon') clip = p.gy - s * .45;
    return { s, gy, hx: p.x, hy: gy - s * .87, hr: s * .085, bx: p.x - s * .15, bw: s * .3, by0: gy - s * .8, by1: gy - s * .05, clip };
  }
  // 0 = vorbei, 1 = Körper, 2 = Kopf
  function hitTest(p, x, y, r) {
    if (p.state === 'flee' || p.state === 'drop' || p.state === 'gone' || p.state === 'hit') return 0;
    if ((p.type === 'dj' || p.type === 'board' || p.type === 'window' || p.type === 'close') && p.up < .3) return 0;
    const b = body(p); r = r + (b.s < .12 ? .012 : 0);
    if (p.type === 'plane') return Math.abs(x - p.x) < .1 + r && Math.abs(y - p.gy) < .03 + r ? 1 : 0;
    if (p.type === 'board') { const w = b.s * .5; return x > p.x - w - r && x < p.x + w + r && y > b.gy - b.s - r && y < Math.min(b.gy, b.clip) + r ? 1 : 0; }
    if (p.type === 'para' && Math.abs(x - p.x) < b.s * .45 + r && y > b.gy - b.s * 1.75 - r && y < b.gy - b.s * 1.2) return 1; // Schirm
    if (p.type === 'balloon' && Math.hypot(x - p.x, y - (b.gy - b.s * 2.1)) < b.s * .75 + r) return 1; // Ballonhülle
    if (Math.hypot(x - b.hx, y - b.hy) < b.hr * 1.25 + r && y < b.clip + r) return 2;
    if (x > b.bx - r && x < b.bx + b.bw + r && y > b.by0 - r && y < Math.min(b.by1, b.clip) + r) return 1;
    return 0;
  }

  /* ---------- Spieler: werfen (sofort), nachladen, Waffe ---------- */
  function fire(g, pl) {
    if (g.over || pl.stun > 0 || pl.cd > 0 || pl.reload > 0) return false;
    let w = pl.weapon;
    if (w === 'bombe') { if (pl.bombs <= 0) { pl.weapon = w = 'torte'; } else { pl.bombs--; if (!pl.bombs) pl.weapon = 'torte'; pl.cd = WEAPONS.bombe.cd; shot(g, pl, 'bombe'); return true; } }
    if (pl.ammo[w] <= 0) { reload(g, pl); g.events.push({ k: 'empty', pl: pl.id }); return false; }
    pl.ammo[w]--; pl.cd = WEAPONS[w].cd; shot(g, pl, w);
    if (pl.ammo[w] <= 0) reload(g, pl);
    return true;
  }
  function shot(g, pl, w) {
    pl.shots++; const x = pl.x, y = pl.y, W = WEAPONS[w];
    g.events.push({ k: 'throw', pl: pl.id, w, x, y });
    // Torte des Konditors im Anflug abwehren
    for (const pie of g.pies) if (!pie.dead && Math.hypot(pie.x - x, pie.y - y) < pie.r + W.r + .03) { pie.dead = true; pl.score += 15; pl.combo++; g.events.push({ k: 'parry', pl: pl.id, x: pie.x, y: pie.y }); if (w !== 'bombe') return; }
    const order = g.people.slice().sort((a, b) => b.z - a.z); let any = false;
    for (const p of order) { const h = hitTest(p, x, y, W.r); if (!h) continue; any = true; damage(g, pl, p, w, x, y, h, W.dmg); if (w !== 'bombe') break; }
    if (!any || w === 'bombe') for (const pr of g.stations.props) if (!pr.hit && Math.abs(x - pr.x) < pr.w / 2 + W.r * .5 && Math.abs(y - pr.y) < pr.h / 2 + W.r * .5) { any = true; prop(g, pl, pr, x, y); break; }
    if (!any && w !== 'spritze') for (const b of g.stations.buildings) for (const win of b.win) if (!win.busy && x > win.x - .005 && x < win.x + win.w + .005 && y > win.y - .005 && y < win.y + win.h + .005) { const p = spawn(g, 'window', { win }); if (p) { p.angry = true; g.events.push({ k: 'peek', x, y }); } }
    if (any) { pl.hits++; pl.combo++; pl.best = Math.max(pl.best, pl.combo); }
    else { if (w !== 'spritze') pl.combo = 0; const layer = y > LAYERS[1].g ? 2 : y > LAYERS[0].g ? 1 : 0; if (y > .45) { if (g.splats.length > 260) g.splats.shift(); g.splats.push({ x, y, r: W.r * (w === 'bombe' ? .5 : w === 'spritze' ? 1 : .8), layer, w }); } g.events.push({ k: 'miss', pl: pl.id, x, y, w }); }
    if (w === 'bombe') g.events.push({ k: 'bomb', pl: pl.id, x, y });
  }
  function prop(g, pl, pr, x, y) {
    pr.hit = true;
    if (pr.k === 'sign') { g.t += 10; pl.score += 20; g.events.push({ k: 'sign', pl: pl.id, x, y }); }
    else { pl.score += 25; g.events.push({ k: 'secret', pl: pl.id, x, y, what: pr.k }); }
  }
  function damage(g, pl, p, w, x, y, h, dmg) {
    const b = body(p); if (p.splats.length < 14) p.splats.push({ dx: (x - p.x) / b.s, dy: (y - b.gy) / b.s, r: w === 'spritze' ? .07 : .17 });
    p.hp -= dmg; if (h === 2) p.headHit = true;
    if (p.hp > 0) { g.events.push({ k: 'splash', pl: pl.id, x, y, p: p.id }); return; }
    const T = TYPES[p.type], m = mult(pl), head = !!p.headHit, pts = T.pts * m * (head ? 2 : 1);
    pl.score += pts; if (head) pl.heads++; p.by = pl.id; p.hitT = 0; if (p.st) p.st.busy = false;
    if (T.kind === 'air') { p.state = 'drop'; p.vy = p.type === 'balloon' ? -.05 : .1; p.spin = (g.rng() < .5 ? -1 : 1) * (4 + g.rng() * 4); }
    else if (T.kind === 'ground') { p.state = 'hit'; p.slip = g.rng() < .55; p.fallDir = g.rng() < .5 ? -1 : 1; }
    else p.state = 'flee';
    if (p.type === 'fan') { pl.bombs++; g.events.push({ k: 'bonus', pl: pl.id, x, y }); }
    if (p.type === 'chef') { g.chefT = 6; g.events.push({ k: 'chef', pl: pl.id }); }
    g.events.push({ k: 'hit', pl: pl.id, p: p.id, type: p.type, head, pts, m, x, y, z: p.z });
  }
  function reload(g, pl) { if (pl.reload > 0 || pl.stun > 0) return; const w = pl.weapon === 'spritze' ? 'spritze' : 'torte'; if (pl.ammo[w] >= WEAPONS[w].mag) return; pl.reload = RELOAD; pl.rw = w; g.events.push({ k: 'reload', pl: pl.id }); }
  function switchWeapon(g, pl) { const order = pl.bombs > 0 ? ['torte', 'spritze', 'bombe'] : ['torte', 'spritze']; pl.weapon = order[(order.indexOf(pl.weapon) + 1) % order.length]; g.events.push({ k: 'weapon', pl: pl.id, w: pl.weapon }); }
  const mult = pl => Math.min(5, 1 + Math.floor(pl.combo / 4));

  /* ---------- Zeitschritt ---------- */
  function step(g, dt) {
    if (g.over) return;
    g.t -= dt; g.el += dt; if (g.chefT > 0) g.chefT -= dt;
    if (g.t <= 0) { g.t = 0; g.over = true; g.events.push({ k: 'end' }); return; }
    for (const pl of g.players) {
      pl.cd = Math.max(0, pl.cd - dt); if (pl.stun > 0) pl.stun = Math.max(0, pl.stun - dt);
      if (pl.reload > 0) { pl.reload -= dt; if (pl.reload <= 0) { pl.reload = 0; pl.ammo[pl.rw || 'torte'] = WEAPONS[pl.rw || 'torte'].mag; g.events.push({ k: 'loaded', pl: pl.id }); } }
      if (pl.fire && pl.weapon === 'spritze') fire(g, pl);
    }
    // Konditor-Torten fliegen auf den Bildschirm zu
    for (const pie of g.pies) {
      if (pie.dead) continue; pie.t += dt; const f = Math.min(1, pie.t / pie.T);
      pie.x = pie.x0 + (pie.tx - pie.x0) * f; pie.y = pie.y0 + (pie.ty - pie.y0) * f - Math.sin(f * Math.PI) * .12; pie.r = .02 + f * .07;
      if (f >= 1) { pie.dead = true; const pl = g.players[pie.pl]; if (pl) { pl.stun = BLIND; pl.combo = 0; pl.reload = 0; } g.events.push({ k: 'blind', pl: pie.pl }); }
    }
    g.pies = g.pies.filter(p => !p.dead);
    const fast = g.chefT > 0 ? 1.4 : 1;
    for (const p of g.people) {
      p.t += dt; const T = TYPES[p.type];
      if (p.state === 'hit') { p.hitT += dt; if (p.hitT > (p.slip ? 1 : .45)) { p.state = 'flee'; p.hitT = 0; p.dir = p.x < (view(g)[0] + view(g)[1]) / 2 ? -1 : 1; } continue; }
      if (p.state === 'flee') {
        p.hitT += dt;
        if (T.kind === 'pop') p.up = Math.max(0, p.up - dt * 3); else if (p.type === 'tech') p.climb = Math.max(0, p.climb - dt * 1.2); else p.x += p.dir * (.7 * p.sc / .3 + .15) * dt;
        if (p.hitT > (T.kind === 'pop' ? .6 : 2.2)) p.state = 'gone'; continue;
      }
      if (p.state === 'drop') { p.hitT += dt; p.vy += (p.type === 'balloon' ? -.15 : 1.1) * dt; p.gy += p.vy * dt; p.x += p.dir * p.v * .5 * dt; p.rot += (p.spin || 0) * dt * (p.type === 'balloon' ? 0 : 1); if (p.gy > 1.3 || p.gy < -.3) p.state = 'gone'; continue; }
      if (p.state === 'pop') { const k = p.t < p.life ? 1 : 0; p.up += (k - p.up) * Math.min(1, dt * (p.type === 'close' ? 9 : 7)); if (p.t > p.life + .4) { p.state = 'gone'; if (p.st) p.st.busy = false; } continue; }
      if (p.state === 'climb') { const h = p.life / 2, c = p.t < h ? p.t / h : Math.max(0, 2 - p.t / h); p.climb = Math.min(1, c); if (p.t > p.life) p.state = 'gone'; continue; }
      if (p.state === 'fly') {
        if (p.type === 'para') { p.gy += p.vy * dt; p.x += Math.sin(p.t * 1.3) * .04 * dt; if (p.gy >= LAYERS[1].g) { p.type = 'prak'; p.landed = true; p.layer = 1; p.z = 1; p.gy = LAYERS[1].g; p.sc = SC(1); p.state = 'walk'; p.v = .2; } }
        else if (p.type === 'jet') { p.x += p.dir * p.v * fast * dt; p.gy = p.base + Math.sin(p.t * 3.2) * .06; }
        else if (p.type === 'cannon') { p.x += p.dir * p.v * dt; p.vy += .55 * dt; p.gy += p.vy * dt; p.rot += p.dir * 5 * dt; if (p.gy > .8) p.state = 'gone'; }
        else p.x += p.dir * p.v * fast * dt;
        if (p.x < -.4 || p.x > g.WW + .4 || p.t > 60) p.state = 'gone'; continue;
      }
      if (p.type === 'mod' && p.target != null && p.t < p.life) { const d = p.target - p.x; if (Math.abs(d) > .02) p.x += Math.sign(d) * Math.min(Math.abs(d), .22 * dt); else p.state = 'stand'; continue; }
      if (p.type === 'kond') {
        if (p.state === 'walk' && p.t > 1.1) { p.state = 'aim'; p.aimT = 0; p.tpl = (g.rng() * g.players.length) | 0; g.events.push({ k: 'warn', p: p.id, pl: p.tpl }); }
        if (p.state === 'aim') { p.aimT += dt; if (p.aimT > 1.7) { const b = body(p), tp = g.players[p.tpl] || g.players[0]; const tx = g.solo ? g.camX + g.A / 2 : tp.x; g.pies.push({ pl: p.tpl, x0: p.x + p.dir * b.s * .2, y0: b.hy, x: p.x, y: b.hy, tx, ty: .45, t: 0, T: .95, r: .02 }); g.events.push({ k: 'incoming', pl: p.tpl }); p.state = 'walk2'; p.dir = -p.dir; } continue; }
      }
      if (p.state === 'stand') { if (p.t > p.life) { p.state = 'walk'; p.v = .12; } continue; }
      p.x += p.dir * p.v * fast * dt;
      if (p.x < -.4 || p.x > g.WW + .4 || p.t > 40) p.state = 'gone';
    }
    for (const p of g.people) if (p.state === 'gone' && p.st) p.st.busy = false;
    g.people = g.people.filter(p => p.state !== 'gone');
    // neue Figuren: viel los, wie bei der Moorhuhn-Jagd
    g.spawnT -= dt;
    const want = Math.min(17, 8 + Math.floor(g.el / 12) + (g.solo ? 0 : g.players.length - 1));
    if (g.spawnT <= 0 && g.people.length < want) {
      g.spawnT = .22 + g.rng() * .4;
      const n = t => g.people.filter(p => p.type === t).length;
      const pool = [['prak', 16], ['mod', 9], ['bike', 8], ['dj', 6], ['board', 6], ['window', 9], ['tech', n('tech') ? 0 : 5], ['para', n('para') > 1 ? 0 : 8], ['balloon', n('balloon') ? 0 : 4],
        ['jet', n('jet') ? 0 : 5], ['cannon', 5], ['plane', n('plane') || g.el < 12 ? 0 : 3], ['close', n('close') ? 0 : 4], ['kond', g.el > 8 && !n('kond') ? 6 : 0], ['chef', n('chef') ? 0 : 3], ['fan', n('fan') ? 0 : 3]];
      let r = g.rng() * pool.reduce((s, x) => s + x[1], 0);
      for (const [t, w] of pool) { if ((r -= w) < 0) { spawn(g, t); break; } }
    }
  }
  function ranking(g) { return g.players.slice().sort((a, b) => b.score - a.score); }

  const TS = { LAYERS, HMAN, TYPES, WEAPONS, RELOAD, BLIND, TIME, mulberry, newGame, addPlayer, spawn, body, hitTest, fire, reload, switchWeapon, mult, step, ranking, view };
  if (typeof module !== 'undefined' && module.exports) module.exports = TS;
  root.TS = TS;
})(typeof self !== 'undefined' ? self : this);
