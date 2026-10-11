import { GW, GH, MAXW, STEP, NAMES, MAPS, DIFFS, TY, ET, TARGETS, BOOST_RANGE } from './config.js';
import { SFX, audio, music } from './audio.js';
import * as V from './view.js';

const $ = id => document.getElementById(id);
if (window.self !== window.top) $('backLink').hidden = true;
const ICON = {
  mute: '<svg class="i" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM17 9a4 4 0 0 1 0 6M19.500 6.500a8 8 0 0 1 0 11"/></svg>',
  muted: '<svg class="i" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/></svg>'
};
try { V.init($('cv')); } catch (e) { console.error(e); $('err').hidden = false; $('errTxt').textContent = 'WebGL konnte nicht gestartet werden. Bitte einen aktuellen Browser verwenden.'; throw e; }

// ------------------------------------------------------------------ Speicher
let save = { rank: [], name: '', map: 0, diff: 1 };
try { const s = JSON.parse(localStorage.getItem('anmachaTD3d') || 'null'); if (s && typeof s === 'object') save = Object.assign(save, s); } catch (e) {}
const persist = () => { try { localStorage.setItem('anmachaTD3d', JSON.stringify(save)); } catch (e) {} };

// ------------------------------------------------------------------ Logos (logos/01.png|jpg|jpeg … 13)
const logos = []; let logosDone = false;
function probe(i) {
  const nn = String(i).padStart(2, '0'), ex = ['png', 'jpg', 'jpeg'];
  return new Promise(res => { let k = 0; const nx = () => { if (k >= ex.length) return res(null); const src = `logos/${nn}.${ex[k++]}`, im = new Image(); im.onload = () => res({ src, im }); im.onerror = nx; im.src = src; }; nx(); });
}
function loadLogos() {
  let left = 13;
  for (let i = 1; i <= 13; i++) probe(i).then(r => {
    if (r) logos.push({ idx: i - 1, src: r.src, name: NAMES[i - 1], im: r.im });
    if (--left === 0) { logosDone = true; V.makeTextures(logos); buildBar(); refreshMenu(); }
  });
}

// ------------------------------------------------------------------ Ton
function setMute(m) { audio.setMute(m); $('bMute').innerHTML = m ? ICON.muted : ICON.mute; }
setMute(audio.muted);
let audioStarted = false;
function startAudio() { if (audioStarted) return; audioStarted = true; audio.unlock(); music.start(); }
addEventListener('pointerdown', startAudio, { once: true }); addEventListener('keydown', startAudio, { once: true });

// ------------------------------------------------------------------ Spielzustand
let state = 'menu', speed = 1, lives = 20, money = 0, score = 0, wave = 0, kills = 0, gameT = 0, countdown = 25, diff = DIFFS[1], uid = 0, curMap = 0;
let towers = [], enemies = [], projs = [], beams = [], queue = [], occ = [], pathCells = [], pathLen = [], pathPts = [], pathTotal = 0;
let buildType = -1, selTower = null, cursor = null;

const cx2w = V.cx2w, cz2w = V.cz2w;
const cellFree = (x, z) => x >= 0 && z >= 0 && x < GW && z < GH && !pathCells[z][x] && !occ[z][x];
const dmgOf = t => TY[t.type].dmg * (1 + 0.7 * (t.lvl - 1)) * t.boost;
const rngOf = t => TY[t.type].range + 0.3 * (t.lvl - 1);
const rateOf = t => TY[t.type].rate * (1 + 0.15 * (t.lvl - 1));
const upCost = t => t.lvl >= 3 ? 0 : Math.round(TY[t.type].cost * (t.lvl === 1 ? 0.9 : 1.4));
const sellVal = t => Math.floor(t.invested * 0.7);

