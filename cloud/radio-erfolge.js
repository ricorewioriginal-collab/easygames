/* Radio-Erfolge 🦊 für die Apps und die Spiele-Seiten (radio-erfolge.html). Gleiche Stufen/Punkte/Ränge wie im Portal (ricorewi-radio assets/js/radio-erfolge.js) –
 * bei einer Änderung beide anpassen. Die Zahlen kommen aus dem Konto-Dokument „ricorewi-portal“ (alle Geräte zusammen) und den eingereichten Magazin-Beiträgen. */
(function (root) {
  'use strict';
  const PTS = [10, 20, 30, 50, 80, 120, 200];
  const RANKS = [[0, 'Fuchswelpe'], [60, 'Jungfuchs'], [160, 'Streuner'], [320, 'Schlaufuchs'], [560, 'Rudelführer'], [900, 'Meisterfuchs'], [1400, 'Fuchs-Legende']];
  const H = 3600;
  // stat = Schlüssel in RRWMeinRadio.statsAll() (oder articles/published vom Konto); thr = Schwellen je Stufe; names = Stufennamen; unit/fmt für die Anzeige
  const DEFS = [
    { id: 'zeit', cat: 'Hören', icon: '🎧', title: 'Hörzeit', desc: 'Höre insgesamt {n} Radio – auf allen Geräten zusammen.', stat: 'sec', thr: [1 * H, 5 * H, 10 * H, 25 * H, 50 * H, 100 * H, 250 * H], names: ['Reingehört', 'Dabei', 'Dauerhörer', 'Radiofan', 'Funkprofi', 'Radiolegende', 'Fuchs am Regler'], fmt: n => Math.round(n / H) + ' Std.' },
    { id: 'tage', cat: 'Treue', icon: '📅', title: 'Hörtage', desc: 'Höre an {n} verschiedenen Tagen.', stat: 'days', thr: [3, 7, 15, 30, 60, 120, 365], names: ['Neugierig', 'Eine Woche', 'Stammgast', 'Ein Monat', 'Zwei Monate', 'Treuer Fuchs', 'Ein ganzes Jahr'], fmt: n => n + ' Tage' },
    { id: 'serie', cat: 'Treue', icon: '🔥', title: 'Serie', desc: 'Höre {n} Tage in Folge.', stat: 'streak', thr: [2, 3, 7, 14, 30, 60, 100], names: ['Zwei am Stück', 'Dreierpack', 'Wochenserie', 'Zwei Wochen', 'Monatsserie', 'Unaufhaltsam', 'Hundert Tage'], fmt: n => n + ' Tage' },
    { id: 'sender', cat: 'Entdecken', icon: '🧭', title: 'Entdecker', desc: 'Höre {n} verschiedene Sender.', stat: 'stations', thr: [2, 4, 6, 9, 12], names: ['Zwei Sender', 'Umschalter', 'Sendersammler', 'Entdecker', 'Alle Frequenzen'], fmt: n => n + ' Sender' },
    { id: 'nacht', cat: 'Entdecken', icon: '🌙', title: 'Nachteule', desc: 'Höre zwischen 0 und 5 Uhr nachts Radio.', stat: 'night', thr: [1], names: ['Nachteule'], fmt: n => (n ? 'geschafft' : 'noch nicht') },
    { id: 'frueh', cat: 'Entdecken', icon: '🌅', title: 'Frühaufsteher', desc: 'Höre zwischen 5 und 8 Uhr morgens Radio.', stat: 'early', thr: [1], names: ['Frühaufsteher'], fmt: n => (n ? 'geschafft' : 'noch nicht') },
    { id: 'favs', cat: 'Sammeln', icon: '⭐', title: 'Lieblingssender', desc: 'Speichere {n} Favoriten.', stat: 'favs', thr: [1, 3, 5, 10, 20], names: ['Erster Favorit', 'Dreierrunde', 'Handverlesen', 'Große Auswahl', 'Sammler'], fmt: n => n + ' Favoriten' },
    { id: 'shows', cat: 'Sammeln', icon: '🔔', title: 'Show-Fan', desc: 'Markiere {n} Lieblingssendungen.', stat: 'shows', thr: [1, 3, 5, 10], names: ['Erste Sendung', 'Programmplaner', 'Showkenner', 'Nichts verpasst'], fmt: n => n + ' Sendungen' },
    { id: 'songs', cat: 'Sammeln', icon: '🎵', title: 'Songsammler', desc: 'Merke dir {n} Songs.', stat: 'songs', thr: [1, 10, 25, 50, 100], names: ['Erster Song', 'Playlist', 'Musikbox', 'Plattensammlung', 'Jukebox'], fmt: n => n + ' Songs' },
    { id: 'karte', cat: 'Mitmachen', icon: '🪪', title: 'Sendercard', desc: 'Erstelle deine eigene Sendercard (Konto-Menü).', stat: 'card', thr: [1], names: ['Kartenmacher'], fmt: n => (n ? 'geschafft' : 'noch nicht') },
    { id: 'artikel', cat: 'Mitmachen', icon: '✍️', title: 'Magazin-Autor', desc: 'Reiche {n} Magazin-Beiträge ein.', stat: 'articles', thr: [1, 3, 10], names: ['Erster Beitrag', 'Stammautor', 'Redakteur'], fmt: n => n + ' Beiträge' },
    { id: 'druck', cat: 'Mitmachen', icon: '📰', title: 'Veröffentlicht', desc: 'Lass {n} Beiträge von der Redaktion veröffentlichen.', stat: 'published', thr: [1, 3, 10], names: ['In der Zeitung', 'Hausautor', 'Starautor'], fmt: n => n + ' veröffentlicht' },
    { id: 'level', cat: 'Rang', icon: '🏅', title: 'Hörer-Level', desc: 'Erreiche Level {n}.', stat: 'level', thr: [2, 3, 4, 5], names: ['Hörer', 'Stammhörer', 'Radiofan', 'Radiolegende'], fmt: n => 'Level ' + n }
  ];
  const fmtNum = (d, n) => d.fmt(n);
  /** stats → { items:[{id,cat,icon,title,desc,level,levels,name,value,next,pct,fmtValue,fmtNext,points}], points, rank, nextRank, rankPct, done, total } */
  function evaluate(stats) {
    const st = stats || {}; let points = 0, done = 0, total = 0;
    const items = DEFS.map(d => {
      const v = Number(st[d.stat]) || 0; let level = 0;
      d.thr.forEach((t, i) => { if (v >= t) level = i + 1; });
      let pts = 0; for (let i = 0; i < level; i++) pts += PTS[Math.min(i, PTS.length - 1)];
      points += pts; done += level; total += d.thr.length;
      const next = level < d.thr.length ? d.thr[level] : null, prev = level > 0 ? d.thr[level - 1] : 0;
      return { id: d.id, cat: d.cat, icon: d.icon, title: d.title, desc: d.desc.replace('{n}', fmtNum(d, next == null ? d.thr[d.thr.length - 1] : next)), level, levels: d.thr.length,
        name: level > 0 ? d.names[level - 1] : '', nextName: next != null ? d.names[level] : '', value: v, next, pct: next == null ? 100 : Math.round(Math.min(1, (v - prev) / (next - prev)) * 100),
        fmtValue: fmtNum(d, v), fmtNext: next != null ? fmtNum(d, next) : '', points: pts };
    });
    let ri = 0; RANKS.forEach((r, i) => { if (points >= r[0]) ri = i; });
    const nextRank = RANKS[ri + 1] || null, prevT = RANKS[ri][0];
    return { items, points, rank: RANKS[ri][1], rankIndex: ri + 1, nextRank: nextRank ? nextRank[1] : '', toNext: nextRank ? nextRank[0] - points : 0,
      rankPct: nextRank ? Math.round((points - prevT) / (nextRank[0] - prevT) * 100) : 100, done, total };
  }
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function card(it) {
    const stars = '<div class="rre-st" aria-hidden="true">' + Array.from({ length: it.levels }, (_, i) => '<i class="' + (i < it.level ? 'on' : '') + '"></i>').join('') + '</div>';
    const prog = it.next != null ? '<div class="rre-bar" style="min-width:0;height:6px"><i style="width:' + it.pct + '%"></i></div><small>' + esc(it.fmtValue) + ' von ' + esc(it.fmtNext) + ' · nächste Stufe: ' + esc(it.nextName) + '</small>' : '<small>✔ Alle Stufen geschafft</small>';
    return '<article class="rre-card' + (it.level ? '' : ' off') + '"><div class="rre-top"><span class="rre-ic">' + it.icon + '</span><div><b>' + esc(it.title) + '</b><small>' + (it.level ? 'Stufe ' + it.level + '/' + it.levels + ' · ' + esc(it.name) : 'noch nicht freigeschaltet') + '</small></div></div>' + stars + '<small>' + esc(it.desc) + '</small>' + prog + '</article>';
  }
  function html(r) {
    const cats = []; r.items.forEach(i => { if (!cats.includes(i.cat)) cats.push(i.cat); });
    return '<div class="rre"><div class="rre-k">RICOREWI RADIO</div><h1>Radio-Erfolge 🦊</h1>' +
      '<div class="rre-hero"><div class="rre-fox" aria-hidden="true">🦊</div><div style="flex:1;min-width:220px"><b>' + esc(r.rank) + '</b><small>Rang ' + r.rankIndex + ' von ' + RANKS.length + ' · ' + r.points + ' Punkte · ' + r.done + ' von ' + r.total + ' Stufen</small>' +
      '<div class="rre-bar" role="progressbar" aria-label="Fortschritt zum nächsten Rang" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + r.rankPct + '"><i style="width:' + r.rankPct + '%"></i></div>' +
      '<small>' + (r.nextRank ? 'Noch ' + r.toNext + ' Punkte bis „' + esc(r.nextRank) + '“' : 'Höchster Rang erreicht – du bist eine Fuchs-Legende!') + '</small></div></div>' +
      cats.map(c => '<h2>' + esc(c) + '</h2><div class="rre-grid">' + r.items.filter(i => i.cat === c).map(card).join('') + '</div>').join('') +
      '<p class="rre-note">Die Erfolge zählen auf allen deinen Geräten zusammen (Hörzeit, Tage, Favoriten, Songs …). Gezählt wird nur, solange du angemeldet bist.</p></div>';
  }
  function css() {
    if (document.getElementById('rrw-re-css')) return; const s = document.createElement('style'); s.id = 'rrw-re-css';
    s.textContent = '.rre{max-width:1100px;margin:auto;padding:clamp(16px,3vw,32px);color:var(--text,#f4f6ff)}.rre h1{font-size:clamp(28px,5vw,46px);margin:6px 0}.rre-k{font-size:.72rem;letter-spacing:.12em;color:var(--primary,#a58cff)}' +
      '.rre-hero{display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:18px;border-radius:20px;border:1px solid rgba(175,210,255,.2);background:linear-gradient(135deg,rgba(181,124,255,.18),rgba(34,211,238,.12));margin:14px 0 22px}' +
      '.rre-fox{font-size:64px;line-height:1}.rre-hero b{font-size:1.4rem}.rre-hero small{display:block;opacity:.8}.rre-bar{height:10px;border-radius:10px;background:rgba(255,255,255,.14);overflow:hidden;margin:10px 0 4px;min-width:220px}.rre-bar i{display:block;height:100%;min-width:3px;background:linear-gradient(90deg,#b57cff,#22d3ee)}' +
      '.rre h2{margin:22px 0 10px;font-size:1.05rem;opacity:.9}.rre-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}.rre-card{padding:14px;border-radius:16px;border:1px solid rgba(175,210,255,.17);background:rgba(9,23,66,.28)}.rre-card.off{opacity:.62}' +
      '.rre-top{display:flex;gap:10px;align-items:center}.rre-ic{font-size:30px;width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:rgba(255,255,255,.08);flex:none}.rre-card b{display:block}.rre-card small{opacity:.78;font-size:.78rem}' +
      '.rre-st{display:flex;gap:4px;margin:8px 0 2px}.rre-st i{width:18px;height:6px;border-radius:4px;background:rgba(255,255,255,.16)}.rre-st i.on{background:linear-gradient(90deg,#b57cff,#22d3ee)}.rre-note{opacity:.7;font-size:.8rem;margin-top:16px}' +
      '.rre-toast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:2147482000;padding:12px 16px;border-radius:14px;background:#141a2b;color:#f4f6ff;border:1px solid rgba(255,255,255,.18);box-shadow:0 12px 40px rgba(0,0,0,.5);font:14px system-ui,sans-serif;max-width:min(92vw,420px)}';
    document.head.appendChild(s);
  }
  // Beiträge vom Konto (Anzahl eingereicht / veröffentlicht)
  function loadArticles() {
    const t = tok(); if (!t) return Promise.resolve({});
    return fetch('/cms/api.php?action=account_articles', { headers: { Authorization: 'Bearer ' + t } }).then(r => r.ok ? r.json() : null)
      .then(j => { const a = (j && j.articles) || []; return { articles: a.length, published: a.filter(x => x.status === 'published').length }; }).catch(() => ({}));
  }

  var PORTAL = 'https://www.ricorewi-radio.de/', API = PORTAL + 'cms/api.php';
  var LEVELS = [0, 3600, 18000, 72000, 180000];
  function ungz(t) {
    if (String(t).slice(0, 2) !== 'z:') return Promise.resolve(t);
    var bin = atob(t.slice(2)), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    var ds = new DecompressionStream('gzip'), w = ds.writable.getWriter(); w.write(u); w.close();
    return new Response(ds.readable).text();
  }
  function j(m, k) { try { var o = m[k] && m[k].v != null ? JSON.parse(m[k].v) : null; return o; } catch (e) { return null; } }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function streak(days) { var set = {}; days.forEach(function (x) { set[x] = 1; }); var c = 0, d = new Date(); if (!set[dayKey(d)]) d.setDate(d.getDate() - 1); while (set[dayKey(d)]) { c++; d.setDate(d.getDate() - 1); } return c; }
  /** Konto-Dokument { schlüssel: {v,t} } → Zahlen für evaluate(); extra = { articles, published } */
  function statsFromDoc(m, extra) {
    m = m || {}; var s = 0, st = {}, days = {}, n = 0, e = 0, k, shows = 0, i;
    for (k in m) {
      if (k.indexOf('rrw_mein_radio_dev_') !== 0) continue;
      var o = j(m, k); if (!o || typeof o !== 'object') continue;
      s += o.s || 0; for (var x in o.st || {}) st[x] = (st[x] || 0) + o.st[x];
      (o.d || []).forEach(function (d) { days[d] = 1; }); if (o.n) n = 1; if (o.e) e = 1;
    }
    var fav = j(m, 'rrw_favorites_v1'), fs = j(m, 'rrw_favorite_shows_v1'), sg = j(m, 'rrw_mein_radio_song_favs_v1');
    if (fs && typeof fs === 'object') for (k in fs) if (Array.isArray(fs[k])) shows += fs[k].length;
    var lvl = 1; for (i = 0; i < LEVELS.length; i++) if (s >= LEVELS[i]) lvl = i + 1;
    var out = { sec: s, stations: Object.keys(st).length, days: Object.keys(days).length, streak: streak(Object.keys(days)), night: n, early: e,
      stMap: st, favs: Array.isArray(fav) ? fav.length : 0, shows: shows, songs: Array.isArray(sg) ? Math.min(100, sg.length) : 0, card: m.rrw_mein_radio_sendercard_v1 && m.rrw_mein_radio_sendercard_v1.v ? 1 : 0, level: lvl };
    for (k in extra || {}) out[k] = extra[k];
    return out;
  }
  function fetchDoc(token) {
    return root.fetch(API + '?action=saves_get&game=ricorewi-portal', { headers: { Authorization: 'Bearer ' + token } })
      .then(function (r) { if (r.status === 404) return {}; if (!r.ok) throw new Error('doc'); return r.json(); })
      .then(function (r) { return r && typeof r.d === 'string' ? ungz(r.d).then(JSON.parse) : {}; });
  }
  function fetchArticles(token) {
    return root.fetch(API + '?action=account_articles', { headers: { Authorization: 'Bearer ' + token } }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (r) { var a = (r && r.articles) || []; return { articles: a.length, published: a.filter(function (x) { return x.status === 'published'; }).length }; }).catch(function () { return {}; });
  }
  /** Holt Konto-Dokument + Beiträge und liefert evaluate()-Ergebnis */
  function load(token) { return Promise.all([fetchDoc(token), fetchArticles(token)]).then(function (a) { return evaluate(statsFromDoc(a[0], a[1])); }); }
  root.RRWErfolge = { evaluate: evaluate, DEFS: DEFS, RANKS: RANKS, statsFromDoc: statsFromDoc, load: load, html: html, css: css, fetchDoc: fetchDoc, fetchArticles: fetchArticles, ungz: ungz };
})(window);
