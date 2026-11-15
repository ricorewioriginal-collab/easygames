'use strict';
/* Bunte Insel – Einstieg für Kinder und Wochen-Ereignis.
   ⬇️ Pfeil: Im ersten Kapitel der Inselreise schwebt ein Pfeil über der nächsten Person, bis man mit jemandem gesprochen hat.
   🎉 Knöpfe nach und nach: Ganz neue Spieler sehen zuerst nur das Nötigste; der Spaß-Knopf kommt nach Kapitel 1 mit „Neu!“-Glitzer dazu.
   🗓️ Wochen-Ereignis: Jede Woche ein anderes Thema (Piraten, Schnee, Tiere …) mit Tipp und Wochen-Ziel (25 ⭐ sammeln → +10 ⭐, Sticker „woche“).
   Spielstand: save.ein = { fun }, save.week = { k, n, done, seen } (nur Felder ergänzt). Test: tests/einstieg.mjs */
BI.WOCHEN = [
  { i: '🏴‍☠️', n: 'Piratenwoche', ne: 'Pirate week', tip: 'Such Schätze mit der Schatzkarte (🎉 → Spiele → Schatzsuche)!', tipe: 'Hunt for treasure with the treasure map (🎉 → Games → Treasure hunt)!' },
  { i: '❄️', n: 'Schneewoche', ne: 'Snow week', tip: 'Es schneit auf der Insel – bau etwas Schönes und sammle Sterne!', tipe: 'It is snowing on the island – build something nice and collect stars!', wx: 'snow' },
  { i: '🐾', n: 'Tierwoche', ne: 'Animal week', tip: 'Streichle Tiere auf dem Hof und hilf in der Fellretter-Bucht!', tipe: 'Pet the animals on the farm and help at the pet rescue bay!' },
  { i: '🎈', n: 'Partywoche', ne: 'Party week', tip: 'Tanz, feier und spiel Mini-Spiele – am besten mit Freunden!', tipe: 'Dance, party and play mini games – best with friends!' },
  { i: '🌈', n: 'Regenbogenwoche', ne: 'Rainbow week', tip: 'Nach dem Regen kommt der Regenbogen – such ihn für Bonus-Sterne!', tipe: 'After the rain comes the rainbow – find it for bonus stars!', wx: 'rain' },
  { i: '🎣', n: 'Anglerwoche', ne: 'Fishing week', tip: 'Angle, sammle und füll dein Sammelbuch!', tipe: 'Fish, collect and fill your collection book!' }
];
BI.WOCHEN_ZIEL = 25;
BI.createEinstieg = function (G) {
  const { save, persist, say } = G, K = {}, $ = id => document.getElementById(id), EN = () => !!(window.BunteInselI18n && BunteInselI18n.language === 'en');
  const E = () => save.ein || (save.ein = {});
  /* Wochen seit 1970, Wechsel jeweils montags (1.1.1970 war ein Donnerstag) */
  const weekNo = () => Math.floor((Date.now() / 864e5 + 3) / 7);
  K.theme = () => BI.WOCHEN[weekNo() % BI.WOCHEN.length];
  const W = () => { const k = weekNo(); if (!save.week || save.week.k !== k) save.week = { k, n: 0, done: 0, seen: 0 }; return save.week; };
  if (!document.getElementById('biEinCss')) { const st = document.createElement('style'); st.id = 'biEinCss';
    st.textContent = 'body.biNew #bFun{display:none!important}@keyframes biGlow{0%,100%{box-shadow:0 0 0 0 #ffd23f00}50%{box-shadow:0 0 0 6px #ffd23fcc}}.biGlow{animation:biGlow 1.1s ease-in-out infinite;position:relative}'
      + '.biGlow::after{content:"Neu!";position:absolute;top:-8px;right:-10px;background:#ff3d7f;color:#fff;font:800 10px system-ui;padding:2px 5px;border-radius:8px;pointer-events:none}';
    document.head.appendChild(st); }

  /* ===== 🎉 Knöpfe nach und nach ===== */
  const newbie = () => !E().fun && G.story && G.story.index && G.story.index() === 0;
  if (!newbie()) E().fun = 1;
  K.unlockFun = function (quiet) {
    if (E().fun) return false; E().fun = 1; persist(); document.body.classList.remove('biNew'); const b = $('bFun');
    if (b && !quiet) { b.classList.add('biGlow'); b.addEventListener('click', () => b.classList.remove('biGlow'), { once: true }); say(EN() ? '🎉 New: the fun button! Dancing, games, photos and much more.' : '🎉 Neu: der Spaß-Knopf! Tanzen, Spiele, Fotos und vieles mehr.', 4200); }
    return true;
  };

  /* ===== ⬇️ Pfeil zur ersten Person ===== */
  let arrow = null, bob = 0;
  function makeArrow() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.beginPath(); x.moveTo(40, 10); x.lineTo(88, 10); x.lineTo(88, 62); x.lineTo(114, 62); x.lineTo(64, 118); x.lineTo(14, 62); x.lineTo(40, 62); x.closePath(); /* eigener gelber Pfeil – sieht auf jedem Gerät gleich aus */
    x.lineJoin = 'round'; x.lineWidth = 9; x.strokeStyle = '#7a3d00'; x.stroke(); x.fillStyle = '#ffd23f'; x.fill();
    const t = new THREE.CanvasTexture(c), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
    s.scale.set(1.8, 1.8, 1.8); s.renderOrder = 999; s.visible = false; G.scene.add(s); return s;
  }
  const talked = () => (save.talked || []).length > 0 || !!(save.story && save.story.ev && save.story.ev.talk);
  K.arrowOn = () => !!(arrow && arrow.visible);
  function updateArrow(dt, playing) {
    const want = playing && G.story && G.story.index && G.story.index() === 0 && !talked() && !(G.story.introPending && G.story.introPending()) && !(G.dlg() && G.dlg().open) && !G.P.veh;
    if (!want) { if (arrow) arrow.visible = false; return; }
    const F = (G.folk && G.folk()) || []; let best = null, bd = 60;
    for (const n of F) { const g = n.c && n.c.group; if (!g || !g.visible) continue; const d = Math.hypot(g.position.x - G.P.x, g.position.z - G.P.z); if (d < bd) { bd = d; best = g; } }
    if (!best) { if (arrow) arrow.visible = false; return; }
    if (!arrow) arrow = makeArrow(); bob += dt * 4; arrow.visible = true; arrow.position.set(best.position.x, best.position.y + 3 + Math.sin(bob) * .25, best.position.z);
  }

  /* ===== 🗓️ Wochen-Ereignis ===== */
  K.weekLine = en => { const T = K.theme(), w = W(); return '🗓️ ' + T.i + ' ' + (en ? T.ne : T.n) + (w.done ? (en ? ' · 🏆 done!' : ' · 🏆 geschafft!') : ' · ' + Math.min(w.n, BI.WOCHEN_ZIEL) + '/' + BI.WOCHEN_ZIEL + ' ⭐'); };
  let busy = false;
  K.stars = function (n) {
    if (busy) return; const w = W(); if (w.done) return; w.n += n;
    if (w.n >= BI.WOCHEN_ZIEL) { w.done = 1; const T = K.theme(); busy = true; try { G.addStars(10); } finally { busy = false; } persist();
      setTimeout(() => { say(EN() ? '🏆 ' + T.i + ' ' + T.ne + ' done! ' + BI.WOCHEN_ZIEL + ' ⭐ collected – weekly trophy +10 ⭐' : '🏆 ' + T.i + ' ' + T.n + ' geschafft! ' + BI.WOCHEN_ZIEL + ' ⭐ gesammelt – Wochen-Pokal +10 ⭐', 5200); if (G.earn) G.earn('woche'); }, 1600); }
  };
  let weekT = 0, weekDone = false;
  function updateWeek(dt, playing) {
    if (weekDone || !playing) return; if (G.dlg() && G.dlg().open) return; if (G.story && G.story.introPending && G.story.introPending()) return;
    weekT += dt; if (weekT < 12) return; weekDone = true; const T = K.theme(), w = W();
    if (T.wx) { try { const wx = G.weather && G.weather(); if (wx && wx.set) wx.set(T.wx); } catch (e) { } }
    if (!w.seen) { w.seen = 1; persist(); const t = EN() ? 'This week: ' + T.i + ' ' + T.ne + '! ' + T.tipe + ' Collect ' + BI.WOCHEN_ZIEL + ' ⭐ for the weekly trophy.' : 'Diese Woche: ' + T.i + ' ' + T.n + '! ' + T.tip + ' Sammle ' + BI.WOCHEN_ZIEL + ' ⭐ für den Wochen-Pokal.'; say('🗓️ ' + t, 7000); }
  }

  let started = false;
  K.update = function (dt, playing) {
    if (playing && !started) { started = true; if (!E().fun) document.body.classList.add('biNew'); }
    if (!E().fun && G.story && G.story.index && G.story.index() >= 1) K.unlockFun(!playing);
    updateArrow(dt, playing); updateWeek(dt, playing);
  };
  K.dbg = { W, weekNo, E };
  return K;
};