function buildPath(m) {
  pathCells = Array.from({ length: GH }, () => new Array(GW).fill(false));
  pathPts = m.pts.map(p => [cx2w(p[0]), cz2w(p[1])]); pathLen = [0]; pathTotal = 0;
  for (let i = 0; i < m.pts.length - 1; i++) {
    const a = m.pts[i], b = m.pts[i + 1], dx = Math.sign(b[0] - a[0]), dz = Math.sign(b[1] - a[1]); let x = a[0], z = a[1];
    pathCells[z][x] = true; while (x !== b[0] || z !== b[1]) { x += dx; z += dz; pathCells[z][x] = true; }
    pathTotal += Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]); pathLen.push(pathTotal);
  }
}
function setupMap(i) { curMap = i; buildPath(MAPS[i]); V.setMap(i, pathCells); }

function newGame(mapI, diffI, silent) {
  towers.forEach(V.removeTower); towers = []; enemies = []; projs = []; beams = []; queue = [];
  save.map = mapI; save.diff = diffI; persist(); diff = DIFFS[diffI];
  setupMap(mapI); occ = Array.from({ length: GH }, () => new Array(GW).fill(null));
  lives = diff.life; money = diff.money; score = 0; wave = 0; kills = 0; gameT = 0; countdown = 25; speed = 1; buildType = -1; selTower = null; cursor = null;
  $('bSpeed').textContent = '×1'; music.intensity(0);
  if (silent) return;
  state = 'play'; $('menu').hidden = $('over').hidden = $('pause').hidden = true; $('hud').hidden = $('bot').hidden = false;
  hud(); refreshBar(); updatePanel(); fitView(); waveBtn(); V.setMode('play');
  toast('BEREIT?', 'Baue deine Verteidigung – dann starte die erste Welle');
}
function fitView() { V.setInsets($('hud').hidden ? 0 : $('hud').offsetHeight, $('bot').hidden ? 0 : $('bot').offsetHeight); }

