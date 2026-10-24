/* Funk-Billard 3D – Physik und 8-Ball-Regeln ohne DOM (auch in Node testbar).
 * Tisch in Metern (Spielfläche L × B), Kugeln als Kreise auf der Ebene: Rollreibung, elastische Stöße, Banden mit Taschen-Öffnungen,
 * Effet (Nachlauf/Rückzieher) nach dem ersten Kontakt. Nur Grundrechenarten und Math.sqrt → auf allen Geräten gleich (für Online-Wiederholung).
 * Regeln (vereinfacht nach 8-Ball): Anstoß, offener Tisch, Volle/Halbe, Fouls (Weiße versenkt, nichts/falsch getroffen, keine Bande),
 * Ball in der Hand, die 8 als letzte – zu früh oder mit Foul versenkt = verloren. */
(function (root) {
  'use strict';
  const L = 2.24, B = 1.12, R = .028, D = R * 2, HX = L / 2, HZ = B / 2;
  const POCKETS = [[-HX, -HZ, .062], [0, -HZ - .012, .054], [HX, -HZ, .062], [-HX, HZ, .062], [0, HZ + .012, .054], [HX, HZ, .062]];
  const FRICT = .32, REST = .955, CUSH = .74, VMAX = 6.2, SUB = 240;
  const group = n => n === 0 ? 'cue' : n === 8 ? 'eight' : n < 8 ? 'solid' : 'stripe';

  function rack(seed) {
    // Dreieck: Spitze am Fußpunkt, 8 in der Mitte, hinten links/rechts je eine Volle und eine Halbe
    let s = seed >>> 0 || 7; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
    const order = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15];
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const balls = [{ n: 0, x: -L / 4, z: 0, vx: 0, vz: 0, in: false }], fx = L / 4, dx = D * .8661 + .0005;
    const slots = []; for (let r = 0; r < 5; r++) for (let c = 0; c <= r; c++) slots.push([fx + r * dx, (c - r / 2) * (D + .0005)]);
    // Platz 4 (Mitte der 3. Reihe) = 8; Ecken der letzten Reihe: eine Volle, eine Halbe
    const nums = Array(15).fill(0); nums[4] = 8;
    const solids = order.filter(n => n < 8), stripes = order.filter(n => n > 8);
    nums[10] = solids.pop(); nums[14] = stripes.pop();
    const rest = solids.concat(stripes).sort(() => rnd() - .5); for (let i = 0; i < 15; i++) if (!nums[i]) nums[i] = rest.pop();
    slots.forEach((p, i) => balls.push({ n: nums[i], x: p[0], z: p[1], vx: 0, vz: 0, in: false }));
    return balls;
  }
  function newGame(o) {
    o = o || {};
    return { balls: rack(o.seed), turn: 0, groups: [null, null], phase: o.free ? 'aim' : 'aim', breakShot: true, inHand: false, inHandKitchen: true, over: false, winner: -1, free: !!o.free, shots: [0, 0], potted: [[], []], log: [], ev: [], shot: null, msg: 'Anstoß' };
  }
  const cue = G => G.balls[0];
  const live = G => G.balls.filter(b => !b.in);
  const moving = G => G.balls.some(b => !b.in && (b.vx || b.vz));

  /* ---------- Stoß ausführen ---------- */
  function shoot(G, dx, dz, power, spin) {
    if (G.over || moving(G)) return false;
    const l = Math.sqrt(dx * dx + dz * dz); if (!l) return false;
    const v = Math.max(.05, Math.min(1, power)) * VMAX, c = cue(G);
    c.vx = dx / l * v; c.vz = dz / l * v;
    G.shot = { first: -1, rail: false, railAfter: false, potted: [], cueIn: false, spin: Math.max(-1, Math.min(1, spin || 0)), dir: [dx / l, dz / l], v0: v, spinDone: false, by: G.turn, t: 0 };
    G.phase = 'roll'; G.inHand = false; G.shots[G.turn]++; G.ev.push({ k: 'shot', v });
    return true;
  }
  // Physik-Schritt (dt Sekunden, intern in feinen Teilschritten)
  function step(G, dt) {
    if (G.phase !== 'roll') return;
    let n = Math.max(1, Math.round(dt * SUB)); const h = dt / n;
    while (n--) sub(G, h);
    G.shot.t += dt;
    if (!moving(G) || G.shot.t > 25) { for (const b of G.balls) b.vx = b.vz = 0; resolve(G); }
  }
  function sub(G, h) {
    const bs = G.balls, S = G.shot;
    for (const b of bs) {
      if (b.in || !(b.vx || b.vz)) continue;
      const sp = Math.sqrt(b.vx * b.vx + b.vz * b.vz), dec = FRICT * h;
      if (sp <= dec) { b.vx = b.vz = 0; continue; }
      const k = (sp - dec) / sp; b.vx *= k; b.vz *= k; b.x += b.vx * h; b.z += b.vz * h;
      // Taschen
      for (const p of POCKETS) { const ex = b.x - p[0], ez = b.z - p[1]; if (ex * ex + ez * ez < p[2] * p[2]) { pot(G, b); break; } }
      if (b.in) continue;
      // Banden (in Taschennähe offen)
      const nearPocket = POCKETS.some(p => { const ex = b.x - p[0], ez = b.z - p[1]; return ex * ex + ez * ez < (p[2] * 1.9) * (p[2] * 1.9); });
      if (!nearPocket) {
        if (b.x < -HX + R) { b.x = -HX + R; b.vx = -b.vx * CUSH; rail(G, b); } else if (b.x > HX - R) { b.x = HX - R; b.vx = -b.vx * CUSH; rail(G, b); }
        if (b.z < -HZ + R) { b.z = -HZ + R; b.vz = -b.vz * CUSH; rail(G, b); } else if (b.z > HZ - R) { b.z = HZ - R; b.vz = -b.vz * CUSH; rail(G, b); }
      } else if (Math.abs(b.x) > HX + .08 || Math.abs(b.z) > HZ + .08) pot(G, b);   // durch die Taschenöffnung hinaus
    }
    // Kugel-Stöße
    for (let i = 0; i < bs.length; i++) { const a = bs[i]; if (a.in) continue;
      for (let j = i + 1; j < bs.length; j++) { const b = bs[j]; if (b.in) continue;
        const dx = b.x - a.x, dz = b.z - a.z, d2 = dx * dx + dz * dz; if (d2 >= D * D || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, ov = (D - d) / 2;
        a.x -= nx * ov; a.z -= nz * ov; b.x += nx * ov; b.z += nz * ov;
        const rv = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz; if (rv <= 0) continue;
        const imp = rv * (1 + REST) / 2; a.vx -= imp * nx; a.vz -= imp * nz; b.vx += imp * nx; b.vz += imp * nz;
        if (S) {
          const other = a.n === 0 ? b : b.n === 0 ? a : null;
          if (other && S.first < 0) S.first = other.n;
          if (other && !S.spinDone && S.spin) { S.spinDone = true; const c = G.balls[0], f = S.spin * S.v0 * .55 * Math.min(1, rv / S.v0 + .2); c.vx += S.dir[0] * f; c.vz += S.dir[1] * f; }
        }
        G.ev.push({ k: 'click', v: rv });
      } }
  }
  function rail(G, b) { const S = G.shot; if (S) { S.rail = true; if (S.first >= 0) S.railAfter = true; } G.ev.push({ k: 'rail', v: Math.sqrt(b.vx * b.vx + b.vz * b.vz) }); }
  function pot(G, b) { b.in = true; b.vx = b.vz = 0; const S = G.shot; if (S) { if (b.n === 0) S.cueIn = true; else S.potted.push(b.n); } G.ev.push({ k: 'pot', n: b.n }); }

  /* ---------- Stoß auswerten (Regeln) ---------- */
  const groupLeft = (G, g) => G.balls.some(b => !b.in && group(b.n) === g);
  function resolve(G) {
    const S = G.shot, p = G.turn, o = 1 - p, g = G.groups[p];
    G.phase = 'aim'; G.shot = null;
    if (G.free) { if (S.cueIn) respotCue(G); G.inHand = S.cueIn; G.ev.push({ k: 'end', foul: false }); return; }
    const own = n => G.groups[p] ? group(n) === G.groups[p] : group(n) !== 'eight';
    let foul = '';
    if (S.cueIn) foul = 'Weiße versenkt';
    else if (S.first < 0) foul = 'Keine Kugel getroffen';
    else if (!G.breakShot && G.groups[p] && group(S.first) !== g && !(S.first === 8 && !groupLeft(G, g))) foul = 'Falsche Kugel zuerst getroffen';
    else if (!G.breakShot && !G.groups[p] && S.first === 8) foul = 'Die 8 zuerst getroffen';
    else if (!G.breakShot && !S.potted.length && !S.railAfter) foul = 'Keine Bande nach dem Kontakt';
    for (const n of S.potted) if (n !== 8) G.potted[p].push(n);
    // die 8
    if (S.potted.includes(8)) {
      if (G.breakShot) { respot(G, 8); G.ev.push({ k: 'msg', m: 'Die 8 beim Anstoß – sie kommt zurück.' }); }
      else { const cleared = !!G.groups[p] && !groupLeft(G, G.groups[p]), win = cleared && !foul; return finish(G, win ? p : o, win ? 'Die 8 versenkt – gewonnen!' : foul ? 'Die 8 mit Foul versenkt – verloren.' : 'Die 8 zu früh versenkt – verloren.'); }
    }
    // Gruppen festlegen (offener Tisch, nicht beim Anstoß)
    if (!G.groups[p] && !G.breakShot && !foul) { const f = S.potted.find(n => n !== 8); if (f) { G.groups[p] = group(f); G.groups[o] = group(f) === 'solid' ? 'stripe' : 'solid'; G.ev.push({ k: 'groups', p, g: G.groups[p] }); } }
    const legal = S.potted.some(n => n !== 8 && own(n));
    const wasBreak = G.breakShot; G.breakShot = false;
    if (foul) { if (S.cueIn) respotCue(G); G.turn = o; G.inHand = true; G.inHandKitchen = false; G.msg = 'Foul: ' + foul + ' – Ball in der Hand'; G.ev.push({ k: 'foul', why: foul, p }); }
    else if (legal || (wasBreak && S.potted.length)) { G.msg = 'Weiter geht’s!'; G.ev.push({ k: 'again', p }); }
    else { G.turn = o; G.msg = 'Wechsel'; G.ev.push({ k: 'switch', p: o }); }
    G.ev.push({ k: 'end', foul: !!foul });
  }
  function finish(G, w, m) { G.over = true; G.winner = w; G.msg = m; G.phase = 'over'; G.ev.push({ k: 'over', winner: w, m }); }
  function free(G, x, z, skip) { for (const b of G.balls) if (!b.in && b !== skip) { const dx = b.x - x, dz = b.z - z; if (dx * dx + dz * dz < D * D * 1.02) return false; } return Math.abs(x) <= HX - R && Math.abs(z) <= HZ - R; }
  function respot(G, n) { const b = G.balls.find(x => x.n === n); b.in = false; let x = L / 4; while (!free(G, x, 0, b)) x += D * .5; b.x = x; b.z = 0; }
  function respotCue(G) { const c = cue(G); c.in = false; c.vx = c.vz = 0; let x = -L / 4; while (!free(G, x, 0, c)) x -= D * .5; c.x = x; c.z = 0; }
  // Ball in der Hand platzieren (Anstoß: nur hinter der Kopflinie)
  function place(G, x, z) {
    if (!G.inHand && !G.breakShot) return false;
    if (G.breakShot && x > -L / 4) x = -L / 4;
    x = Math.max(-HX + R, Math.min(HX - R, x)); z = Math.max(-HZ + R, Math.min(HZ - R, z));
    const c = cue(G); if (!free(G, x, z, c)) return false; c.x = x; c.z = z; c.in = false; return true;
  }

  /* ---------- Vorschau: wo trifft die Weiße zuerst? ---------- */
  function aimInfo(G, dx, dz) {
    const c = cue(G), l = Math.sqrt(dx * dx + dz * dz); dx /= l; dz /= l;
    let best = Infinity, hit = null;
    for (const b of G.balls) { if (b.in || b === c) continue;
      const ex = b.x - c.x, ez = b.z - c.z, t = ex * dx + ez * dz; if (t <= 0) continue;
      const pd2 = ex * ex + ez * ez - t * t; if (pd2 >= D * D) continue;
      const tt = t - Math.sqrt(D * D - pd2); if (tt < best) { best = tt; hit = b; } }
    // Bande
    let tw = Infinity; if (dx > 0) tw = Math.min(tw, (HX - R - c.x) / dx); if (dx < 0) tw = Math.min(tw, (-HX + R - c.x) / dx); if (dz > 0) tw = Math.min(tw, (HZ - R - c.z) / dz); if (dz < 0) tw = Math.min(tw, (-HZ + R - c.z) / dz);
    if (!hit || best > tw) return { t: tw, hit: null, gx: c.x + dx * tw, gz: c.z + dz * tw };
    const gx = c.x + dx * best, gz = c.z + dz * best, nx = (hit.x - gx) / D, nz = (hit.z - gz) / D;
    return { t: best, hit, gx, gz, ox: nx, oz: nz, cx: dx - nx * (dx * nx + dz * nz), cz: dz - nz * (dx * nx + dz * nz) };
  }

  /* ---------- Computer-Gegner ---------- */
  const segClear = (G, x1, z1, x2, z2, skip) => { const dx = x2 - x1, dz = z2 - z1, l2 = dx * dx + dz * dz; for (const b of G.balls) { if (b.in || skip.includes(b)) continue; let t = ((b.x - x1) * dx + (b.z - z1) * dz) / l2; t = Math.max(0, Math.min(1, t)); const px = x1 + dx * t - b.x, pz = z1 + dz * t - b.z; if (px * px + pz * pz < D * D * .98) return false; } return true; };
  function candidates(G, p) {
    const g = G.groups[p], c = cue(G), out = [];
    const targets = G.balls.filter(b => !b.in && b.n && (g ? (group(b.n) === g || (b.n === 8 && !groupLeft(G, g))) : b.n !== 8));
    for (const b of targets) for (const pk of POCKETS) {
      const tx = pk[0] - b.x, tz = pk[1] - b.z, tl = Math.sqrt(tx * tx + tz * tz), ux = tx / tl, uz = tz / tl;
      const gx = b.x - ux * D, gz = b.z - uz * D, ax = gx - c.x, az = gz - c.z, al = Math.sqrt(ax * ax + az * az); if (al < .001) continue;
      const cos = (ax * ux + az * uz) / al; if (cos < .3) continue;
      if (!segClear(G, c.x, c.z, gx, gz, [c, b]) || !segClear(G, b.x, b.z, pk[0], pk[1], [c, b])) continue;
      const score = cos * cos / (1 + al * .6 + tl * .9);
      out.push({ b, pk, dx: ax, dz: az, score, power: Math.min(1, .22 + (al + tl / Math.max(.3, cos)) * .2) });
    }
    return out.sort((a, b) => b.score - a.score);
  }
  function ai(G, lvl, rnd) {
    rnd = rnd || Math.random; const p = G.turn, err = [.07, .03, .009][lvl] || .03;
    if (G.inHand || G.breakShot) {
      // gute Stelle für die Weiße suchen
      let best = null; const c = cue(G), ox = c.x, oz = c.z;
      if (G.breakShot) { place(G, -L / 4, (rnd() - .5) * .3); return { dx: 1, dz: (rnd() - .5) * .02, power: 1, spin: 0 }; }
      for (let k = 0; k < 40; k++) { const x = (rnd() - .5) * (L - .2), z = (rnd() - .5) * (B - .2); if (!place(G, x, z)) continue; const cs = candidates(G, p); if (cs.length && (!best || cs[0].score > best.s)) best = { x, z, s: cs[0].score }; }
      if (best) place(G, best.x, best.z); else if (!place(G, ox, oz)) respotCue(G);
    }
    const cs = candidates(G, p);
    let pick = cs[0];
    // Mittel/Profi: die besten Stöße kurz durchrechnen (keine Weiße hinterher, eigene Kugel fällt)
    if (lvl >= 1 && cs.length > 1) {
      let bs = -1e9;
      for (const c of cs.slice(0, lvl >= 2 ? 6 : 3)) {
        const T = JSON.parse(JSON.stringify(G)); T.ev = []; shoot(T, c.dx, c.dz, c.power, 0); let k = 0; while (T.phase === 'roll' && k++ < 3000) step(T, 1 / 120);
        const sc = (T.over ? (T.winner === p ? 50 : -50) : 0) + (T.ev.some(e => e.k === 'foul') ? -8 : 0) + (T.ev.some(e => e.k === 'again') ? 6 : 0) + c.score;
        if (sc > bs) { bs = sc; pick = c; }
      }
    }
    if (!pick) { // Sicherheitsstoß: nächste eigene Kugel direkt anspielen
      const g = G.groups[p], c = cue(G); const own = G.balls.filter(b => !b.in && b.n && (g ? group(b.n) === g || (b.n === 8 && !groupLeft(G, g)) : b.n !== 8)).sort((a, b) => ((a.x - c.x) ** 2 + (a.z - c.z) ** 2) - ((b.x - c.x) ** 2 + (b.z - c.z) ** 2));
      const t = own[0] || G.balls.find(b => !b.in && b.n); return { dx: t.x - c.x, dz: t.z - c.z, power: .45, spin: 0 };
    }
    const a = Math.atan2(pick.dz, pick.dx) + (rnd() - .5) * 2 * err;
    return { dx: Math.cos(a), dz: Math.sin(a), power: pick.power * (1 + (rnd() - .5) * err * 3), spin: lvl >= 2 ? -.2 : 0 };
  }

  const FB = { L, B, R, D, HX, HZ, POCKETS, VMAX, group, rack, newGame, shoot, step, place, aimInfo, ai, candidates, moving, cue, free, respotCue };
  if (typeof module !== 'undefined' && module.exports) module.exports = FB;
  root.FB = FB;
})(typeof window !== 'undefined' ? window : globalThis);
