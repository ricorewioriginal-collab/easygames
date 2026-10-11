'use strict';
/* Bunte Insel – Eigener Parcours: im Bau-Menü (Reiter 🏁) Start 🚩, Hindernisse (Lava 🌋, Hürde 🧱, Sprungpilz 🔼), Checkpoints ⛳ und Ziel 🏁 bauen.
   Dann auf den Start laufen: Zeit läuft, Lava = zurück zum Checkpoint, am Ziel gibt es die Zeit (Top 3 gespeichert) und ein paar Sterne. */
BI.createParcours = function (G) {
  const { P, A, fx, save, say } = G, K = { run: null }, CELL = 4;
  const hud = document.createElement('div'); hud.className = 'chip'; hud.hidden = true; hud.style.cssText = 'position:absolute;left:50%;top:max(66px,calc(env(safe-area-inset-top) + 56px));transform:translateX(-50%);z-index:6;font-weight:800;font-size:16px;pointer-events:none;padding:6px 14px;border-radius:16px'; (document.getElementById('hud') || document.body).appendChild(hud);
  const pos = it => ({ x: it.gx * CELL, z: it.gz * CELL }), mine = t => G.items().filter(i => !i.o && i.t === t);
  let cool = 0, hintT = 0, starT = -1e9;
  K.top = () => (save.own && save.own.top) || [];
  function place(c) { P.x = c.x; P.z = c.z; P.y = 0; P.vy = 0; G.char().group.position.set(P.x, 0, P.z); }
  function stop(msg) { if (!K.run) return; K.run = null; hud.hidden = true; cool = 3; if (msg) say(msg, 2400); }
  K.stop = stop;
  function finish() {
    const r = K.run, t = r.t, o = save.own || (save.own = { top: [], runs: 0 }); o.runs++; const prev = o.top[0] || 0, best = !prev || t < prev; o.top = o.top.concat([+t.toFixed(1)]).sort((a, b) => a - b).slice(0, 3); G.persist();
    const f = pos(r.fin), n = r.obst; A.fanfare && A.fanfare(); fx.burst(f.x, 2, f.z, 50, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.green], 9, 1.6, 28, 7);
    let msg = '🏁 Geschafft in ' + t.toFixed(1) + ' s!' + (best ? ' Neue Bestzeit!' : ''); const now = performance.now();
    if (n >= 3 && r.len >= 12 && now - starT > 120000) { starT = now; G.addStars(3 + (best ? 2 : 0)); msg += ' +' + (3 + (best ? 2 : 0)) + ' ⭐'; G.earn && G.earn('parcours'); }
    else if (n < 3 || r.len < 12) msg += ' · Mit 3 Hindernissen und etwas Länge gibt es auch Sterne!';
    msg += ' · Top: ' + o.top.map((v, i) => (i + 1) + '. ' + v.toFixed(1)).join('  '); stop(msg);
  }
  K.update = function (dt) {
    cool -= dt; hintT -= dt; const r = K.run;
    if (G.active()) { if (r) stop(''); return; }
    if (!r) {
      if (P.veh || P.y > 1 || cool > 0) return;
      for (const s of mine('obstart')) { const p = pos(s); if (Math.hypot(P.x - p.x, P.z - p.z) < 1.6) {
        const fins = mine('obfin'); if (!fins.length) { if (hintT <= 0) { hintT = 8; say('🚩 Setz noch ein Ziel 🏁 dazu (Bauen → Reiter 🏁)', 2600); } return; }
        let fin = fins[0], bd = 1e9; for (const f of fins) { const d = Math.hypot(pos(f).x - p.x, pos(f).z - p.z); if (d < bd) { bd = d; fin = f; } }
        K.run = { t: 0, cp: { x: p.x, z: p.z }, start: p, fin, len: bd, obst: mine('oblava').length + mine('obblock').length + mine('obpad').length, falls: 0 }; A.whoosh && A.whoosh(); fx.burst(p.x, 1, p.z, 14, [BI.C.green, BI.C.white], 4, 1, 28, 3); say('🚩 Los! Ab zum Ziel 🏁 – Lava 🌋 bringt dich zum Checkpoint zurück', 3000); return; } }
      return;
    }
    if (P.veh || Math.hypot(P.x - r.start.x, P.z - r.start.z) > 140) { stop('Parcours abgebrochen'); return; }
    r.t += dt; hud.hidden = false; hud.textContent = '⏱ ' + r.t.toFixed(1) + ' s · 🌋 ' + r.falls + (K.top()[0] ? ' · 🏅 ' + K.top()[0].toFixed(1) : '');
    for (const c of mine('obcp')) { const p = pos(c); if (Math.hypot(P.x - p.x, P.z - p.z) < 1.6 && P.y < 1 && (r.cp.x !== p.x || r.cp.z !== p.z)) { r.cp = p; A.ding && A.ding(); say('⛳ Checkpoint!', 1200); fx.burst(p.x, 1, p.z, 10, [BI.C.gold, BI.C.white], 3, .8, 26, 3); } }
    if (P.y < .45) for (const l of mine('oblava')) { const p = pos(l); if (Math.abs(P.x - p.x) < 1.75 && Math.abs(P.z - p.z) < 1.75) { r.falls++; A.bonk && A.bonk(); fx.burst(P.x, .5, P.z, 14, [BI.C.orange, BI.C.red, BI.C.gold], 5, .8, 28, 5); place(r.cp); say('🌋 Heiß! Zurück zum Checkpoint', 1500); break; } }
    const f = pos(r.fin); if (Math.hypot(P.x - f.x, P.z - f.z) < 1.9 && P.y < 1.2) finish();
  };
  return K;
};