function waveGroups(n) {
  const g = [{ t: 'static', c: Math.round(5 + n * 1.2), gap: Math.max(0.45, 0.9 - n * 0.02) }];
  if (n >= 2 && n % 2 === 0) g.push({ t: 'zip', c: 2 + Math.ceil(n / 2), gap: 0.55 });
  if (n >= 3 && n % 3 === 0) g.push({ t: 'swarm', c: 8 + n, gap: 0.22 });
  if (n >= 4 && (n % 4 === 0 || n % 5 === 0)) g.push({ t: 'block', c: 1 + Math.ceil(n / 4), gap: 1.3 });
  if (n === 10 || n === 20) g.push({ t: 'boss', c: n / 10, gap: 4 });
  if (n === 25) g.push({ t: 'boss', c: 3, gap: 4 });
  return g;
}
function wavePreview(n) { return waveGroups(n).map(g => `${ET[g.t].name} ×${g.c}`).join(' · '); }
function startWave() {
  if (state !== 'play' || wave >= MAXW || !V.introDone()) return;
  let early = 0;
  if (!queue.length && countdown > 4) { early = Math.floor(countdown / 2); money += early; }
  wave++; countdown = 16; let off = 0;
  waveGroups(wave).forEach(g => { for (let i = 0; i < g.c; i++) { queue.push({ at: gameT + off, t: g.t, w: wave }); off += g.gap; } off += 1; });
  queue.sort((a, b) => a.at - b.at);
  let inc = 0; towers.forEach(t => { if (TY[t.type].kind === 'cash') inc += TY[t.type].inc[t.lvl - 1]; }); inc += 10 + wave * 3; money += inc;
  toast('WELLE ' + wave + (wave === MAXW ? ' – FINALE' : ''), (inc ? `+${inc} Geld` : '') + (early > 0 ? ` · +${early} Frühstart` : '') + ' · ' + wavePreview(wave));
  const sp = pathPts[0]; V.ring(sp[0], sp[1], '#ff4fb0', 2.4, 0.9); V.shake(0.15);
  music.intensity(Math.min(1, wave / 12));
  SFX.wave(); if (inc) SFX.coin(); hud(); refreshBar(); updatePanel(); waveBtn();
}
function spawn(type, w) {
  if (enemies.length >= 220) return; const E = ET[type], hpS = 1 + 0.18 * (w - 1) + 0.018 * (w - 1) * (w - 1);
  const hp = E.hp * hpS * diff.hp; enemies.push({ id: uid++, type, hp, max: hp, d: 0, seg: 0, slow: 1, slowT: 0, x: pathPts[0][0], z: pathPts[0][1], flash: 0, dead: false });
}
function hurt(e, d) { if (e.dead) return; e.hp -= d; e.flash = 0.1; if (e.hp <= 0) killE(e); }
function killE(e) {
  e.dead = true; kills++; const E = ET[e.type]; money += E.rw; score += Math.round(E.rw * 10 * diff.sc);
  const boss = e.type === 'boss';
  V.burst(e.x, 0.5, e.z, E.col, boss ? 60 : 12, boss ? 4 : 2.2); V.ring(e.x, e.z, E.col, boss ? 3 : 0.9, boss ? 0.8 : 0.4);
  if (boss) { V.shake(0.7); SFX.boom(); }
  SFX.kill(); V.pop(e.x, 0.9, e.z, '+' + E.rw); hud(); refreshBar();
}
function aoe(x, z, r, d) { for (const o of enemies) if (!o.dead) { const dx = o.x - x, dz = o.z - z, dd = Math.sqrt(dx * dx + dz * dz); if (dd < r) hurt(o, d * (1 - dd / r * 0.4)); } }
function beam(ax, ay, az, bx, by, bz, col, zig, laser) { if (beams.length < 60) beams.push({ ax, ay, az, bx, by, bz, col, t: 0.14, zig, laser }); }
function addProj(t, e, dmg) {
  if (projs.length >= 120) return; const T = TY[t.type];
  projs.push({ x: t.x + Math.sin(t.head.rotation.y) * 0.55, y: t.head.position.y * 1.3 + 0.3, z: t.z + Math.cos(t.head.rotation.y) * 0.55, e, tx: e.x, tz: e.z, dmg, T, lvl: t.lvl, sp: T.spd, col: T.col, sc: t.type === 1 ? 0.3 : t.type === 5 ? 0.14 : 0.18 });
}
function fire(t, e) {
  const T = TY[t.type], dmg = dmgOf(t); SFX.shot(T.id); V.towerFire(t); V.muzzle(t, T.col);
  const hy = t.head.position.y * 1.3 + 0.3;
  if (T.kind === 'proj') addProj(t, e, dmg);
  else if (T.kind === 'chain') {
    let cur = e, d = dmg; const hit = [e]; hurt(e, d); beam(t.x, hy + 0.35, t.z, e.x, 0.5, e.z, T.col, true);
    for (let i = 0; i < T.n[t.lvl - 1]; i++) {
      let nx = null, nd = 3.6;
      for (const o of enemies) { if (o.dead || hit.includes(o)) continue; const dx = o.x - cur.x, dz = o.z - cur.z, dd = dx * dx + dz * dz; if (dd < nd) { nd = dd; nx = o; } }
      if (!nx) break; d *= 0.8; hurt(nx, d); beam(cur.x, 0.5, cur.z, nx.x, 0.5, nx.z, T.col, true); hit.push(nx); cur = nx;
    }
  } else {   // laser: Linie vom Turm durch das Ziel
    const dx = e.x - t.x, dz = e.z - t.z, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, r = rngOf(t), c = [];
    for (const o of enemies) { if (o.dead) continue; const ox = o.x - t.x, oz = o.z - t.z, s = ox * ux + oz * uz, p = Math.abs(ox * uz - oz * ux); if (s > 0 && s < r + 0.4 && p < 0.45) c.push([s, o]); }
    c.sort((a, b) => a[0] - b[0]); c.slice(0, T.n[t.lvl - 1]).forEach(a => hurt(a[1], dmg)); beam(t.x + ux * 0.4, hy, t.z + uz * 0.4, t.x + ux * r, 0.5, t.z + uz * r, T.col, false, true);
  }
}
function recomputeBoost() {
  towers.forEach(t => t.boost = 1);
  towers.forEach(b => { if (TY[b.type].kind !== 'boost') return; const v = 1 + TY[b.type].bon[b.lvl - 1]; towers.forEach(t => { if (t !== b && Math.hypot(t.cx - b.cx, t.cz - b.cz) <= BOOST_RANGE && v > t.boost) t.boost = v; }); });
}
function leak(e) {
  e.dead = true; lives -= ET[e.type].dm; SFX.leak(); const b = pathPts[pathPts.length - 1];
  V.burst(b[0], 0.8, b[1], '#ff3a3a', 22, 2.8); V.ring(b[0], b[1], '#ff3a3a', 2.2, 0.6); V.flashBase(); V.shake(0.45);
  const s = $('stLife'); s.classList.remove('hit'); void s.offsetWidth; s.classList.add('hit'); hud();
  if (lives <= 0) { lives = 0; hud(); endGame(false); }
}

