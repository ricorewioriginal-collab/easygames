/* Online- und Gemeinschaftsfunktionen nach der Spezifikation (zotik-Repo 12/13/21/22):
   Zuhause mit Ausbaustufen (Grundstück bis Metropole), NPC-Tagesabläufe, Emotes/Siegerposen/Gimmicks (im Koop sichtbar),
   öffentliche Giftcodes und Live-Events (tägliche, wöchentliche und saisonale Rotation, optional über events.json ohne neue Spielversion). */

const DAY = 600;                                   // ein Spieltag = 10 Minuten Echtzeit, für alle Spieler gleich (Uhrzeit des Geräts)
const UTC_DAY = () => Math.floor(Date.now() / 864e5);

export const EMO = [
  ['wave', '👋', 'Winken', 'frei'], ['cheer', '🙌', 'Jubeln', 'frei'], ['shuffle', '💃', 'Zotik Shuffle', 'Code ZOTIKDANCE'],
  ['moon', '🌙', 'Mondschritt', 'Code MOONWALK'], ['blade', '⚔️', 'Siegerpose: Weltenklinge', 'Kapitel 1 abschließen'],
  ['riss', '⟡', 'Siegerpose: Rissenergie', 'Code RISSKICK'], ['camp', '🔥', 'Lagerfeuer', 'Code CAMPFIRE'],
  ['party', '🎉', 'Party', 'Code PARTYELYNDRA'], ['friend', '💞', 'Freundschaft', 'Code WELTENFREUND'],
  ['prof', '💨', 'Professorium-Gimmick', 'Code PROFESSORIUM'], ['horn', '📯', 'Nautilux-Horn', 'Code NAUTILUX'],
  ['group', '🤝', 'Gruppenpose', 'Code TEAMZOTIK'], ['comm', '💖', 'Community-Gruß', 'Code COMMUNITY'],
  ['bloom', '🌸', 'Waldblüte', 'Code ELARISGREEN'], ['shadow', '🌑', 'Schattenpose', 'Code NOCTARIS'],
  ['chair', '🪑', 'Imaginärer Stuhl', 'Kapitel 3 abschließen'], ['robot', '🤖', 'Roboter-Tanz', '8 Erfolge'],
  ['spook', '🎃', 'Gruselpose', 'Herbst-Event'], ['snow', '❄️', 'Schneeflockentanz', 'Winter-Event']
];
const PUB = {
  WELCOMEZOTIK: [['sh', 500], ['po', 5]], HELLOELYNDRA: [['sh', 1000]], ZOTIKSTART: [['title', 'Waldabenteurer']], WELTENRISS: [['kern', 5]],
  LUNARISLOVE: [['title', 'Mond-Anhänger']], ELARISGREEN: [['emo', 'bloom']], VALDORIA: [['sh', 2000]], SOLMERA: [['staub', 10]],
  AQUALIS: [['et', 3]], FROSTHAIN: [['kern', 5]], IGNARA: [['title', 'Feuerherz']], NOCTARIS: [['emo', 'shadow']], ASTRALIS: [['staub', 10]],
  ELYNDRA: [['kern', 3]], RIFTREADY: [['kern', 10]], ZOTIKDANCE: [['emo', 'shuffle']], ZOTIKFUN: [['gim', 'big']], PARTYELYNDRA: [['emo', 'party']],
  WELTENFREUND: [['emo', 'friend']], PROFESSORIUM: [['emo', 'prof']], NAUTILUX: [['emo', 'horn']], RISSKICK: [['emo', 'riss']], '1000LUN': [['sh', 1000]],
  TREASUREZOTIK: [['sh', 300], ['fell', 5], ['staub', 5]], CAMPFIRE: [['emo', 'camp']], MOONWALK: [['emo', 'moon']], TEAMZOTIK: [['emo', 'group']],
  THANKYOU: [['sh', 500], ['po', 3], ['et', 2]], COMMUNITY: [['emo', 'comm']], ZOTIKFOREVER: [['title', 'Zotik für immer']]
};
// Eventcodes: [Monat, Tag] von – bis (jährlich), oder feste Jahre
const EVC = {
  FROSTHAIN2026: [[2026, 12, 1], [2027, 2, 28], [['emo', 'snow'], ['kern', 5]]], ELYNDRA2026: [[2026, 1, 1], [2026, 12, 31], [['sh', 2026]]],
  ZOTIKWEEN: [[0, 10, 15], [0, 11, 7], [['emo', 'spook'], ['sh', 666]]], WINTERZOTIK: [[0, 12, 1], [0, 1, 15], [['emo', 'snow']]],
  SPRINGRIFT: [[0, 3, 20], [0, 4, 30], [['staub', 15]]], SUMMERELYNDRA: [[0, 6, 21], [0, 8, 31], [['sh', 1500]]],
  ANNIVERSARYZOTIK: [[0, 10, 1], [0, 10, 31], [['title', 'Jubiläumsgast'], ['sh', 1000]]], NEWYEARZOTIK: [[0, 12, 31], [0, 1, 7], [['po', 5], ['sh', 500]]]
};
const DAILY = [
  { id: 'xp', n: 'Bonus-EP-Tag', d: '+50 % Erfahrung', xp: 1.5 },
  { id: 'sh', n: 'Schatztag', d: '+50 % Rissplitter', sh: 1.5 },
  { id: 'mat', n: 'Materialtag', d: 'Doppelte Materialien', mat: 2 },
  { id: 'inv', n: 'Riss-Invasion', d: 'Gegner +25 % Leben, doppelte Belohnung', hp: 1.25, xp: 2, sh: 2 },
  { id: 'boss', n: 'Bossrotation', d: 'Bosse geben dreifache Erfahrung', bxp: 3 },
  { id: 'herb', n: 'Kräutertag', d: 'Gegner lassen oft Kräuter fallen', herb: .35 }
];
const WEEK = [{ id: 'mw', n: 'Monsterwoche', d: '+25 % Erfahrung', xp: 1.25 }, { id: 'sw', n: 'Schatzwoche', d: '+25 % Rissplitter', sh: 1.25 }];
const SEASON = [
  { from: [10, 15], to: [11, 7], n: 'Zotikween', d: 'Gruselzeit in allen Welten. Beim Einloggen: Emote „Gruselpose“.', emo: 'spook' },
  { from: [12, 1], to: [1, 15], n: 'Winterzotik', d: 'Schneeflocken über Elyndra. Beim Einloggen: Emote „Schneeflockentanz“.', emo: 'snow' },
  { from: [3, 20], to: [4, 30], n: 'Frühlingsriss', d: 'Doppelte Materialien.', mat: 2 },
  { from: [6, 21], to: [8, 31], n: 'Sommer in Elyndra', d: '+25 % Rissplitter.', sh: 1.25 }
];
const HOME = [
  ['Grundstück', 'Ein abgestecktes Stück Land westlich vom Dorfplatz.', 0, {}],
  ['Haus', 'Ein gemütliches Waldhaus mit Kamin.', 300, { fell: 5 }],
  ['Garten & Werkstatt', 'Blumenbeete, eine Bank und eine kleine Werkstatt mit Amboss.', 700, { staub: 8 }],
  ['Kleiner Ort', 'Zwei Hütten, Laternen und ein Brunnen.', 1500, { kern: 3, fell: 6 }],
  ['Stadt', 'Ein Wachturm und Marktstände.', 3000, { kern: 6, staub: 20 }],
  ['Metropole', 'Ein Weltenkristall-Denkmal mitten in deiner Stadt.', 6000, { kern: 12 }]
];
const INCOME = [0, 20, 50, 100, 200, 400];
const MATN = { fell: '🧶 Fell', staub: '✨ Rissstaub', kern: '💠 Kernsplitter' };

