'use strict';
/* Bunte Insel – „Mehr Spaß“-Menü: 📅 Tagesaufgaben (3 pro Tag, Serie), 🥚 Haustier-Eier (sammeln, anlegen, Stern-Bonus), 🍭 Bonbon-Fabrik (Maschinen kaufen, Bonbons → Sterne).
   Alles ohne Server, nur ein Fenster + ein kleiner Begleiter-Sprite → sehr sparsam. */
BI.createMeta = function (G) {
  const { scene, P, A, fx, save, say } = G, X = { open: false, tab: 0 }, $ = id => document.getElementById(id), TAU = Math.PI * 2;
  const stars = n => { G.addStars(n); };
  /* ---------- 📅 Tagesaufgaben ---------- */
  const QT = [{ k: 'star', icon: '⭐', t: 'Sterne einsammeln', n: [10, 15, 20] }, { k: 'talk', icon: '💬', t: 'Mit Leuten reden', n: [3, 5, 7] }, { k: 'ride', icon: '🚗', t: 'In Fahrzeuge steigen', n: [2, 3, 4] }, { k: 'tree', icon: '🌳', t: 'Bäume hauen', n: [4, 6, 8] }, { k: 'play', icon: '🛝', t: 'Spielgeräte benutzen', n: [2, 3, 4] }, { k: 'obby', icon: '🏁', t: 'Himmels-Parcours schaffen', n: [1, 1, 1] }, { k: 'emote', icon: '🎭', t: 'Emotes zeigen', n: [2, 3, 5] }, { k: 'parcours', icon: '🧗', t: 'Eigenen Parcours schaffen', n: [1, 1, 1] }];
  const dayKey = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  function seedRand(s) { let a = 0; for (const c of s) a = (a * 31 + c.charCodeAt(0)) >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
  function ensureDay() {
    const now = new Date(), key = dayKey(now), D = save.dq; if (D && D.d === key) return D;
    const r = seedRand(key), pool = QT.slice(), q = []; for (let i = 0; i < 3; i++) { const t = pool.splice((r() * pool.length) | 0, 1)[0], lv = (r() * 3) | 0; q.push({ k: t.k, need: t.n[lv], have: 0, done: false }); }
    const streak = D && D.d === dayKey(new Date(now - 864e5)) && D.all ? (D.streak || 0) : 0; save.dq = { d: key, q, streak, all: false }; G.persist(); return save.dq;
  }
  X.note = function (k, n) {
    const D = ensureDay(); let hit = false; for (const q of D.q) if (!q.done && q.k === k) { q.have = Math.min(q.need, q.have + (n || 1)); hit = true; if (q.have >= q.need) { q.done = true; const t = QT.find(z => z.k === k); stars(3); A.fanfare && A.fanfare(); say('📅 Tagesaufgabe geschafft: ' + t.icon + ' ' + t.t + '! +3 ⭐', 2800); }
      if (D.q.every(z => z.done) && !D.all) { D.all = true; D.streak = (D.streak || 0) + 1; const b = 5 + Math.min(5, D.streak); stars(b); say('🏆 Alle 3 Tagesaufgaben! +' + b + ' ⭐ · Serie: ' + D.streak + ' Tag(e) 🔥', 3600); } }
    if (hit) { G.persist(); if (X.open && X.tab === 0) render(); }
  };
  /* ---------- 🥚 Haustiere ---------- */
  X.PETS = [['cat', '🐱', 'Katze', 0], ['dog', '🐶', 'Hund', 0], ['rabbit', '🐰', 'Hase', 0], ['hamster', '🐹', 'Hamster', 0], ['chick', '🐥', 'Küken', 0], ['fox', '🦊', 'Fuchs', 1], ['panda', '🐼', 'Panda', 1], ['frog', '🐸', 'Frosch', 1], ['koala', '🐨', 'Koala', 1], ['unicorn', '🦄', 'Einhorn', 2], ['penguin', '🐧', 'Pinguin', 2], ['owl', '🦉', 'Eule', 2], ['dragon', '🐲', 'Drache', 3], ['trex', '🦖', 'Dino', 3]];
  const RAR = [{ n: 'Gewöhnlich', col: '#8a94a6', b: .1 }, { n: 'Selten', col: '#3f9bff', b: .2 }, { n: 'Episch', col: '#b36bff', b: .35 }, { n: 'Legendär', col: '#ffb300', b: .55 }];
  const EGGS = [{ icon: '🥚', name: 'Ei', price: 30, w: [60, 30, 9, 1] }, { icon: '🪺', name: 'Goldenes Ei', price: 100, w: [20, 45, 28, 7] }];
  const pets = () => save.pets || (save.pets = { own: {}, eq: '' });
  const petOf = id => X.PETS.find(p => p[0] === id);
  X.starBonus = function () { const e = petOf(pets().eq); if (!e || P.veh) return 0; return Math.random() < RAR[e[3]].b ? 1 : 0; };
  function hatch(egg) {
    const E = EGGS[egg]; if (save.stars < E.price) { say('Dafür brauchst du noch ' + (E.price - save.stars) + ' ⭐', 1800); return; }
    save.stars -= E.price; $('starN').textContent = save.stars; A.buy && A.buy();
    let r = Math.random() * 100, rar = 0; for (let i = 0; i < 4; i++) { if (r < E.w[i]) { rar = i; break; } r -= E.w[i]; }
    const list = X.PETS.filter(p => p[3] === rar), p = list[(Math.random() * list.length) | 0], O = pets().own, dup = !!O[p[0]]; O[p[0]] = (O[p[0]] || 0) + 1; if (!pets().eq) pets().eq = p[0];
    X.hatching = { egg, p, rar, dup, t: 0 }; G.persist(); render(); A.whoosh && A.whoosh();
    setTimeout(() => { X.hatching = null; A.fanfare && A.fanfare(); if (dup) { stars(5); say('Doppelt! ' + p[1] + ' ' + p[2] + ' – du bekommst 5 ⭐ zurück', 2600); } else say('🎉 Neues Haustier: ' + p[1] + ' ' + p[2] + ' (' + RAR[rar].n + ')!', 3200); G.earn && G.earn('pet'); G.persist(); if (X.open) render(); }, 1600);
  }
  /* Begleiter: ein Emoji-Sprite, hüpft neben der Figur */
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false })); sp.scale.set(1.1, 1.1, 1); sp.visible = false; scene.add(sp); let spId = '';
  const texCache = {};
  function tex(e) { if (!texCache[e]) { const cv = document.createElement('canvas'); cv.width = cv.height = 96; const c = cv.getContext('2d'); c.font = '70px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 48, 54); texCache[e] = new THREE.CanvasTexture(cv); } return texCache[e]; }
  let px = 0, pz = 0, py = 0;
  /* ---------- 🍭 Bonbon-Fabrik ---------- */
  const MACH = [{ k: 'cotton', icon: '🍥', name: 'Zuckerwatte', base: 15, r: .1 }, { k: 'lolli', icon: '🍭', name: 'Lutscher', base: 40, r: .3 }, { k: 'choc', icon: '🍫', name: 'Schoko', base: 100, r: .8 }, { k: 'ice', icon: '🍦', name: 'Eis', base: 250, r: 2 }];
  const fac = () => save.fac || (save.fac = { candy: 0, lv: {}, cap: 0 });
  const cap = () => 100 * (1 + fac().cap), rate = () => MACH.reduce((s, m) => s + m.r * (fac().lv[m.k] || 0), 0), cost = (m, l) => Math.round(m.base * Math.pow(1.6, l));
  X.update = function (dt, t) {
    const F = fac(), r = rate(); if (r > 0 && F.candy < cap()) { F.candy = Math.min(cap(), F.candy + r * dt); if (X.open && X.tab === 2) { X.fT = (X.fT || 0) - dt; if (X.fT <= 0) { X.fT = .5; live(); } } }
    const e = petOf(pets().eq), show = !!e && !P.veh; if (sp.visible !== show) sp.visible = show; if (!show) return;
    if (spId !== e[0]) { spId = e[0]; sp.material.map = tex(e[1]); sp.material.needsUpdate = true; }
    const tx = P.x - Math.sin(P.h) * 1.0 + Math.cos(P.h) * 1.1, tz = P.z - Math.cos(P.h) * 1.0 - Math.sin(P.h) * 1.1; px += (tx - px) * Math.min(1, dt * 4); pz += (tz - pz) * Math.min(1, dt * 4); if (Math.hypot(px - P.x, pz - P.z) > 8) { px = tx; pz = tz; }
    py += ((P.y + .9) - py) * Math.min(1, dt * 6); sp.position.set(px, py + Math.abs(Math.sin(t * (P.speed > .3 ? 7 : 2))) * (P.speed > .3 ? .3 : .08), pz);
  };
  /* ---------- Fenster ---------- */
  const el = document.createElement('div'); el.id = 'metaPanel'; el.hidden = true;
  el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:12;max-height:75vh;overflow:auto;padding:10px 10px max(12px,env(safe-area-inset-bottom));background:var(--glass);backdrop-filter:blur(8px);border-radius:24px 24px 0 0;box-shadow:0 -8px 24px rgba(20,50,100,.3);display:flex;flex-direction:column;gap:8px;align-items:center';
  el.innerHTML = '<div id="metaTabs" style="display:flex;gap:6px"></div><div id="metaBody" style="width:100%;max-width:560px"></div><button class="pill" id="metaClose">✔ Fertig</button>';
  document.body.appendChild(el);
  const css = document.createElement('style'); css.textContent = '#metaTabs button{padding:8px 12px;border-radius:16px;background:#fff;box-shadow:var(--shadow);font-weight:800}#metaTabs button.sel{background:#ffd23f}.mrow{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:16px;background:#fff;box-shadow:var(--shadow);margin:6px 0}.mrow b{font-size:28px}.mrow .tx{flex:1;font-weight:700;font-size:14px}.mrow small{display:block;opacity:.7;font-weight:600}.mrow button,.mbtn{padding:7px 12px;border-radius:14px;font-weight:800;background:#4cd07d;color:#fff}.mrow button.no,.mbtn.no{background:#c8ced8}.mbar{height:8px;border-radius:5px;background:#e2e8f2;overflow:hidden;margin-top:4px}.mbar i{display:block;height:100%;background:linear-gradient(90deg,#4cd07d,#ffd23f)}.mpets{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:6px}.mpet{padding:6px;border-radius:14px;background:#fff;box-shadow:var(--shadow);text-align:center;font-size:11px;font-weight:700}.mpet b{display:block;font-size:30px}.mpet.eq{outline:3px solid #ffd23f}@keyframes mwob{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}.megg{font-size:64px;display:inline-block;animation:mwob .3s infinite}';
  document.head.appendChild(css);
  const TABS = ['📅 Aufgaben', '🥚 Haustiere', '🍭 Fabrik'];
  function live() { const F = fac(), c = $('facCand'); if (c) { c.textContent = Math.floor(F.candy) + ' / ' + cap() + ' 🍬 · +' + rate().toFixed(1) + '/s'; $('facBar').style.width = Math.round(F.candy / cap() * 100) + '%'; } }
  function render() {
    const tb = $('metaTabs'); tb.innerHTML = ''; TABS.forEach((n, i) => { const b = document.createElement('button'); b.textContent = n; if (i === X.tab) b.className = 'sel'; b.onclick = () => { X.tab = i; render(); }; tb.appendChild(b); });
    const body = $('metaBody'); body.innerHTML = '';
    if (X.tab === 0) {
      const D = ensureDay(); body.insertAdjacentHTML('beforeend', '<div style="text-align:center;font-weight:800;margin-bottom:4px">Heute · 🔥 Serie: ' + (D.streak || 0) + (D.all ? ' ✔' : '') + '</div>');
      for (const q of D.q) { const t = QT.find(z => z.k === q.k); body.insertAdjacentHTML('beforeend', '<div class="mrow"><b>' + t.icon + '</b><div class="tx">' + t.t + '<small>' + q.have + ' / ' + q.need + (q.done ? ' ✔ +3 ⭐' : '') + '</small><div class="mbar"><i style="width:' + Math.round(q.have / q.need * 100) + '%"></i></div></div></div>'); }
      body.insertAdjacentHTML('beforeend', '<div style="text-align:center;font-size:12px;opacity:.75">Alle 3 geschafft = Extra-Sterne – und die Serie wächst jeden Tag 🔥</div>');
    } else if (X.tab === 1) {
      const H = X.hatching; if (H) body.insertAdjacentHTML('beforeend', '<div style="text-align:center;padding:14px"><span class="megg">' + EGGS[H.egg].icon + '</span><div style="font-weight:800">Es schlüpft …</div></div>');
      else for (let i = 0; i < EGGS.length; i++) { const E = EGGS[i], r = document.createElement('div'); r.className = 'mrow'; r.innerHTML = '<b>' + E.icon + '</b><div class="tx">' + E.name + '<small>' + (i ? 'Mehr Seltene & Legendäre' : 'Meist gewöhnliche Tiere') + '</small></div>'; const b = document.createElement('button'); b.textContent = E.price + ' ⭐'; if (save.stars < E.price) b.className = 'no'; b.onclick = () => hatch(i); r.appendChild(b); body.appendChild(r); }
      const O = pets().own, g = document.createElement('div'); g.className = 'mpets'; let have = 0;
      for (const p of X.PETS) { const n = O[p[0]] || 0; if (n) have++; const d = document.createElement('div'); d.className = 'mpet' + (pets().eq === p[0] ? ' eq' : ''); d.innerHTML = '<b>' + (n ? p[1] : '❔') + '</b>' + (n ? p[2] + (n > 1 ? ' ×' + n : '') : '?') + '<br><span style="color:' + RAR[p[3]].col + '">' + RAR[p[3]].n + (n ? ' · +' + Math.round(RAR[p[3]].b * 100) + '%⭐' : '') + '</span>'; if (n) d.onclick = () => { pets().eq = pets().eq === p[0] ? '' : p[0]; G.persist(); A.pop && A.pop(); render(); }; g.appendChild(d); }
      body.insertAdjacentHTML('beforeend', '<div style="text-align:center;font-weight:800;margin:6px 0">Sammlung ' + have + ' / ' + X.PETS.length + ' · Tippe ein Tier an, damit es mitkommt (Bonus-Sterne beim Sammeln)</div>'); body.appendChild(g);
    } else {
      const F = fac(); body.insertAdjacentHTML('beforeend', '<div class="mrow"><b>🍬</b><div class="tx"><span id="facCand"></span><div class="mbar"><i id="facBar" style="width:0"></i></div></div></div>');
      const sell = document.createElement('button'); sell.className = 'mbtn' + (F.candy < 25 ? ' no' : ''); sell.style.cssText = 'display:block;margin:4px auto'; sell.textContent = '💰 Verkaufen: ' + Math.floor(F.candy / 25) + ' ⭐ (25 🍬 = 1 ⭐)'; sell.onclick = () => { const n = Math.floor(F.candy / 25); if (!n) return; F.candy -= n * 25; stars(n); A.coins && A.coins(); G.persist(); render(); }; body.appendChild(sell);
      for (const m of MACH) { const l = F.lv[m.k] || 0, c = cost(m, l), r = document.createElement('div'); r.className = 'mrow'; r.innerHTML = '<b>' + m.icon + '</b><div class="tx">' + m.name + ' · Stufe ' + l + '<small>+' + m.r + ' 🍬/s pro Stufe</small></div>'; const b = document.createElement('button'); if (l >= 8) { b.textContent = 'Max'; b.className = 'no'; } else { b.textContent = (l ? 'Ausbauen ' : 'Kaufen ') + c + ' ⭐'; if (save.stars < c) b.className = 'no'; b.onclick = () => { if (save.stars < c) { say('Dafür brauchst du noch ' + (c - save.stars) + ' ⭐', 1800); return; } save.stars -= c; $('starN').textContent = save.stars; F.lv[m.k] = l + 1; A.buy && A.buy(); G.earn && G.earn('factory'); G.persist(); render(); }; } r.appendChild(b); body.appendChild(r); }
      const cc = 30 * Math.pow(2, F.cap), r2 = document.createElement('div'); r2.className = 'mrow'; r2.innerHTML = '<b>📦</b><div class="tx">Lager · Platz für ' + cap() + ' 🍬<small>Mehr Platz = mehr sammeln</small></div>'; const b2 = document.createElement('button'); if (F.cap >= 6) { b2.textContent = 'Max'; b2.className = 'no'; } else { b2.textContent = 'Erweitern ' + cc + ' ⭐'; if (save.stars < cc) b2.className = 'no'; b2.onclick = () => { if (save.stars < cc) { say('Dafür brauchst du noch ' + (cc - save.stars) + ' ⭐', 1800); return; } save.stars -= cc; $('starN').textContent = save.stars; F.cap++; A.buy && A.buy(); G.persist(); render(); }; } r2.appendChild(b2); body.appendChild(r2);
      live();
    }
  }
  X.show = function (tab) { if (X.open) return; X.open = true; if (tab != null) X.tab = tab; render(); el.hidden = false; G.setStick && G.setStick(0, 0); };
  X.close = function () { X.open = false; el.hidden = true; };
  $('metaClose').onclick = () => X.close(); el.addEventListener('pointerdown', ev => ev.stopPropagation());
  X.quests = () => ensureDay();
  return X;
};