function update(h) {
  gameT += h;
  if (!queue.length && wave < MAXW) { countdown -= h; if (countdown <= 0) startWave(); }
  while (queue.length && queue[0].at <= gameT) { const q = queue.shift(); spawn(q.t, q.w); }
  for (const e of enemies) {
    if (e.dead) continue; if (e.slowT > 0) { e.slowT -= h; if (e.slowT <= 0) e.slow = 1; }
    e.d += ET[e.type].sp * e.slow * h; if (e.flash > 0) e.flash -= h;
    if (e.d >= pathTotal) { leak(e); if (state !== 'play') return; continue; }
    while (e.seg < pathLen.length - 2 && e.d > pathLen[e.seg + 1]) e.seg++;
    const a = pathPts[e.seg], b = pathPts[e.seg + 1], f = (e.d - pathLen[e.seg]) / (pathLen[e.seg + 1] - pathLen[e.seg]);
    e.x = a[0] + (b[0] - a[0]) * f; e.z = a[1] + (b[1] - a[1]) * f;
  }
  for (const t of towers) {
    const T = TY[t.type]; if (T.kind === 'cash' || T.kind === 'boost') continue;
    t.cool -= h; const r = rngOf(t), r2 = r * r; let best = null, bv = -1e9;
    for (const e of enemies) {
      if (e.dead) continue; const dx = e.x - t.x, dz = e.z - t.z, d2 = dx * dx + dz * dz; if (d2 > r2) continue;
      if (T.slow && e.slow < 1 && t.mode === 0 && e.slowT > 0.8) continue;
      const v = t.mode === 0 ? e.d : t.mode === 1 ? e.hp : -d2; if (v > bv) { bv = v; best = e; }
    }
    if (best) {
      const want = Math.atan2(best.x - t.x, best.z - t.z); let da = want - t.head.rotation.y; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283;
      if (!t.v.info.noAim) t.head.rotation.y += da * Math.min(1, h * 14);
      if (t.cool <= 0) { if (t.v.info.noAim) t.head.rotation.y = want; fire(t, best); t.cool = 1 / rateOf(t); }
    }
  }
  for (let i = projs.length - 1; i >= 0; i--) {
    const p = projs[i]; if (p.e && !p.e.dead) { p.tx = p.e.x; p.tz = p.e.z; } else p.e = null;
    const dx = p.tx - p.x, dz = p.tz - p.z, d = Math.hypot(dx, dz), st = p.sp * h; p.y += (0.5 - p.y) * Math.min(1, h * 6);
    if (d <= st + 0.08) {
      if (p.T.splash) { aoe(p.tx, p.tz, p.T.splash[p.lvl - 1], p.dmg); V.burst(p.tx, 0.3, p.tz, p.col, 22, 3); V.ring(p.tx, p.tz, p.col, p.T.splash[p.lvl - 1], 0.45); V.shake(0.06); }
      else if (p.e) { hurt(p.e, p.dmg); if (p.T.slow) { p.e.slow = Math.min(p.e.slow, p.T.slow[p.lvl - 1]); p.e.slowT = 2.2; } V.burst(p.tx, 0.5, p.tz, p.col, 4, 1.4); }
      projs.splice(i, 1);
    } else { p.x += dx / d * st; p.z += dz / d * st; }
  }
  for (let i = beams.length - 1; i >= 0; i--) { beams[i].t -= h; if (beams[i].t <= 0) beams.splice(i, 1); }
  let w = 0; for (let i = 0; i < enemies.length; i++) if (!enemies[i].dead) enemies[w++] = enemies[i]; enemies.length = w;
  if (state === 'play' && wave >= MAXW && !queue.length && !enemies.length) endGame(true);
  if (state === 'play') { const s = Math.ceil(countdown); if (s !== update.last) { update.last = s; waveBtn(); } }
}

