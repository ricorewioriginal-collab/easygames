/* Funk-Survivor – Spielkern (reine Logik, ohne Grafik; testbar mit `node --test funk-survivor/tests/*.test.js`).
 * Welt: Bodenebene mit x/z, Arena mit Radius ARENA. Eine Runde = Überlebe die Störwelle (10 Minuten) oder Endlos.
 * Ablauf je Bild: FS.step(W, dt, input) → W.ev (Ereignisse für Grafik, Ton, Oberfläche) mit FS.drain(W) abholen. */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2, ARENA = 56, CELL = 3, GW = Math.ceil(ARENA * 2 / CELL) + 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  function rng(seed) { let a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function dailySeed(d) { d = d || new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
  function dailyKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  /* ---------- Helden ---------- */
  const HEROES = [
    { id: 'rico', n: 'Rico', w: 'strahl', price: 0, hp: 1, spd: 1, dmg: 1, cd: 1, d: 'Der Allrounder mit Funkstrahl-Pistole. Ausgewogen und leicht zu spielen.',
      look: { body: 'm', skin: '#e3b08a', hair: { style: 'short', color: '#2b1d14' }, top: '#ff2d95', topStyle: 'tee', bottom: '#1b2140', bottomStyle: 'pants', shoes: '#f5f5ff' } },
    { id: 'mia', n: 'Mia Mikro', w: 'welle', price: 450, hp: .9, spd: 1.1, dmg: 1, cd: .95, d: 'Schnelle Sängerin: Ihre Schallwelle fegt alles weg, was zu nah kommt.',
      look: { body: 'w', skin: '#f0c9a8', hair: { style: 'long', color: '#c8341e' }, top: '#19c3b1', topStyle: 'tank', bottom: '#12172e', bottomStyle: 'pants', shoes: '#ffd23f' } },
    { id: 'bassti', n: 'Bassti', w: 'bass', price: 1000, hp: 1.3, spd: .92, dmg: 1.05, cd: 1, d: 'Der Zweimeter-DJ mit Bassbomben: zäh, langsam, mit riesiger Flächenwirkung.',
      look: { body: 'm', skin: '#8a5a3c', hair: { style: 'buzz', color: '#111111' }, beard: '#1a1a1a', top: '#2a2f45', topStyle: 'long', bottom: '#0d0f1c', bottomStyle: 'pants', shoes: '#ff8a3d', bulk: 1.25 } },
    { id: 'luna', n: 'Luna Blitz', w: 'blitz', price: 1700, hp: .85, spd: 1.05, dmg: 1.1, cd: .9, d: 'Ihre Blitzantenne springt von Gegner zu Gegner. Zerbrechlich, aber tödlich.',
      look: { body: 'w', skin: '#e8b88a', hair: { style: 'pony', color: '#7a5cff' }, top: '#7a5cff', topStyle: 'tee', bottom: '#1b2140', bottomStyle: 'shorts', shoes: '#19c3b1' } },
    { id: 'kiko', n: 'Kiko', w: 'rakete', price: 2600, hp: 1, spd: 1.05, dmg: 1.15, cd: 1, d: 'Der Technik-Tüftler schickt Richtfunk-Raketen, die ihr Ziel nie verlieren.',
      look: { body: 'm', skin: '#c68a62', hair: { style: 'curls', color: '#1c1410' }, top: '#ffd23f', topStyle: 'tee', bottom: '#2c3554', bottomStyle: 'shorts', shoes: '#ffffff', hat: { type: 'cap', color: '#ff3d6e' } } }
  ];

  /* ---------- Karten und Schwierigkeit ---------- */
  const MAPS = [
    { id: 'halle', n: 'Sendehalle', d: 'Kühles Studio mit blauem Neon.', price: 0, sky: 0x0a1330, fog: 0x0b1633, floor: '#1a2540', accent: '#2bd9ff', accent2: '#7a5cff', light: 0xbfd8ff },
    { id: 'wueste', n: 'Wüsten-Festival', d: 'Heißer Sand, orangefarbene Scheinwerfer.', price: 600, sky: 0x2a1408, fog: 0x3a1c0c, floor: '#4a3320', accent: '#ff9d2e', accent2: '#ff3d6e', light: 0xffd2a0 },
    { id: 'neon', n: 'Neon-Nacht', d: 'Regennasse Stadt, Pink und Violett.', price: 1200, sky: 0x12061f, fog: 0x1a0a2c, floor: '#221233', accent: '#ff3dc8', accent2: '#19e6b0', light: 0xe0b8ff }
  ];
  const DIFFS = [
    { id: 'chill', n: 'Entspannt', hp: .75, dmg: .7, spawn: .8, coin: .8, score: .8 },
    { id: 'normal', n: 'Normal', hp: 1, dmg: 1, spawn: 1, coin: 1, score: 1 },
    { id: 'hart', n: 'Hart', hp: 1.4, dmg: 1.25, spawn: 1.3, coin: 1.5, score: 1.35 }
  ];

  /* ---------- Waffen (je 6 Stufen) ---------- */
  const WEAPONS = {
    strahl: { n: 'Funkstrahl', icon: '🔫', d: 'Schießt automatisch auf den nächsten Gegner.', up: ['', 'Schaden +', 'Zweiter Strahl', 'Durchschlägt 1 Gegner mehr', 'Dritter Strahl', 'Schaden ++ und schneller'] },
    welle: { n: 'Schallwelle', icon: '🔊', d: 'Eine Druckwelle um dich, die Gegner zurückstößt.', up: ['', 'Größerer Radius', 'Schneller im Takt', 'Mehr Schaden', 'Riesenwelle', 'Doppelte Welle'] },
    platten: { n: 'Kreisende Platten', icon: '💿', d: 'Schallplatten kreisen um dich und zerschneiden alles.', up: ['', 'Dritte Platte', 'Schneller und größer', 'Vierte Platte', 'Mehr Schaden', 'Sechste Platte'] },
    blitz: { n: 'Blitzantenne', icon: '⚡', d: 'Blitze springen von Gegner zu Gegner.', up: ['', 'Mehr Schaden', 'Zweiter Blitz', 'Längere Kette', 'Schneller im Takt', 'Dritter Blitz'] },
    bass: { n: 'Bassbombe', icon: '💣', d: 'Wirft Bomben in Gegnerhaufen – Flächenschaden.', up: ['', 'Größere Explosion', 'Schneller im Takt', 'Zweite Bombe', 'Mehr Schaden', 'Dritte Bombe'] },
    rakete: { n: 'Richtfunk-Rakete', icon: '🚀', d: 'Zielsuchende Raketen mit kleiner Explosion.', up: ['', 'Mehr Schaden', 'Zweite Rakete', 'Schneller im Takt', 'Dritte Rakete', 'Große Sprengkraft'] }
  };
  const PASSIVES = {
    herz: { n: 'Kraftherz', icon: '❤️', d: '+20 % maximale Gesundheit', max: 5 },
    schuhe: { n: 'Turnschuhe', icon: '👟', d: '+8 % Lauftempo', max: 5 },
    magnet: { n: 'Magnet-Mikro', icon: '🧲', d: '+30 % Einsammelradius', max: 5 },
    verstaerker: { n: 'Verstärker', icon: '📢', d: '+10 % Schaden', max: 5 },
    takt: { n: 'Taktgeber', icon: '⏱️', d: '−7 % Wartezeit der Waffen', max: 5 },
    panzer: { n: 'Studiopanzer', icon: '🛡️', d: '−1 Schaden pro Treffer', max: 5 },
    pflaster: { n: 'Pflaster', icon: '🩹', d: '+0,5 Leben pro Sekunde', max: 5 },
    mikro: { n: 'Studio-Mikro', icon: '🎙️', d: '+12 % Erfahrung', max: 5 },
    glueck: { n: 'Glücksbringer', icon: '🍀', d: '+6 % kritische Treffer, mehr Münzen', max: 5 }
  };
  const MAXW = 6, MAXP = 6, MAXWL = 6;

  /* ---------- Dauerhafte Verbesserungen (Studio-Ausbau, mit Münzen) ---------- */
  const META = [
    { id: 'hp', n: 'Stabile Nerven', icon: '❤️', d: '+10 % Gesundheit je Stufe', max: 5, base: 120 },
    { id: 'dmg', n: 'Lautstärke', icon: '📢', d: '+6 % Schaden je Stufe', max: 5, base: 160 },
    { id: 'spd', n: 'Trainingslager', icon: '👟', d: '+4 % Tempo je Stufe', max: 5, base: 120 },
    { id: 'xp', n: 'Talentscout', icon: '⭐', d: '+8 % Erfahrung je Stufe', max: 5, base: 140 },
    { id: 'magnet', n: 'Starker Magnet', icon: '🧲', d: '+12 % Einsammelradius je Stufe', max: 5, base: 90 },
    { id: 'armor', n: 'Dämmwolle', icon: '🛡️', d: '−1 Schaden pro Treffer je Stufe (bis 3)', max: 3, base: 300 },
    { id: 'regen', n: 'Kaffeeküche', icon: '☕', d: '+0,3 Leben pro Sekunde je Stufe', max: 5, base: 150 },
    { id: 'coin', n: 'Sponsoren', icon: '🪙', d: '+10 % Münzen je Stufe', max: 5, base: 130 },
    { id: 'reroll', n: 'Zweite Meinung', icon: '🎲', d: '+1 Neu würfeln pro Runde je Stufe (bis 3)', max: 3, base: 260 },
    { id: 'revive', n: 'Notstrom', icon: '🔋', d: 'Einmal pro Runde wiederbeleben', max: 1, base: 900 }
  ];
  const metaCost = (m, lv) => Math.round(m.base * (1 + lv * 1.1));

  /* ---------- Gegner ---------- */
  const EN = {
    rausch: { n: 'Rauschling', hp: 7, spd: 2.3, r: .5, dmg: 7, xp: 1 },
    knack: { n: 'Knackser', hp: 4, spd: 4.0, r: .38, dmg: 5, xp: 1 },
    brumm: { n: 'Brummer', hp: 55, spd: 1.5, r: 1.0, dmg: 16, xp: 6 },
    schrei: { n: 'Schreihals', hp: 14, spd: 1.9, r: .55, dmg: 6, xp: 3 },
    splitt: { n: 'Splitter', hp: 24, spd: 2.1, r: .78, dmg: 9, xp: 3 },
    blitz: { n: 'Blitzer', hp: 17, spd: 2.6, r: .55, dmg: 12, xp: 4 },
    boss1: { n: 'Der Dröhner', hp: 2400, spd: 2.3, r: 2.2, dmg: 26, xp: 150, boss: 1 },
    boss2: { n: 'Feedback-Queen', hp: 5600, spd: 2.6, r: 1.8, dmg: 20, xp: 250, boss: 1 },
    boss3: { n: 'Der Große Störsender', hp: 13500, spd: 1.3, r: 2.9, dmg: 30, xp: 600, boss: 1 }
  };
  const BOSS_ORDER = ['boss1', 'boss2', 'boss3'];
  const RUN_LEN = 600;

  function weightsAt(t) {
    const w = { rausch: 100 };
    if (t > 25) w.knack = Math.min(60, (t - 25) * 1.2);
    if (t > 70) w.schrei = Math.min(26, (t - 70) * .5);
    if (t > 100) w.brumm = Math.min(16, (t - 100) * .18);
    if (t > 140) w.splitt = Math.min(22, (t - 140) * .4);
    if (t > 190) w.blitz = Math.min(24, (t - 190) * .35);
    if (t > 300) w.rausch = Math.max(35, 100 - (t - 300) * .2);
    return w;
  }

  /* ---------- Welt ---------- */
  function create(o) {
    o = o || {};
    const meta = o.meta || {}, H = HEROES.find(h => h.id === o.hero) || HEROES[0], D = DIFFS.find(d => d.id === o.diff) || DIFFS[1];
    const W = {
      o, mode: o.mode || 'run', hero: H, diff: D, map: MAPS.find(m => m.id === o.map) || MAPS[0], meta,
      R: rng(o.seed || (Date.now() & 0x7fffffff)), t: 0, state: 'play', won: false, endless: o.mode === 'endless',
      P: { x: 0, z: 0, vx: 0, vz: 0, fx: 0, fz: 1, hp: 100, maxHp: 100, inv: 0, dash: 0, dashCd: 0, dashX: 0, dashZ: 1, hurtT: 0, moving: 0, shootT: 0, speed: 6 },
      lv: 1, xp: 0, need: 0, pending: 0, choice: null, rerolls: 0,
      weapons: [], passives: {}, en: [], pb: [], eb: [], gems: [], pk: [], rings: [], bombs: [], ms: [], orbit: [], ev: [],
      kills: 0, bossKills: 0, coins: 0, dmgTaken: 0, dashes: 0, nextId: 1, spawnAcc: 0, eliteT: 90, hordeT: 45, bossIdx: 0, bossT: 180, boss: null,
      revived: false, score: 0, hitEv: 0, lastKillT: -9, combo: 0, comboT: 0,
      grid: { head: new Int32Array(GW * GW).fill(-1), next: new Int32Array(1024) }, stats: {}
    };
    W.rerolls = 1 + (meta.reroll || 0);
    W.need = needFor(1);
    W.weapons.push({ id: H.w, lv: 1, cd: .4, ang: 0 });
    recalc(W);
    W.P.hp = W.P.maxHp;
    // Erfahrung zum Start: Talentscout-Bonus ändert nur das Tempo, kein Gratis-Level
    return W;
  }
  function needFor(lv) { return Math.round(7 + 4 * lv + lv * lv * .6); }

  function recalc(W) {
    const m = W.meta, H = W.hero, pa = W.passives, P = W.P, ratio = P.maxHp ? P.hp / P.maxHp : 1;
    const lv = k => pa[k] || 0;
    W.s = {
      maxHp: Math.round(100 * H.hp * (1 + .2 * lv('herz')) * (1 + .1 * (m.hp || 0))),
      speed: 6 * H.spd * (1 + .08 * lv('schuhe')) * (1 + .04 * (m.spd || 0)),
      magnet: 3.6 * (1 + .3 * lv('magnet')) * (1 + .12 * (m.magnet || 0)),
      dmg: H.dmg * (1 + .1 * lv('verstaerker')) * (1 + .06 * (m.dmg || 0)),
      cd: Math.max(.4, H.cd * (1 - .07 * lv('takt'))),
      armor: lv('panzer') + Math.min(3, m.armor || 0),
      regen: .5 * lv('pflaster') + .3 * (m.regen || 0),
      xp: (1 + .12 * lv('mikro')) * (1 + .08 * (m.xp || 0)),
      crit: .05 + .06 * lv('glueck'),
      coin: (1 + .1 * (m.coin || 0)) * (1 + .15 * lv('glueck')) * W.diff.coin
    };
    P.maxHp = W.s.maxHp; P.hp = Math.min(P.maxHp, Math.max(1, Math.round(ratio * P.maxHp)));
    P.speed = W.s.speed;
  }

  const ev = (W, e) => { W.ev.push(e); };
  function drain(W) { const e = W.ev; W.ev = []; return e; }
  function wlv(W, id) { const w = W.weapons.find(x => x.id === id); return w ? w.lv : 0; }

  /* ---------- Gegner erzeugen ---------- */
  function hpScale(W) { const m = W.t / 60; return (1 + m * .25 + m * m * .011) * W.diff.hp; }
  function spawnEnemy(W, type, x, z, opt) {
    opt = opt || {};
    const def = EN[type], sc = hpScale(W);
    let hp = def.hp * (def.boss ? 1 : sc) * (opt.elite ? 7 : 1), r = def.r * (opt.elite ? 1.45 : 1);
    if (def.boss) hp *= W.diff.hp * (1 + .85 * (opt.loop || 0)) * (1 + (W.t / 600) * .15);
    const e = { id: W.nextId++, type, x, z, vx: 0, vz: 0, hp, maxHp: hp, r, spd: def.spd * (1 + Math.min(.35, W.t / 900)) * (opt.elite ? .9 : 1), dmg: def.dmg * W.diff.dmg * (1 + Math.min(1.2, W.t / 500)),
      xp: def.xp * (opt.elite ? 6 : 1), flash: 0, touchT: 0, discT: 0, elite: !!opt.elite, boss: !!def.boss, spawn: .45, st: 0, tm: 1 + W.R() * 2, aux: 0, ang: 0, kx: 0, kz: 0, dead: false, face: 0, noDrop: !!opt.noDrop, loop: opt.loop || 0, wob: W.R() * TAU };
    if (type === 'blitz') { e.st = 0; e.tm = 1.2 + W.R() * 1.5; }
    if (def.boss) { e.spawn = 1.2; e.tm = 2; }
    W.en.push(e);
    return e;
  }
  function clampArena(o, r) { const d = Math.hypot(o.x, o.z), lim = ARENA - r; if (d > lim) { o.x *= lim / d; o.z *= lim / d; return true; } return false; }
  function spawnPos(W, dist) {
    const P = W.P;
    for (let i = 0; i < 8; i++) { const a = W.R() * TAU, x = P.x + Math.cos(a) * dist, z = P.z + Math.sin(a) * dist; if (Math.hypot(x, z) < ARENA - 1.5) return [x, z]; }
    const a = Math.atan2(-P.z, -P.x) + (W.R() - .5) * 1.4; return [P.x + Math.cos(a) * dist * .8, P.z + Math.sin(a) * dist * .8];
  }
  function pickType(W) {
    const w = weightsAt(W.t); let sum = 0; for (const k in w) sum += w[k]; let r = W.R() * sum;
    for (const k in w) { r -= w[k]; if (r <= 0) return k; } return 'rausch';
  }
  function spawnBoss(W) {
    const idx = W.bossIdx++, kind = BOSS_ORDER[idx % 3], loop = Math.floor(idx / 3);
    const p = spawnPos(W, 16), e = spawnEnemy(W, kind, p[0], p[1], { loop });
    W.boss = e; ev(W, { k: 'boss', type: kind, n: EN[kind].n, id: e.id });
    if (W.mode === 'run' && idx === 2) e.final = true;
    return e;
  }

  /* ---------- Raster für Nachbarn ---------- */
  function buildGrid(W) {
    const G = W.grid, en = W.en; G.head.fill(-1);
    if (G.next.length < en.length) G.next = new Int32Array(en.length * 2);
    for (let i = 0; i < en.length; i++) { const e = en[i]; const c = cellOf(e.x, e.z); G.next[i] = G.head[c]; G.head[c] = i; e.ci = c; }
  }
  function cellOf(x, z) { const cx = clamp(Math.floor((x + ARENA) / CELL) + 1, 0, GW - 1), cz = clamp(Math.floor((z + ARENA) / CELL) + 1, 0, GW - 1); return cz * GW + cx; }
  // ruft fn(e) für alle Gegner im Umkreis (grob über Zellen)
  function near(W, x, z, r, fn) {
    const G = W.grid, c0x = clamp(Math.floor((x - r + ARENA) / CELL) + 1, 0, GW - 1), c1x = clamp(Math.floor((x + r + ARENA) / CELL) + 1, 0, GW - 1),
      c0z = clamp(Math.floor((z - r + ARENA) / CELL) + 1, 0, GW - 1), c1z = clamp(Math.floor((z + r + ARENA) / CELL) + 1, 0, GW - 1);
    for (let cz = c0z; cz <= c1z; cz++) for (let cx = c0x; cx <= c1x; cx++) {
      for (let i = G.head[cz * GW + cx]; i !== -1; i = G.next[i]) { const e = W.en[i]; if (e && !e.dead) fn(e); }
    }
  }
  function nearest(W, x, z, maxR) {
    let best = null, bd = maxR * maxR;
    for (let i = 0; i < W.en.length; i++) { const e = W.en[i]; if (e.dead || e.spawn > .3) continue; const dx = e.x - x, dz = e.z - z, d = dx * dx + dz * dz; if (d < bd) { bd = d; best = e; } }
    return best;
  }

  /* ---------- Schaden ---------- */
  function hurt(W, e, dmg, kx, kz, kb, flags) {
    if (e.dead) return 0;
    const crit = W.R() < W.s.crit; let d = dmg * W.s.dmg * (crit ? 2 : 1);
    if (flags && flags.raw) d = dmg;
    e.hp -= d; e.flash = .12; W.stats.dmg = (W.stats.dmg || 0) + d;
    if (kb && !e.boss) { const m = kb / (e.r > .9 ? 2.2 : 1); e.kx += kx * m; e.kz += kz * m; }
    if (W.hitEv < 40) { W.hitEv++; ev(W, { k: 'hit', x: e.x, z: e.z, d: Math.round(d), c: crit, big: e.boss }); }
    if (e.hp <= 0) kill(W, e);
    return d;
  }
  function dropGem(W, x, z, v) { if (W.gems.length > 520) { for (let i = 0; i < 40; i++) W.gems[i].mag = true; } W.gems.push({ x: x + (W.R() - .5) * .6, z: z + (W.R() - .5) * .6, v, mag: false, vx: 0, vz: 0, ph: W.R() * TAU }); }
  function dropPk(W, k, x, z, v) { W.pk.push({ k, x, z, v: v || 0, ph: W.R() * TAU, life: k === 'coin' ? 60 : 90 }); }
  function kill(W, e) {
    if (e.dead) return; e.dead = true; W.kills++; W.stats.kills = W.kills;
    ev(W, { k: 'kill', x: e.x, z: e.z, type: e.type, r: e.r, boss: e.boss, elite: e.elite });
    W.comboT = 2.5; W.combo++;
    if (e.type === 'splitt') for (let i = 0; i < 2; i++) { const a = W.R() * TAU, c = spawnEnemy(W, 'knack', e.x + Math.cos(a) * .6, e.z + Math.sin(a) * .6, { noDrop: false }); c.spawn = 0; c.hp = c.maxHp = c.maxHp * 1.2; }
    if (e.boss) {
      W.bossKills++; if (W.boss === e) W.boss = null;
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; dropGem(W, e.x + Math.cos(a) * 2, e.z + Math.sin(a) * 2, Math.round(e.xp / 14) + 1); }
      for (let i = 0; i < 5; i++) dropPk(W, 'coin', e.x + (W.R() - .5) * 5, e.z + (W.R() - .5) * 5, 8);
      dropPk(W, 'chest', e.x, e.z, 3); dropPk(W, 'heart', e.x + 1.5, e.z, 0);
      W.eb.length = 0; ev(W, { k: 'bossdown', type: e.type, n: EN[e.type].n });
      if (e.final && !W.endless && !W.won) { W.won = true; W.state = 'won'; ev(W, { k: 'win' }); }
      return;
    }
    if (e.noDrop) return;
    dropGem(W, e.x, e.z, Math.max(1, Math.round(e.xp)));
    const lk = W.s.crit - .05;
    if (e.elite) { dropPk(W, 'chest', e.x, e.z, 1); for (let i = 0; i < 3; i++) dropPk(W, 'coin', e.x + (W.R() - .5) * 2, e.z + (W.R() - .5) * 2, 3); }
    else {
      const r = W.R();
      if (r < .045 + lk * .3) dropPk(W, 'coin', e.x, e.z, 1);
      else if (r < .052 + lk * .3) dropPk(W, 'heart', e.x, e.z, 0);
      else if (r < .0545) dropPk(W, 'magnet', e.x, e.z, 0);
      else if (r < .0565) dropPk(W, 'bomb', e.x, e.z, 0);
    }
  }
  function hurtPlayer(W, raw, src) {
    const P = W.P; if (P.inv > 0 || P.dash > 0 || W.state !== 'play') return false;
    const d = Math.max(1, Math.round(raw - W.s.armor)); P.hp -= d; P.inv = .55; P.hurtT = .3; W.dmgTaken += d;
    ev(W, { k: 'hurt', d, x: P.x, z: P.z }); W.combo = 0;
    if (P.hp <= 0) die(W);
    return true;
  }
  function die(W) {
    const P = W.P;
    if ((W.meta.revive || 0) > 0 && !W.revived) {
      W.revived = true; P.hp = Math.round(P.maxHp * .6); P.inv = 2.5;
      ev(W, { k: 'revive', x: P.x, z: P.z });
      for (const e of W.en) { if (e.dead || e.boss) continue; const dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz); if (d < 14) { if (e.elite) e.hp *= .6; else { e.hp = 0; kill(W, e); } } }
      W.eb.length = 0; return;
    }
    W.state = 'dead'; W.over = true; finish(W);
  }
  function finish(W) {
    const m = W.t / 60, d = W.diff;
    W.score = Math.round((W.kills * 10 + Math.floor(W.t) * 6 + W.bossKills * 1500 + W.lv * 40 + (W.won ? 6000 : 0)) * d.score);
    W.reward = Math.round(W.coins + (Math.floor(W.kills / 18) + Math.floor(m * 4) + W.bossKills * 25 + (W.won ? 120 : 0)) * W.s.coin);
    ev(W, { k: 'over', won: W.won });
  }

  /* ---------- Level-Aufstieg ---------- */
  function optionText(kind, id, to) {
    if (kind === 'weapon') { const d = WEAPONS[id]; return { n: d.n, icon: d.icon, lv: to, t: to === 1 ? d.d : d.up[to - 1] }; }
    const d = PASSIVES[id]; return { n: d.n, icon: d.icon, lv: to, t: d.d };
  }
  function makeChoices(W) {
    const pool = [], wc = W.weapons.length, pc = Object.keys(W.passives).length;
    for (const w of W.weapons) if (w.lv < MAXWL) pool.push({ kind: 'weapon', id: w.id, to: w.lv + 1, w: 10 });
    if (wc < MAXW) for (const id in WEAPONS) if (!W.weapons.some(w => w.id === id)) pool.push({ kind: 'weapon', id, to: 1, w: 7 });
    for (const id in W.passives) if (W.passives[id] < PASSIVES[id].max) pool.push({ kind: 'passive', id, to: W.passives[id] + 1, w: 9 });
    if (pc < MAXP) for (const id in PASSIVES) if (!(id in W.passives)) pool.push({ kind: 'passive', id, to: 1, w: 6 });
    const out = [], n = 3 + (W.R() < W.s.crit - .05 ? 1 : 0);
    while (out.length < n && pool.length) {
      let sum = 0; pool.forEach(p => sum += p.w); let r = W.R() * sum, i = 0;
      for (; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) break; }
      const p = pool.splice(Math.min(i, pool.length - 1), 1)[0]; out.push(Object.assign({}, p, optionText(p.kind, p.id, p.to)));
    }
    if (!out.length) { out.push({ kind: 'heal', n: 'Verschnaufpause', icon: '💚', lv: 0, t: 'Stellt 40 % Gesundheit wieder her.' }, { kind: 'coins', n: 'Bonus', icon: '🪙', lv: 0, t: '+25 Münzen.' }); }
    return out;
  }
  function openChoice(W) { if (W.choice || W.pending <= 0) return; W.choice = makeChoices(W); ev(W, { k: 'levelup', lv: W.lv }); }
  function choose(W, i) {
    const c = W.choice && W.choice[i]; if (!c) return false;
    if (c.kind === 'weapon') { const w = W.weapons.find(x => x.id === c.id); if (w) w.lv = c.to; else W.weapons.push({ id: c.id, lv: 1, cd: .3, ang: 0 }); }
    else if (c.kind === 'passive') W.passives[c.id] = c.to;
    else if (c.kind === 'heal') W.P.hp = Math.min(W.P.maxHp, W.P.hp + W.P.maxHp * .4);
    else if (c.kind === 'coins') W.coins += 25;
    recalc(W); W.pending--; W.choice = null; ev(W, { k: 'picked', c });
    if (W.pending > 0) openChoice(W);
    return true;
  }
  function reroll(W) { if (!W.choice || W.rerolls <= 0) return false; W.rerolls--; W.choice = makeChoices(W); return true; }
  function addXp(W, v) {
    W.xp += v * W.s.xp;
    while (W.xp >= W.need) { W.xp -= W.need; W.lv++; W.need = needFor(W.lv); W.pending++; }
    if (W.pending > 0) openChoice(W);
  }

  /* ---------- Waffen ---------- */
  function wstats(id, lv) {
    switch (id) {
      case 'strahl': return { dmg: 9 + 3.2 * (lv - 1) + (lv >= 6 ? 6 : 0), cd: .72 - .05 * (lv - 1) - (lv >= 6 ? .1 : 0), n: 1 + (lv >= 2) + (lv >= 5), pierce: 1 + (lv >= 4 ? 2 : lv >= 3 ? 1 : 0) };
      case 'welle': return { dmg: 12 + 5 * lv + (lv >= 4 ? 8 : 0), cd: 2.9 - .25 * (lv - 1) - (lv >= 3 ? .2 : 0), rad: 4 + .55 * lv + (lv >= 5 ? 2.5 : 0), n: lv >= 6 ? 2 : 1 };
      case 'platten': return { dmg: 7 + 2.4 * lv + (lv >= 5 ? 4 : 0), n: [2, 3, 3, 4, 4, 6][lv - 1], rad: 2.7 + (lv >= 3 ? .5 : 0), spd: 2.4 + (lv >= 3 ? .8 : 0), size: .62 + (lv >= 3 ? .18 : 0) };
      case 'blitz': return { dmg: 13 + 4 * lv + (lv >= 2 ? 4 : 0), cd: 1.7 - .1 * (lv - 1) - (lv >= 5 ? .25 : 0), n: 1 + (lv >= 3) + (lv >= 6), chain: 2 + (lv >= 4 ? 3 : 1) + lv };
      case 'bass': return { dmg: 24 + 8 * lv + (lv >= 5 ? 12 : 0), cd: 2.7 - .2 * (lv - 1) - (lv >= 3 ? .25 : 0), rad: 2.7 + .3 * lv, n: 1 + (lv >= 4) + (lv >= 6) };
      case 'rakete': return { dmg: 16 + 5 * lv, cd: 2.4 - .15 * (lv - 1) - (lv >= 4 ? .3 : 0), n: 1 + (lv >= 3) + (lv >= 5), rad: 1.7 + (lv >= 6 ? 1 : 0) };
    }
    return {};
  }
  function updateWeapons(W, dt) {
    const P = W.P, S = W.s;
    for (const w of W.weapons) {
      const st = wstats(w.id, w.lv), cdm = S.cd;
      if (w.id === 'platten') { updateOrbit(W, w, st, dt); continue; }
      w.cd -= dt; if (w.cd > 0) continue;
      if (w.id === 'strahl') {
        const t = nearest(W, P.x, P.z, 17); if (!t) { w.cd = .1; continue; }
        const base = Math.atan2(t.z - P.z, t.x - P.x), n = st.n, sp = .13;
        for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * sp; W.pb.push({ x: P.x + Math.cos(a) * .8, z: P.z + Math.sin(a) * .8, vx: Math.cos(a) * 26, vz: Math.sin(a) * 26, dmg: st.dmg, pierce: st.pierce, life: 1.1, r: .32, hit: [] }); }
        P.fx = Math.cos(base); P.fz = Math.sin(base); P.shootT = .25; ev(W, { k: 'shoot', w: 'strahl' }); w.cd = st.cd * cdm;
      } else if (w.id === 'welle') {
        if (!W.en.length) { w.cd = .2; continue; }
        for (let i = 0; i < st.n; i++) W.rings.push({ x: P.x, z: P.z, r: .6, max: st.rad, dmg: st.dmg, hit: new Set(), delay: i * .35 });
        ev(W, { k: 'nova', r: st.rad }); w.cd = st.cd * cdm;
      } else if (w.id === 'blitz') {
        if (!W.en.length) { w.cd = .2; continue; }
        const used = new Set();
        for (let i = 0; i < st.n; i++) {
          let cur = null, bd = 1e9; for (let j = 0; j < 12; j++) { const e = W.en[(W.R() * W.en.length) | 0]; if (!e || e.dead || used.has(e.id) || e.spawn > .3) continue; const d = Math.hypot(e.x - P.x, e.z - P.z); if (d < 15 && d < bd + 6) { cur = e; bd = d; } }
          if (!cur) continue; const pts = [[P.x, 1.6, P.z]]; let left = st.chain;
          while (cur && left-- > 0) { used.add(cur.id); pts.push([cur.x, 1, cur.z]); hurt(W, cur, st.dmg, cur.x - P.x, cur.z - P.z, .6); let nx = null, nd = 36; near(W, cur.x, cur.z, 6, e => { if (e.dead || used.has(e.id)) return; const d = (e.x - cur.x) ** 2 + (e.z - cur.z) ** 2; if (d < nd) { nd = d; nx = e; } }); cur = nx; }
          ev(W, { k: 'bolt', pts });
        }
        w.cd = st.cd * cdm;
      } else if (w.id === 'bass') {
        if (!W.en.length) { w.cd = .2; continue; }
        for (let i = 0; i < st.n; i++) {
          let best = null, bc = -1; for (let j = 0; j < 7; j++) { const e = W.en[(W.R() * W.en.length) | 0]; if (!e || e.dead) continue; const d = Math.hypot(e.x - P.x, e.z - P.z); if (d > 14) continue; let c = 0; near(W, e.x, e.z, 3, () => { c++; }); if (c > bc) { bc = c; best = e; } }
          if (best) W.bombs.push({ x0: P.x, z0: P.z, x1: best.x + (W.R() - .5), z1: best.z + (W.R() - .5), t: 0, dur: .65, dmg: st.dmg, rad: st.rad });
        }
        ev(W, { k: 'lob' }); w.cd = st.cd * cdm;
      } else if (w.id === 'rakete') {
        if (!W.en.length) { w.cd = .2; continue; }
        for (let i = 0; i < st.n; i++) { const a = W.R() * TAU; W.ms.push({ x: P.x, z: P.z, vx: Math.cos(a) * 5, vz: Math.sin(a) * 5, t: 0, life: 3.2, dmg: st.dmg, rad: st.rad, tid: 0 }); }
        ev(W, { k: 'shoot', w: 'rakete' }); w.cd = st.cd * cdm;
      }
    }
  }
  function updateOrbit(W, w, st, dt) {
    const P = W.P; w.ang += st.spd * dt; W.orbit.length = 0;
    for (let i = 0; i < st.n; i++) {
      const a = w.ang + i / st.n * TAU, x = P.x + Math.cos(a) * st.rad, z = P.z + Math.sin(a) * st.rad; W.orbit.push({ x, z, a, s: st.size });
      near(W, x, z, st.size + 1.1, e => { if (e.dead || e.discT > W.t) return; const d = Math.hypot(e.x - x, e.z - z); if (d < st.size + e.r) { e.discT = W.t + .4; hurt(W, e, st.dmg, e.x - P.x, e.z - P.z, 1.1); ev(W, { k: 'disc' }); } });
    }
  }

  /* ---------- Schritt ---------- */
  function step(W, dt, inp) {
    if (W.state !== 'play') return;
    if (W.choice) return;
    dt = Math.min(dt, .05); inp = inp || {}; W.hitEv = 0;
    W.t += dt; const P = W.P, S = W.s;
    // ---- Spieler
    let mx = inp.mx || 0, mz = inp.mz || 0; const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
    if (P.dash > 0) { P.dash -= dt; P.vx = P.dashX * 22; P.vz = P.dashZ * 22; }
    else {
      const tx = mx * P.speed, tz = mz * P.speed, k = Math.min(1, dt * 14); P.vx += (tx - P.vx) * k; P.vz += (tz - P.vz) * k;
      if (inp.dash && P.dashCd <= 0) { let dx = mx, dz = mz; if (!ml) { dx = P.fx; dz = P.fz; } const l = Math.hypot(dx, dz) || 1; P.dashX = dx / l; P.dashZ = dz / l; P.dash = .2; P.dashCd = 2.4; P.inv = Math.max(P.inv, .35); W.dashes++; ev(W, { k: 'dash', x: P.x, z: P.z }); }
    }
    P.dashCd = Math.max(0, P.dashCd - dt); P.inv = Math.max(0, P.inv - dt); P.hurtT = Math.max(0, P.hurtT - dt); P.shootT = Math.max(0, P.shootT - dt);
    P.x += P.vx * dt; P.z += P.vz * dt; clampArena(P, .5);
    P.moving = Math.hypot(P.vx, P.vz);
    if (P.moving > .5 && P.shootT <= 0) { P.fx = P.vx / P.moving; P.fz = P.vz / P.moving; }
    if (S.regen > 0 && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + S.regen * dt);
    W.comboT -= dt; if (W.comboT <= 0) W.combo = 0;

    // ---- Spawn-Regie
    const live = W.en.length, cap = 240 + Math.min(80, W.t / 8);
    if (!W.boss || !W.boss.final) {
      W.spawnAcc += (1.45 + W.t / 60 * 1.0 + Math.pow(W.t / 60, 1.7) * .07) * W.diff.spawn * dt;
      while (W.spawnAcc >= 1) { W.spawnAcc--; if (W.en.length >= cap) continue; const p = spawnPos(W, 17 + W.R() * 5); spawnEnemy(W, pickType(W), p[0], p[1]); }
    }
    W.eliteT -= dt; if (W.eliteT <= 0) { W.eliteT = 70; const p = spawnPos(W, 16); const ty = ['rausch', 'brumm', 'blitz', 'splitt', 'schrei'][(W.R() * (W.t > 160 ? 5 : 2)) | 0]; spawnEnemy(W, ty, p[0], p[1], { elite: true }); ev(W, { k: 'elite' }); }
    W.hordeT -= dt; if (W.hordeT <= 0 && !(W.boss && W.boss.final)) {
      W.hordeT = 60; const n = Math.min(60, 18 + Math.floor(W.t / 12)); ev(W, { k: 'horde' });
      for (let i = 0; i < n; i++) { const a = i / n * TAU, x = P.x + Math.cos(a) * 15, z = P.z + Math.sin(a) * 15; if (Math.hypot(x, z) < ARENA - 1) spawnEnemy(W, 'knack', x, z); }
    }
    W.bossT -= dt;
    if (W.bossT <= 0 && !W.boss) {
      if (W.mode === 'run' && !W.endless) { if (W.bossIdx < 3) { spawnBoss(W); W.bossT = W.bossIdx === 1 ? 180 : 240; } else W.bossT = 1e9; }
      else { spawnBoss(W); W.bossT = 200; }
    } else if (W.bossT <= 0) W.bossT = 5;

    // ---- Gegner
    buildGrid(W);
    const en = W.en, n0 = en.length;
    for (let i = 0; i < n0; i++) {
      const e = en[i]; if (e.dead) continue;
      e.flash = Math.max(0, e.flash - dt); e.touchT = Math.max(0, e.touchT - dt);
      const dx = P.x - e.x, dz = P.z - e.z, dist = Math.hypot(dx, dz) || .001, ux = dx / dist, uz = dz / dist;
      if (e.spawn > 0) { e.spawn -= dt; continue; }
      let sp = e.spd, mvx = ux, mvz = uz;
      if (e.boss) updateBoss(W, e, dt, dist, ux, uz);
      else if (e.type === 'schrei') {
        if (dist < 8) { mvx = -ux; mvz = -uz; sp *= .8; } else if (dist < 11) sp = 0;
        e.tm -= dt; if (e.tm <= 0 && dist < 18) { e.tm = 2.6 + W.R(); const v = 6.5; W.eb.push({ x: e.x, z: e.z, vx: ux * v, vz: uz * v, dmg: e.dmg * 1.3, life: 5, r: .3 }); ev(W, { k: 'eshoot' }); }
      } else if (e.type === 'blitz') {
        e.tm -= dt;
        if (e.st === 0) { sp *= .85; if (e.tm <= 0 && dist < 13) { e.st = 1; e.tm = .7; e.ang = Math.atan2(uz, ux); } }
        else if (e.st === 1) { sp = 0; mvx = Math.cos(e.ang); mvz = Math.sin(e.ang); if (e.tm <= 0) { e.st = 2; e.tm = .55; } }
        else { sp = 13; mvx = Math.cos(e.ang); mvz = Math.sin(e.ang); if (e.tm <= 0) { e.st = 0; e.tm = 2 + W.R() * 1.5; } }
      }
      // Wackeln und Bewegung
      let vx = mvx * sp + e.kx, vz = mvz * sp + e.kz;
      e.kx *= Math.max(0, 1 - dt * 9); e.kz *= Math.max(0, 1 - dt * 9);
      // Abstand zu Nachbarn
      if (!e.boss) near(W, e.x, e.z, e.r + 1.1, o => {
        if (o === e || o.dead) return; const ox = e.x - o.x, oz = e.z - o.z, d2 = ox * ox + oz * oz, rr = (e.r + o.r) * .85;
        if (d2 < rr * rr && d2 > 1e-6) { const d = Math.sqrt(d2), f = (rr - d) / rr * 3.2; vx += ox / d * f; vz += oz / d * f; }
      });
      e.x += vx * dt; e.z += vz * dt; if (!e.boss || e.type !== 'boss1' || e.st !== 2) clampArena(e, e.r * .6);
      e.face = Math.atan2(vx, vz);
      // Berührung
      const rr = e.r + .45;
      if (dist < rr && e.touchT <= 0) { if (hurtPlayer(W, e.dmg, e)) { e.touchT = .6; e.kx -= ux * 3; e.kz -= uz * 3; } }
    }
    // ---- Waffen und Geschosse
    updateWeapons(W, dt);
    updateBullets(W, dt);
    // ---- Aufsammeln
    updatePickups(W, dt);
    // ---- aufräumen
    let j = 0; for (let i = 0; i < en.length; i++) { const e = en[i]; if (!e.dead) en[j++] = e; } en.length = j;
    if (W.boss && W.boss.dead) W.boss = null;
  }

  /* ---------- Bosse ---------- */
  function ring(W, e, n, off, v, dmg) { for (let i = 0; i < n; i++) { const a = off + i / n * TAU; W.eb.push({ x: e.x, z: e.z, vx: Math.cos(a) * v, vz: Math.sin(a) * v, dmg, life: 7, r: .35 }); } ev(W, { k: 'eshoot' }); }
  function summon(W, e, type, n, rad) { for (let i = 0; i < n; i++) { const a = W.R() * TAU, x = e.x + Math.cos(a) * rad, z = e.z + Math.sin(a) * rad; if (Math.hypot(x, z) < ARENA - 1) spawnEnemy(W, type, x, z, { noDrop: true }); } }
  function updateBoss(W, e, dt, dist, ux, uz) {
    const P = W.P, low = e.hp < e.maxHp * .5; e.tm -= dt; e.aux -= dt;
    if (e.type === 'boss1') {
      // st: 0 verfolgen, 1 Anlauf (Warnung), 2 Sturmangriff, 3 Erholung
      if (e.st === 0) { e.vx = ux; e.vz = uz; if (e.tm <= 0) { e.st = 1; e.tm = .9; e.ang = Math.atan2(uz, ux); ev(W, { k: 'warn', x: e.x, z: e.z, a: e.ang }); } }
      else if (e.st === 1) { e.spd = 0; if (e.tm <= 0) { e.st = 2; e.tm = .85; ev(W, { k: 'roar' }); } }
      else if (e.st === 2) { e.x += Math.cos(e.ang) * 15 * dt; e.z += Math.sin(e.ang) * 15 * dt; if (Math.hypot(e.x, e.z) > ARENA - e.r) { e.tm = 0; ring(W, e, 12, 0, 6, e.dmg * .5); ev(W, { k: 'quake' }); } if (e.tm <= 0) { e.st = 3; e.tm = 1.1; ring(W, e, low ? 18 : 10, W.R(), 6.5, e.dmg * .45); ev(W, { k: 'quake' }); } }
      else if (e.st === 3) { if (e.tm <= 0) { e.st = 0; e.tm = low ? 2.2 : 3.2; } }
      e.spd = e.st === 0 ? EN.boss1.spd * (low ? 1.35 : 1) : e.st === 3 ? 0 : 0;
      if (e.aux <= 0) { e.aux = low ? 6 : 8; summon(W, e, 'knack', low ? 10 : 6, 3.5); }
      if (e.st === 2) { const dxp = P.x - e.x, dzp = P.z - e.z; if (Math.hypot(dxp, dzp) < e.r + .5) hurtPlayer(W, e.dmg * 1.4, e); }
    } else if (e.type === 'boss2') {
      // hält Abstand und umkreist
      const want = 10, tang = e.ang || 1;
      if (dist < want - 2) { e.x -= ux * 3 * dt; e.z -= uz * 3 * dt; } else if (dist > want + 2) { e.x += ux * 3.2 * dt; e.z += uz * 3.2 * dt; }
      e.x += -uz * tang * 2.6 * dt; e.z += ux * tang * 2.6 * dt; if (Math.hypot(e.x, e.z) > ARENA - 3) e.ang = -tang;
      e.spd = 0; e.pat = (e.pat || 0) + dt; const cyc = e.pat % 7;
      if (cyc < 3.2) { e.sp = (e.sp || 0) - dt; if (e.sp <= 0) { e.sp = low ? .08 : .12; e.sa = (e.sa || 0) + .55; for (let k = 0; k < (low ? 3 : 2); k++) { const a = e.sa + k * TAU / (low ? 3 : 2); W.eb.push({ x: e.x, z: e.z, vx: Math.cos(a) * 6.2, vz: Math.sin(a) * 6.2, dmg: e.dmg * .45, life: 8, r: .32 }); } } }
      else if (cyc < 3.4 && !e.rr) { e.rr = true; ring(W, e, low ? 28 : 20, W.R(), 5.4, e.dmg * .5); }
      else if (cyc >= 3.4) { e.rr = cyc < 3.5 ? e.rr : false; if (low && cyc > 4 && cyc < 6 && (e.aim = (e.aim || 0) - dt) <= 0) { e.aim = .55; const a = Math.atan2(P.z - e.z, P.x - e.x); for (let k = -1; k <= 1; k++) W.eb.push({ x: e.x, z: e.z, vx: Math.cos(a + k * .16) * 9, vz: Math.sin(a + k * .16) * 9, dmg: e.dmg * .6, life: 4, r: .32 }); ev(W, { k: 'eshoot' }); } }
      if (e.aux <= 0) { e.aux = low ? 7 : 11; summon(W, e, 'schrei', low ? 4 : 2, 3); }
    } else if (e.type === 'boss3') {
      const rage = e.hp < e.maxHp * .4;
      if (dist > 6) { e.x += ux * (rage ? 1.9 : 1.2) * dt; e.z += uz * (rage ? 1.9 : 1.2) * dt; }
      e.spd = 0; e.pat = (e.pat || 0) + dt * (rage ? 1.35 : 1); const ph = Math.floor(e.pat / 5) % 3, k5 = e.pat % 5;
      if (ph === 0) { e.sp = (e.sp || 0) - dt; if (e.sp <= 0) { e.sp = .8; e.n1 = (e.n1 || 0) + 1; ring(W, e, 24, (e.n1 % 2) * (TAU / 48), 5.6, e.dmg * .4); } }
      else if (ph === 1) { e.sp = (e.sp || 0) - dt; if (e.sp <= 0) { e.sp = .5; const a = Math.atan2(P.z - e.z, P.x - e.x); for (let k = -3; k <= 3; k++) W.eb.push({ x: e.x, z: e.z, vx: Math.cos(a + k * .13) * 9.5, vz: Math.sin(a + k * .13) * 9.5, dmg: e.dmg * .5, life: 4, r: .32 }); ev(W, { k: 'eshoot' }); } }
      else { if (!e.su || e.su !== Math.floor(e.pat / 5)) { e.su = Math.floor(e.pat / 5); summon(W, e, 'blitz', 6, 4); summon(W, e, 'knack', 8, 5); ev(W, { k: 'roar' }); } }
      if (rage) { e.sa = (e.sa || 0) + dt * 1.8; e.sq = (e.sq || 0) - dt; if (e.sq <= 0) { e.sq = .22; W.eb.push({ x: e.x, z: e.z, vx: Math.cos(e.sa * 3) * 6, vz: Math.sin(e.sa * 3) * 6, dmg: e.dmg * .35, life: 8, r: .3 }); } }
      if (e.final && W.t > 1e9) e.ang = 0; void k5;
    }
    if (e.type !== 'boss1') clampArena(e, e.r);
  }

  /* ---------- Geschosse ---------- */
  function updateBullets(W, dt) {
    const P = W.P;
    // Strahlen des Spielers
    for (let i = W.pb.length - 1; i >= 0; i--) {
      const b = W.pb[i]; b.x += b.vx * dt; b.z += b.vz * dt; b.life -= dt;
      let dead = b.life <= 0 || Math.hypot(b.x, b.z) > ARENA + 1;
      if (!dead) near(W, b.x, b.z, b.r + 1.3, e => {
        if (dead || e.dead || b.hit.indexOf(e.id) >= 0 || e.spawn > .35) return; const d = Math.hypot(e.x - b.x, e.z - b.z);
        if (d < e.r + b.r) { b.hit.push(e.id); hurt(W, e, b.dmg, b.vx * .05, b.vz * .05, .45); if (--b.pierce < 0) dead = true; }
      });
      if (dead) { W.pb[i] = W.pb[W.pb.length - 1]; W.pb.pop(); }
    }
    // Schallwellen
    for (let i = W.rings.length - 1; i >= 0; i--) {
      const r = W.rings[i]; if (r.delay > 0) { r.delay -= dt; r.x = P.x; r.z = P.z; if (r.delay <= 0) ev(W, { k: 'nova', r: r.max }); continue; }
      const prev = r.r; r.r += 15 * dt; const rr = r.r;
      near(W, r.x, r.z, rr + 2, e => { if (e.dead || r.hit.has(e.id)) return; const d = Math.hypot(e.x - r.x, e.z - r.z); if (d - e.r <= rr && d + e.r >= prev - .5) { r.hit.add(e.id); hurt(W, e, r.dmg, (e.x - r.x) / (d || 1), (e.z - r.z) / (d || 1), 6.5); } });
      if (r.r >= r.max) { W.rings[i] = W.rings[W.rings.length - 1]; W.rings.pop(); }
    }
    // Bassbomben
    for (let i = W.bombs.length - 1; i >= 0; i--) {
      const b = W.bombs[i]; b.t += dt;
      if (b.t >= b.dur) {
        near(W, b.x1, b.z1, b.rad + 1.5, e => { const d = Math.hypot(e.x - b.x1, e.z - b.z1); if (!e.dead && d < b.rad + e.r) hurt(W, e, b.dmg * (1 - Math.min(.5, d / b.rad * .5)), (e.x - b.x1) / (d || 1), (e.z - b.z1) / (d || 1), 4); });
        ev(W, { k: 'boom', x: b.x1, z: b.z1, r: b.rad, big: true }); W.bombs[i] = W.bombs[W.bombs.length - 1]; W.bombs.pop();
      }
    }
    // Raketen
    for (let i = W.ms.length - 1; i >= 0; i--) {
      const m = W.ms[i]; m.t += dt; m.life -= dt;
      let tg = null; if (m.tid) tg = W.en.find(e => e.id === m.tid && !e.dead);
      if (!tg) { tg = nearest(W, m.x, m.z, 30); m.tid = tg ? tg.id : 0; }
      if (tg) { const a = Math.atan2(tg.z - m.z, tg.x - m.x), cur = Math.atan2(m.vz, m.vx); let da = a - cur; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; const na = cur + clamp(da, -dt * 5.5, dt * 5.5), sp = Math.min(20, Math.hypot(m.vx, m.vz) + dt * 22); m.vx = Math.cos(na) * sp; m.vz = Math.sin(na) * sp; }
      m.x += m.vx * dt; m.z += m.vz * dt;
      let boom = m.life <= 0;
      if (!boom && m.t > .25) near(W, m.x, m.z, 2, e => { if (!e.dead && Math.hypot(e.x - m.x, e.z - m.z) < e.r + .5) boom = true; });
      if (boom) {
        near(W, m.x, m.z, m.rad + 1.5, e => { const d = Math.hypot(e.x - m.x, e.z - m.z); if (!e.dead && d < m.rad + e.r) hurt(W, e, m.dmg, (e.x - m.x) / (d || 1), (e.z - m.z) / (d || 1), 3); });
        ev(W, { k: 'boom', x: m.x, z: m.z, r: m.rad }); W.ms[i] = W.ms[W.ms.length - 1]; W.ms.pop();
      }
    }
    // Gegnerische Geschosse
    for (let i = W.eb.length - 1; i >= 0; i--) {
      const b = W.eb[i]; b.x += b.vx * dt; b.z += b.vz * dt; b.life -= dt;
      let dead = b.life <= 0 || Math.hypot(b.x, b.z) > ARENA + 2;
      if (!dead && Math.hypot(b.x - P.x, b.z - P.z) < b.r + .42) { if (hurtPlayer(W, b.dmg, b)) dead = true; }
      if (dead) { W.eb[i] = W.eb[W.eb.length - 1]; W.eb.pop(); }
    }
  }

  /* ---------- Einsammeln ---------- */
  function updatePickups(W, dt) {
    const P = W.P, S = W.s, mr = S.magnet, mr2 = mr * mr;
    for (let i = W.gems.length - 1; i >= 0; i--) {
      const g = W.gems[i], dx = P.x - g.x, dz = P.z - g.z, d2 = dx * dx + dz * dz;
      if (g.mag || d2 < mr2) { const d = Math.sqrt(d2) || .001, sp = (g.mag ? 26 : 12) + (mr - Math.min(mr, d)) * 3; g.x += dx / d * sp * dt; g.z += dz / d * sp * dt; g.mag = g.mag || d2 < mr2 * .5; }
      if (d2 < .7) { addXp(W, g.v); ev(W, { k: 'gem', v: g.v }); W.gems[i] = W.gems[W.gems.length - 1]; W.gems.pop(); }
    }
    for (let i = W.pk.length - 1; i >= 0; i--) {
      const p = W.pk[i]; p.life -= dt; const dx = P.x - p.x, dz = P.z - p.z, d2 = dx * dx + dz * dz;
      if (p.k === 'coin' && d2 < mr2) { const d = Math.sqrt(d2) || .001; p.x += dx / d * 13 * dt; p.z += dz / d * 13 * dt; }
      if (p.life <= 0) { W.pk[i] = W.pk[W.pk.length - 1]; W.pk.pop(); continue; }
      if (d2 < (p.k === 'chest' ? 1.6 : .9)) {
        if (p.k === 'coin') { W.coins += Math.max(1, Math.round(p.v * S.coin)); ev(W, { k: 'coin' }); }
        else if (p.k === 'heart') { P.hp = Math.min(P.maxHp, P.hp + P.maxHp * .3); ev(W, { k: 'heal' }); }
        else if (p.k === 'magnet') { W.gems.forEach(g => { g.mag = true; }); W.pk.forEach(q => { if (q.k === 'coin') q.life = Math.max(q.life, 5); }); ev(W, { k: 'magnet' }); }
        else if (p.k === 'bomb') { for (const e of W.en) { if (e.dead || e.spawn > 0) continue; const d = Math.hypot(e.x - P.x, e.z - P.z); if (d < 22) hurt(W, e, e.boss ? 120 : 140, (e.x - P.x) / (d || 1), (e.z - P.z) / (d || 1), 4, { raw: true }); } W.eb.length = 0; ev(W, { k: 'boom', x: P.x, z: P.z, r: 14, big: true }); }
        else if (p.k === 'chest') { W.pending += p.v || 1; ev(W, { k: 'chest', n: p.v || 1 }); openChoice(W); }
        W.pk[i] = W.pk[W.pk.length - 1]; W.pk.pop();
      }
    }
  }

  function continueRun(W) { if (W.state !== 'won') return; W.state = 'play'; W.endless = true; W.bossT = 90; W.bossIdx = 3; ev(W, { k: 'encore' }); }
  function abort(W) { if (W.state === 'play' || W.state === 'won') { W.state = 'dead'; W.over = true; finish(W); } }
  function summary(W) { return { score: W.score, kills: W.kills, time: Math.floor(W.t), level: W.lv, bosses: W.bossKills, coins: W.coins, reward: W.reward, won: W.won, dashes: W.dashes }; }

  const FS = { ARENA, RUN_LEN, HEROES, MAPS, DIFFS, WEAPONS, PASSIVES, META, EN, metaCost, create, step, drain, choose, reroll, continueRun, abort, summary, dailySeed, dailyKey, rng, wstats, needFor, nearest, spawnEnemy, hurt, kill, MAXW, MAXP };
  root.FS = FS; if (typeof module !== 'undefined' && module.exports) module.exports = FS;
})(typeof window !== 'undefined' ? window : globalThis);
