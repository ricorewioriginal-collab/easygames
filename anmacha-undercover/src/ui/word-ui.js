/* AnMaCha UNDERCOVER 3D – Oberfläche „Imposter: Das geheime Wort“ (reines DOM, funktioniert auch ohne WebGL).
   Phasen: reveal (geheime Karte) → clue (reihum ein Hinweis) → discuss → vote → ggf. guess (enttarnter Imposter rät) → end.
   AMU.WordUI.open({ send(act) → Promise<res>, view, onMenu, onTyping }) → { update(view), close() } */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const esc = s => AMU.U.esc(s);
  const WHY = { 'nicht dran': 'Du bist gerade nicht dran.', 'schon genannt': 'Dieser Hinweis wurde schon genannt.', langsam: 'Nicht so schnell …', filter: 'Bitte anders formulieren.',
    'nur Karten': 'In dieser Runde nur Hinweiskarten.', 'nur Freitext': 'In dieser Runde nur getippte Hinweise.', 'schon versucht': 'Das hast du schon versucht.', leer: 'Bitte etwas eingeben.' };
  const why = r => { const w = r && r.why; if (!w) return 'Geht gerade nicht.'; return WHY[w] || (/wort|Wort|teil|zu nah|ähnlich/.test(w) ? 'Zu nah am geheimen Wort – wähle einen anderen Hinweis.' : 'Geht nicht: ' + w); };

  function open(opt) {
    let v = opt.view, closed = false, picking = null;
    const Q = AMU.WordGame.QUICK, cache = {};
    const el = AMU.UI.screen(
      '<div class="wd-wrap">' +
      '<header class="mt-head"><div><h2 class="ui-h2">🤫 Das geheime Wort</h2><p class="wd-phase ui-small ui-muted"></p></div><div class="mt-timer wd-timer"></div><button class="ui-btn ui-sm" data-a="menu" aria-label="Menü">☰</button></header>' +
      '<ol class="wd-steps" aria-label="Ablauf"></ol><div class="wd-now" aria-live="polite"></div>' +
      '<div class="wd-card" aria-live="polite"></div>' +
      '<div class="wd-main"><section class="wd-left"><div class="wd-order"></div><div class="wd-act"></div></section>' +
      '<section class="mt-chatbox"><h3 class="ui-h2 wd-h wd-ch">💡 Alle Hinweise</h3><ul class="wd-clues"></ul><h3 class="ui-h2 wd-h">💬 Diskussion</h3><ul class="mt-chat wd-chat"></ul>' +
      '<div class="mt-quick">' + Object.keys(Q).map(k => '<button class="ui-btn ui-sm" data-a="q" data-v="' + k + '">' + esc(Q[k].de.replace('{p}', '…')) + '</button>').join('') + '</div>' +
      '<form class="mt-form wd-chatform"><input type="text" maxlength="140" placeholder="Nachricht …" aria-label="Nachricht" autocomplete="off"><button class="ui-btn ui-sm" type="submit">Senden</button></form></section></div>' +
      '<div class="mt-pick" hidden></div></div>',
    { key: 'word', cls: 'clear wd-screen', focus: false, on: (a, val) => onAct(a, val) });
    const $ = s => el.querySelector(s);
    const set = (k, node, html) => { if (cache[k] !== html) { cache[k] = html; node.innerHTML = html; } };
    const chatInp = $('.wd-chatform input');
    $('.wd-chatform').addEventListener('submit', e => { e.preventDefault(); const t = chatInp.value.trim(); if (!t) return; opt.send({ a: 'chat', text: t }).then(r => { if (r && r.ok) chatInp.value = ''; else AMU.UI.toast(why(r), 'bad'); }); });
    el.addEventListener('submit', e => {
      const f = e.target; if (!f.classList.contains('wd-clueform') && !f.classList.contains('wd-guessform')) return;
      e.preventDefault(); const i = f.querySelector('input'), t = i.value.trim(); if (!t) return;
      const act = f.classList.contains('wd-clueform') ? { a: 'clue', text: t.slice(0, 24) } : { a: 'guess', text: t.slice(0, 30) };
      opt.send(act).then(r => { if (r && r.ok) { i.value = ''; AMU.Audio && AMU.Audio.sfx('clue'); } else AMU.UI.toast(why(r), 'bad'); });
    });
    el.addEventListener('focusin', e => { if (e.target.tagName === 'INPUT') opt.onTyping && opt.onTyping(true); });
    el.addEventListener('focusout', e => { if (e.target.tagName === 'INPUT') opt.onTyping && opt.onTyping(false); });
    function onAct(a, val) {
      if (a === 'menu') return opt.onMenu && opt.onMenu();
      const done = r => { if (!r || !r.ok) AMU.UI.toast(why(r), 'bad'); };
      if (a === 'card') return opt.send({ a: 'clue', card: +val }).then(r => { done(r); if (r && r.ok) AMU.Audio && AMU.Audio.sfx('clue'); });
      if (a === 'vote') return opt.send({ a: 'vote', target: val }).then(r => { done(r); if (r && r.ok) AMU.Audio && AMU.Audio.sfx('vote'); });
      if (a === 'ready') return opt.send({ a: 'ready' }).then(done);
      if (a === 'gopt') return opt.send({ a: 'guess', opt: +val }).then(done);
      if (a === 'q') { if (Q[val].target) { picking = val; renderPick(); return; } return opt.send({ a: 'quick', q: val }).then(done); }
      if (a === 'pick') { const q = picking; picking = null; renderPick(); if (q && val) opt.send({ a: 'quick', q, target: val }).then(done); }
    }
    function renderPick() {
      const box = $('.mt-pick');
      if (!picking) { box.hidden = true; box.innerHTML = ''; return; }
      box.innerHTML = '<div class="ui-card" data-amu-focus-root><p>' + esc(Q[picking].de.replace('{p}', '…')) + '</p><div class="ui-grid">' +
        v.roster.filter(r => !r.out && r.id !== v.me.id).map(r => '<button class="ui-btn ui-sm" data-a="pick" data-v="' + esc(r.id) + '">' + AMU.UI.badge(r) + '</button>').join('') +
        '</div><button class="ui-btn ui-sm" data-a="pick" data-v="">Abbrechen</button></div>';
      box.hidden = false; AMU.UI.focusFirst(box);
    }
    function cardHtml(c, big) {
      if (!c) return '';
      if (c.impostor) return '<div class="wd-secret imp' + (big ? ' big' : '') + '"><small>Deine Karte</small><b>🎭 Du bist der Imposter!</b><span>Kategorie: ' + esc(c.cat) + '</span><small>Hör gut zu und gib einen Hinweis, der passen könnte.</small></div>';
      return '<div class="wd-secret' + (big ? ' big' : '') + '"><small>Dein geheimes Wort</small><b>' + esc(c.word) + '</b><span>Kategorie: ' + esc(c.cat) + '</span>' +
        (v.variant === 'alternativ' ? '<small>Achtung: Der Imposter hat ein ähnliches Wort und weiß es nicht!</small>' : '<small>Verrate das Wort nicht – aber zeig, dass du es kennst.</small>') + '</div>';
    }
    function nowText(me, nm) {
      const imp = me.card && me.card.impostor, who = id => '<b>' + esc(nm[id] || '?') + '</b>';
      if (me.out) return 'Du bist raus und schaust zu.';
      switch (v.phase) {
        case 'reveal': return imp ? 'Du bist der <b>Imposter</b> und kennst das Wort nicht. Gleich gibt jeder reihum einen Hinweis. Hör gut zu und tu so, als wüsstest du es.'
          : 'Merk dir dein Wort. Gleich gibt jeder reihum einen Hinweis dazu, ohne es zu verraten. Einer kennt das Wort nicht: der <b>Imposter</b>. Findet ihn!';
        case 'clue': if (v.turn === me.id) return imp ? 'Du bist dran! Gib einen Hinweis, der zu den anderen passt, damit niemand merkt, dass du das Wort nicht kennst.' : 'Du bist dran! Gib einen kurzen Hinweis zu deinem Wort, ohne es zu verraten.';
          return (v.turn ? who(v.turn) + ' gibt gerade einen Hinweis. ' : '') + (imp ? 'Errate aus den Hinweisen, um welches Wort es geht.' : 'Achte darauf, wessen Hinweis nicht richtig passt.');
        case 'discuss': return imp ? 'Lenk den Verdacht auf jemand anderen. Tippe auf „Bereit zur Abstimmung“, wenn du so weit bist.' : 'Besprecht, wessen Hinweis verdächtig ist. Tippe auf „Bereit zur Abstimmung“, wenn du so weit bist.';
        case 'vote': return me.voted ? 'Deine Stimme zählt. Warte, bis alle abgestimmt haben.' : 'Tippe beim Spieler, den du für den Imposter hältst, auf „🎭 Verdächtigen“. Unsicher? Dann überspringe.';
        case 'guess': return v.guess && v.guess.id === me.id ? 'Du wurdest enttarnt! Rate das Wort. Liegst du richtig, gewinnst du trotzdem.' : (v.guess ? who(v.guess.id) + ' war ein Imposter und rät jetzt das Wort. Stimmt es, gewinnt der Imposter doch noch.' : '');
        default: return 'Die Runde ist vorbei.';
      }
    }
    function update(nv) {
      if (closed) return; v = nv; const me = v.me || {}, nm = {}; v.roster.forEach(r => { nm[r.id] = r.n; });
      const PH = { reveal: 'Merke dir deine Karte', clue: 'Runde ' + v.round + '/' + v.rounds + ': reihum ein Hinweis', discuss: 'Diskutiert: Wessen Hinweis passt nicht?', vote: 'Abstimmen – wer ist der Imposter?', guess: 'Der enttarnte Imposter darf raten', end: 'Ende' };
      set('ph', $('.wd-phase'), esc(PH[v.phase] || '') + (me.out ? ' · Du bist raus und schaust zu.' : ''));
      set('tm', $('.wd-timer'), v.phase === 'clue' ? '⏱ ' + AMU.U.fmtTime(v.turnLeft) : v.left ? '⏱ ' + AMU.U.fmtTime(v.left) : '');
      // Schrittleiste und Anleitung „Was jetzt?“
      const step = { reveal: 0, clue: 1, discuss: 2, vote: 3, guess: 3, end: 4 }[v.phase];
      set('steps', $('.wd-steps'), ['Karte ansehen', 'Hinweise geben', 'Diskutieren', 'Abstimmen'].map((t, i) => '<li class="' + (i === step ? 'on' : i < step ? 'done' : '') + '"><b>' + (i < step ? '✓' : i + 1) + '</b> ' + t + '</li>').join(''));
      set('now', $('.wd-now'), '<b>Jetzt:</b> ' + nowText(me, nm));
      set('card', $('.wd-card'), cardHtml(me.card, v.phase === 'reveal') + ((me.mates || []).length ? '<p class="ui-small">🎭 Weiterer Imposter: ' + me.mates.map(id => esc(nm[id])).join(', ') + '</p>' : ''));
      // Reihenfolge / Teilnehmer
      set('ord', $('.wd-order'), '<ul class="ui-list">' + v.order.map(id => {
        const r = v.roster.find(x => x.id === id) || { n: '?' }, my = v.clues.filter(c => c.id === id);
        return '<li class="' + (v.turn === id ? 'wd-turn' : '') + (r.out ? ' dead' : '') + '"><span>' + AMU.UI.badge(r, id === me.id ? ' <small>(du)</small>' : '') + (r.out ? ' <span class="ui-tag">raus</span>' : '') + (r.voted ? ' <span class="ui-tag ok">✔</span>' : '') + (r.conn ? '' : ' <span class="ui-tag bad">getrennt</span>') + '</span>' +
          '<small>' + my.map(c => c.none ? '—' : '„' + esc(c.text) + '“').join(' · ') + (v.turn === id ? ' ✍️' : '') + '</small>' +
          (v.phase === 'vote' && !me.out && !me.voted && id !== me.id && !r.out ? '<button class="ui-btn ui-sm ui-pri" data-a="vote" data-v="' + esc(id) + '">🎭 Verdächtigen</button>' : '') + '</li>';
      }).join('') + '</ul>');
      // Aktionsbereich
      let act = '';
      if (v.phase === 'reveal') act = '<p class="ui-muted">Gleich geht es los. Alle sehen ihre eigene Karte – niemand sonst sieht sie.</p>';
      else if (v.phase === 'clue') {
        if (v.turn === me.id) {
          act = '<div class="ui-card wd-myturn"><b>✍️ Du bist dran!</b> Ein Wort oder kurzer Begriff (nicht das Wort selbst).';
          if (v.clueMode !== 'karten') act += '<form class="mt-form wd-clueform"><input type="text" maxlength="24" placeholder="Dein Hinweis" aria-label="Dein Hinweis" autocomplete="off" autofocus><button class="ui-btn ui-sm ui-pri" type="submit">Geben</button></form>';
          if (me.opts && me.opts.length) act += '<p class="ui-small ui-muted">' + (v.clueMode === 'karten' ? 'Wähle eine Hinweiskarte:' : 'Oder wähle eine Karte:') + '</p><div class="ui-seg">' + me.opts.map((o, i) => '<button class="ui-segb" data-a="card" data-v="' + i + '">' + esc(o) + '</button>').join('') + '</div>';
          act += '</div>';
        } else act = '<p>' + (v.turn ? '⏳ <b>' + esc(nm[v.turn] || '?') + '</b> überlegt einen Hinweis …' : '') + '</p>';
      } else if (v.phase === 'discuss') act = me.out ? '' : '<button class="ui-btn ' + (me.ready ? '' : 'ui-pri') + '" data-a="ready"' + (me.ready ? ' disabled' : '') + '>' + (me.ready ? '✔ Bereit zur Abstimmung' : '🗳 Bereit zur Abstimmung') + '</button>';
      else if (v.phase === 'vote') act = me.out ? '<p class="ui-muted">Du stimmst nicht mehr mit ab.</p>' : me.voted ? '<p>Deine Stimme: <b>' + (me.voted === 'skip' ? 'überspringen' : esc(nm[me.voted])) + '</b></p>' : '<button class="ui-btn" data-a="vote" data-v="skip">⏭ Überspringen</button>';
      else if (v.phase === 'guess' && v.guess) {
        if (v.guess.id === me.id) {
          act = '<div class="ui-card wd-myturn"><b>🎯 Du wurdest enttarnt!</b> Errätst du das Wort, gewinnst du trotzdem. Versuche: ' + v.guess.tries + (v.guess.wrong.length ? ' · falsch: ' + v.guess.wrong.map(esc).join(', ') : '') +
            '<form class="mt-form wd-guessform"><input type="text" maxlength="30" placeholder="Das Wort ist …" aria-label="Wort raten" autocomplete="off" autofocus><button class="ui-btn ui-sm ui-pri" type="submit">Raten</button></form>' +
            (me.guessOpts ? '<div class="ui-seg">' + me.guessOpts.map((o, i) => '<button class="ui-segb" data-a="gopt" data-v="' + i + '">' + esc(o) + '</button>').join('') + '</div>' : '') + '</div>';
        } else act = '<p>🎯 <b>' + esc(nm[v.guess.id]) + '</b> war ein Imposter und darf jetzt das Wort raten …' + (v.guess.wrong.length ? ' (falsch: ' + v.guess.wrong.map(esc).join(', ') + ')' : '') + '</p>';
      }
      const box = $('.wd-act'), had = box.querySelector('input'), typed = had ? had.value : '';
      const k = 'act' + v.phase + v.turn + (me.voted || '') + (me.ready || '') + JSON.stringify(v.guess) + (me.opts || []).join();
      if (cache.actK !== k) { cache.actK = k; box.innerHTML = act; const ni = box.querySelector('input'); if (ni) { ni.value = typed; if (!AMU.Touch || !AMU.Touch.isTouch()) ni.focus({ preventScroll: true }); } }
      // Hinweise und Chat
      set('clues', $('.wd-clues'), v.clues.map(c => '<li><b>' + esc(nm[c.id]) + ':</b> ' + (c.none ? '<i>(kein Hinweis)</i>' : esc(c.text)) + ' <small class="ui-muted">R' + c.round + '</small></li>').join('') || '<li class="ui-muted">Noch keine Hinweise.</li>');
      const chatH = v.chat.map(e => '<li class="mt-msg' + (e.id === me.id ? ' me' : '') + '"><b>' + esc(nm[e.id] || '?') + ':</b> ' + esc(e.text || '') + '</li>').join('');
      if (cache.chat !== chatH) { cache.chat = chatH; const ul = $('.wd-chat'); ul.innerHTML = chatH || '<li class="ui-muted">Schnellchat oder eigene Nachricht – auch schon während der Hinweisrunde.</li>'; ul.scrollTop = ul.scrollHeight; }
      const canChat = !me.out && ['clue', 'discuss', 'vote'].includes(v.phase);
      el.querySelectorAll('.mt-quick button, .wd-chatform button, .wd-chatform input').forEach(b => { b.disabled = !canChat; });
    }
    update(v);
    return { update, close() { closed = true; }, el, focusChat() { chatInp.focus(); } };
  }
  AMU.WordUI = { open };
})(typeof window !== 'undefined' ? window : globalThis);