// ------------------------------------------------------------------ Bauen / Ausbauen / Verkaufen
function toast(t, s) { $('tT').textContent = t; $('tS').textContent = s || ''; const el = $('toast'); el.classList.add('on'); clearTimeout(toast.k); toast.k = setTimeout(() => el.classList.remove('on'), 2000); }
function tryBuild(cx, cz) {
  if (state !== 'play' || buildType < 0) return false; const T = TY[buildType];
  if (!cellFree(cx, cz)) { SFX.bad(); toast(pathCells[cz] && pathCells[cz][cx] ? 'Nicht auf dem Weg!' : 'Feld belegt'); return false; }
  if (money < T.cost) { SFX.bad(); toast('Zu wenig Geld'); return false; }
  money -= T.cost;
  const t = { type: buildType, cx, cz, x: cx2w(cx), z: cz2w(cz), lvl: 1, cool: 0.3, mode: buildType === 5 ? 1 : 0, boost: 1, invested: T.cost };
  V.addTower(t); occ[cz][cx] = t; towers.push(t); recomputeBoost(); SFX.build(); V.burst(t.x, 0.3, t.z, T.col, 16, 1.8); V.ring(t.x, t.z, T.col, 1.3, 0.55);
  selTower = null; hud(); refreshBar(); updatePanel(); return true;
}
function upgrade(t) {
  const c = upCost(t); if (!c) return; if (money < c) { SFX.bad(); toast('Zu wenig Geld'); return; }
  money -= c; t.invested += c; t.lvl++; V.styleTower(t); recomputeBoost(); SFX.up(); V.burst(t.x, 0.8, t.z, TY[t.type].col, 22, 2.2); V.ring(t.x, t.z, TY[t.type].col, 1.8, 0.6); hud(); refreshBar(); updatePanel();
}
function sell(t) {
  money += sellVal(t); V.removeTower(t); occ[t.cz][t.cx] = null; towers.splice(towers.indexOf(t), 1); recomputeBoost(); SFX.sell(); V.burst(t.x, 0.5, t.z, '#ffffff', 10, 1.5); V.pop(t.x, 1, t.z, '+' + sellVal(t)); selTower = null; hud(); refreshBar(); updatePanel();
}

// ------------------------------------------------------------------ Ende / Bestenliste
function qualifies() { return score > 0 && (save.rank.length < 10 || score > save.rank[save.rank.length - 1].s); }
function endGame(won) {
  if (state === 'over') return; state = 'over'; if (won) { score += Math.round(lives * 200 * diff.sc); SFX.win(); } else SFX.lose();
  music.intensity(0);
  $('hud').hidden = $('bot').hidden = true; $('toast').classList.remove('on');
  $('oTitle').textContent = won ? 'GESCHAFFT!' : 'RAUSCHEN GEWINNT'; $('oS').textContent = score; $('oW').textContent = wave + '/' + MAXW; $('oK').textContent = kills;
  $('oText').textContent = won ? `Alle ${MAXW} Wellen auf „${MAPS[curMap].name}“ (${diff.name}) abgewehrt – ${lives} Basis-Leben übrig (+${Math.round(lives * 200 * diff.sc)} Bonus).` : `Dein Senderturm ist gefallen – Welle ${wave} auf „${MAPS[curMap].name}“.`;
  const q = qualifies(); $('nameBox').hidden = !q; $('nm').value = save.name || ''; $('rank2').hidden = q; if (!q) $('rank2').innerHTML = rankHtml();
  $('over').hidden = false; renderRank();
}
function rankHtml() { return save.rank.length ? save.rank.map((r, i) => `<div><span>${i + 1}. ${String(r.n).replace(/[<>&]/g, '')}</span><b>${r.s}</b></div>`).join('') : ''; }
function renderRank() { const r = $('rank'); r.hidden = !save.rank.length; r.innerHTML = '<div style="justify-content:center;color:var(--mut);font-size:11px;letter-spacing:.14em">TOP 10 (LOKAL)</div>' + rankHtml(); }
$('bSave').onclick = () => {
  const n = ($('nm').value || 'Anonym').trim().slice(0, 14) || 'Anonym'; save.name = n;
  save.rank.push({ n, s: score }); save.rank.sort((a, b) => b.s - a.s); save.rank = save.rank.slice(0, 10); persist();
  $('nameBox').hidden = true; $('rank2').hidden = false; $('rank2').innerHTML = rankHtml(); renderRank();
};

