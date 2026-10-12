'use strict';
/* Bunte Insel – Handbuch 📘 und Lösungsbuch 🗝️ im Spiel (⚙️ → „Handbuch & Lösungen“, auch im Pause-Menü). Scrollbares Buch mit Inhaltsverzeichnis, Suche und zwei Reitern.
   Text steht in js/buch-data.js; Tasten, Welten, Sticker, Aufgabenlisten und Codes werden hier automatisch aus dem Spiel erzeugt (neue Inhalte erscheinen von selbst).
   Dieselben Inhalte erzeugt tools/gen-docs.mjs als Markdown (docs/HANDBUCH.md, docs/LOESUNGSBUCH.md). */
BI.createBuch = function (G) {
  const K = { open: false, tab: 'handbuch' }, D = BI.BUCH;
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  /* ---------- Inhalte (Blöcke) ---------- */
  function dyn(tag) {
    const out = [];
    if (tag === '@tasten') { const kb = G.keys && G.keys.bound || {}; out.push(['tbl', BI.KEY_ACTIONS.map(([id, nm, d]) => [nm, BI.keyLabel(kb[id] || d)])]); }
    else if (tag === '@welten') {
      const sm = G.smode; out.push(['p', 'Brücken führen von der Hauptinsel zu den Welten. Im Story-Modus öffnen sie sich nach und nach (Aufgaben in Klammern).']);
      out.push(['ul', (sm ? sm.islands() : []).map(I => I.icon + ' ' + I.name + ' – ' + (D.welten[I.key] || 'eine neue Welt zum Entdecken') + ' (Freischalten: ' + I.req.map(id => { const q = G.info(id); return q ? q[2] : id; }).join(', ') + ')')]);
      for (const [label, names] of (G.destGroups ? G.destGroups() : [])) if (names.length) out.push(['p', '**' + label + ':** ' + names.join(' · ')]);
    }
    else if (tag === '@reise') { for (const [i, c] of (G.chapters ? G.chapters() : []).entries()) { out.push(['h', 'Kapitel ' + (i + 1) + ': ' + c.icon + ' ' + c.name]); out.push(['p', c.intro]); out.push(['ul', c.tasks.map(t => t.icon + ' ' + t.text)]); } out.push(['tip', 'Nach dem letzten Kapitel gibt es das Insel-Fest und den Sticker „Inselheld“. Bereits Geschafftes wird automatisch abgehakt.']); }
    else if (tag === '@freischalten') { for (const I of (G.smode ? G.smode.islands() : [])) { out.push(['h', I.icon + ' ' + I.name]); out.push(['ul', I.req.map(id => { const q = G.info(id); return q ? q[1] + ' ' + q[2] + ': ' + q[3] : id; })]); } }
    else if (tag === '@geschichten') for (const d of BI.INSELSTORY || []) { out.push(['h', d.icon + ' ' + d.title + ' – erzählt von ' + d.npc]); out.push(['ul', d.acts.map((a, i) => 'Akt ' + (i + 1) + ': ' + a.hint + ' → ' + (a.goal.filter(id => typeof id === 'string').map(id => { const q = G.info(id); return q ? q[1] + ' ' + q[2] : id; }).join(' + ') || 'Aufgabe der Welt'))]); }
    else if (tag === '@aufgaben') { for (const l of (G.worldLogs ? G.worldLogs() : [])) { out.push(['h', l.title]); out.push(['ul', l.rows.map(r => r.icon + ' ' + r.text)]); } }
    else if (tag === '@sticker') out.push(['tbl', (G.stickers ? G.stickers() : []).map(q => [q[1] + ' ' + q[2], q[3]])]);
    else if (tag === '@codes') out.push(['tbl', (G.cheats ? G.cheats.list() : []).map(c => [c.icon + ' ' + c.code, c.text + (c.toggle ? ' (nochmal eingeben = aus)' : '')])]);
    return out;
  }
  K.sections = function (tab) { return (D[tab] || []).map(s => ({ id: s.id, icon: s.icon, title: s.title, blocks: s.body.flatMap(b => typeof b[0] === 'string' && b[0][0] === '@' ? dyn(b[0]) : [b]) })); };
  K.toMarkdown = function (tab) {
    const head = tab === 'handbuch' ? '# 📘 Handbuch – Bunte Insel\n\n> Wird automatisch erzeugt (`node bunte-insel/tools/gen-docs.mjs`) aus `js/buch-data.js` und den Spieldaten. Dasselbe Buch steht im Spiel unter ⚙️ → „Handbuch & Lösungen“.\n' : '# 🗝️ Lösungsbuch – Bunte Insel\n\n> Wird automatisch erzeugt (`node bunte-insel/tools/gen-docs.mjs`) aus `js/buch-data.js` und den Spieldaten. Dasselbe Buch steht im Spiel unter ⚙️ → „Handbuch & Lösungen“.\n';
    const secs = K.sections(tab); let md = head + '\n## Inhalt\n\n' + secs.map((s, i) => (i + 1) + '. ' + s.icon + ' ' + s.title).join('\n') + '\n';
    for (const s of secs) { md += '\n---\n\n## ' + s.icon + ' ' + s.title + '\n'; for (const b of s.blocks) { if (b[0] === 'p') md += '\n' + b[1] + '\n'; else if (b[0] === 'h') md += '\n### ' + b[1] + '\n'; else if (b[0] === 'ul') md += '\n' + b[1].map(x => '- ' + x).join('\n') + '\n'; else if (b[0] === 'tip') md += '\n> 💡 ' + b[1] + '\n'; else if (b[0] === 'tbl') md += '\n| Eintrag | Beschreibung |\n|---|---|\n' + b[1].map(r => '| ' + r[0] + ' | ' + String(r[1]).replace(/\|/g, '/') + ' |').join('\n') + '\n'; } }
    return md;
  };
  K.text = tab => K.sections(tab).map(s => s.title + ' ' + s.blocks.map(b => b[0] === 'ul' ? b[1].join(' ') : b[0] === 'tbl' ? b[1].flat().join(' ') : b[1]).join(' ')).join(' ');
  /* ---------- Fenster ---------- */
  let root = null, q = '';
  const css = document.createElement('style'); css.textContent = `
  #buch{position:fixed;inset:0;z-index:99996;display:flex;align-items:center;justify-content:center;background:rgba(20,10,40,.62);font-family:Fredoka,system-ui,sans-serif}
  #buch .bk{display:flex;flex-direction:column;width:min(96vw,860px);height:min(94vh,900px);background:#fffaf0;border:6px solid #b0733a;border-radius:26px;box-shadow:0 12px 40px rgba(0,0,0,.5);overflow:hidden}
  #buch .hd{display:flex;align-items:center;gap:8px;padding:10px 12px;background:linear-gradient(180deg,#e8b36a,#c98a45);color:#fff;flex-wrap:wrap}
  #buch .hd h2{margin:0;font-size:22px;flex:1;min-width:140px;text-shadow:0 2px 0 rgba(0,0,0,.25)}
  #buch .tabs{display:flex;gap:6px}#buch .tab,#buch .x{border:3px solid #fff;border-radius:14px;background:rgba(255,255,255,.2);color:#fff;font:800 15px inherit;padding:6px 12px;cursor:pointer}#buch .tab.on{background:#fff;color:#8a4a1a}
  #buch .sr{display:flex;gap:6px;padding:6px 12px;background:#f6e3c2}#buch .sr input{flex:1;border-radius:12px;border:2px solid #c98a45;padding:6px 10px;font:600 15px inherit;background:#fff}
  #buch .toc{display:flex;gap:6px;overflow-x:auto;padding:6px 12px;background:#f6e3c2;border-bottom:3px solid #e0c08a;flex:none}#buch .toc button{flex:none;border:2px solid #c98a45;border-radius:999px;background:#fff;padding:4px 10px;font:700 13px inherit;cursor:pointer;color:#6a3a10}
  #buch .ct{flex:1;overflow-y:auto;padding:14px 18px 40px;color:#3a2a1a;font-size:16px;line-height:1.5;scroll-behavior:smooth;-webkit-overflow-scrolling:touch}
  #buch .ct h3{margin:22px 0 6px;font-size:24px;color:#8a4a1a;border-bottom:3px dashed #e0c08a;padding-bottom:4px}#buch .ct h4{margin:14px 0 4px;font-size:18px;color:#a0561a}
  #buch .ct ul{margin:6px 0 6px 18px;padding:0}#buch .ct li{margin:4px 0}#buch .ct p{margin:6px 0}
  #buch .tip{background:#fff3b0;border-left:6px solid #ffb400;border-radius:10px;padding:8px 12px;margin:8px 0;font-weight:600}
  #buch table{width:100%;border-collapse:collapse;margin:8px 0;font-size:15px}#buch td{border-bottom:1px solid #ecd9b3;padding:5px 6px;vertical-align:top}#buch td:first-child{font-weight:800;white-space:nowrap;padding-right:12px}
  #buch .up{position:absolute;right:22px;bottom:20px;border:3px solid #fff;border-radius:50%;width:46px;height:46px;background:#c98a45;color:#fff;font:900 20px inherit;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.35)}
  @media (max-width:520px){#buch .bk{width:100vw;height:100vh;border-radius:0;border-width:0}#buch table td:first-child{white-space:normal}}`;
  document.head.appendChild(css);
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
  function draw() {
    const secs = K.sections(K.tab), ql = q.trim().toLowerCase();
    const hit = s => !ql || (s.title + ' ' + s.blocks.map(b => b[0] === 'ul' ? b[1].join(' ') : b[0] === 'tbl' ? b[1].flat().join(' ') : b[1]).join(' ')).toLowerCase().includes(ql);
    const list = secs.filter(hit), ct = root.querySelector('.ct'), toc = root.querySelector('.toc');
    toc.innerHTML = ''; ct.innerHTML = '';
    for (const t of ['handbuch', 'loesung']) root.querySelector('[data-t=' + t + ']').classList.toggle('on', K.tab === t);
    for (const s of list) { const b = document.createElement('button'); b.type = 'button'; b.textContent = s.icon + ' ' + s.title.split(' ').slice(0, 3).join(' '); b.onclick = () => { const e = ct.querySelector('#bk-' + s.id); if (e) ct.scrollTo({ top: e.offsetTop - 8, behavior: 'smooth' }); }; toc.appendChild(b); }
    if (!list.length) ct.innerHTML = '<p>😕 Nichts gefunden für „' + esc(q) + '“.</p>';
    for (const s of list) {
      const h = document.createElement('h3'); h.id = 'bk-' + s.id; h.textContent = s.icon + ' ' + s.title; ct.appendChild(h);
      for (const b of s.blocks) {
        if (b[0] === 'p') { const p = document.createElement('p'); p.innerHTML = md(b[1]); ct.appendChild(p); }
        else if (b[0] === 'h') { const e = document.createElement('h4'); e.textContent = b[1]; ct.appendChild(e); }
        else if (b[0] === 'ul') { const u = document.createElement('ul'); for (const x of b[1]) { const li = document.createElement('li'); li.textContent = x; u.appendChild(li); } ct.appendChild(u); }
        else if (b[0] === 'tip') { const d = document.createElement('div'); d.className = 'tip'; d.textContent = '💡 ' + b[1]; ct.appendChild(d); }
        else if (b[0] === 'tbl') { const t = document.createElement('table'); for (const r of b[1]) { const tr = document.createElement('tr'); for (const c of r) { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); } t.appendChild(tr); } ct.appendChild(t); }
      }
    }
    ct.scrollTop = 0;
  }
  K.show = function (tab) {
    if (K.open) { if (tab) { K.tab = tab; draw(); } return; } K.open = true; K.tab = tab || K.tab; q = ''; G.setStick && G.setStick(0, 0);
    root = document.createElement('div'); root.id = 'buch'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Handbuch und Lösungsbuch');
    root.innerHTML = '<div class="bk"><div class="hd"><h2>📚 Handbuch &amp; Lösungen</h2><div class="tabs"><button type="button" class="tab" data-t="handbuch">📘 Handbuch</button><button type="button" class="tab" data-t="loesung">🗝️ Lösungsbuch</button></div><button type="button" class="x" aria-label="Schließen">✖</button></div><div class="sr"><input type="search" placeholder="🔍 Suchen …" aria-label="Im Buch suchen"></div><div class="toc"></div><div class="ct"></div><button type="button" class="up" aria-label="Nach oben">▲</button></div>';
    document.body.appendChild(root);
    root.querySelector('.x').onclick = K.close; root.addEventListener('click', e => { if (e.target === root) K.close(); });
    for (const b of root.querySelectorAll('.tab')) b.onclick = () => { K.tab = b.dataset.t; draw(); };
    root.querySelector('input').addEventListener('input', e => { q = e.target.value; draw(); }); root.querySelector('.up').onclick = () => root.querySelector('.ct').scrollTo({ top: 0, behavior: 'smooth' });
    draw();
  };
  K.close = function () { if (!K.open) return; K.open = false; if (root) { root.remove(); root = null; } G.updateButtons && G.updateButtons(true); };
  addEventListener('keydown', e => { if (K.open && e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); K.close(); } }, true);
  return K;
};
