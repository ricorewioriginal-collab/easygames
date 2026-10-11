'use strict';
/* Bunte Insel – Rucksack 🎒: alles, was man hat, ordentlich sortiert (Essen & Zutaten, Kleidung, Spielzeug & Gadgets, Zimmer, Tiere) – mit Erklärung „Was ist das?“ und „Wofür?“,
   passenden Knöpfen (Anlegen, Essen, Holen …) und Hilfe-Seite. Dazu 🎁 Verschenken und 🔄 Tauschen mit Mitspielern (feste Gegenstandsliste, nichts Freies → kindersicher). */
BI.createPack = function (G) {
  const { A, fx, P, save, say } = G, $ = id => document.getElementById(id), X = { open: false, tab: 0, sel: null, pick: null };
  const FOOD = { carrot: ['🥕', 'Möhre'], tomato: ['🍅', 'Tomate'], corn: ['🌽', 'Mais'], pumpkin: ['🎃', 'Kürbis'], strawberry: ['🍓', 'Erdbeere'], sunflower: ['🌻', 'Sonnenblume'], tulip: ['🌷', 'Tulpe'], rose: ['🌹', 'Rose'], egg: ['🥚', 'Ei'], milk: ['🥛', 'Milch'], jam: ['🍯', 'Marmelade'], cake: ['🍰', 'Kuchen'], soup: ['🥣', 'Kürbissuppe'], popcorn: ['🍿', 'Popcorn'], apple: ['🍎', 'Apfel'], banana: ['🍌', 'Banane'], bread: ['🍞', 'Brot'], cheese: ['🧀', 'Käse'], flour: ['🌾', 'Mehl'], juice: ['🧃', 'Saft'], choc: ['🍫', 'Schoko'], croissant: ['🥐', 'Croissant'], cookie: ['🍪', 'Keks'], bouquet: ['💐', 'Blumenstrauß'], potion_hp: ['❤️', 'Heiltrank'], potion_ep: ['⚡', 'Energietrank'], cocoa: ['☕', 'Kakao'], cakeslice: ['🍰', 'Kuchenstück'], icecream: ['🍦', 'Eis'], pancake: ['🥞', 'Pfannkuchen'], pizza: ['🍕', 'Pizza'], fruitsalad: ['🥗', 'Obstsalat'], sandwich: ['🥪', 'Sandwich'] };
  const REC = { jam: { strawberry: 2 }, soup: { pumpkin: 1, carrot: 1 }, cake: { egg: 2, milk: 1, strawberry: 1 }, popcorn: { corn: 1 }, pancake: { egg: 1, milk: 1, flour: 1 }, pizza: { flour: 1, cheese: 1, tomato: 1 }, fruitsalad: { apple: 1, banana: 1 }, sandwich: { bread: 1, cheese: 1 } };
  const GROW = ['carrot', 'tomato', 'corn', 'pumpkin', 'strawberry'], FLOW = ['sunflower', 'tulip', 'rose'], POTION = ['potion_hp', 'potion_ep'], READY = ['jam', 'cake', 'soup', 'popcorn', 'pancake', 'pizza', 'fruitsalad', 'sandwich', 'croissant', 'cookie', 'cakeslice', 'icecream', 'cocoa', 'choc', 'juice', 'apple', 'banana', 'bread'];
  const groupOf = k => POTION.includes(k) ? 3 : k === 'bouquet' ? 4 : FLOW.includes(k) ? 4 : GROW.includes(k) || ['egg', 'milk', 'flour', 'cheese'].includes(k) ? 0 : 1;
  const GROUPS = ['🥕 Ernte & Zutaten', '🍽️ Zum Essen', '', '🧪 Tränke', '💐 Blumen & Geschenke'];
  const usedIn = k => Object.keys(REC).filter(r => REC[r][k]).map(r => FOOD[r][0] + ' ' + FOOD[r][1]);
  function foodInfo(k) {
    const g = groupOf(k), u = usedIn(k); let what, use;
    if (k === 'potion_hp') { what = 'Ein Heiltrank aus der Apotheke.'; use = 'Im Verbotenen Wald 🌲 im Kampf: Knopf ❤️ drücken = +50 Leben.'; }
    else if (k === 'potion_ep') { what = 'Ein Energietrank aus der Apotheke.'; use = 'Im Verbotenen Wald 🌲 im Kampf: Knopf ⚡ drücken = +30 Energie.'; }
    else if (k === 'bouquet') { what = 'Ein schöner Blumenstrauß.'; use = 'Schenke ihn einem Dorfbewohner: Geh hin und drück 💬 – das gibt +3 ⭐. Oder verschenke ihn an Freunde 🎁.'; }
    else if (g === 4) { what = 'Eine Blume aus dem Garten oder Blumenladen.'; use = 'Tiere im Zoo mögen manche Blumen. Du kannst sie auch an Bauer Heinz 🧑‍🌾 verkaufen oder verschenken.'; }
    else if (g === 0) { what = (k === 'egg' || k === 'milk') ? 'Frisch vom Bauernhof.' : 'Frisch aus dem Garten oder Supermarkt.'; use = (u.length ? 'Zutat für: ' + u.join(', ') + ' (kochen in der Hofküche 🍳). ' : '') + 'Auch zum Füttern der Tiere 🐮 oder Verkaufen an Bauer Heinz.'; }
    else { what = 'Etwas Leckeres.'; use = (u.length ? 'Zutat für: ' + u.join(', ') + '. ' : '') + 'Zum Essen 😋 (Knopf unten). ' + (k === 'apple' ? 'Im Kampf: +20 ❤️. ' : '') + (k === 'juice' ? 'Im Kampf: +20 ⚡. ' : '') + (REC[k] ? '' : 'Du kannst es auch verschenken 🎁.'); }
    return { what, use };
  }
  const SLOTINFO = {
    hat: ['Eine Kopfbedeckung.', 'Anlegen: sie erscheint sofort auf deinem Kopf. Es passt immer nur ein Hut.'], glasses: ['Eine coole Brille.', 'Anlegen: du trägst sie im Gesicht.'], patch: ['Eine Piraten-Augenklappe.', 'Anlegen: Ahoi, Käpt’n!'],
    pack: ['Ein Rucksack zum Anziehen.', 'Anlegen: du trägst ihn auf dem Rücken (nur Optik).'], teddy: ['Dein Kuschel-Teddy.', 'Anlegen: du trägst ihn im Arm.'], cape: ['Ein Heldenumhang.', 'Anlegen: er weht hinter dir her.'], wings: ['Glitzernde Feenflügel.', 'Anlegen: du trägst sie auf dem Rücken.'],
    scarf: ['Ein warmer Schal.', 'Anlegen: er hängt um deinen Hals.'], bowtie: ['Eine schicke Fliege.', 'Anlegen: sie sitzt am Kragen.'], medal: ['Eine glänzende Medaille.', 'Anlegen: du trägst sie stolz auf der Brust.'],
    kite: ['Ein bunter Drachen.', 'Anlegen: er fliegt an einer Schnur über dir. Zum Wegpacken wieder „Ablegen“.'], rcheli: ['Ein ferngesteuerter Hubschrauber.', 'Holen: er erscheint neben dir. Steig ein = Fernsteuern, mit ⬆ ⬇ fliegen.'], skate: ['Ein Skateboard.', 'Holen: es erscheint neben dir. Steig auf und fahr los!'],
    deco: ['Deko für dein Zimmer.', 'Geh in deine Wohnung 🏠 (🧭 → „Meine Wohnung“) und stelle sie im Zimmer-Editor auf.']
  };
  const GADGET = { double: ['Der Doppelsprung.', 'Anlegen, dann in der Luft nochmal Springen drücken.'], board: ['Ein Hoverboard.', 'Anlegen: du schwebst und bist viel schneller.'], jet: ['Ein Jetpack.', 'Anlegen, springen und den Sprung-Knopf gedrückt halten = fliegen. Der Tank lädt am Boden auf.'] };
  /* ---------- Dinge, die man hat ---------- */
  const inv = () => G.inv(), owned = () => save.owned || (save.owned = []), shopOf = id => G.shop().find(s => s.id === id);
  const petsAll = () => save.pets || (save.pets = { own: {}, eq: '' });
  X.items = function () {
    const out = { food: [], cloth: [], toy: [], room: [], pet: [] }; const I = inv();
    for (const k of Object.keys(I)) if (I[k] > 0 && FOOD[k]) out.food.push({ c: 'inv', k, n: I[k], icon: FOOD[k][0], name: FOOD[k][1], g: groupOf(k) });
    out.food.sort((a, b) => a.g - b.g || a.name.localeCompare(b.name));
    for (const id of owned()) { const s = shopOf(id); if (!s) continue; const e = { c: 'owned', k: id, n: 1, icon: s.icon, name: s.name, slot: s.slot, s }; if (s.slot === 'deco') out.room.push(e); else if (s.slot === 'kite' || s.slot === 'rcheli' || s.slot === 'skate') out.toy.push(e); else out.cloth.push(e); }
    for (const g of (G.gadgets.LIST || [])) if ((save.gadgets || []).includes(g.k)) out.toy.push({ c: 'gadget', k: g.k, n: 1, icon: g.icon, name: g.name, slot: 'gadget' });
    for (const p of G.meta.PETS) { const n = (petsAll().own || {})[p[0]] || 0; if (n) out.pet.push({ c: 'pet', k: p[0], n, icon: p[1], name: p[2], r: p[3] }); }
    return out;
  };
  const equipped = e => e.c === 'owned' ? G.isEq(e.s) : e.c === 'gadget' ? save.gadget === e.k : e.c === 'pet' ? petsAll().eq === e.k : false;
  function describe(e) {
    if (e.c === 'inv') return foodInfo(e.k);
    if (e.c === 'owned') { const si = SLOTINFO[e.slot === 'hat' ? 'hat' : e.slot] || ['Ein Ausrüstungsteil.', 'Anlegen: es erscheint an deiner Figur.']; return { what: si[0], use: si[1] }; }
    if (e.c === 'gadget') return { what: GADGET[e.k][0], use: GADGET[e.k][1] + ' (In Parcours sind Gadgets aus.)' };
    if (e.c === 'pet') { const bonus = [10, 20, 35, 55][e.r]; return { what: ['Ein gewöhnliches', 'Ein seltenes', 'Ein episches', 'Ein legendäres'][e.r] + ' Haustier.', use: 'Wenn du es mitnimmst, hüpft es neben dir her und bringt beim Sterne-Sammeln mit ' + bonus + ' % Chance einen Bonus-Stern.' }; }
    return { what: '', use: '' };
  }
  /* ---------- Aktionen ---------- */
  const EAT = READY.concat(['juice']);
  function eat(e) {
    const I = inv(); if (!(I[e.k] > 0)) return; I[e.k]--; G.persist(); A.pop && A.pop(); A.giggle && A.giggle(); P.wave = 1.2; fx.burst(P.x, 1.6, P.z, 10, [BI.C.gold, BI.C.pink, BI.C.white], 3, 1, 26, 3); say('😋 Mmmh, ' + e.name + '! Lecker!', 1800); G.earn && G.earn('eat'); X.sel = I[e.k] > 0 ? X.sel : null; render();
  }
  function actions(e) {
    const out = [];
    if (e.c === 'inv' && EAT.includes(e.k)) out.push(['😋 Essen', () => eat(e)]);
    if (e.c === 'owned') { const sl = e.slot; if (sl === 'rcheli' || sl === 'skate') out.push(['🎮 Holen', () => { G.spawnRC(false, sl); X.close(); }]); else if (sl !== 'deco') out.push([equipped(e) ? '✋ Ablegen' : '👕 Anlegen', () => { G.setEq(e.s, !equipped(e)); A.pop && A.pop(); render(); }]); }
    if (e.c === 'gadget') out.push([equipped(e) ? '✋ Ablegen' : '🚀 Anlegen', () => { save.gadget = equipped(e) ? '' : e.k; G.persist(); A.pop && A.pop(); render(); }]);
    if (e.c === 'pet') out.push([equipped(e) ? '🏠 Wegschicken' : '🐾 Mitnehmen', () => { petsAll().eq = equipped(e) ? '' : e.k; G.persist(); A.pop && A.pop(); render(); }]);
    if (!(e.c === 'owned' && e.slot === 'deco' && false)) { out.push(['🎁 Verschenken', () => friendPick(e, 'gift')]); out.push(['🔄 Tauschen', () => friendPick(e, 'trade')]); }
    return out;
  }
  /* ---------- Fenster ---------- */
  const el = document.createElement('div'); el.id = 'packPanel'; el.hidden = true;
  el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:13;width:min(640px,calc(100% - 20px));max-height:min(92vh,640px);display:flex;flex-direction:column;gap:6px;padding:10px;background:var(--glass);backdrop-filter:blur(10px);border-radius:24px;box-shadow:0 12px 40px rgba(20,50,100,.4)';
  el.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b style="font-size:18px">🎒 Rucksack</b><span id="packStars" style="font-weight:800"></span><button class="pill" id="packClose">✖</button></div><div id="packTabs" style="display:flex;gap:5px;flex-wrap:wrap"></div><div id="packBody" style="overflow:auto;flex:1;min-height:120px"></div><div id="packDetail"></div>';
  document.body.appendChild(el);
  const css = document.createElement('style'); css.textContent = '#packTabs button{padding:6px 10px;border-radius:14px;background:#fff;box-shadow:var(--shadow);font-weight:800;font-size:13px}#packTabs button.sel{background:#ffd23f}.pgh{font-weight:800;font-size:13px;margin:8px 2px 4px;opacity:.8}.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:6px}.pslot{position:relative;padding:6px 2px;border-radius:14px;background:#fff;box-shadow:var(--shadow);text-align:center;font-size:11px;font-weight:700;line-height:1.15}.pslot b{display:block;font-size:30px}.pslot i{position:absolute;right:5px;top:3px;font-style:normal;background:#16335e;color:#fff;border-radius:9px;padding:0 6px;font-size:11px}.pslot.on{outline:3px solid #ffd23f}.pslot em{position:absolute;left:4px;top:2px;font-style:normal;font-size:12px}.pdet{padding:10px;border-radius:18px;background:#fff;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:6px}.pdet .h{display:flex;align-items:center;gap:10px}.pdet .h b{font-size:38px}.pdet p{margin:0;font-size:13px;font-weight:600}.pbt{display:flex;flex-wrap:wrap;gap:6px}.pbt button{padding:7px 12px;border-radius:14px;font-weight:800;background:#4cd07d;color:#fff}.pbt button.alt{background:#4da3ff}.pbt button.no{background:#c8ced8}.phelp{padding:8px 10px;border-radius:14px;background:#fff;box-shadow:var(--shadow);margin:5px 0;font-size:13px;font-weight:600}.phelp b{font-size:14px}'; document.head.appendChild(css);
  const TABS = ['🍎 Essen', '👕 Kleidung', '🧸 Spielzeug', '🏠 Zimmer', '🐾 Tiere', '❓ Hilfe'];
  const EMPTY = ['Noch kein Essen. Ernte im Garten 🌻, melke eine Kuh 🥛, kaufe im Supermarkt 🛒 oder koche in der Hofküche 🍳.', 'Noch keine Kleidung. Kaufe Hüte und Zubehör im Spielzeugladen 🧸 oder Kleiderladen 👕.', 'Noch kein Spielzeug. Im Spielzeugladen gibt es Drachen, Skateboard und RC-Hubschrauber – und Gadgets 🚀 im Spaß-Menü.', 'Noch keine Zimmer-Deko. Kaufe sie im Spielzeugladen (Reiter „Zimmer“).', 'Noch keine Haustiere. Kaufe ein Ei 🥚 im Menü „Aufgaben & Haustiere“.'];
  const HELP = [
    ['⭐ Sterne', 'Sammle goldene Sterne auf der Insel, schaffe Aufträge, Parcours und Tagesaufgaben. Mit Sternen kaufst du alles.'], ['🚗 Fahrzeuge & Aufträge', 'Geh zu einem Fahrzeug und drück 🚪. Bei Taxi, Polizei & Co. fragt dich ein Fenster, ob du einen Auftrag annehmen willst – du kannst auch einfach so fahren.'],
    ['🎮 Knöpfe A B X Y', 'A (rechts) = Aktion/Einsteigen, B (unten) = Springen/Turbo, Y (links) = Winken/Hupen, X (oben) = Sirene oder Sinken.'], ['🎉 Spaß-Menü', 'Links oben: Tanzen, Kaugummi, Feuerwerk, Emotes & Chat, Gadgets, Aufgaben & Haustiere und viel mehr.'],
    ['🛒 Läden', 'Spielzeugladen (Hüte, Spielzeug, Zimmer), Supermarkt, Bäckerei, Blumenladen, Apotheke, Café, Tierhandlung, Kleiderladen. An der Theke drücken 🛒.'], ['🌻 Garten & Farm', 'Pflanze Samen in deinem Garten, gieß sie und ernte. Die Ernte kommt in den Rucksack – koche in der Hofküche 🍳 oder verkaufe an Bauer Heinz.'],
    ['🐮 Tiere füttern', 'Im Streichelzoo: Tiere streicheln 🤗, Kühe melken 🥛 und füttern (Möhren, Mais, Äpfel).'], ['🏗️ Bauen', 'Mit 🏗️ baust du Häuser, Möbel, Gärten und sogar einen eigenen Parcours (Reiter 🏁). Alles ist gratis und wird gespeichert.'],
    ['🏁 Parcours', 'Himmels-Parcours: 🧭 → Himmels-Parcours. Eigener Parcours: Start 🚩 bauen, Hindernisse, Ziel 🏁 – dann auf den Start laufen.'], ['🚀 Gadgets', 'Doppelsprung, Hoverboard und Jetpack kaufst du im Spaß-Menü. Im Rucksack kannst du sie anlegen.'],
    ['🥚 Haustiere', 'Eier kaufen, Tiere sammeln, eins mitnehmen = Bonus-Sterne. Alles im Menü „Aufgaben & Haustiere“.'], ['🍭 Bonbon-Fabrik', 'Maschinen kaufen, Bonbons entstehen beim Spielen, verkaufen = Sterne.'],
    ['⚔️ Kämpfen', 'Nur im Verbotenen Wald 🌲 und in der Arena. Heil- und Energietränke aus der Apotheke helfen dir.'], ['👥 Freunde, 🎁 Geschenke & 🔄 Tausch', 'Mit dem 👥-Knopf verbindest du dich mit Freunden. Im Rucksack kannst du Gegenstände verschenken oder tauschen.'],
    ['🏠 Meine Wohnung', 'Mit 🧭 → „Meine Wohnung“ kommst du heim: Bett, Zimmer-Editor und deine Deko.'], ['🚂 Zug & Boot', 'Am Bahnhof „Zug fahren“, am Steg das Segelboot. Beides gibt Aufträge und Sterne.']
  ];
  const HINT = { hat: 'Kommt auf den Kopf', glasses: 'Für dein Gesicht', patch: 'Piraten-Look', pack: 'Hängt am Rücken', teddy: 'Kuschelt im Arm', cape: 'Weht hinter dir', wings: 'Auf dem Rücken', scarf: 'Um den Hals', bowtie: 'Am Kragen', medal: 'Auf der Brust', kite: 'Fliegt über dir', rcheli: 'Zum Fernsteuern', skate: 'Zum Fahren', deco: 'Für dein Zimmer' };
  X.shopHint = it => (HINT[it.slot] || 'Zum Anziehen') + ' · liegt dann im Rucksack 🎒';
  X.show = function (tab) { if (X.open) return; G.earn && G.earn('pack'); X.open = true; if (tab != null) X.tab = tab; X.sel = null; render(); el.hidden = false; G.setStick && G.setStick(0, 0); };
  X.close = function () { X.open = false; el.hidden = true; X.pick = null; };
  X.toggle = () => { if (X.open) X.close(); else X.show(); };
  function render() {
    $('packStars').textContent = '⭐ ' + save.stars; const tb = $('packTabs'); tb.innerHTML = '';
    TABS.forEach((n, i) => { const b = document.createElement('button'); b.textContent = n; if (i === X.tab) b.className = 'sel'; b.onclick = () => { X.tab = i; X.sel = null; X.pick = null; render(); }; tb.appendChild(b); });
    const body = $('packBody'); body.innerHTML = ''; const det = $('packDetail'); det.innerHTML = '';
    if (X.pick) { renderPick(body, det); return; }
    if (X.tab === 5) { for (const [h, t] of HELP) { const d = document.createElement('div'); d.className = 'phelp'; d.innerHTML = '<b></b><br><span></span>'; d.firstChild.textContent = h; d.lastChild.textContent = t; body.appendChild(d); } return; }
    const I = X.items(), list = [I.food, I.cloth, I.toy, I.room, I.pet][X.tab];
    if (!list.length) { const d = document.createElement('div'); d.className = 'phelp'; d.textContent = EMPTY[X.tab]; body.appendChild(d); return; }
    let lastG = -1, grid = null;
    for (const e of list) {
      if (X.tab === 0 && e.g !== lastG) { lastG = e.g; const h = document.createElement('div'); h.className = 'pgh'; h.textContent = GROUPS[e.g]; body.appendChild(h); grid = document.createElement('div'); grid.className = 'pgrid'; body.appendChild(grid); }
      else if (X.tab !== 0 && !grid) { grid = document.createElement('div'); grid.className = 'pgrid'; body.appendChild(grid); }
      const s = document.createElement('div'); s.className = 'pslot' + (X.sel && X.sel.c === e.c && X.sel.k === e.k ? ' on' : ''); s.innerHTML = '<b></b><span></span>' + (e.n > 1 ? '<i>×' + e.n + '</i>' : '') + (equipped(e) ? '<em>✔</em>' : ''); s.firstChild.textContent = e.icon; s.children[1].textContent = e.name;
      s.onclick = () => { X.sel = e; A.pop && A.pop(); render(); }; grid.appendChild(s);
    }
    if (X.sel) { const e = list.find(q => q.c === X.sel.c && q.k === X.sel.k); if (!e) { X.sel = null; return; } const d = describe(e); det.innerHTML = '<div class="pdet"><div class="h"><b></b><div><div style="font-weight:800;font-size:16px"></div><div style="font-size:12px;opacity:.7"></div></div></div><p><u>Was ist das?</u> <span class="w"></span></p><p><u>Wofür?</u> <span class="u"></span></p><div class="pbt"></div></div>';
      det.querySelector('.h b').textContent = e.icon; det.querySelector('.h div div').textContent = e.name + (equipped(e) ? ' ✔' : ''); det.querySelector('.h div div:nth-child(2)').textContent = e.n > 1 ? 'Du hast ' + e.n : ''; det.querySelector('.w').textContent = d.what; det.querySelector('.u').textContent = d.use;
      const bt = det.querySelector('.pbt'); for (const [t, f] of actions(e)) { const b = document.createElement('button'); b.textContent = t; if (/Verschenken|Tauschen/.test(t)) b.className = 'alt'; b.onclick = f; bt.appendChild(b); } }
  }
  /* ---------- Freunde auswählen: Geschenk / Tausch ---------- */
  function friendPick(e, mode) {
    const fr = G.friends(); if (!fr.length) { say('🎁 Zum Verschenken & Tauschen musst du mit Freunden verbunden sein (👥).', 3000); return; }
    X.pick = { e, mode }; render();
  }
  function renderPick(body, det) {
    const { e, mode } = X.pick; const h = document.createElement('div'); h.className = 'pgh'; h.textContent = (mode === 'gift' ? '🎁 Wem schenkst du ' : '🔄 Mit wem tauschst du ') + e.icon + ' ' + e.name + '?'; body.appendChild(h);
    const g = document.createElement('div'); g.className = 'pbt';
    for (const f of G.friends()) { const b = document.createElement('button'); b.textContent = f.icon + ' ' + f.name; b.onclick = () => { X.pick = null; if (mode === 'gift') sendGift(f, desc(e, 1)); else tradeRequest(f, desc(e, 1)); render(); }; g.appendChild(b); }
    const c = document.createElement('button'); c.className = 'no'; c.textContent = '↩ Zurück'; c.onclick = () => { X.pick = null; render(); }; g.appendChild(c); body.appendChild(g);
    if (mode === 'gift') { const s = document.createElement('div'); s.className = 'pgh'; s.textContent = '⭐ Oder Sterne schenken:'; body.appendChild(s); const sg = document.createElement('div'); sg.className = 'pbt'; for (const n of [1, 5, 10]) for (const f of G.friends()) { if (G.friends().length > 3 && n > 1) continue; const b = document.createElement('button'); b.textContent = '⭐ ' + n + ' → ' + f.name; if (save.stars < n) b.className = 'no'; b.onclick = () => { if (save.stars < n) return; X.pick = null; sendGift(f, { c: 'stars', k: 'stars', n }); render(); }; sg.appendChild(b); } body.appendChild(sg); }
  }
  /* ---------- Gegenstands-Beschreibung für das Netz (nur feste Listen) ---------- */
  const desc = (e, n) => ({ c: e.c, k: e.k, n: n || 1 });
  const PETKEYS = () => G.meta.PETS.map(p => p[0]);
  function valid(d) {
    if (!d || typeof d !== 'object') return null; const c = d.c, k = String(d.k || ''), n = Math.max(1, Math.min(50, d.n | 0 || 1));
    if (c === 'inv' && FOOD[k]) return { c, k, n }; if (c === 'owned' && shopOf(k)) return { c, k, n: 1 }; if (c === 'pet' && PETKEYS().includes(k)) return { c, k, n: 1 };
    if (c === 'gadget' && G.gadgets.LIST.some(g => g.k === k)) return { c, k, n: 1 }; if (c === 'stars') return { c, k: 'stars', n: Math.min(20, n) }; return null;
  }
  const label = d => d.c === 'stars' ? '⭐ ' + d.n + ' Sterne' : d.c === 'inv' ? FOOD[d.k][0] + ' ' + FOOD[d.k][1] + (d.n > 1 ? ' ×' + d.n : '') : d.c === 'owned' ? shopOf(d.k).icon + ' ' + shopOf(d.k).name : d.c === 'pet' ? G.meta.PETS.find(p => p[0] === d.k)[1] + ' ' + G.meta.PETS.find(p => p[0] === d.k)[2] : (G.gadgets.LIST.find(g => g.k === d.k).icon + ' ' + G.gadgets.LIST.find(g => g.k === d.k).name);
  const have = d => d.c === 'stars' ? save.stars >= d.n : d.c === 'inv' ? (inv()[d.k] || 0) >= d.n : d.c === 'owned' ? owned().includes(d.k) : d.c === 'pet' ? ((petsAll().own || {})[d.k] || 0) >= 1 : (save.gadgets || []).includes(d.k);
  function take(d) {
    if (!have(d)) return false;
    if (d.c === 'stars') { save.stars -= d.n; $('starN').textContent = save.stars; } else if (d.c === 'inv') inv()[d.k] -= d.n;
    else if (d.c === 'owned') { const s = shopOf(d.k); if (s && G.isEq(s)) G.setEq(s, false); owned().splice(owned().indexOf(d.k), 1); }
    else if (d.c === 'pet') { const o = petsAll().own; o[d.k]--; if (o[d.k] <= 0) { delete o[d.k]; if (petsAll().eq === d.k) petsAll().eq = ''; } }
    else { save.gadgets.splice(save.gadgets.indexOf(d.k), 1); if (save.gadget === d.k) save.gadget = ''; }
    G.persist(); return true;
  }
  function give(d) {
    if (d.c === 'stars') G.addStars(d.n); else if (d.c === 'inv') inv()[d.k] = (inv()[d.k] || 0) + d.n;
    else if (d.c === 'owned') { if (owned().includes(d.k)) G.addStars(2); else owned().push(d.k); }
    else if (d.c === 'pet') { const o = petsAll().own; o[d.k] = (o[d.k] || 0) + 1; if (!petsAll().eq) petsAll().eq = d.k; }
    else { const o = save.gadgets || (save.gadgets = []); if (o.includes(d.k)) G.addStars(5); else o.push(d.k); }
    G.persist(); G.earn && G.earn('gift');
  }
  /* ---------- Geschenke ---------- */
  let giftT = 0;
  function sendGift(f, d) {
    const now = performance.now(); if (now - giftT < 1200) { say('Nicht so schnell 😊', 1200); return; } if (!have(d) || !take(d)) { say('Das hast du gerade nicht mehr.', 1600); return; } giftT = now;
    G.send({ t: 'gf', to: f.id, it: d }); A.fanfare && A.fanfare(); fx.burst(P.x, 2, P.z, 18, [BI.C.pink, BI.C.gold, BI.C.white], 4, 1.2, 28, 4); say('🎁 Du schenkst ' + f.name + ' ' + label(d) + '!', 2600);
  }
  /* ---------- Tauschfenster ---------- */
  const T = { peer: null, name: '', mine: null, theirs: null, myOk: false, theirOk: false, req: null };
  const tp = document.createElement('div'); tp.id = 'tradePanel'; tp.hidden = true; tp.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:14;width:min(460px,calc(100% - 20px));padding:12px;background:var(--glass);backdrop-filter:blur(10px);border-radius:24px;box-shadow:0 12px 40px rgba(20,50,100,.45);display:flex;flex-direction:column;gap:8px';
  document.body.appendChild(tp);
  function tradeReset() { T.peer = null; T.mine = null; T.theirs = null; T.myOk = T.theirOk = false; T.req = null; tp.hidden = true; }
  function tradeRequest(f, d) { if (!have(d)) return; T.peer = f.id; T.name = f.name; T.mine = d; T.theirs = null; T.myOk = T.theirOk = false; G.send({ t: 'tr', to: f.id, op: 'req', it: d }); say('🔄 Tausch-Anfrage an ' + f.name + ' geschickt …', 2400); tradeRender(); }
  function tradeRender() {
    tp.hidden = false; tp.innerHTML = ''; const h = document.createElement('div'); h.style.cssText = 'font-weight:800;text-align:center'; h.textContent = '🔄 Tausch mit ' + T.name; tp.appendChild(h);
    if (T.req) { const p = document.createElement('div'); p.className = 'phelp'; p.textContent = T.name + ' möchte tauschen und bietet ' + label(T.req.it) + '. Annehmen?'; tp.appendChild(p); const r = document.createElement('div'); r.className = 'pbt'; const y = document.createElement('button'); y.textContent = '✔ Ja'; y.onclick = () => { T.peer = T.req.from; T.theirs = T.req.it; T.mine = null; T.req = null; G.send({ t: 'tr', to: T.peer, op: 'acc' }); tradeRender(); }; const n = document.createElement('button'); n.className = 'no'; n.textContent = '✖ Nein'; n.onclick = () => { G.send({ t: 'tr', to: T.req.from, op: 'x' }); tradeReset(); }; r.append(y, n); tp.appendChild(r); return; }
    const row = document.createElement('div'); row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px'; const mk = (t, d, ok) => { const c = document.createElement('div'); c.className = 'pdet'; c.innerHTML = '<div style="font-size:12px;opacity:.7"></div><div style="font-weight:800;min-height:24px"></div>'; c.children[0].textContent = t + (ok ? ' ✔' : ''); c.children[1].textContent = d ? label(d) : '…noch nichts'; return c; };
    row.append(mk('Du gibst', T.mine, T.myOk), mk(T.name + ' gibt', T.theirs, T.theirOk)); tp.appendChild(row);
    const pk = document.createElement('div'); pk.className = 'pbt'; const all = []; const I = X.items(); for (const l of [I.food, I.cloth, I.toy, I.pet]) for (const e of l) all.push(e); all.slice(0, 40).forEach(e => { const b = document.createElement('button'); b.className = 'alt'; b.textContent = e.icon; b.title = e.name; b.onclick = () => { T.mine = desc(e, 1); T.myOk = T.theirOk = false; G.send({ t: 'tr', to: T.peer, op: 'set', it: T.mine }); tradeRender(); }; pk.appendChild(b); });
    const l1 = document.createElement('div'); l1.style.cssText = 'font-size:12px;font-weight:700'; l1.textContent = 'Wähle, was du gibst:'; tp.appendChild(l1); tp.appendChild(pk);
    const bt = document.createElement('div'); bt.className = 'pbt'; const ok = document.createElement('button'); ok.textContent = T.myOk ? '✔ Wartet auf ' + T.name : '✔ Tauschen!'; if (!T.mine || !T.theirs || T.myOk) ok.className = 'no'; ok.onclick = () => { if (!T.mine || !T.theirs || T.myOk) return; T.myOk = true; G.send({ t: 'tr', to: T.peer, op: 'ok', my: T.mine, yours: T.theirs }); tradeCheck(); if (T.peer) tradeRender(); };
    const x = document.createElement('button'); x.className = 'no'; x.textContent = '✖ Abbrechen'; x.onclick = () => { G.send({ t: 'tr', to: T.peer, op: 'x' }); tradeReset(); }; bt.append(ok, x); tp.appendChild(bt);
  }
  const same = (a, b) => a && b && a.c === b.c && a.k === b.k && a.n === b.n;
  function tradeCheck() {
    if (!(T.myOk && T.theirOk && T.mine && T.theirs)) return;
    if (!have(T.mine)) { say('Dir fehlt der Gegenstand – Tausch abgebrochen.', 2400); G.send({ t: 'tr', to: T.peer, op: 'x' }); tradeReset(); return; }
    take(T.mine); give(T.theirs); A.fanfare && A.fanfare(); fx.burst(P.x, 2, P.z, 24, [BI.C.gold, BI.C.pink, BI.C.blue], 5, 1.2, 28, 4); say('🔄 Getauscht! Du bekommst ' + label(T.theirs) + '.', 3000); tradeReset(); if (X.open) render();
  }
  /* ---------- eingehende Nachrichten ---------- */
  X.onNet = function (d, from) {
    if (!d || d.to !== G.selfId() || !from) return; const f = G.friends().find(q => q.id === from);
    if (d.t === 'gf') { const it = valid(d.it); if (!it || !f) return; give(it); A.fanfare && A.fanfare(); fx.burst(P.x, 2, P.z, 18, [BI.C.pink, BI.C.gold, BI.C.white], 4, 1.2, 28, 4); say('🎁 ' + f.name + ' schenkt dir ' + label(it) + '! (Rucksack 🎒)', 3600); if (X.open) render(); return; }
    if (d.t !== 'tr' || !f) return;
    if (d.op === 'req') { const it = valid(d.it); if (!it || T.peer) { G.send({ t: 'tr', to: from, op: 'x' }); return; } T.name = f.name; T.req = { from, it }; A.pop && A.pop(); tradeRender(); return; }
    if (T.peer !== from) return;
    if (d.op === 'acc') { tradeRender(); say('🔄 ' + T.name + ' hat angenommen – wähle, was ' + T.name + ' bekommen soll!', 2600); return; }
    if (d.op === 'set') { const it = valid(d.it); if (!it) return; T.theirs = it; T.myOk = T.theirOk = false; tradeRender(); return; }
    if (d.op === 'ok') { const my = valid(d.my), yours = valid(d.yours); if (same(yours, T.mine) && same(my, T.theirs)) { T.theirOk = true; tradeCheck(); if (T.peer) tradeRender(); } return; }
    if (d.op === 'x') { say('🔄 Tausch beendet.', 1800); tradeReset(); }
  };
  X.tradeOpen = () => !tp.hidden;
  X.peerGone = id => { if (T.peer === id || (T.req && T.req.from === id)) tradeReset(); };
  $('packClose').onclick = () => X.close(); el.addEventListener('pointerdown', ev => ev.stopPropagation()); tp.addEventListener('pointerdown', ev => ev.stopPropagation());
  X.FOOD = FOOD; X.valid = valid; X.label = label; X.info = foodInfo;
  return X;
};
