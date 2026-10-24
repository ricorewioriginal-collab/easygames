/* AnMaCha Spiele-Hub – die komplette Spieleseite als eigene, native Seite (kein iframe) für easygames, RicoReWi Radio, RicoReWi und jede Seite, die easygames einbindet.
 *
 *   <div id="spiele"></div>
 *   <script src="https://ricorewioriginal-collab.github.io/easygames/hub/anmacha-hub.js"></script>
 *   AnMaChaHub.mount('#spiele', { theme: { accent: '#b57cff', card: '#0f1538', text: '#e0e0e0', muted: '#9aa5bd', radius: '16px', font: 'inherit' } });
 *   (oder <div data-anmacha-hub></div> – wird automatisch gefüllt)
 *
 * Aussehen: Farben, Schrift und Rundungen kommen von der Seite (CSS-Variablen --egh-*, Standard: erbt von der Seite). Inhalt: Suche, Kategorien, Favoriten, Weiterspielen,
 * Spiel des Tages und alle Spiele aus sync/catalog.json (immer der aktuelle Stand). Gespielt wird im Vollbild-Fenster dieser Seite.
 * Echtzeit: Die Spieleliste prüft alle 60 s ihre Version (neue/geänderte Spiele erscheinen ohne Neuladen); Favoriten und „Weiterspielen“ gleichen sich mit dem Konto ab
 * (eigener Server, Format wie anmacha-cloud.js, Spiel „home“; Versions-Abfrage alle 45 s nur bei sichtbarer Seite) und folgen sofort jedem anderen Gerät/Tab. */
