/* Öffentliche Profile 🙂 und Nutzerliste (radio-profil.html, Portal-Seite „#profil“/„#nutzer“, Apps). Nur wer angemeldet ist, kann ein Profil anlegen; ansehen darf es jede Person.
 * Alles ist freiwillig und je Bereich schaltbar. Die Zahlen kommen aus dem eigenen Konto (Dokumente „ricorewi-portal“ und „home“ auf dem Server, wie radio-erfolge.js) und werden beim Speichern
 * als Schnappschuss veröffentlicht; der Server prüft nur Form, Länge und Links (cms/lib/profiles.php). Braucht cloud/radio-erfolge.js (window.RRWErfolge). */
(function (root) {
  'use strict';
  var doc = root.document, HOST = (root.location && root.location.hostname) || '';
  var PORTAL = 'https://www.ricorewi-radio.de/', HOME = 'https://ricorewioriginal-collab.github.io/easygames/';
  var API = /(^|\.)(ricorewi-radio|senderwelt)\.de$/.test(HOST) ? '/cms/api.php' : PORTAL + 'cms/api.php';
  var SECTIONS = [['games', 'Top-3-Spiele'], ['gach', 'Spiele-Erfolge'], ['stations', 'Top-3-Radiosender'], ['songs', 'Lieblingssongs'], ['top', 'Meistgehört'], ['time', 'Radio-Hörzeit'], ['rach', 'Radio-Erfolge']];
  var SOCIAL = [['instagram', 'Instagram', '@name'], ['tiktok', 'TikTok', '@name'], ['youtube', 'YouTube', '@kanal'], ['x', 'X', '@name'], ['twitch', 'Twitch', 'name'], ['facebook', 'Facebook', 'name'], ['website', 'Website', 'https://…']];
  var AVATARS = ['🦊', '🎧', '🎮', '🎵', '🌙', '⭐', '🔥', '🚀', '🐼', '🦁', '🐙', '🎸'];
  var NICE = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', x: 'X', twitch: 'Twitch', facebook: 'Facebook', website: 'Website' };

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function dur(sec) { sec = Math.max(0, Math.round(sec || 0)); var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return h ? h + ' Std. ' + m + ' Min.' : m + ' Min.'; }
  function safeUrl(u) { return /^https:\/\/[^\s"'<>]+$/.test(String(u || '')) ? String(u) : ''; }

  function css() {
    if (doc.getElementById('rrw-pf-css')) return; var s = doc.createElement('style'); s.id = 'rrw-pf-css';
    s.textContent = '.rrp{max-width:1000px;margin:auto;padding:clamp(16px,3vw,30px);color:var(--text,#f4f6ff)}.rrp h1{font-size:clamp(26px,5vw,42px);margin:6px 0}.rrp-k{font-size:.72rem;letter-spacing:.12em;color:var(--primary,#a58cff)}' +
      '.rrp-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.rrp-tabs button,.rrp-btn{border:1px solid rgba(175,210,255,.25);background:rgba(255,255,255,.07);color:inherit;border-radius:12px;padding:9px 15px;font:600 14px system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-block}' +
      '.rrp-tabs button.on,.rrp-btn.pri{background:linear-gradient(135deg,#b57cff,#22d3ee);border-color:transparent;color:#fff}.rrp-btn.danger{border-color:#f28b82;color:#f28b82}' +
      '.rrp-card{padding:14px;border-radius:16px;border:1px solid rgba(175,210,255,.17);background:rgba(9,23,66,.28);margin:12px 0}.rrp-card h2{font-size:1rem;margin:0 0 8px}.rrp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}' +
      '.rrp-hero{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:18px;border-radius:20px;border:1px solid rgba(175,210,255,.2);background:linear-gradient(135deg,rgba(181,124,255,.18),rgba(34,211,238,.12));margin:12px 0}' +
      '.rrp-av{font-size:54px;line-height:1;width:84px;height:84px;display:grid;place-items:center;border-radius:24px;background:rgba(255,255,255,.1);flex:none}.rrp-hero b{font-size:1.5rem;display:block}.rrp small,.rrp .mut{opacity:.75}' +
      '.rrp-soc{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.rrp-soc a{border:1px solid rgba(175,210,255,.3);border-radius:99px;padding:5px 12px;color:inherit;text-decoration:none;font-size:13px}' +
      '.rrp ul{margin:0;padding-left:20px}.rrp li{margin:3px 0}.rrp a.l{color:inherit}.rrp-bar{height:8px;border-radius:8px;background:rgba(255,255,255,.14);overflow:hidden;margin:6px 0}.rrp-bar i{display:block;height:100%;background:linear-gradient(90deg,#b57cff,#22d3ee)}' +
      '.rrp label{display:block;margin:10px 0 3px;font-size:13px;opacity:.85}.rrp input[type=text],.rrp textarea,.rrp select{width:100%;padding:9px 11px;border-radius:10px;border:1px solid rgba(175,210,255,.3);background:rgba(0,0,0,.25);color:inherit;font:inherit}' +
      '.rrp .chk{display:flex;gap:8px;align-items:center;margin:6px 0}.rrp .chk input{width:20px;height:20px;accent-color:#b57cff}.rrp-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0 14px}' +
      '.rrp-msg{min-height:20px;font-size:13px;margin:8px 0}.rrp-msg.err{color:#f28b82}.rrp-msg.ok{color:#81c995}.rrp-item{display:block;text-decoration:none;color:inherit;cursor:pointer;text-align:left;font:inherit}.rrp-item .rrp-av{width:44px;height:44px;font-size:26px;border-radius:12px}' +
      '.rrp-row{display:flex;gap:10px;align-items:center}.rrp-row div{min-width:0}.rrp-row b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';
    doc.head.appendChild(s);
  }
  function call(action, o) {
    o = o || {}; var h = {}; if (o.token) h.Authorization = 'Bearer ' + o.token; if (o.body) h['Content-Type'] = 'application/json';
    return root.fetch(API + '?action=' + action + (o.qs ? '&' + o.qs : ''), { method: o.body ? 'POST' : 'GET', headers: h, body: o.body ? JSON.stringify(o.body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.http = r.status; return j; }); });
  }

  /* ───────── Eigene Zahlen aus dem Konto ───────── */
  var cat = null;
  function catalog(url) {
    if (cat) return cat;
    cat = root.fetch(url || (HOME + 'sync/catalog.json')).then(function (r) { return r.ok ? r.json() : { games: [] }; }).then(function (c) { var m = {}; (c.games || []).forEach(function (g) { m[g.id] = g; }); return m; }).catch(function () { return {}; });
    return cat;
  }
  function stationName(id) {
    return root.fetch('https://api.laut.fm/station/' + encodeURIComponent(id)).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { return (j && (j.display_name || j.name)) || id; }).catch(function () { return id; });
  }
  function docVal(m, k) { try { return m && m[k] && m[k].v != null ? JSON.parse(m[k].v) : null; } catch (e) { return null; } }
  /** Zahlen aus den Konto-Dokumenten: { games, gach, stations, songs, top, sec, rach, counts } (alles Schnappschuss für den Server). */
  function collect(token, o) {
    var R = root.RRWErfolge; if (!R || !R.fetchDoc) return Promise.reject(new Error('Die Erfolge-Bausteine fehlen.'));
    return Promise.all([R.fetchDoc(token), root.fetch(API + '?action=saves_get&game=home', { headers: { Authorization: 'Bearer ' + token } }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { return j && typeof j.d === 'string' ? R.ungz(j.d).then(JSON.parse) : {}; }).catch(function () { return {}; }), R.fetchArticles(token), catalog(o && o.catalogUrl)]).then(function (a) {
      var portal = a[0] || {}, home = a[1] || {}, cm = a[3] || {}, stats = R.statsFromDoc(portal, a[2]), ev = R.evaluate(stats);
      var ids = docVal(portal, 'rrw_favorites_v1'), songs = docVal(portal, 'rrw_mein_radio_song_favs_v1'), fav = docVal(home, 'eg-fav') || docVal(home, 'eg-recent') || [], ach = docVal(home, 'eg-ach') || {};
      ids = Array.isArray(ids) ? ids.map(String) : []; songs = Array.isArray(songs) ? songs : [];
      var games = (Array.isArray(fav) ? fav : []).filter(function (id) { return cm[id]; }).slice(0, 3).map(function (id) { return { id: id, t: String(cm[id].title || id).split(' – ')[0] }; });
      var st = stats.stMap || {}, topId = '', k, best = 0; for (k in st) if (st[k] > best) { best = st[k]; topId = k; }
      var want = ids.slice(0, 3); if (topId && want.indexOf(topId) < 0) want.push(topId);
      return Promise.all(want.map(stationName)).then(function (names) {
        var nm = {}; want.forEach(function (id, i) { nm[id] = names[i]; });
        return {
          games: games, gach: { d: ach.d || 0, t: ach.t || 0 },
          stations: ids.slice(0, 3).map(function (id) { return { id: id, n: nm[id] || id }; }),
          songs: songs.slice(0, 10).map(function (s) { return { a: s.artist, t: s.title }; }),
          top: topId ? { id: topId, n: nm[topId] || topId } : null, sec: stats.sec || 0,
          rach: { rank: ev.rank, points: ev.points, done: ev.done, total: ev.total, level: stats.level || 1 }
        };
      });
    });
  }

  /* ───────── Anzeige ───────── */
  function gameLink(g, cm) { var c = cm && cm[g.id]; return HOME + (c && c.path ? c.path : ''); }
  function viewHtml(p, cm) {
    var h = '<div class="rrp-hero"><div class="rrp-av" aria-hidden="true">' + esc(p.avatar || '🙂') + '</div><div style="flex:1;min-width:200px"><b>' + esc(p.nick) + '</b>' + (p.bio ? '<span>' + esc(p.bio) + '</span>' : '');
    var soc = p.social || {}, ks = Object.keys(soc).filter(function (n) { return NICE[n] && safeUrl(soc[n]); });
    if (ks.length) h += '<div class="rrp-soc">' + ks.map(function (n) { return '<a href="' + esc(safeUrl(soc[n])) + '" target="_blank" rel="noopener nofollow ugc">' + NICE[n] + ' ↗</a>'; }).join('') + '</div>';
    h += '</div></div><div class="rrp-grid">';
    if (p.games) h += '<section class="rrp-card"><h2>🎮 Top-3-Spiele</h2>' + (p.games.length ? '<ol style="margin:0;padding-left:20px">' + p.games.map(function (g) { return '<li><a class="l" href="' + esc(gameLink(g, cm)) + '" target="_blank" rel="noopener">' + esc(g.t) + '</a></li>'; }).join('') + '</ol>' : '<span class="mut">Noch keine Favoriten.</span>') + '</section>';
    if (p.gach) h += '<section class="rrp-card"><h2>🏅 Spiele-Erfolge</h2>' + (p.gach.t ? '<b>' + p.gach.d + ' von ' + p.gach.t + '</b><div class="rrp-bar"><i style="width:' + Math.round(p.gach.d / p.gach.t * 100) + '%"></i></div>' : '<span class="mut">Noch nichts freigegeben.</span>') + '</section>';
    if (p.stations) h += '<section class="rrp-card"><h2>📻 Top-3-Radiosender</h2>' + (p.stations.length ? '<ol style="margin:0;padding-left:20px">' + p.stations.map(function (s) { return '<li>' + esc(s.n) + '</li>'; }).join('') + '</ol>' : '<span class="mut">Noch keine Favoriten.</span>') + '</section>';
    if (p.top !== undefined) h += '<section class="rrp-card"><h2>🎧 Meistgehört</h2>' + (p.top ? '<b>' + esc(p.top.n) + '</b>' : '<span class="mut">Noch keine Hörzeit.</span>') + '</section>';
    if (p.sec !== undefined) h += '<section class="rrp-card"><h2>⏱ Radio-Hörzeit</h2><b>' + esc(dur(p.sec)) + '</b><br><small>auf allen Geräten zusammen</small></section>';
    if (p.rach) h += '<section class="rrp-card"><h2>🦊 Radio-Erfolge</h2>' + (p.rach.rank ? '<b>' + esc(p.rach.rank) + '</b> · Level ' + p.rach.level + '<br><small>' + p.rach.points + ' Punkte · ' + p.rach.done + ' von ' + p.rach.total + ' Stufen</small>' + (p.rach.total ? '<div class="rrp-bar"><i style="width:' + Math.round(p.rach.done / p.rach.total * 100) + '%"></i></div>' : '') : '<span class="mut">Noch nichts freigegeben.</span>') + '</section>';
    if (p.songs) h += '<section class="rrp-card" style="grid-column:1/-1"><h2>🎵 Lieblingssongs</h2>' + (p.songs.length ? '<ul>' + p.songs.map(function (s) { return '<li><b>' + esc(s.t) + '</b> <span class="mut">– ' + esc(s.a) + '</span></li>'; }).join('') + '</ul>' : '<span class="mut">Noch keine Songs gemerkt.</span>') + '</section>';
    return h + '</div><p class="mut" style="font-size:.8rem;margin-top:16px">Alle Angaben sind freiwillig und stammen von der Person selbst.</p>';
  }
  function frame(host, inner, tabs) { host.innerHTML = '<div class="rrp"><div class="rrp-k">RICOREWI RADIO</div><h1>' + (tabs.title || 'Profile 🙂') + '</h1>' + (tabs.html || '') + inner + '</div>'; }
  function tabsHtml(mode, loggedIn) {
    return '<div class="rrp-tabs" role="tablist">' + (loggedIn ? '<button type="button" data-rrp-go="me" class="' + (mode === 'me' ? 'on' : '') + '">🙂 Mein Profil</button>' : '') + '<button type="button" data-rrp-go="list" class="' + (mode === 'list' ? 'on' : '') + '">👥 Nutzerliste</button></div>';
  }

  function renderView(host, o, tok) {
    host.innerHTML = '<div class="rrp"><p class="mut">Lade Profil …</p></div>';
    Promise.all([call('pubprofile_view', { qs: 'n=' + encodeURIComponent(o.slug || '') }), catalog(o.catalogUrl)]).then(function (a) {
      var r = a[0];
      if (r.status !== 'ok') { frame(host, '<div class="rrp-card">' + esc(r.message || 'Dieses Profil gibt es nicht.') + '</div><button type="button" class="rrp-btn" data-rrp-go="list">← Nutzerliste</button>', { title: 'Profil', html: '' }); return; }
      frame(host, viewHtml(r.profile, a[1]) + '<p><button type="button" class="rrp-btn" data-rrp-go="list">← Nutzerliste</button> ' + (tok ? '<button type="button" class="rrp-btn" data-rrp-go="me">Mein Profil</button>' : '') + '</p>', { title: 'Profil', html: '' });
    }).catch(function () { frame(host, '<div class="rrp-card">Das Profil konnte gerade nicht geladen werden.</div>', { title: 'Profil', html: '' }); });
  }

  function renderList(host, o, tok, q, page) {
    q = q || ''; page = page || 1;
    call('pubprofiles_list', { qs: 'q=' + encodeURIComponent(q) + '&page=' + page }).then(function (r) {
      var items = r.items || [], inner = '<div class="rrp-card"><input type="text" id="rrp-q" placeholder="Spitzname suchen …" value="' + esc(q) + '" aria-label="Suche"></div>';
      inner += items.length ? '<div class="rrp-grid">' + items.map(function (it) {
        var facts = [it.rach && it.rach.rank ? '🦊 ' + it.rach.rank : '', it.sec != null ? '⏱ ' + dur(it.sec) : '', it.top ? '🎧 ' + it.top.n : ''].filter(Boolean).join(' · ');
        return '<button type="button" class="rrp-card rrp-item" data-rrp-open="' + esc(it.slug) + '"><div class="rrp-row"><span class="rrp-av" aria-hidden="true">' + esc(it.avatar || '🙂') + '</span><div><b>' + esc(it.nick) + '</b><small>' + esc(facts || it.bio || '') + '</small></div></div>' + (it.bio && facts ? '<small>' + esc(it.bio) + '</small>' : '') + '</button>';
      }).join('') + '</div>' : '<div class="rrp-card">Noch keine öffentlichen Profile' + (q ? ' zu dieser Suche' : '') + '.</div>';
      if (r.pages > 1) inner += '<p><button type="button" class="rrp-btn" data-rrp-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>← Zurück</button> Seite ' + r.page + ' von ' + r.pages + ' <button type="button" class="rrp-btn" data-rrp-page="' + (page + 1) + '"' + (page >= r.pages ? ' disabled' : '') + '>Weiter →</button></p>';
      var focus = doc.activeElement && doc.activeElement.id === 'rrp-q';
      frame(host, inner, { title: 'Nutzerliste 👥', html: tabsHtml('list', !!tok) });
      var qi = host.querySelector('#rrp-q'), tm;
      if (focus && qi) { qi.focus(); qi.setSelectionRange(qi.value.length, qi.value.length); }
      qi.oninput = function () { clearTimeout(tm); tm = setTimeout(function () { renderList(host, o, tok, qi.value, 1); }, 350); };
      Array.prototype.forEach.call(host.querySelectorAll('[data-rrp-page]'), function (b) { b.onclick = function () { renderList(host, o, tok, q, +b.getAttribute('data-rrp-page')); }; });
    }).catch(function () { frame(host, '<div class="rrp-card">Die Liste konnte gerade nicht geladen werden.</div>', { title: 'Nutzerliste 👥', html: tabsHtml('list', !!tok) }); });
  }

  function renderMe(host, o, tok) {
    if (!tok) { frame(host, '<div class="rrp-card">Melde dich mit Google an, um ein eigenes öffentliches Profil anzulegen.</div><button type="button" class="rrp-btn pri" data-rrp-login>Mit Google anmelden</button>', { title: 'Mein Profil 🙂', html: tabsHtml('me', false) }); return; }
    host.innerHTML = '<div class="rrp"><p class="mut">Lade …</p></div>';
    Promise.all([call('pubprofile_get', { token: tok }), collect(tok, o).catch(function () { return null; })]).then(function (a) {
      var cur = a[0].profile || { nick: '', public: false, avatar: AVATARS[0], bio: '', sections: {}, social: {} }, snap = a[1];
      var sec = cur.sections || {}, soc = cur.social || {};
      var f = '<form id="rrp-f" autocomplete="off"><div class="rrp-card"><div class="chk"><input type="checkbox" id="rrp-pub"' + (cur.public ? ' checked' : '') + '><label for="rrp-pub" style="margin:0"><b>Profil öffentlich anzeigen</b> (sichtbar für alle, auch ohne Anmeldung, und in der Nutzerliste)</label></div>' +
        '<div class="rrp-two"><div><label for="rrp-nick">Spitzname</label><input type="text" id="rrp-nick" maxlength="24" value="' + esc(cur.nick) + '" placeholder="3–24 Zeichen"></div><div><label for="rrp-av">Symbol</label><select id="rrp-av">' + AVATARS.map(function (e) { return '<option' + (e === (cur.avatar || AVATARS[0]) ? ' selected' : '') + '>' + e + '</option>'; }).join('') + '</select></div></div>' +
        '<label for="rrp-bio">Über mich (max. 140 Zeichen)</label><textarea id="rrp-bio" rows="2" maxlength="140">' + esc(cur.bio) + '</textarea></div>' +
        '<div class="rrp-card"><h2>Das zeige ich öffentlich</h2><div class="rrp-two">' + SECTIONS.map(function (s) { return '<div class="chk"><input type="checkbox" id="rrp-s-' + s[0] + '"' + (sec[s[0]] === false ? '' : ' checked') + '><label for="rrp-s-' + s[0] + '" style="margin:0">' + s[1] + '</label></div>'; }).join('') + '</div>' +
        '<p class="mut" style="font-size:.8rem">Top-3-Spiele: deine ersten 3 Favoriten ♥ in der Spieleliste · Top-3-Sender: deine ersten 3 Favoriten im Radio · Zahlen werden beim Speichern aus deinem Konto übernommen.</p>' +
        (snap ? '<p class="mut" style="font-size:.8rem">Aktuell: ' + snap.games.length + ' Spiele, ' + snap.stations.length + ' Sender, ' + snap.songs.length + ' Songs, ' + esc(dur(snap.sec)) + ' Hörzeit, Rang ' + esc(snap.rach.rank) + '.</p>' : '<p class="mut" style="font-size:.8rem">Deine Zahlen konnten gerade nicht geladen werden – gespeichert werden dann nur die Angaben unten.</p>') + '</div>' +
        '<div class="rrp-card"><h2>Social Media (optional, anklickbar)</h2><div class="rrp-two">' + SOCIAL.map(function (s) { return '<div><label for="rrp-so-' + s[0] + '">' + s[1] + '</label><input type="text" id="rrp-so-' + s[0] + '" maxlength="200" placeholder="' + s[2] + '" value="' + esc(soc[s[0]] || '') + '"></div>'; }).join('') + '</div></div>' +
        '<div class="rrp-msg" id="rrp-msg" role="status"></div><p><button type="submit" class="rrp-btn pri">Speichern</button> ' + (cur.slug ? '<button type="button" class="rrp-btn" data-rrp-open="' + esc(cur.slug) + '">Profil ansehen</button> <button type="button" class="rrp-btn danger" id="rrp-del">Profil löschen</button>' : '') + '</p></form>';
      frame(host, f, { title: 'Mein Profil 🙂', html: tabsHtml('me', true) });
      var $ = function (id) { return host.querySelector('#' + id); }, msg = function (t, ok) { var m = $('rrp-msg'); m.textContent = t; m.className = 'rrp-msg ' + (ok ? 'ok' : 'err'); };
      $('rrp-f').onsubmit = function (e) {
        e.preventDefault(); msg('Speichere …', true);
        var body = { nick: $('rrp-nick').value, public: $('rrp-pub').checked, avatar: $('rrp-av').value, bio: $('rrp-bio').value, sections: {}, social: {} };
        SECTIONS.forEach(function (s) { body.sections[s[0]] = $('rrp-s-' + s[0]).checked; }); SOCIAL.forEach(function (s) { body.social[s[0]] = $('rrp-so-' + s[0]).value; });
        collect(tok, o).catch(function () { return snap; }).then(function (fresh) {
          var d = fresh || {}; ['games', 'gach', 'stations', 'songs', 'top', 'sec', 'rach'].forEach(function (k) { if (d[k] !== undefined) body[k] = d[k]; });
          return call('pubprofile_save', { token: tok, body: body });
        }).then(function (r) { if (r.status === 'ok') { msg(body.public ? 'Gespeichert – dein Profil ist öffentlich.' : 'Gespeichert (noch nicht öffentlich).', true); cur.slug = r.profile.slug; renderMe(host, o, tok); } else msg(r.message || 'Das hat nicht geklappt.', false); })
          .catch(function () { msg('Keine Verbindung – bitte später erneut versuchen.', false); });
      };
      var del = $('rrp-del'); if (del) del.onclick = function () { if (!root.confirm('Dein öffentliches Profil wirklich löschen?')) return; call('pubprofile_delete', { token: tok, body: {} }).then(function () { renderMe(host, o, tok); }); };
    }).catch(function () { frame(host, '<div class="rrp-card">Das Profil konnte gerade nicht geladen werden.</div>', { title: 'Mein Profil 🙂', html: tabsHtml('me', true) }); });
  }

  /** mode: 'me' | 'list' | 'view'; o: { slug, token: function → Promise<string>, nav: function(mode, slug), catalogUrl } */
  function render(host, o) {
    css(); o = o || {};
    var getTok = o.token || function () { return Promise.resolve(''); };
    getTok().catch(function () { return ''; }).then(function (tok) {
      tok = tok || '';
      if (!host._rrpBound) {
        host._rrpBound = true;
        host.addEventListener('click', function (e) {
          var t = e.target.closest && e.target.closest('[data-rrp-go],[data-rrp-open],[data-rrp-login]'); if (!t || !host.contains(t)) return;
          if (t.hasAttribute('data-rrp-login')) { try { root.AnMaChaAccount && root.AnMaChaAccount.login(); } catch (x) { } return; }
          var nav = (host._rrpO && host._rrpO.nav) || function () { }; if (t.hasAttribute('data-rrp-go')) nav(t.getAttribute('data-rrp-go')); else nav('view', t.getAttribute('data-rrp-open'));
        });
      }
      host._rrpO = o;
      if (o.mode === 'view') renderView(host, o, tok); else if (o.mode === 'list') renderList(host, o, tok); else renderMe(host, o, tok);
    });
  }
  root.RRWProfil = { render: render, collect: collect, viewHtml: viewHtml };
})(window);
