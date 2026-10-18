/* AnMaCha UNDERCOVER 3D – Besprechung (Missionsmodi): Diskussion mit Schnellchat und Freitext, Spuren vorlegen (Detektiv),
   anonyme Abstimmung inkl. Überspringen, Ergebnis ohne Rollenoffenbarung. Geister schreiben nur im Geisterkanal.
   AMU.MeetingUI.open({ send(act) → Promise<res>, view }) → { update(view), close() }   (läuft als Bildschirm in #ui) */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const esc = s => AMU.U.esc(s);

  function chatLine(e, nm, rooms, meId) {
    let txt;
    if (e.q) txt = AMU.Meeting.quickText(e, nm, rooms);
    else if (e.clue) txt = '🗂 legt vor: ' + AMU.Evidence.text(e.clue, nm, rooms);
    else txt = e.txt || '';
    return '<li class="mt-msg' + (e.ghost ? ' ghost' : '') + (e.pid === meId ? ' me' : '') + '"><b>' + esc(nm[e.pid] || '?') + (e.ghost ? ' 👻' : '') + ':</b> ' + esc(txt) + '</li>';
  }

  function open(opt) {
    let v = opt.view, picking = null, lastChat = -1, closed = false;
    const map = AMU.mapById(v.map), rooms = map.rooms.map(r => r.n);
    const Q = AMU.Meeting.QUICK;
    const el = AMU.UI.screen(
      '<div class="mt-wrap">' +
      '<header class="mt-head"><div><h2 class="ui-h2 mt-title"></h2><p class="mt-sub ui-small ui-muted"></p></div><div class="mt-timer"></div><button class="ui-btn ui-sm" data-a="menu" aria-label="Menü">☰</button></header>' +
      '<div class="mt-main"><section class="mt-players" aria-label="Teilnehmer"></section>' +
      '<section class="mt-chatbox"><ul class="mt-chat" aria-live="polite"></ul>' +
      '<div class="mt-quick">' + Object.keys(Q).map(k => '<button class="ui-btn ui-sm" data-a="q" data-v="' + k + '">' + esc(Q[k].de.replace('{p}', '…').replace(/\{r\w*\}/, '…')) + '</button>').join('') + '</div>' +
      '<div class="mt-clues"></div>' +
      '<form class="mt-form"><input type="text" maxlength="90" placeholder="Nachricht … (Enter)" aria-label="Nachricht" autocomplete="off"><button class="ui-btn ui-sm ui-pri" type="submit">Senden</button></form>' +
      '</section></div><div class="mt-pick" hidden></div><div class="mt-result" hidden></div></div>',
    { key: 'meeting', cls: 'clear mt-screen', focus: false, on: (a, val) => onAct(a, val) });
    const $ = s => el.querySelector(s);
    const inp = $('.mt-form input');
    $('.mt-form').addEventListener('submit', e => {
      e.preventDefault(); const t = inp.value.trim(); if (!t) return;
      opt.send({ a: 'chat', txt: t.slice(0, 90) }).then(r => { if (r && r.ok) inp.value = ''; else AMU.UI.toast(why(r), 'bad'); });
    });
    inp.addEventListener('focus', () => opt.onTyping && opt.onTyping(true));
    inp.addEventListener('blur', () => opt.onTyping && opt.onTyping(false));
    function why(r) { const w = r && r.why; return w === 'zu schnell' ? 'Nicht so schnell …' : w === 'vorbei' ? 'Die Besprechung ist vorbei.' : w === 'filter' ? 'Nachricht wurde gefiltert.' : 'Geht gerade nicht' + (w ? ' (' + w + ')' : '') + '.'; }
    function onAct(a, val) {
      if (a === 'menu') return opt.onMenu && opt.onMenu();
      if (a === 'vote') return opt.send({ a: 'vote', target: val }).then(r => { if (r && r.ok) AMU.Audio && AMU.Audio.sfx('vote'); else AMU.UI.toast(why(r), 'bad'); });
      if (a === 'q') {
        const q = Q[val];
        if (q.target) { picking = { q: val, kind: 'p' }; renderPick(); return; }
        if (q.room) { picking = { q: val, kind: 'r' }; renderPick(); return; }
        return opt.send({ a: 'quick', q: val }).then(r => { if (!r || !r.ok) AMU.UI.toast(why(r), 'bad'); });
      }
      if (a === 'pick') {
        const p = picking; picking = null; renderPick();
        if (!p || val === '') return;
        const act = { a: 'quick', q: p.q }; if (p.kind === 'p') act.p = val; else act.r = +val;
        return opt.send(act).then(r => { if (!r || !r.ok) AMU.UI.toast(why(r), 'bad'); });
      }
      if (a === 'clue') return opt.send({ a: 'present', clue: +val }).then(r => { if (!r || !r.ok) AMU.UI.toast('Diese Spur hast du schon vorgelegt.', 'bad'); });
    }
    function renderPick() {
      const box = $('.mt-pick');
      if (!picking) { box.hidden = true; box.innerHTML = ''; return; }
      const m = v.meeting || {}, alive = new Set(m.alive || []);
      const items = picking.kind === 'p' ? v.roster.filter(r => alive.has(r.id) && r.id !== v.me.id).map(r => [r.id, AMU.UI.badge(r)]) : rooms.map((n, i) => [i, esc(n)]);
      box.innerHTML = '<div class="ui-card" data-amu-focus-root><p>' + esc(Q[picking.q].de.replace('{p}', '…').replace(/\{r\w*\}/, '…')) + '</p><div class="ui-grid">' +
        items.map(it => '<button class="ui-btn ui-sm" data-a="pick" data-v="' + esc(it[0]) + '">' + it[1] + '</button>').join('') + '</div><button class="ui-btn ui-sm" data-a="pick" data-v="">Abbrechen</button></div>';
      box.hidden = false;
      AMU.UI.focusFirst(box);
    }
    const cache = {};
    const set = (k, node, html) => { if (cache[k] !== html) { cache[k] = html; node.innerHTML = html; } };
    function update(nv) {
      if (closed) return; v = nv; const m = v.meeting; if (!m) return;
      const nm = AMU.HUD.names(v), meAlive = (m.alive || []).includes(v.me.id);
      const by = m.by ? nm[m.by] : null;
      set('title', $('.mt-title'), m.body ? '📣 Gemeldet: ' + esc(nm[m.body] || '?') + ' wurde ausgeknipst' : '🚨 Notruf' + (by ? ' von ' + esc(by) : ''));
      set('sub', $('.mt-sub'), (m.body ? 'Gefunden von ' + esc(by || '?') + (m.room >= 0 ? ' in ' + esc(rooms[m.room] || 'einem Gang') : ' in einem Gang') + '. ' : '') +
        (m.phase === 'discuss' ? 'Diskutiert: Wer war wo? Was habt ihr gesehen?' : m.phase === 'vote' ? 'Abstimmen! Stimmen sind anonym. Gleichstand = niemand fliegt.' : 'Ergebnis') + (meAlive ? '' : ' · Du bist ausgeschieden: nur Geisterchat, keine Stimme.'));
      set('timer', $('.mt-timer'), (m.phase === 'discuss' ? '💬 ' : m.phase === 'vote' ? '🗳 ' : '') + AMU.U.fmtTime(m.left));
      // Teilnehmer
      const alive = new Set(m.alive || []), voted = new Set(m.voted || []);
      const canVote = m.phase === 'vote' && meAlive && m.mine == null;
      const ph = v.roster.map(r => {
        const dead = !alive.has(r.id), mate = (v.mates || []).includes(r.id);
        return '<div class="mt-p' + (dead ? ' dead' : '') + (m.mine === r.id ? ' mine' : '') + '">' + AMU.UI.badge(r, r.id === v.me.id ? ' <small>(du)</small>' : '') +
          (mate ? ' <span class="ui-tag bad">Team</span>' : '') + (dead ? ' <span class="ui-tag">👻 raus</span>' : '') + (voted.has(r.id) ? ' <span class="ui-tag ok">✔ gestimmt</span>' : '') +
          (m.result && m.result.counts && m.result.counts[r.id] ? ' <b class="mt-cnt">' + m.result.counts[r.id] + ' 🗳</b>' : '') +
          (canVote && !dead && r.id !== v.me.id ? '<button class="ui-btn ui-sm ui-pri" data-a="vote" data-v="' + esc(r.id) + '">Wählen</button>' : '') + '</div>';
      }).join('') + (canVote ? '<button class="ui-btn ui-sm" data-a="vote" data-v="skip">⏭ Überspringen</button>' : '') +
        (m.mine != null ? '<p class="ui-small ui-muted">Deine Stimme: ' + (m.mine === 'skip' ? 'übersprungen' : esc(nm[m.mine] || '?')) + '</p>' : '') +
        (m.result && m.result.skip ? '<p class="ui-small">⏭ Übersprungen: ' + m.result.skip + '</p>' : '');
      set('players', $('.mt-players'), ph);
      // Chat (nur Neues anhängen)
      const ul = $('.mt-chat'), chat = m.chat || [];
      if (chat.length !== lastChat || (chat.length && cache.lastT !== chat[chat.length - 1].t)) {
        lastChat = chat.length; cache.lastT = chat.length ? chat[chat.length - 1].t : null;
        ul.innerHTML = chat.map(e => chatLine(e, nm, rooms, v.me.id)).join('') || '<li class="ui-muted">Noch keine Nachrichten. Nutze den Schnellchat oder schreibe selbst.</li>';
        ul.scrollTop = ul.scrollHeight;
      }
      // Spuren vorlegen
      const cf = (v.ext && v.ext.casefile) || [];
      set('clues', $('.mt-clues'), cf.length && meAlive && m.phase !== 'result' ? '<p class="ui-small ui-muted">🗂 Spur vorlegen:</p>' + cf.map(c => '<button class="ui-btn ui-sm" data-a="clue" data-v="' + c.id + '">' + esc(AMU.Evidence.text(c, nm, rooms)) + '</button>').join('') : '');
      const off = m.phase === 'result';
      el.querySelectorAll('.mt-quick button').forEach(b => { b.disabled = off || !meAlive && !!Q[b.dataset.v].target; });
      // Ergebnis
      const res = $('.mt-result');
      if (m.phase === 'result' && m.result) {
        const ej = m.result.ejected;
        set('res', res, '<div class="ui-card mt-ej">' + (ej ? '<div class="mt-ejbig">' + AMU.UI.badge(v.roster.find(r => r.id === ej) || { n: '?' }) + '</div><p><b>' + esc(nm[ej] || '?') + '</b> wurde rausgewählt.</p><p class="ui-small ui-muted">Die Rolle bleibt geheim – erst am Ende wird alles aufgedeckt.</p>'
          : '<p><b>Niemand</b> wurde rausgewählt' + (m.result.tie ? ' (Gleichstand).' : '.') + '</p>') + '</div>');
        res.hidden = false;
      } else res.hidden = true;
    }
    update(v);
    return { update, close() { closed = true; }, el, focusChat() { inp.focus(); }, quickMenu() { const b = el.querySelector('.mt-quick button'); if (b) b.focus(); } };
  }
  AMU.MeetingUI = { open, chatLine };
})(typeof window !== 'undefined' ? window : globalThis);
