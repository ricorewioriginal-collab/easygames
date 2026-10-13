'use strict';
/* Bunte Insel – Sprechblasen im Rollenspiel-Stil 💬: statt der ovalen Einblendung zeigt ein Textfeld am unteren Rand das Bild der Figur, ihren Namen und den Text
   („▶ weiter“ bei mehreren Zeilen). Tippen = weiter/schließen; sonst verschwindet es nach der Lesezeit. Der Text wird vorgelesen.
   BI.DLG_LOOKS: Name → Figuren-Optionen (für das Porträt); Module tragen ihre Figuren dort ein. */
BI.DLG_LOOKS = BI.DLG_LOOKS || {};
BI.createDialog = function (G) {
  const K = { open: false }, $ = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const css = $('style'); css.textContent = '#rpgDlg{position:fixed;left:50%;transform:translateX(-50%);width:min(calc(100vw - 400px),520px);bottom:calc(max(12px,env(safe-area-inset-bottom)) + 4px);z-index:39;display:flex;gap:10px;align-items:flex-start;padding:8px 12px 7px;border-radius:14px;background:rgba(26,32,58,.9);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:2px solid rgba(120,140,210,.5);color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:inherit;cursor:pointer;-webkit-user-select:none;user-select:none}#rpgDlg[hidden]{display:none}#rpgDlg .pt{flex:none;width:52px;height:52px;border-radius:10px;border:2px solid #4a8cff;background:linear-gradient(#2c3a6a,#1c2646);display:flex;align-items:center;justify-content:center;font-size:30px;overflow:hidden}#rpgDlg .pt img{width:100%;height:100%;object-fit:cover}#rpgDlg .tx{flex:1;min-width:0}#rpgDlg .nm{font-size:14px;font-weight:800;color:#6aa8ff;margin-bottom:1px}#rpgDlg .ln{font-size:14px;line-height:1.3;font-weight:500}#rpgDlg .nx{text-align:right;font-size:12px;opacity:.65;margin-top:2px;min-height:14px}@media (max-width:760px),(max-aspect-ratio:1/1){#rpgDlg{width:calc(100vw - 20px);max-width:520px;bottom:calc(max(12px,env(safe-area-inset-bottom)) + 190px)}}';
  document.head.appendChild(css);
  const el = $('div'); el.id = 'rpgDlg'; el.hidden = true; el.innerHTML = '<div class="pt"></div><div class="tx"><div class="nm"></div><div class="ln"></div><div class="nx"></div></div>'; document.body.appendChild(el);
  let queue = [], tm = 0, cur = null, px = 0, pz = 0;
  const portrait = (name, icon) => {
    const L = BI.DLG_LOOKS[name] || BI.DLG_LOOKS[(name || '').split(' ')[0]] || null, box = el.querySelector('.pt'); box.innerHTML = ''; box.textContent = '';
    if (L && BI.Thumb) { const u = BI.Thumb.get('dl|' + name, () => BI.Thumb.render(BI.makeChar(L).group, [.95, 1.95])); if (u) { const im = new Image(); im.src = u; im.alt = ''; box.appendChild(im); return; } }
    box.textContent = icon || '💬';
  };
  function showLine() {
    if (!cur) return; const line = cur.lines[0]; el.querySelector('.nm').textContent = cur.name; el.querySelector('.ln').textContent = line; el.querySelector('.nx').textContent = cur.lines.length > 1 || queue.length ? '▶ weiter' : '';
    portrait(cur.name, cur.icon); el.hidden = false; K.open = true; document.body.classList.add('dlgOpen'); clearTimeout(tm); tm = setTimeout(next, Math.min(14000, 3200 + line.length * 75));
    if (G.speak) G.speak(line);
  }
  function next() { clearTimeout(tm); if (!cur) return; cur.lines.shift(); if (cur.lines.length) { showLine(); return; } cur = queue.shift() || null; if (cur) { showLine(); return; } K.close(); }
  K.close = function () { clearTimeout(tm); cur = null; queue = []; el.hidden = true; K.open = false; document.body.classList.remove('dlgOpen'); };
  /* { name, icon, text | lines } – mehrere Aufrufe nacheinander werden gereiht, ein neuer Sprecher ersetzt den alten */
  K.show = function (o) {
    const lines = (o.lines || [o.text]).filter(Boolean).map(String); if (!lines.length) return; if (o.look && o.name) BI.DLG_LOOKS[o.name] = o.look; const d = { name: o.name || '', icon: o.icon || '💬', lines: lines.slice(), px: G.pos ? G.pos().x : 0, pz: G.pos ? G.pos().z : 0 };
    if (cur && cur.name === d.name && o.append) { queue.push(d); return; } cur = d; queue = []; showLine();
  };
  /* erkennt „Name: „Text““-Meldungen (Figuren-Sprache) und liefert { name, icon, text } oder null */
  K.parse = function (txt) {
    const m = /^(?:(\S{1,4})\s+)?([^:„“"!?0-9+]{2,34}):\s*[„“"](.+?)[“”"]\s*(.*)$/s.exec(txt); if (!m) return null; const rest = (m[4] || '').trim(); return { name: m[2].trim(), icon: m[1] && !/^[A-Za-zÄÖÜäöü]/.test(m[1]) ? m[1] : '', text: (m[3] + (rest ? ' ' + rest : '')).trim() };
  };
  el.addEventListener('click', e => { e.stopPropagation(); next(); });
  el.addEventListener('pointerdown', e => e.stopPropagation());
  addEventListener('keydown', e => { if (K.open && (e.code === 'Enter' || e.code === 'Escape')) { next(); } });
  /* Wer weit weggeht, schließt das Fenster */
  K.update = function () { if (!K.open || !G.pos) return; const p = G.pos(); if (cur && Math.hypot(p.x - cur.px, p.z - cur.pz) > 14) K.close(); };
  return K;
};