// ------------------------------------------------------------------ UI
function hud() { $('vLife').textContent = lives; $('vMoney').textContent = money; $('vWave').textContent = wave + '/' + MAXW; $('vScore').textContent = score; }
function waveBtn() {
  const b = $('waveBtn'); if (state !== 'play') return;
  if (wave >= MAXW) { b.hidden = true; return; } b.hidden = false;
  b.textContent = `▶ WELLE ${wave + 1}${queue.length ? '' : ' in ' + Math.max(0, Math.ceil(countdown)) + ' s'} · ${wavePreview(wave + 1)}`;
}
function buildBar() {
  const bar = $('bar'); bar.innerHTML = '';
  TY.forEach((T, i) => {
    const b = document.createElement('button'); b.className = 'tb'; b.dataset.i = i; b.title = T.name; b.style.setProperty('--tc', T.col);
    const l = logos.find(x => x.idx === T.li); let im;
    if (l) { im = document.createElement('img'); im.src = l.src; im.alt = ''; } else { im = document.createElement('div'); im.className = 'fb'; im.textContent = T.name[0]; im.style.color = T.col; }
    const c = document.createElement('b'); c.textContent = '$' + T.cost; const k = document.createElement('i'); k.textContent = i + 1;
    b.append(im, c, k); b.onclick = () => selectType(buildType === i ? -1 : i); bar.appendChild(b);
  });
  refreshBar();
}
function refreshBar() { document.querySelectorAll('.tb').forEach(b => { const i = +b.dataset.i; b.classList.toggle('on', i === buildType); b.classList.toggle('poor', money < TY[i].cost); }); }
function selectType(i) { buildType = i; selTower = null; cursor = null; refreshBar(); updatePanel(); }
function selectTower(t) { selTower = t; buildType = -1; refreshBar(); updatePanel(); }
function updatePanel() {
  const info = $('pInfo'), up = $('bUp'), sl = $('bSell'), tg = $('bTgt'); up.hidden = sl.hidden = tg.hidden = true;
  if (selTower) {
    const t = selTower, T = TY[t.type]; let st = '';
    if (T.kind === 'cash') st = `+${T.inc[t.lvl - 1]} Geld pro Welle`; else if (T.kind === 'boost') st = `+${Math.round(T.bon[t.lvl - 1] * 100)} % Schaden für Türme in der Nähe`;
    else { st = `Schaden ${Math.round(dmgOf(t))} · Reichweite ${rngOf(t).toFixed(1)} · ${rateOf(t).toFixed(1)}/s`; if (T.slow) st += ` · Tempo −${Math.round((1 - T.slow[t.lvl - 1]) * 100)} %`; if (t.boost > 1) st += ` · Boost +${Math.round((t.boost - 1) * 100)} %`; }
    info.innerHTML = `<b>${T.name}</b><span class="pips">${[1, 2, 3].map(n => `<u class="${n <= t.lvl ? 'on' : ''}"></u>`).join('')}</span><br>${NAMES[T.li]} – ${st}`;
    if (t.lvl < 3) { up.hidden = false; up.innerHTML = `⬆ Ausbau<br>$${upCost(t)}`; up.disabled = money < upCost(t); }
    sl.hidden = false; sl.innerHTML = `Verkauf<br>+$${sellVal(t)}`;
    if (T.kind !== 'cash' && T.kind !== 'boost') { tg.hidden = false; tg.innerHTML = `Ziel<br>${TARGETS[t.mode]}`; }
  } else if (buildType >= 0) {
    const T = TY[buildType]; info.innerHTML = `<b>${T.name}</b> · $${T.cost} · ${NAMES[T.li]}<br>${T.desc} ${money < T.cost ? '<span style="color:#ff8a9a">(zu wenig Geld)</span>' : ''}`;
  } else info.innerHTML = '<b>Bauen:</b> unten einen Sender-Turm wählen, dann ein Feld neben dem Weg antippen.<br>Auf einen Turm tippen = ausbauen, Ziel ändern oder verkaufen.';
}
$('bUp').onclick = () => selTower && upgrade(selTower);
$('bSell').onclick = () => selTower && sell(selTower);
$('bTgt').onclick = () => { if (selTower) { selTower.mode = (selTower.mode + 1) % 3; updatePanel(); } };
$('waveBtn').onclick = () => startWave();
$('bSpeed').onclick = () => { speed = speed === 1 ? 2 : 1; $('bSpeed').textContent = '×' + speed; };
function setPause(p) { if (p && state === 'play') { state = 'pause'; $('pause').hidden = false; audio.suspend(true); } else if (!p && state === 'pause') { state = 'play'; $('pause').hidden = true; audio.suspend(false); } }
$('bPause').onclick = () => setPause(true); $('bResume').onclick = () => setPause(false);
$('bMute').onclick = () => setMute(!audio.muted);
const toMenu = () => { audio.suspend(false); newGame(save.map, save.diff, true); state = 'menu'; V.setMode('menu'); $('pause').hidden = $('over').hidden = true; $('hud').hidden = $('bot').hidden = true; $('menu').hidden = false; fitView(); renderRank(); };
$('bMenu').onclick = () => setPause(true); $('bToMenu').onclick = toMenu; $('oMenu').onclick = toMenu;
$('bRestart').onclick = () => { audio.suspend(false); newGame(curMap, save.diff); }; $('bAgain').onclick = () => newGame(curMap, save.diff);
$('bPlay').onclick = () => newGame(save.map, save.diff);