export function createOnline(C) {
  const { T, mk, G, M, glow, hgt } = C;
  const S = () => C.S();
  const home = () => (S().home || (S().home = { t: 0, acc: 'open', inc: 0 }));
  const emo = () => (S().emo || (S().emo = {}));
  let remoteEv = null;
  try { fetch('events.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { if (j && typeof j === 'object') remoteEv = j }).catch(() => {}) } catch (e) {}

  /* ---------- Live-Events ---------- */
  const md = (d) => [d.getMonth() + 1, d.getDate()];
  const inWin = (f, t, d) => { const v = d[0] * 100 + d[1], a = f[0] * 100 + f[1], b = t[0] * 100 + t[1]; return a <= b ? v >= a && v <= b : v >= a || v <= b };
  function events() {
    const now = new Date(), d = md(now), day = UTC_DAY(), list = [];
    const daily = (remoteEv && Array.isArray(remoteEv.daily) && remoteEv.daily.length ? remoteEv.daily : DAILY);
    list.push(Object.assign({ k: 'Tag' }, daily[day % daily.length]));
    list.push(Object.assign({ k: 'Woche' }, WEEK[Math.floor((day + 3) / 7) % WEEK.length]));
    for (const s of SEASON) if (inWin(s.from, s.to, d)) list.push(Object.assign({ k: 'Saison' }, s));
    if (remoteEv && Array.isArray(remoteEv.special)) for (const s of remoteEv.special) { const f = Date.parse(s.from), t = Date.parse(s.to); if (f && t && now >= f && now <= t) list.push(Object.assign({ k: 'Sonder' }, s)) }
    return list;
  }
  let evCache = null, evT = 0;
  const evs = () => { const n = performance.now(); if (!evCache || n - evT > 30000) { evCache = events(); evT = n } return evCache };
  function ev(k, e) {
    let v = 1; for (const x of evs()) { if (typeof x[k] === 'number') v *= x[k]; if (k === 'xp' && e && e.boss && typeof x.bxp === 'number') v *= x.bxp }
    return v;
  }

  /* ---------- Belohnungen und Giftcodes ---------- */
  function give(list) {
    const s = S(), m = s.mat || (s.mat = {}), out = [];
    for (const [k, v] of list) {
      if (k === 'sh') { s.shards += v; out.push('💎 ' + v + ' Rissplitter') }
      else if (k === 'po') { s.potions += v; out.push('🧪 ' + v + ' Heiltränke') }
      else if (k === 'et') { s.items.ether = (s.items.ether || 0) + v; out.push('🔷 ' + v + ' Äther') }
      else if (MATN[k]) { m[k] = (m[k] || 0) + v; out.push(MATN[k] + ' ×' + v) }
      else if (k === 'emo') { emo()[v] = 1; const e = EMO.find(x => x[0] === v); out.push('Emote ' + (e ? e[1] + ' ' + e[2] : v)) }
      else if (k === 'gim') { (s.gim || (s.gim = {}))[v] = 1; out.push('Gimmick „Großer Kopf“') }
      else if (k === 'title') { const t = s.titles || (s.titles = []); if (!t.includes(v)) t.push(v); out.push('Titel „' + v + '“') }
    }
    return out;
  }
  function redeem(raw) {
    const code = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!code) return 'Bitte einen Code eingeben.';
    const used = S().gc || (S().gc = {});
    if (used[code]) return 'Diesen Code hast du schon eingelöst.';
    let r = PUB[code];
    if (!r && EVC[code]) {
      const [f, t, rew] = EVC[code], now = new Date();
      const ok = f[0] ? (now >= new Date(f[0], f[1] - 1, f[2]) && now <= new Date(t[0], t[1] - 1, t[2], 23, 59)) : inWin([f[1], f[2]], [t[1], t[2]], md(now));
      if (!ok) return 'Dieser Event-Code gilt gerade nicht.';
      r = rew;
    }
    if (!r) return 'Unbekannter Code.';
    used[code] = 1; const got = give(r); C.sfx('level'); C.banner('Code eingelöst', got.join(' · ')); C.saveGame(true);
    return '✅ ' + got.join(', ');
  }

  /* ---------- Emotes ---------- */
  const emoOk = id => { const e = EMO.find(x => x[0] === id); if (!e) return false; if (e[3] === 'frei' || emo()[id]) return true;
    if (id === 'blade') return C.chDone(1); if (id === 'chair') return C.chDone(3); if (id === 'robot') return Object.keys(S().ach || {}).length >= 8; return false };
  let cur = null;
  function emoAnim(f, id, t, pos, dt) {
    const b = f.body, A = f.arms, L = f.legs, s = Math.sin, k = Math.min(1, t * 4), rnd = Math.random, P = pos;
    const fx = (c, n, up, g) => { if (rnd() < dt * n) C.emit(P.x + (rnd() - .5) * .8, P.y + 1 + rnd(), P.z + (rnd() - .5) * .8, c, 1, 1.5, .9, .45, g ?? -1, up ?? 1) };
    switch (id) {
      case 'wave': A[1].rotation.x = -2.7 * k; A[1].rotation.z = -.3 + s(t * 10) * .45; break;
      case 'cheer': A[0].rotation.x = A[1].rotation.x = -3 * k; b.position.y = Math.abs(s(t * 6)) * .25; break;
      case 'shuffle': L[0].rotation.x = s(t * 12) * .6; L[1].rotation.x = -s(t * 12) * .6; b.position.y = Math.abs(s(t * 12)) * .12; b.rotation.y = s(t * 6) * .5; A[0].rotation.x = s(t * 12) * .8; A[1].rotation.x = -s(t * 12) * .8; break;
      case 'moon': b.rotation.y = Math.PI * k; L[0].rotation.x = s(t * 8) * .5; L[1].rotation.x = -s(t * 8) * .5; b.position.y = .04; A[0].rotation.x = -.4; A[1].rotation.x = .4; break;
      case 'blade': f.handSword.visible = true; f.backSword.visible = false; A[1].rotation.x = -2.9 * k; A[0].rotation.x = -.4; b.rotation.y = .4 * k; break;
      case 'riss': A[0].rotation.z = 1.4 * k; A[1].rotation.z = -1.4 * k; b.position.y = .25 * k + s(t * 3) * .05; fx(0xb070ff, 40); break;
      case 'camp': b.position.y = -.35 * k; L[0].rotation.x = L[1].rotation.x = -1.4 * k; if (rnd() < dt * 30) C.emit(P.x + Math.sin(f.root.rotation.y) * 1.2, P.y + .2, P.z + Math.cos(f.root.rotation.y) * 1.2, rnd() < .5 ? 0xff9a3a : 0xffd27a, 1, 1, .7, .45, -2, 1); break;
      case 'party': b.position.y = Math.abs(s(t * 7)) * .5; A[0].rotation.x = A[1].rotation.x = -3; fx([0xff6ab0, 0x6affd8, 0xffe27a, 0x8ab0ff][(t * 20 | 0) % 4], 50, 2, 3); break;
      case 'friend': case 'comm': A[0].rotation.x = A[1].rotation.x = -1.6 * k; A[0].rotation.z = .6; A[1].rotation.z = -.6; fx(0xff8ac8, 25); break;
      case 'prof': if (t < 1.2) b.rotation.y = t * 12; fx(0xbfc4d0, t < 1.2 ? 80 : 10, .5, -.5); break;
      case 'horn': A[1].rotation.x = -2.2 * k; A[1].rotation.z = -.8 * k; if (rnd() < dt * 3) C.fxRing(P.x, P.z, 0x8ad0ff, 3, .5); break;
      case 'group': A[0].rotation.z = 1.2 * k; A[1].rotation.z = -1.2 * k; b.position.y = Math.abs(s(t * 5)) * .1; break;
      case 'bloom': A[0].rotation.x = A[1].rotation.x = -2.6 * k; fx(0x8aef6a, 30); fx(0xff8ac8, 15); break;
      case 'shadow': b.position.y = -.2 * k; A[0].rotation.x = A[1].rotation.x = -1 * k; fx(0x4a2a7a, 40, .4); break;
      case 'chair': b.position.y = -.45 * k; L[0].rotation.x = L[1].rotation.x = -1.5 * k; A[0].rotation.x = A[1].rotation.x = -.6 * k; b.rotation.x = -.1; break;
      case 'robot': { const q = Math.round(s(t * 4) * 2) / 2; A[0].rotation.x = -1.5 * q; A[1].rotation.x = 1.5 * q; f.head.rotation.y = Math.round(s(t * 2)) * .6; b.rotation.y = Math.round(s(t * 1.5) * 2) * .3; break }
      case 'spook': A[0].rotation.x = A[1].rotation.x = -1.6 * k; b.rotation.z = s(t * 5) * .12; fx(0xff9a2a, 15); break;
      case 'snow': b.rotation.y = t * 4; A[0].rotation.z = 1.2; A[1].rotation.z = -1.2; fx(0xffffff, 40, .3, -.4); break;
    }
  }

  /* ---------- NPC-Tagesabläufe ---------- */
  const KEEP = new Set(['mira', 'prof', 'elder', 'home']);
  const phase = () => ((Date.now() / 1000) % DAY) / DAY;
  const phaseName = () => { const p = phase(); return p < .2 ? '🌅 Morgen' : p < .5 ? '☀️ Mittag' : p < .7 ? '🌇 Abend' : '🌙 Nacht' };
  function npc(n, dt, dPl) {
    n.mv = 0; if (KEEP.has(n.id) || n.noRoute) return;
    if (!n.home) {
      n.home = [n.x, n.z]; const h0 = hgt(n.x, n.z); let best = null;
      for (let i = 0; i < 12 && !best; i++) {
        const a = (i * 2.4 + n.x) % 6.283, r = 6 + (i % 3) * 1.5, x = n.x + Math.sin(a) * r, z = n.z + Math.cos(a) * r; let ok = Math.abs(hgt(x, z) - h0) < 1.4;
        for (let j = 1; j <= 5 && ok; j++) { const q = j / 5; if (C.blocked(n.x + (x - n.x) * q, n.z + (z - n.z) * q)) ok = false }
        if (ok) best = [x, z];
      }
      n.work = best; if (!best) { n.noRoute = 1; return }
    }
    const p = phase(), tg = p > .12 && p < .62 ? n.work : n.home;
    if (dPl < 3.2 || C.dlgOn()) return;
    const dx = tg[0] - n.x, dz = tg[1] - n.z, d = Math.hypot(dx, dz);
    if (d < .15) return;
    const st = Math.min(d, 1.5 * dt); n.x += dx / d * st; n.z += dz / d * st; n.mv = .5; n.mf = Math.atan2(dx, dz);
    const y = hgt(n.x, n.z); n.P.root.position.set(n.x, y, n.z); n.spr.position.x = n.x; n.spr.position.z = n.z; if (n.col) { n.col.x = n.x; n.col.z = n.z }
  }

  /* ---------- Zuhause ---------- */
  const PX = -20, PZ = 8;
  const grp = new T.Group(), inner = new T.Group(); grp.add(inner); C.scene.add(grp); grp.userData.t = -1;
  const myCols = [];
  const PYR = new T.ConeGeometry(1, 1, 4);
  function put(o, x, z, y) { o.position.x = PX + x; o.position.z = PZ + z; o.position.y += (y || 0) + hgt(PX + x, PZ + z); inner.add(o); return o }
  function col(x, z, r) { const c = { x: PX + x, z: PZ + z, r }; C.COL.push(c); myCols.push(c) }
  function hut(x, z, w, h, d, wall, roof) {
    const g = new T.Group();
    g.add(mk(G.box, M(wall, { r: .9 }), 0, h / 2, 0, w, h, d)); const rf = mk(PYR, M(roof, { r: .8 }), 0, h + h * .35, 0, w * .78, h * .7, d * .78); rf.rotation.y = Math.PI / 4; g.add(rf);
    g.add(mk(G.box, M(0x4a2e1c), w / 2 + .01, h * .3, 0, .05, h * .6, .9, false));
    g.add(mk(G.box, M(0xffd88a, { e: 0xffb84a, ei: 1.4 }), w / 2 + .01, h * .6, d * .3, .05, .5, .5, false));
    g.add(mk(G.box, M(0xffd88a, { e: 0xffb84a, ei: 1.4 }), w / 2 + .01, h * .6, -d * .3, .05, .5, .5, false));
    return put(g, x, z);
  }
  function lantern(x, z) { const g = new T.Group(); g.add(mk(G.cyl0, M(0x3a2a22), 0, 1, 0, .06, 2, .06)); g.add(mk(G.sph0, M(0xffe0a0, { e: 0xffc060, ei: 2 }), 0, 2.05, 0, .16, .2, .16, false)); g.add(glow(0xffc060, 1.6, 0, 2.05, 0, .7)); put(g, x, z) }
  function rebuild() {
    for (const c of myCols.splice(0)) { const i = C.COL.indexOf(c); if (i >= 0) C.COL.splice(i, 1) }
    for (const ch of inner.children.slice()) inner.remove(ch);
    const t = home().t || 0; grp.userData.t = t;
    for (let i = 0; i < 16; i++) { const a = i / 16, sd = Math.floor(a * 4), u = (a * 4 % 1) * 16 - 8; const [x, z] = [[u, -8], [8, u], [-u, 8], [-8, -u]][sd]; if (sd === 1 && Math.abs(u) < 2.5) continue; put(mk(G.box, M(0x8a6a44, { r: .9 }), 0, .5, 0, .14, 1, .14), x, z) }
    if (t >= 1) { hut(-3, 0, 5, 3, 4, 0xeadcc4, 0x9a4a3a); put(mk(G.box, M(0x7a7a80), 0, .9, 0, .5, 1.8, .5), -4.5, 1.2, 3.4); col(-3, 0, 2.8) }
    if (t >= 2) {
      for (let i = 0; i < 6; i++) put(mk(G.sph0, M([0xff7ab0, 0xffe27a, 0x9ad0ff][i % 3], { e: 0x3a1a2a, ei: .4 }), 0, .25, 0, .28, .22, .28, false), 1 + (i % 3) * 1.1, -5.6 + (i > 2 ? 1 : 0));
      put(mk(G.box, M(0x8a5a34), 0, .45, 0, 1.8, .12, .5), 2, 5.5); put(mk(G.box, M(0x5a5a62, { m: .6, r: .4 }), 0, .45, 0, .8, .5, .4), -5.8, 5.8);
      hut(-5.8, -5.5, 2.4, 2, 2.4, 0xb89a74, 0x5a4a3a); col(-5.8, -5.5, 1.6)
    }
    if (t >= 3) { hut(3.5, -6, 3, 2.4, 3, 0xd8c8a8, 0x4a6a9a); hut(3.5, 6, 3, 2.4, 3, 0xe0d0b0, 0x6a8a4a); col(3.5, -6, 1.9); col(3.5, 6, 1.9); for (const x of [6.5, 2]) { lantern(x, -1.5); lantern(x, 1.5) }
      put(mk(G.cyl0, M(0x8a8a90), 0, .4, 0, .8, .8, .8), 0.5, -3); put(mk(G.cyl0, M(0x3a8cff, { e: 0x2a6cff, ei: .8 }), 0, .78, 0, .62, .05, .62, false), .5, -3); col(.5, -3, .9) }
    if (t >= 4) { put(mk(G.cyl0, M(0xb0a090), 0, 3, 0, 1, 6, 1), -6.5, 6.5); put(mk(G.cone0, M(0x6a3a6a), 0, 6.7, 0, 1.4, 1.6, 1.4), -6.5, 6.5); col(-6.5, 6.5, 1.2);
      for (const z of [-2.8, 2.8]) { const g = new T.Group(); g.add(mk(G.box, M(0x8a5a34), 0, .5, 0, 1.6, 1, .8)); g.add(mk(G.box, M(z < 0 ? 0xd94a4a : 0x4a8ad9), 0, 1.9, 0, 1.9, .1, 1.1)); for (const sx of [-.8, .8]) g.add(mk(G.cyl0, M(0x5a3a22), sx, 1.2, .45, .05, 1.4, .05)); put(g, 0, z * 2); col(0, z * 2, 1) } }
    if (t >= 5) { const g = new T.Group(); g.add(mk(G.cyl0, M(0x9a9ab0), 0, .4, 0, 1.3, .8, 1.3)); const c = mk(G.oct, M(0x8ad0ff, { e: 0x4aa0ff, ei: 2.2, r: .2 }), 0, 2.6, 0, .9, 1.6, .9, false); g.add(c); g.add(glow(0x8ad0ff, 5, 0, 2.6, 0, .8)); put(g, 5.5, 0); col(5.5, 0, 1.4); C.anim(t2 => { c.rotation.y = t2 * .6; c.position.y = 2.6 + Math.sin(t2 * 1.5) * .15 }) }
  }
  function sign() {
    const g = new T.Group(); g.add(mk(G.cyl0, M(0x6a4a2a), 0, .7, 0, .08, 1.4, .08)); g.add(mk(G.box, M(0xc8a070, { r: .9 }), 0, 1.35, 0, .9, .55, .08)); g.add(mk(G.box, M(0x3a8cff, { e: 0x2a6cff, ei: 1.2 }), 0, 1.35, .05, .25, .25, .02, false));
    const d = () => new T.Object3D();
    return { root: g, legs: [d(), d()], arms: [d(), d()], body: d(), head: d() };
  }
  const nearHome = () => C.inLunaris() && Math.hypot(C.pl.x - PX, C.pl.z - PZ) < 16;

  return {
    initHome() { const o = C.addNpc('home', 'Bauplan', PX + 8.6, PZ + 2.6, sign(), () => C.toggleMenu(true, 'home'), Math.PI / 2, () => false); o.pr = 'Bauen'; rebuild() },
    ev, events: evs,
    kill(e) { const h = evs().reduce((a, x) => a + (x.herb || 0), 0); if (h && Math.random() < h) { S().herbs++; C.toast('🌿 Kraut gefunden') } },
    npc, emoOk,
    emote(id) { if (!emoOk(id)) return C.toast('🔒 Noch nicht freigeschaltet'); cur = { id, t: 0 }; C.toggleMenu(false) },
    emoIdx: () => cur ? EMO.findIndex(x => x[0] === cur.id) + 1 : 0, emoT: () => cur ? Math.round(cur.t * 10) / 10 : 0,
    player(f, dt, pl) { if (!cur) return; if (pl.mv > .1 || pl.atk >= 0 || pl.dash > 0 || pl.dead) { cur = null; return } cur.t += dt; emoAnim(f, cur.id, cur.t, f.root.position, dt); if (cur.t > 3.4) cur = null },
    remote(f, idx, t, dt) { const e = EMO[idx - 1]; if (e) emoAnim(f, e[0], t, f.root.position, dt) },
    tick(dt) {
      if (C.inLunaris() && grp.userData.t !== (home().t || 0)) rebuild();
      inner.visible = !(C.MP.role === 'guest' && home().acc === 'priv');
      const s = S(), day = UTC_DAY(); if (C.playing() && (s.ev || (s.ev = {})).day !== day) {
        s.ev.day = day; const b = 100 + 10 * Math.min(s.lvl, 50); s.shards += b; const list = evs();
        for (const x of list) if (x.emo && !emo()[x.emo]) { emo()[x.emo] = 1; C.toast('🎁 Event-Emote: ' + x.n) }
        C.banner('Tagesbonus: +' + b + ' Rissplitter', list.map(x => x.n).join(' · '));
      }
    },
    eventsHTML() {
      let h = '<h3>📅 Live-Events</h3><p style="color:var(--dim);font-size:13px">Die Events wechseln täglich, wöchentlich und mit der Jahreszeit und gelten für alle Spieler gleichzeitig, auch im Koop.' + (remoteEv ? ' Aktuelle Liste vom Server geladen.' : '') + '</p>';
      h += evs().map(x => `<div class="row"><span><b>${x.k}: ${x.n}</b><br><small style="color:var(--dim)">${x.d || ''}</small></span></div>`).join('');
      h += `<div class="row"><span>🕰️ Tageszeit in den Welten</span><span>${phaseName()}</span></div>`;
      h += '<h3>🎁 Giftcode einlösen</h3><div class="row"><span style="flex:1"><input id="gcIn" maxlength="24" placeholder="CODE" autocomplete="off" style="width:100%;padding:8px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.25);color:#fff;text-transform:uppercase"></span><span><button class="cpb" id="gcGo">Einlösen</button></span></div><p id="gcMsg" style="font-size:13px;color:var(--dim)"></p>';
      const tl = S().titles || []; if (tl.length) h += '<h3>🏷️ Titel</h3>' + tl.map(x => `<div class="row"><span>${x}</span></div>`).join('');
      h += '<h3>😀 Emotes & Siegerposen</h3><p style="color:var(--dim);font-size:13px">Rein kosmetisch. Dein Mitspieler im Koop sieht sie auch.</p>';
      h += EMO.map(e => { const ok = emoOk(e[0]); return `<div class="row"><span>${e[1]} ${e[2]}${ok ? '' : `<br><small style="color:var(--dim)">🔒 ${e[3]}</small>`}</span><span><button class="cpb" data-emo="${e[0]}" ${ok ? '' : 'disabled'}>Zeigen</button></span></div>` }).join('');
      if (S().gim && S().gim.big) h += `<div class="row"><span>🗿 Gimmick: Großer Kopf</span><span><button class="cpb" id="gimBig">${S().gim.on ? 'aus' : 'an'}</button></span></div>`;
      return h;
    },
    homeHTML() {
      const hm = home(), t = hm.t || 0, nx = HOME[t + 1], s = S(), m = s.mat || {}, near = nearHome();
      let h = `<h3>🏡 Zuhause: ${HOME[t][0]}</h3><p style="color:var(--dim);font-size:13px">${HOME[t][1]} Dein Grundstück liegt in Lunaris, westlich vom Dorfplatz (Schild „Bauplan“).</p>`;
      h += `<div class="row"><span>Ausbaustufe</span><span>${t} / ${HOME.length - 1}</span></div>`;
      if (nx) {
        const can = s.shards >= nx[2] && Object.keys(nx[3]).every(k => (m[k] || 0) >= nx[3][k]);
        h += `<div class="row"><span>Nächste Stufe: <b>${nx[0]}</b><br><small style="color:var(--dim)">${nx[1]}<br>${nx[2]} Rissplitter${Object.keys(nx[3]).map(k => ', ' + nx[3][k] + ' ' + MATN[k]).join('')}</small></span><span><button class="cpb" id="hBuild" ${can && near ? '' : 'disabled'}>Bauen</button></span></div>`;
        if (!near) h += '<p style="color:var(--dim);font-size:13px">Zum Bauen musst du auf deinem Grundstück in Lunaris stehen.</p>';
      } else h += '<p style="color:var(--dim);font-size:13px">Deine Metropole ist fertig ausgebaut.</p>';
      const inc = INCOME[t], day = UTC_DAY();
      if (inc) h += `<div class="row"><span>💰 Einnahmen (Gasthaus, Markt)<br><small style="color:var(--dim)">${inc} Rissplitter pro Tag</small></span><span><button class="cpb" id="hInc" ${hm.inc !== day ? '' : 'disabled'}>${hm.inc !== day ? 'Abholen' : 'Morgen wieder'}</button></span></div>`;
      h += `<h3>🔑 Besuch im Koop</h3><div class="row"><span>${hm.acc === 'priv' ? 'Privat: Mitspieler sehen dein Grundstück nicht.' : 'Offen: Mitspieler sehen dein Grundstück, wenn sie bei dir mitspielen.'}</span><span><button class="cpb" id="hAcc">${hm.acc === 'priv' ? 'Öffnen' : 'Privat machen'}</button></span></div>`;
      return h;
    },
    bind(c, tab, rerender) {
      if (tab === 'events') {
        const go = c.querySelector('#gcGo'), inp = c.querySelector('#gcIn'), msg = c.querySelector('#gcMsg');
        if (go) { const f = () => { msg.textContent = redeem(inp.value); inp.value = '' }; go.onclick = f; inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') f() } }
        c.querySelectorAll('[data-emo]').forEach(b => b.onclick = () => this.emote(b.dataset.emo));
        const gb = c.querySelector('#gimBig'); if (gb) gb.onclick = () => { S().gim.on = !S().gim.on; rerender() };
      }
      if (tab === 'home') {
        const b = c.querySelector('#hBuild'); if (b) b.onclick = () => { const hm = home(), nx = HOME[(hm.t || 0) + 1], s = S(), m = s.mat || (s.mat = {}); if (!nx || !nearHome()) return; if (s.shards < nx[2] || Object.keys(nx[3]).some(k => (m[k] || 0) < nx[3][k])) return;
          s.shards -= nx[2]; for (const k in nx[3]) m[k] -= nx[3][k]; hm.t = (hm.t || 0) + 1; rebuild(); C.sfx('level'); C.banner('Gebaut: ' + nx[0], nx[1]); C.fxRing(PX, PZ, 0xffe27a, 9, .8); C.saveGame(true); rerender() };
        const ic = c.querySelector('#hInc'); if (ic) ic.onclick = () => { const hm = home(), d = UTC_DAY(); if (hm.inc === d) return; hm.inc = d; S().shards += INCOME[hm.t || 0]; C.toast('💰 +' + INCOME[hm.t || 0] + ' Rissplitter'); C.saveGame(true); rerender() };
        const ac = c.querySelector('#hAcc'); if (ac) ac.onclick = () => { const hm = home(); hm.acc = hm.acc === 'priv' ? 'open' : 'priv'; C.saveGame(true); rerender() };
      }
    },
    gimBig: () => !!(S().gim && S().gim.big && S().gim.on)
  };
}
