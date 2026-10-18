'use strict';
/* Bunte Insel – Ausrüstung 🎒⚔️: Waffen, Schilde, Amulett und Tränke für die Kämpfe auf der Wald-Insel (klein auf der Hauptinsel, groß auf der Wald-Insel).
   Kaufen mit Sternen bei Händlern (Waldhändlerin Fenja, Rurik „Wanderhand“ in Lunaris, Kampfmeister Kai), anlegen im selben Fenster.
   Kindgerecht: keine echten Waffen-Details, alles bunt und ohne Blut. Spielstand: save.gear = { own, w, sh, amu } (nur ergänzt). */
BI.GEAR = {
  weapons: [
    { id: 'faust', icon: '👊', name: 'Fäuste', price: 0, txt: 'Immer dabei.', mul: 1 },
    { id: 'stock', icon: '🪵', name: 'Waldstock', price: 5, txt: 'Etwas stärker und länger als die Faust.', mul: 1.3, reach: .4 },
    { id: 'schwert', icon: '⚔️', name: 'Abenteuer-Schwert', price: 15, txt: 'Starke Hiebe, gute Reichweite.', mul: 1.65, reach: .7 },
    { id: 'bogen', icon: '🏹', name: 'Sternenbogen', price: 25, txt: 'Schießt Sternpfeile auf weit entfernte Monster.', mul: 1.2, shot: 14 },
    { id: 'hammer', icon: '🔨', name: 'Donnerhammer', price: 30, txt: 'Langsam, aber sehr stark. Der Tritt wird zur Schockwelle!', mul: 2.2, reach: .5, cd: 1.45, slam: true },
    { id: 'stab', icon: '🪄', name: 'Funkelstab', price: 40, txt: 'Zauber-Spezial: kostet weniger Energie und trifft weiter.', mul: 1.45, reach: .3, sp: .5 }
  ],
  shields: [
    { id: 'holzschild', icon: '🛡️', name: 'Holzschild', price: 10, txt: 'Monster treffen dich weniger hart (−25 %).', def: .75 },
    { id: 'kristallschild', icon: '💠', name: 'Kristallschild', price: 35, txt: 'Noch besserer Schutz (−45 %).', def: .55 }
  ],
  extras: [{ id: 'herzamulett', icon: '📿', name: 'Herz-Amulett', price: 20, txt: '+30 Herzen im Kampf.', hp: 30 }],
  potions: [['potion_hp', '❤️', 'Heiltrank', 3, '+50 Herzen (Knopf ❤️ im Kampf)'], ['potion_ep', '⚡', 'Energietrank', 3, '+30 Energie (Knopf ⚡ im Kampf)']]
};
BI.createGear = function (G) {
  const { save, persist, say, A, fx, P } = G, D = BI.GEAR, K = { open: false }, all = [].concat(D.weapons, D.shields, D.extras);
  const S = () => { const s = save.gear || (save.gear = {}); if (!Array.isArray(s.own)) s.own = ['faust']; if (!s.own.includes('faust')) s.own.push('faust'); s.w = s.w || 'faust'; s.sh = s.sh || ''; s.amu |= 0; return s; };
  const byId = id => all.find(q => q.id === id);
  K.weapon = () => D.weapons.find(q => q.id === S().w) || D.weapons[0];
  K.shield = () => D.shields.find(q => q.id === S().sh) || null;
  K.dmgMul = () => K.weapon().mul || 1; K.reach = () => K.weapon().reach || 0; K.cdMul = () => K.weapon().cd || 1; K.shot = () => K.weapon().shot || 0; K.slam = () => !!K.weapon().slam; K.spMul = () => K.weapon().sp || 1;
  K.defMul = () => { const s = K.shield(); return s ? s.def : 1; }; K.hpBonus = () => S().amu ? 30 : 0;
  K.owns = id => S().own.includes(id) || (id === 'herzamulett' && !!S().amu);
  /* ---------- Waffe und Schild in der Hand (nur in Kampfgebieten) ---------- */
  const mat = BI.mat(), MESH = {
    stock: b => { b.box(0, 0, .5, .12, .12, 1.1, 0x8a5a2a); b.sph(0, 0, 1.05, .12, 0x6a4a2a, 0); },
    schwert: b => { b.box(0, 0, .65, .08, .14, 1.15, 0xdfe6f2); b.box(0, 0, 0, .4, .08, .1, 0xffd23f); b.sph(0, 0, -.14, .09, 0xe0382b, 1); },
    bogen: b => { for (let k = 0; k <= 6; k++) b.box(0, Math.sin(k / 6 * Math.PI) * .2, .2 + k * .13, .08, .08, .15, 0xb07a3a); b.box(0, 0, .59, .02, .02, .8, 0xffffff); b.sph(0, .2, .59, .07, 0xffd23f, 0); },
    hammer: b => { b.box(0, 0, .45, .09, .09, .9, 0x7a4a2a); b.box(0, 0, 1.0, .5, .32, .32, 0x8a96a8); b.box(0, 0, 1.0, .54, .1, .36, 0xffd23f); },
    stab: b => { b.box(0, 0, .5, .07, .07, 1.05, 0x6a3a8a); b.sph(0, 0, 1.08, .17, 0xff8fc8, 1); b.sph(0, 0, 1.08, .09, 0xffffff, 0); }
  };
  const SHIELD = { holzschild: [0xa86a3a, 0xffd23f], kristallschild: [0x6ac8ff, 0xffffff] };
  let at = null, wG = null, sG = null, wId = '', sId = '';
  function attach(on) {
    const ch = G.char && G.char(); if (!ch || !ch.armR) return; if (at !== ch) { at = ch; wG = sG = null; wId = sId = ''; }
    const w = S().w, s = S().sh;
    if (wId !== w) { if (wG) wG.parent && wG.parent.remove(wG); wG = null; wId = w; if (MESH[w]) { const b = new BI.Batch(); MESH[w](b); wG = new THREE.Group(); wG.add(b.mesh(mat)); wG.position.set(.1, -.78, .06); wG.rotation.set(-Math.PI / 2 + .3, 0, 0); ch.armR.add(wG); } }
    if (sId !== s) { if (sG) sG.parent && sG.parent.remove(sG); sG = null; sId = s; const c = SHIELD[s]; if (c && ch.armL) { const b = new BI.Batch(); b.cyl(0, 0, 0, .42, .42, .08, c[0], 14, Math.PI / 2); b.cyl(0, 0, .05, .16, .16, .06, c[1], 10, Math.PI / 2); sG = new THREE.Group(); sG.add(b.mesh(mat)); sG.position.set(-.16, -.55, .05); sG.rotation.y = -Math.PI / 2; ch.armL.add(sG); } }
    if (wG) wG.visible = on; if (sG) sG.visible = on;
  }
  K.update = function () { const on = !!(G.fightZone && G.fightZone()) && !P.veh; attach(on); };
  K.handBusy = () => S().w !== 'faust' && !!(G.fightZone && G.fightZone()); /* dann zeigt die Rätsel-Insel ihr Schwert nicht zusätzlich */
  /* ---------- Laden + Anlegen ---------- */
  let panel = null;
  const el = (t, css, txt) => { const e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
  function buy(q, kind) {
    const s = S(); if ((save.stars | 0) < q.price) { say('⭐ Dafür fehlen dir noch ' + (q.price - (save.stars | 0)) + ' Sterne.', 2400); A.bonk && A.bonk(); return; }
    G.addStars(-q.price); if (kind === 'x') s.amu = 1; else s.own.push(q.id); if (kind === 'w') s.w = q.id; if (kind === 's') s.sh = q.id; persist(); A.fanfare && A.fanfare(); fx && fx.burst(P.x, 2, P.z, 22, [BI.C.gold, BI.C.white, BI.C.pink], 4, 1, 26, 4);
    say(q.icon + ' ' + q.name + ' gehört jetzt dir' + (kind === 'x' ? '!' : ' – und ist angelegt!'), 3000); if (G.earn) G.earn('ausruestung');
  }
  function closeBtn() { const c = el('button', 'margin-top:10px;border:0;border-radius:14px;padding:10px 22px;font:inherit;font-weight:900;color:#fff;background:#4cae5a', '✔ Fertig'); c.type = 'button'; c.onclick = () => K.close(); return c; }
  function draw() {
    if (!panel) return; const s = S(), card = panel.firstChild; card.innerHTML = '';
    card.appendChild(el('div', 'font-size:24px;font-weight:900;color:#5a3a1a', '🎒 Ausrüstung')); card.appendChild(el('div', 'font-weight:700;color:#6a4a2a;margin:2px 0 6px', '⭐ ' + (save.stars | 0) + (K.seller ? ' · ' + K.seller : '')));
    const list = el('div', 'overflow:auto;max-height:min(62vh,520px);text-align:left;padding-right:2px'); card.appendChild(list);
    const head = t => list.appendChild(el('div', 'font-weight:900;color:#8a4a1a;margin:8px 4px 2px', t));
    const row = (icon, name, txt, btn) => { const r = el('div', 'display:flex;align-items:center;gap:8px;margin:5px 0;background:#fff;border:3px solid #f0d8a8;border-radius:14px;padding:6px 8px'); r.appendChild(el('div', 'font-size:30px;flex:none', icon)); const m = el('div', 'flex:1;min-width:0'); m.appendChild(el('div', 'font-weight:900;color:#4a2a1a', name)); m.appendChild(el('div', 'font-size:12px;color:#7a5a3a;line-height:1.2', txt)); r.appendChild(m); r.appendChild(btn); list.appendChild(r); return r; };
    const btn = (t, col, fn) => { const b = el('button', 'flex:none;border:0;border-radius:12px;padding:8px 10px;font:inherit;font-weight:900;color:#fff;background:' + col + ';min-width:84px', t); b.type = 'button'; b.onclick = () => { A.pop && A.pop(); fn(); draw(); }; return b; };
    const done = t => el('div', 'flex:none;font-weight:900;color:#2a9a4a;min-width:84px;text-align:center', t);
    /* ohne Händler (Knopf 🎒 im Kampf): nur anlegen – kaufen geht bei Fenja, Rurik oder Kai */
    const shop = (q, k) => K.seller ? btn(q.price + ' ⭐ kaufen', '#e0902a', () => buy(q, k)) : el('div', 'flex:none;font-size:12px;font-weight:700;color:#9a7a5a;min-width:84px;text-align:center', '🛒 bei Fenja');
    head('⚔️ Waffen');
    for (const q of D.weapons) row(q.icon, q.name, q.txt, s.w === q.id ? done('✔ in der Hand') : K.owns(q.id) ? btn('Anlegen', '#3f8cff', () => { s.w = q.id; persist(); say(q.icon + ' ' + q.name + ' angelegt!', 1600); }) : shop(q, 'w'));
    head('🛡️ Schutz');
    for (const q of D.shields) row(q.icon, q.name, q.txt, s.sh === q.id ? btn('Ablegen', '#8a96a8', () => { s.sh = ''; persist(); }) : K.owns(q.id) ? btn('Anlegen', '#3f8cff', () => { s.sh = q.id; persist(); say(q.icon + ' ' + q.name + ' angelegt!', 1600); }) : shop(q, 's'));
    for (const q of D.extras) row(q.icon, q.name, q.txt, s.amu ? done('✔ trägst du') : shop(q, 'x'));
    if (!K.seller) { card.appendChild(el('div', 'font-size:13px;color:#7a5a3a;margin-top:6px', 'Neues kaufen: Waldhändlerin Fenja (Wald-Insel), Rurik (Lunaris) oder Kampfmeister Kai.')); return void card.appendChild(closeBtn()); }
    head('🧪 Tränke');
    const iv = G.inv ? G.inv() : null;
    for (const [id, icon, name, pr, txt] of D.potions) row(icon, name + (iv ? ' (' + (iv[id] | 0) + ')' : ''), txt, btn(pr + ' ⭐ kaufen', '#e0902a', () => { if ((save.stars | 0) < pr) { say('⭐ Dafür fehlen dir noch Sterne.', 2000); return; } if (!iv) return; G.addStars(-pr); iv[id] = (iv[id] | 0) + 1; persist(); say(icon + ' ' + name + ' im Rucksack!', 1600); }));
    card.appendChild(closeBtn());
  }
  K.show = function (seller) {
    if (panel) return; G.setStick && G.setStick(0, 0); K.seller = seller || ''; K.open = true;
    panel = el('div', 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(20,10,40,.55);z-index:60;font-family:Fredoka,system-ui,sans-serif;padding:10px');
    panel.appendChild(el('div', 'background:#fffaf0;border:6px solid #8a5a2a;border-radius:24px;padding:12px 12px 14px;width:min(94vw,420px);text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.35)'));
    panel.addEventListener('pointerdown', e => { if (e.target === panel) K.close(); }); document.body.appendChild(panel); draw(); G.updateButtons && G.updateButtons(true);
  };
  K.close = function () { if (!panel) return; panel.remove(); panel = null; K.open = false; G.updateButtons && G.updateButtons(true); };
  K.unlockAll = function () { const s = S(); for (const q of D.weapons.concat(D.shields)) if (!s.own.includes(q.id)) s.own.push(q.id); s.amu = 1; persist(); };
  return K;
};