// Kartenwahl mit kleiner Vorschau des Wegs
(function mapCards() {
  const wrap = $('maps');
  MAPS.forEach((m, i) => {
    const b = document.createElement('button'); b.className = 'mc'; b.dataset.map = i; b.style.setProperty('--ac', m.th[3]);
    const c = document.createElement('canvas'); c.width = 140; c.height = 100; const g = c.getContext('2d'), S = 10;
    g.fillStyle = m.th[0]; g.fillRect(0, 0, 140, 100); g.strokeStyle = m.th[1]; g.globalAlpha = 0.35; g.lineWidth = 1;
    for (let x = 0; x <= 14; x++) { g.beginPath(); g.moveTo(x * S, 0); g.lineTo(x * S, 100); g.stroke(); } for (let y = 0; y <= 10; y++) { g.beginPath(); g.moveTo(0, y * S); g.lineTo(140, y * S); g.stroke(); }
    g.globalAlpha = 1; g.strokeStyle = m.th[3]; g.lineWidth = 4; g.lineJoin = 'round'; g.shadowColor = m.th[3]; g.shadowBlur = 8; g.beginPath();
    m.pts.forEach((p, k) => { const x = p[0] * S + S / 2, y = p[1] * S + S / 2; k ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    b.append(c, document.createTextNode(m.name)); b.onclick = () => { save.map = i; persist(); refreshMenu(); newGame(i, save.diff, true); }; wrap.appendChild(b);
  });
})();
document.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { save.diff = +b.dataset.diff; persist(); refreshMenu(); });
function refreshMenu() {
  document.querySelectorAll('[data-map]').forEach(b => b.classList.toggle('on', +b.dataset.map === save.map));
  document.querySelectorAll('[data-diff]').forEach(b => b.classList.toggle('on', +b.dataset.diff === save.diff));
  const p = $('bPlay'); p.disabled = !logosDone; p.textContent = logosDone ? 'SPIELEN' : 'LADEN …';
  const n = logos.length; $('logoInfo').textContent = !logosDone ? 'Logos werden geladen …' : n ? `${n} Sender-Logos geladen` : 'Keine Logos gefunden – lege Bilder als logos/01.png … 13.png ab.';
}
renderRank();
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Enter' && e.target.id === 'nm') $('bSave').click(); return; }
  const k = e.key.toLowerCase();
  if (k === 'm') setMute(!audio.muted);
  if (state === 'pause' && (k === 'p' || k === 'escape')) return setPause(false);
  if (state !== 'play') return;
  if (k === 'p') setPause(true); else if (k === 'f') $('bSpeed').click(); else if (k === ' ' || k === 'enter') { e.preventDefault(); startWave(); }
  else if (k >= '1' && k <= '8') selectType(buildType === +k - 1 ? -1 : +k - 1);
  else if (k === 'u' && selTower) upgrade(selTower); else if ((k === 's' || k === 'delete') && selTower) sell(selTower);
  else if (k === 'escape') { buildType = -1; selTower = null; refreshBar(); updatePanel(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) setPause(true); });