(function (root) {
  'use strict';
  // Sprachausgabe für eingebettete Spiele: Chrome spricht in fremden iframes oft nicht – das Spiel (cloud/anmacha-cloud.js)
  // schickt seine Ansagen per 'eg-tts' hierher, diese Seite spricht sie. Nur für easygames-Spiele (GitHub Pages oder eigene Adresse).
  (function egTtsHost() {
    var s = window.speechSynthesis;
    if (!s || window.__egTtsHost || !window.SpeechSynthesisUtterance) return;
    window.__egTtsHost = 1;
    var live = {}, lastCancel = 0, wait = [], timer = 0;
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || d.type !== 'eg-tts' || !e.source || (e.origin !== 'https://ricorewioriginal-collab.github.io' && e.origin !== location.origin)) return;
      var src = e.source, origin = e.origin, reply = function (m) { m.type = 'eg-tts'; try { src.postMessage(m, origin); } catch (x) { } };
      if (d.op === 'hello') return reply({ op: 'host' });
      if (d.op === 'cancel') { live = {}; wait = []; clearTimeout(timer); timer = 0; lastCancel = Date.now(); try { s.cancel(); } catch (x) { } return; }
      if (d.op !== 'speak' || !d.id) return;
      var u = new SpeechSynthesisUtterance(String(d.text || '').slice(0, 1500)), id = String(d.id).slice(0, 20);
      u.lang = String(d.lang || '').slice(0, 20); u.rate = +d.rate || 1; u.pitch = +d.pitch || 1; u.volume = d.volume == null ? 1 : +d.volume;
      try { var v = d.voice && s.getVoices().filter(function (x) { return x.name === d.voice; })[0]; if (v) { u.voice = v; u.lang = v.lang; } } catch (x) { }
      live[id] = u;
      u.onstart = function () { reply({ op: 'ev', id: id, kind: 'start' }); };
      u.onend = function () { delete live[id]; reply({ op: 'ev', id: id, kind: 'end' }); };
      u.onerror = function (ev) { delete live[id]; reply({ op: 'ev', id: id, kind: 'error', error: ev && ev.error || '' }); };
      // Chrome für Android verschluckt eine Ansage direkt nach cancel(): kurz warten, Reihenfolge bleibt
      var go = function () { try { if (s.paused) s.resume(); s.speak(u); } catch (x) { } }, ms = 260 - (Date.now() - lastCancel);
      if (ms > 0 || wait.length) { wait.push(go); if (!timer) timer = setTimeout(function () { timer = 0; var l = wait; wait = []; l.forEach(function (f) { f(); }); }, Math.max(0, ms)); } else go();
    });
  })();
  if (root.AnMaChaHub) return;
  var doc = root.document, LS = null;
  try { LS = root.localStorage; } catch (e) { LS = null; }
  var cs = doc.currentScript, EG = 'https://ricorewioriginal-collab.github.io/easygames/';
  if (cs && /\/hub\/anmacha-hub\.js/.test(cs.src || '')) EG = cs.src.replace(/hub\/anmacha-hub\.js.*$/, '');
  var HOST = root.location.hostname, PORTAL = 'https://www.ricorewi-radio.de/';
  var API = /(^|\.)ricorewi-radio\.de$/.test(HOST) ? '/cms/api.php' : PORTAL + 'cms/api.php';
  var FAV = 'eg-fav', REC = 'eg-recent', TK = 'eg-hub-t', GAME = 'home';
  var CSS = '.egh{--a:var(--egh-accent,#b57cff);--a2:var(--egh-accent2,#22d3ee);--c:var(--egh-card,rgba(255,255,255,.07));--t:var(--egh-text,inherit);--m:var(--egh-muted,rgba(255,255,255,.62));--r:var(--egh-radius,16px);--l:var(--egh-line,rgba(255,255,255,.12));font-family:var(--egh-font,inherit);color:var(--t);position:relative}' +
    '.egh *{box-sizing:border-box}.egh button{font:inherit;color:inherit;cursor:pointer}.egh [hidden]{display:none!important}' +
    '.egh-bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:0 0 14px}.egh-s{flex:1;min-width:200px;height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--l);background:var(--c);color:inherit;font:inherit}' +
    '.egh-s:focus{outline:2px solid var(--a2);outline-offset:1px}.egh-n{color:var(--m);font-size:.9rem}' +
    '.egh-chips{display:flex;gap:8px;overflow-x:auto;padding:2px 0 8px;margin:0 0 14px;scrollbar-width:none}.egh-chips::-webkit-scrollbar{display:none}' +
    '.egh-chip{flex:none;display:inline-flex;gap:6px;align-items:center;padding:9px 14px;border-radius:999px;border:1px solid var(--l);background:var(--c);font-weight:600;font-size:.88rem;white-space:nowrap}' +
    '.egh-chip small{opacity:.7;font-weight:700}.egh-chip[aria-pressed=true]{background:linear-gradient(135deg,var(--a),var(--a2));color:#0a0a12;border-color:transparent}' +
    '.egh-hero{display:grid;grid-template-columns:1.2fr 1fr;gap:0;border-radius:calc(var(--r) + 4px);overflow:hidden;border:1px solid var(--l);margin:0 0 20px;background:var(--c);min-height:230px;max-height:340px}' +
    '.egh-hero-i{min-height:200px;max-height:340px;overflow:hidden;background-size:cover;background-position:center;display:grid;place-items:center;font-size:84px}.egh-hero-i img{width:100%;height:100%;object-fit:cover;display:block}' +
    '.egh-hero-b{padding:22px;display:flex;flex-direction:column;gap:10px;justify-content:center}.egh-eyebrow{color:var(--a2);font-weight:800;letter-spacing:.12em;font-size:.72rem;text-transform:uppercase}' +
    '.egh-hero-b h3{margin:0;font-size:clamp(1.3rem,3.2vw,2rem);line-height:1.15}.egh-hero-b p{margin:0;color:var(--m);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
    '.egh-play{align-self:flex-start;padding:11px 22px;border-radius:999px;border:0;background:linear-gradient(135deg,var(--a),var(--a2));color:#0a0a12;font-weight:800}' +
    '.egh h4{margin:18px 0 10px;font-size:1.05rem}.egh-row{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;scrollbar-width:thin}.egh-row .egh-it{flex:0 0 150px}' +
    '.egh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px}' +
    '.egh-it{position:relative;min-width:0;display:flex}.egh-card{position:relative;display:flex;flex-direction:column;width:100%;min-width:0;height:100%;margin:0;color:inherit;font:inherit;text-transform:none;letter-spacing:normal;text-align:left;padding:0;border-radius:var(--r);overflow:hidden;border:1px solid var(--l);background:var(--c);transition:transform .15s,border-color .15s}' +
    '.egh-card:hover,.egh-card:focus-visible{transform:translateY(-3px);border-color:var(--a);outline:none}' +
    '.egh-ci{width:100%;aspect-ratio:1/1;display:grid;place-items:center;font-size:52px;background-size:cover;background-position:center}.egh-ci img{width:100%;height:100%;object-fit:cover;display:block}.egh-ci img.egh-wide{object-fit:contain;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))}' +
    '.egh-cb{display:block;flex:1;padding:10px 12px 12px}.egh-cb b{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:.95rem;line-height:1.25;min-height:2.5em;overflow:hidden;overflow-wrap:anywhere}.egh-cb span{color:var(--m);font-size:.78rem}' +
    '.egh-heart{position:absolute;top:8px;right:8px;width:34px;height:34px;padding:0;margin:0;min-width:0;line-height:1;border-radius:50%;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:17px;display:grid;place-items:center}.egh-heart[aria-pressed=true]{color:#ff5c8a}' +
    '.egh-empty{padding:30px;text-align:center;color:var(--m)}.egh-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:2147483000;padding:10px 18px;border-radius:999px;background:#161d30;color:#fff;border:1px solid var(--l,#333);box-shadow:0 10px 30px rgba(0,0,0,.4);font:600 14px system-ui}' +
    '.egh-pl{position:fixed;inset:0;z-index:2147482500;background:#000;display:flex;flex-direction:column}.egh-pl[hidden]{display:none}' +
    '.egh-pl-h{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#0b0e1a;color:#fff;font:600 15px system-ui}.egh-pl-h span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.egh-pl-h button{border:0;border-radius:10px;padding:8px 14px;background:rgba(255,255,255,.12);color:#fff;font:600 14px system-ui;cursor:pointer}.egh-pl iframe{flex:1;border:0;width:100%;background:#000}' +
    '@media(max-width:700px){.egh-hero{grid-template-columns:1fr;max-height:none}.egh-hero-i{min-height:140px;max-height:190px}.egh-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function get(k, d) { try { var v = JSON.parse(LS.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function setLocal(k, v) { try { LS.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) { } }
  function tmap() { return get(TK, {}); }
  function touch(k) { var t = tmap(); t[k] = Date.now(); setLocal(TK, t); }
  function short(t) { return String(t || '').split(/\s[–-]\s/)[0]; }
  function loadScript(src) { return new Promise(function (res) { var s = doc.createElement('script'); s.src = src; s.onload = function () { res(true); }; s.onerror = function () { res(false); }; doc.head.appendChild(s); }); }
  function css() { if (doc.getElementById('egh-css')) return; var s = doc.createElement('style'); s.id = 'egh-css'; s.textContent = CSS; doc.head.appendChild(s); }

  /* ───────── Daten (Spieleliste live) ───────── */
  var S = { games: [], ver: '', q: '', cat: '', cats: null, mounts: [], pl: null, share: undefined, cur: null, prev: null };
  /* Teilen-Link je Spiel: eingebundene Seiten teilen ihre eigene Adresse (Standard: diese Seite + #games/<id>, z. B. https://www.ricorewi-radio.de/#games/zotik).
   * mount(…, { share: 'https://meine-seite.de/spiele/{id}' }) eigene Vorlage, share: 'preview' = easygames-Vorschauseite mit Bild, die zu dieser Seite weiterleitet,
   * share: false = easygames-Vorschauseite (zum Spiel auf easygames). Vorschaubild je Spiel: AnMaChaHub.preview(id) bzw. <easygames>/share/<id>.jpg (1200×630). Die Adresse geht als ?eg_share an das Spiel
   * (dessen eigene Teilen-Knöpfe nutzen sie dann auch); #games/<id> beim Aufruf öffnet das Spiel direkt. */
  function pageBase() { return root.location.href.split('#')[0]; }
  function shareUrl(g) {
    var t = S.share;
    if (g.external || /^https?:/.test(g.path)) return g.path;
    if (typeof t === 'function') { try { var r = t(g); if (r) return String(r); } catch (e) { } }
    if (t === false || t === 'false' || (t == null && pageBase().indexOf(EG) === 0)) return new URL('share/' + g.id + '.html', EG).href;
    if (t === 'preview') return new URL('share/' + g.id + '.html', EG).href + '?to=' + encodeURIComponent(pageBase() + '#games/' + encodeURIComponent(g.id));
    if (typeof t === 'string' && t && t !== 'auto') return t.replace(/\{id\}/g, encodeURIComponent(g.id));
    return pageBase() + '#games/' + encodeURIComponent(g.id);
  }
  // Adresszeile zeigt #games/<id>, solange ein Spiel offen ist (nicht auf easygames selbst, nicht mit hash: false / share: false)
  function ownHash(g) { return S.hash === false || S.share === false || S.share === 'false' || pageBase().indexOf(EG) === 0 ? null : '#games/' + encodeURIComponent(g.id); }
  function setHash(h) { try { root.history.replaceState(root.history.state, '', root.location.pathname + root.location.search + h); } catch (e) { } }
  function shareCur(btn) {
    var g = S.cur; if (!g) return; var url = shareUrl(g), title = short(g.title), nav = root.navigator;
    if (nav.share && /Android|iPhone|iPad|Mobile/i.test(nav.userAgent || '')) { nav.share({ title: title, text: title + ' – jetzt kostenlos spielen', url: url }).catch(function () { }); return; }
    function ok() { var t = btn.textContent; btn.textContent = '✓ Link kopiert'; setTimeout(function () { btn.textContent = t; }, 1600); }
    function ask() { root.prompt('Link zum Teilen:', url); }
    if (nav.clipboard && nav.clipboard.writeText) nav.clipboard.writeText(url).then(ok, ask); else ask();
  }
  function deep() {
    var m = /^#games\/([\w-]+)/.exec(root.location.hash); if (!m || !S.games.length) return;
    if (S.pl && !S.pl.hidden && S.cur && S.cur.id === m[1]) return;
    if (S.games.some(function (x) { return x.id === m[1]; })) open(m[1]);
  }
  function fetchJSON(u) { return root.fetch(u, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function loadCatalog() {
    return Promise.all([fetchJSON(EG + 'sync/catalog.json?_=' + Date.now()), fetchJSON(EG + 'sync/manifest.json?_=' + Date.now()).catch(function () { return {}; })]).then(function (r) {
      S.games = (r[0].games || []).filter(function (g) { return g && g.id && g.path; }); S.ver = r[1].version || '';
    });
  }
  function loadCats() {
    if (root.EASYGAMES_CATS) { S.cats = root.EASYGAMES_CATS; return Promise.resolve(); }
    return loadScript(EG + 'categories.js').then(function () { S.cats = root.EASYGAMES_CATS || { list: [], of: {} }; });
  }
  function catOf(g) { return (S.cats && S.cats.of && S.cats.of[g.id]) || ''; }
  function checkLive() {
    if (doc.hidden || !S.mounts.length) return;
    fetchJSON(EG + 'sync/manifest.json?_=' + Date.now()).then(function (m) {
      if (!m.version || !S.ver || m.version === S.ver) return;
      return loadCatalog().then(function () { renderAll(); toast('Spieleliste aktualisiert'); });
    }).catch(function () { });
  }
  function toast(t) { var e = doc.createElement('div'); e.className = 'egh-toast'; e.textContent = t; doc.body.appendChild(e); setTimeout(function () { e.remove(); }, 2600); }

  /* ───────── Favoriten & Weiterspielen (mit Konto, Echtzeit) ───────── */
  function favs() { var a = get(FAV, []); return Array.isArray(a) ? a : []; }
  function recents() { var a = get(REC, []); return Array.isArray(a) ? a : []; }
  function toggleFav(id) { var a = favs(), i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); setLocal(FAV, a); touch(FAV); renderAll(); queuePush(); }
  function remember(id) { setLocal(REC, [id].concat(recents().filter(function (x) { return x !== id; })).slice(0, 8)); touch(REC); queuePush(); }
  var sync = { ver: '', busy: false, timer: 0, seen: '' };
  function acc() { try { return (root.AnMaChaAccount && root.AnMaChaAccount.token && root.AnMaChaAccount.token()) || LS.getItem('anmacha-rating-token') || ''; } catch (e) { return ''; } }   // Konto-Token (anmacha-account.js); gleicher Speicherplatz
  function b64(t) { var a = atob(t), u = new Uint8Array(a.length), i; for (i = 0; i < a.length; i++) u[i] = a.charCodeAt(i); return u; }
  function ungz(t) {
    if (t.slice(0, 2) !== 'z:') return Promise.resolve(t);
    if (!root.DecompressionStream) return Promise.reject(new Error('gz'));
    var ds = new root.DecompressionStream('gzip'), w = ds.writable.getWriter(); w.write(b64(t.slice(2))); w.close();
    return new root.Response(ds.readable).text();
  }
  function remoteGet(tok) {
    return root.fetch(API + '?action=saves_get&game=' + GAME, { headers: { Authorization: 'Bearer ' + tok } }).then(function (r) {
      if (r.status === 404) return { obj: {}, ver: '' };
      if (!r.ok) throw new Error('get ' + r.status);
      return r.json().then(function (j) { return ungz(j.d).then(function (d) { return { obj: JSON.parse(d) || {}, ver: j.ver || '' }; }); });
    });
  }
  function syncNow() {
    var tok = acc(); if (!tok || sync.busy) return Promise.resolve();
    sync.busy = true;
    return remoteGet(tok).then(function (r) {
      var obj = r.obj, t = tmap(), dirty = false, changed = false;
      [FAV, REC].forEach(function (k) {
        var rk = obj[k], lv = LS.getItem(k), lt = t[k] || 0;
        if (rk && rk.t > lt) { if (rk.v !== lv) { setLocal(k, rk.v == null ? '[]' : rk.v); changed = true; } t[k] = rk.t; }
        else if (lv != null && lt > ((rk && rk.t) || 0)) { obj[k] = { v: lv, t: lt }; dirty = true; }
      });
      setLocal(TK, t);
      var p = dirty ? root.fetch(API + '?action=saves_put', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: JSON.stringify({ game: GAME, d: JSON.stringify(obj), t: Date.now(), pre: r.ver }) })
        .then(function (x) { if (x.status === 409) { sync.busy = false; return syncNow(); } if (x.ok) return x.json().then(function (j) { sync.ver = j.ver || ''; }); }) : Promise.resolve(sync.ver = r.ver);
      return p.then(function () { if (changed) renderAll(); });
    }).catch(function () { }).then(function () { sync.busy = false; });
  }
  function queuePush() { clearTimeout(sync.timer); sync.timer = setTimeout(syncNow, 2500); }
  function pollRemote() {   // winzige Versions-Abfrage; bei fremdem Stand sofort voller Abgleich
    var tok = acc(); if (!tok || doc.hidden || sync.busy) return;
    root.fetch(API + '?action=saves_ver&game=' + GAME, { headers: { Authorization: 'Bearer ' + tok } }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ver && j.ver !== sync.ver) syncNow(); }).catch(function () { });
  }
  function watchLocal() {   // Änderungen aus anderen Tabs/Skripten sofort übernehmen
    var sig = LS ? (LS.getItem(FAV) || '') + '|' + (LS.getItem(REC) || '') : '';
    if (sig !== sync.seen) { sync.seen = sig; renderAll(); }
  }

  /* ───────── Oberfläche ───────── */
  function cardHtml(g) {
    var isF = favs().indexOf(g.id) >= 0, img = g.img ? '<img src="' + esc(EG + g.img) + '" alt="" loading="lazy" decoding="async">' : esc(g.icon || '🎮');
    var c = (S.cats && S.cats.list || []).filter(function (x) { return x.id === catOf(g); })[0];
    return '<div class="egh-it"><button class="egh-card" type="button" data-play="' + esc(g.id) + '" aria-label="' + esc(short(g.title)) + ' spielen">' +
      '<span class="egh-ci" style="background-image:' + esc(g.bg || 'none') + '">' + img + '</span>' +
      '<span class="egh-cb"><b>' + esc(short(g.title)) + '</b><span>' + esc(c ? c.icon + ' ' + c.short : '🎮 Spiel') + (g.multiplayer ? ' · 👥' : '') + '</span></span></button>' +
      '<button class="egh-heart" type="button" data-fav="' + esc(g.id) + '" aria-pressed="' + isF + '" aria-label="' + (isF ? 'Aus Favoriten entfernen' : 'Zu Favoriten') + '">' + (isF ? '♥' : '♡') + '</button></div>';
  }
  function dayPick() { var d = new Date(), n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate(); return S.games.length ? S.games[n % S.games.length] : null; }
  function render(m) {
    var f = favs(), q = S.q.trim().toLowerCase(), list = S.games.filter(function (g) {
      if (S.cat === '__fav') { if (f.indexOf(g.id) < 0) return false; } else if (S.cat && catOf(g) !== S.cat) return false;
      return !q || (g.title + ' ' + (g.desc || '')).toLowerCase().indexOf(q) >= 0;
    });
    var counts = {}; S.games.forEach(function (g) { var c = catOf(g); counts[c] = (counts[c] || 0) + 1; });
    var chips = '<button class="egh-chip" type="button" data-cat="" aria-pressed="' + (S.cat === '') + '">🎮 Alle <small>' + S.games.length + '</small></button>' +
      '<button class="egh-chip" type="button" data-cat="__fav" aria-pressed="' + (S.cat === '__fav') + '">♥ Favoriten <small>' + f.filter(function (id) { return S.games.some(function (g) { return g.id === id; }); }).length + '</small></button>' +
      (S.cats && S.cats.list || []).map(function (c) { return '<button class="egh-chip" type="button" data-cat="' + c.id + '" aria-pressed="' + (S.cat === c.id) + '">' + c.icon + ' ' + esc(c.short) + ' <small>' + (counts[c.id] || 0) + '</small></button>'; }).join('');
    var hero = '', pick = !q && !S.cat ? dayPick() : null;
    if (pick) hero = '<section class="egh-hero"><div class="egh-hero-i" style="background-image:' + esc(pick.img ? 'none' : (pick.bg || 'none')) + '">' + (pick.img ? '<img src="' + esc(EG + pick.img) + '" alt="">' : esc(pick.icon || '🎮')) + '</div>' +
      '<div class="egh-hero-b"><span class="egh-eyebrow">Spiel des Tages</span><h3>' + esc(short(pick.title)) + '</h3><p>' + esc(pick.desc || '') + '</p><button class="egh-play" type="button" data-play="' + esc(pick.id) + '">▶ Jetzt spielen</button></div></section>';
    var rec = '', rl = !q && !S.cat ? recents().map(function (id) { return S.games.filter(function (g) { return g.id === id; })[0]; }).filter(Boolean) : [];
    if (rl.length) rec = '<h4>Weiterspielen</h4><div class="egh-row">' + rl.map(cardHtml).join('') + '</div>';
    var title = S.cat === '__fav' ? 'Meine Favoriten' : S.cat ? ((S.cats.list.filter(function (c) { return c.id === S.cat; })[0] || {}).label || '') : 'Alle Spiele';
    m.el.innerHTML = '<div class="egh"><div class="egh-bar"><input class="egh-s" type="search" placeholder="Spiel suchen …" aria-label="Spiel suchen" value="' + esc(S.q) + '" autocomplete="off"><span class="egh-n">' + list.length + ' Spiele</span></div>' +
      '<div class="egh-chips" role="group" aria-label="Kategorien">' + chips + '</div>' + hero + rec + '<h4>' + esc(title) + '</h4>' +
      (list.length ? '<div class="egh-grid">' + list.map(cardHtml).join('') + '</div>' : '<div class="egh-empty">' + (S.cat === '__fav' ? 'Noch keine Favoriten – tippe auf ♡ bei einem Spiel.' : 'Nichts gefunden.') + '</div>') + '</div>';
    var root0 = m.el.firstChild, th = m.theme || {};
    Object.keys(th).forEach(function (k) { root0.style.setProperty('--egh-' + k, th[k]); });
    var inp = m.el.querySelector('.egh-s');
    inp.addEventListener('input', function () { S.q = inp.value; var pos = inp.selectionStart; renderAll(); var n = m.el.querySelector('.egh-s'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } });
  }
  function renderAll() { S.mounts.forEach(render); }

  /* ───────── Spielen im Vollbild-Fenster dieser Seite ───────── */
  function player() {
    if (S.pl) return S.pl;
    var d = doc.createElement('div'); d.className = 'egh-pl'; d.hidden = true; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="egh-pl-h"><span></span><button type="button" data-sh>📤 Teilen</button><button type="button" data-fs>⛶ Vollbild</button><button type="button" data-x>✕ Schließen</button></div><iframe allow="fullscreen; autoplay; gamepad; accelerometer; gyroscope; microphone; camera; clipboard-write; web-share; screen-wake-lock" allowfullscreen title="Spiel"></iframe>';
    doc.body.appendChild(d);
    d.querySelector('[data-x]').onclick = close;
    d.querySelector('[data-sh]').onclick = function () { shareCur(this); };
    d.querySelector('[data-fs]').onclick = function () { try { (d.requestFullscreen || d.webkitRequestFullscreen).call(d); } catch (e) { } };
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !d.hidden && !doc.fullscreenElement) close(); });
    root.addEventListener('message', function (e) { if (e.source === d.querySelector('iframe').contentWindow && e.data && (e.data.type === 'easygames:close' || e.data === 'easygames:close')) close(); });
    S.pl = d; return d;
  }
  function open(id) {
    var g = S.games.filter(function (x) { return x.id === id; })[0]; if (!g) return;
    var d = player(), u = new URL(g.path, EG), link = shareUrl(g), h = ownHash(g); if (root.EASYGAMES_BUILD) u.searchParams.set('eg_build', root.EASYGAMES_BUILD);
    if (link.indexOf(EG) !== 0) u.searchParams.set('eg_share', link);
    S.cur = g;
    if (h && root.location.hash !== h) { if (S.prev == null) S.prev = root.location.hash; setHash(h); } else if (h && S.prev == null) S.prev = h.replace(/\/[^\/]*$/, '');
    d.querySelector('span').textContent = short(g.title);
    d.querySelector('iframe').setAttribute('src', u.href);   // easygames-iframe: die Seite reicht das Konto weiter (angemeldet im Spiel)
    d.hidden = false; doc.documentElement.style.overflow = 'hidden'; remember(id); renderAll();
  }
  function close() { if (!S.pl) return; S.pl.hidden = true; S.cur = null; if (S.prev != null) { setHash(S.prev); S.prev = null; } S.pl.querySelector('iframe').setAttribute('src', 'about:blank'); doc.documentElement.style.overflow = ''; if (doc.fullscreenElement) try { doc.exitFullscreen(); } catch (e) { } }

  function mount(target, o) {
    css(); o = o || {};
    var el = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!el || el.__egh) return null;
    var m = el.__egh = { el: el, theme: o.theme || {} }; S.mounts.push(m);
    if ('share' in o) S.share = o.share; else if (el.getAttribute && el.getAttribute('data-share') != null) S.share = el.getAttribute('data-share');
    if ('hash' in o) S.hash = o.hash;
    // Breite Kartenbilder (z. B. 1200×630) nicht beschneiden: ganz zeigen, Spielfarbe als Hintergrund
    el.addEventListener('load', function (e) { var i = e.target; if (i.tagName === 'IMG' && i.parentNode && i.parentNode.classList.contains('egh-ci') && i.naturalWidth > i.naturalHeight * 1.25) i.classList.add('egh-wide'); }, true);
    el.addEventListener('click', function (e) {
      var h = e.target.closest('[data-fav]'), p = e.target.closest('[data-play]'), c = e.target.closest('[data-cat]');
      if (h) { e.stopPropagation(); toggleFav(h.dataset.fav); } else if (p) open(p.dataset.play); else if (c) { S.cat = c.dataset.cat; renderAll(); }
    });
    el.innerHTML = '<div class="egh"><div class="egh-empty">Spiele werden geladen …</div></div>';
    (S.games.length ? Promise.resolve() : Promise.all([loadCatalog(), loadCats()])).then(function () { render(m); deep(); sync.seen = (LS.getItem(FAV) || '') + '|' + (LS.getItem(REC) || ''); syncNow(); })
      .catch(function () { el.innerHTML = '<div class="egh"><div class="egh-empty">Die Spieleliste ist gerade nicht erreichbar. <a href="' + esc(EG) + '" target="_blank" rel="noopener" style="color:inherit">Zu easygames</a></div></div>'; });
    return m;
  }
  setInterval(checkLive, 60000); setInterval(pollRemote, 45000); setInterval(watchLocal, 2000);
  doc.addEventListener('visibilitychange', function () { if (!doc.hidden) { checkLive(); pollRemote(); } });
  root.addEventListener('storage', function (e) { if (e.key === FAV || e.key === REC) renderAll(); });
  root.addEventListener('hashchange', deep);
  root.addEventListener('anmacha-account-changed', function () { sync.ver = ''; syncNow(); });
  function auto() { [].forEach.call(doc.querySelectorAll('[data-anmacha-hub]'), function (el) { mount(el); }); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', auto); else auto();
  root.AnMaChaHub = { mount: mount, open: open, base: EG, preview: function (id) { var g = S.games.filter(function (x) { return x.id === id; })[0]; return g ? { title: short(g.title), desc: g.desc || '', image: new URL('share/' + g.id + '.jpg', EG).href, page: new URL('share/' + g.id + '.html', EG).href } : null; }, shareUrl: function (id) { var g = S.games.filter(function (x) { return x.id === id; })[0]; return g ? shareUrl(g) : null; } };
})(window);