// ------------------------------------------------------------------ Schwebende Zahlen
const popBox = $('pops');
V.setPopHandler((x, y, txt) => {
  if (popBox.childElementCount > 14) return;
  const d = document.createElement('div'); d.className = 'pop'; d.textContent = txt; d.style.left = x + 'px'; d.style.top = y + 'px';
  d.onanimationend = () => d.remove(); popBox.appendChild(d);
});

// ------------------------------------------------------------------ Eingabe (Antippen / Klicken)
const cv = $('cv'); let down = null;
cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
cv.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && state === 'play') cursor = V.pick(e.clientX, e.clientY); });
cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') cursor = null; });
cv.addEventListener('pointerup', e => {
  if (!down || state !== 'play') return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null; if (moved > 12) return;
  const c = V.pick(e.clientX, e.clientY); if (!c) { selTower = null; updatePanel(); return; }
  const t = occ[c.z][c.x]; if (t) { cursor = null; return selectTower(t); }
  if (buildType >= 0) { if (cursor && cursor.x === c.x && cursor.z === c.z) tryBuild(c.x, c.z); else cursor = c; }
  else { selTower = null; updatePanel(); }
});
cv.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('resize', () => { V.setInsets($('hud').hidden ? 0 : $('hud').offsetHeight, $('bot').hidden ? 0 : $('bot').offsetHeight); });

// ------------------------------------------------------------------ Schleife
const S = { get state() { return state; }, towers, enemies, projs, beams, buildType: -1, cursor: null, selTower: null, selRange: 0, ghostOk: false };
let last = performance.now(), acc = 0;
function loop(now) {
  requestAnimationFrame(loop); const raw = (now - last) / 1000, dt = Math.min(0.1, raw); last = now;
  if (state === 'play' && V.introDone()) { acc += dt * speed; let k = 0; while (acc >= STEP && k++ < 8) { update(STEP); acc -= STEP; if (state !== 'play') break; } if (k >= 8) acc = 0; if (state === 'play') hud(); }
  S.towers = towers; S.enemies = enemies; S.projs = projs; S.beams = beams; S.buildType = buildType; S.cursor = cursor; S.selTower = selTower;
  S.ghostOk = buildType >= 0 && cursor ? cellFree(cursor.x, cursor.z) && money >= TY[buildType].cost : false;
  S.selRange = selTower ? (TY[selTower.type].range ? rngOf(selTower) : TY[selTower.type].kind === 'boost' ? BOOST_RANGE : 0.5) : 0;
  V.render(state === 'pause' ? 0 : dt * (state === 'play' ? Math.min(speed, 2) : 1), raw, S);
}
try { newGame(save.map, save.diff, true); } catch (e) { console.error(e); }
V.setMode('menu'); refreshMenu(); loadLogos(); requestAnimationFrame(loop);

// Test-Hook
window.__td = {
  get state() { return state; }, get lives() { return lives; }, get money() { return money; }, get wave() { return wave; }, get score() { return score; }, get kills() { return kills; },
  towers: () => towers, enemies: () => enemies, pathCells: () => pathCells, TY, newGame, startWave, tryBuild, selectType, selectTower, upgrade, sell, GW, GH, MAXW,
  place: (type, x, z) => { buildType = type; return tryBuild(x, z); }, setMoney: m => { money = m; }, quality: () => V.currentQuality()
};
