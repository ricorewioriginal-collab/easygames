/* Radio-Fenster: AnMaCha24 live hören (src/radio/player.js) und Sendungen im eigenen Radiostudio (src/sim/radio.js). */
(function (root) {
  'use strict';
  const PT = root.PT; const esc = PT.esc; const UI = PT.UI;
  const G = () => PT.G;

  UI.radio = function (tab) {
    const st = G().st, R = PT.Radio, P = PT.RadioPlayer, S = PT.Sim;
    if (!st || !R) return;
    let view = tab === 'studio' ? 'studio' : 'live';
    const pnl = UI.panel('Radio', '', { wide: true, icon: '📻', onClose: () => unsub && unsub() });
    const unsub = P ? P.subscribe(() => { if (view === 'live') render(); }) : null;

    function liveHtml() {
      if (!P) return '<p class="pt-hint">Der Radio-Player ist nicht geladen.</p>';
      const cur = P.station(), on = P.active();
      return '<div class="pt-card"><span class="pt-ico">📻</span><div><b>' + esc(cur.name) + '</b> <small>' + esc(cur.desc || '') + '</small>' +
        '<p data-radio-status>' + (P.playing ? '▶ läuft live' + (P.song ? ' · Jetzt läuft: <b>' + esc(P.song) + '</b>' : '') : P.loading ? '⏳ verbinde …' : '⏸ aus') + '</p>' +
        (P.err ? '<p class="pt-hint" data-radio-err style="color:var(--bad)">⚠️ ' + esc(P.err) + '</p>' : '') +
        '<div class="pt-row"><button data-act="toggle" data-primary class="' + (on ? '' : 'pri') + '">' + (on ? '⏹ Stopp' : '▶ Abspielen') + '</button>' +
        '<label class="pt-range" style="flex:1;min-width:180px">🔊 Lautstärke <input type="range" min="0" max="100" value="' + Math.round(P.vol * 100) + '" data-radio-vol></label></div>' +
        '<p class="pt-hint">Solange das Radio läuft, ist die Spielmusik leise. Live-Stream über laut.fm.</p></div></div>' +
        '<h3>Alle 12 Sender</h3><div class="pt-chips">' + R.STATIONS.map(s => '<button data-act="st" data-s="' + s.slug + '" class="' + (s.slug === P.slug ? 'sel' : '') + '" title="' + esc(s.desc) + '">' + esc(s.name) + '</button>').join('') + '</div>' +
        '<p class="pt-hint">„Musik, die mich anmacht!“ – die Webradios der AnMaCha-Radioproduktion: <a href="https://www.meinradio.com" target="_blank" rel="noopener">meinradio.com</a> · Den echten Podcast gibt es auf <a href="https://www.anmacha.de" target="_blank" rel="noopener">anmacha.de</a>.</p>';
    }
    function studioHtml() {
      const r = R.state(st), room = S.studio(st).rooms.find(x => x.fn === 'radio'), pr = R.promo(st);
      let h = '';
      if (!S.hasRoom(st, 'radio')) {
        h += '<div class="pt-card"><span class="pt-ico">🔨</span><div><b>Noch kein fertiges Radiostudio</b><small>' +
          (room ? 'Es fehlt: ' + esc(room.miss.map(PT.Build.missText).join(', ')) : 'Baue einen Raum (ab 6 m²) mit Radio-Sendepult, Mikrofon und ON-AIR-Licht und gib ihm die Funktion „📻 Radiostudio“.') + '</small></div></div>';
      }
      h += '<div class="pt-card"><span class="pt-ico">🎙️</span><div><b>Podcast bleibt das Highlight</b><small>Radio bringt wenig Geld, aber Werbung: Die nächste Folge bekommt mehr Reichweite, und Radiohörer werden beim Veröffentlichen zu Podcast-Fans.</small>' +
        (pr ? '<small>📣 Aktive Werbung: <b>+' + Math.round(pr.pct * 100) + ' % Reichweite</b> · <b>' + PT.fmt(pr.fans) + '</b> Radiohörer warten auf die nächste Folge (bis Tag ' + pr.until + ')</small>' : '<small>Gerade keine Radio-Werbung aktiv.</small>') +
        '<small>Bisher ' + r.shows + ' Sendungen · ' + PT.fmt(r.listeners) + ' Radiohörer · ' + PT.fmt(r.convFans) + ' neue Podcast-Fans durchs Radio</small></div></div><h3>Sendung machen (1× pro Tag)</h3><div class="pt-cards">';
      h += R.SHOWS.map(s => {
        const c = R.canRun(st, s.id), p = R.preview(st, s.id, 0.7), mg = PT.MG && PT.MG.get(s.mg);
        return '<div class="pt-card"><span class="pt-ico">' + s.icon + '</span><div><b>' + esc(s.name) + '</b><small>' + esc(s.desc) + '</small>' +
          '<small>⏰ Beste Zeit ' + s.hours[0] + '–' + (s.hours[1] % 24) + ' Uhr' + (p.prime ? ' · <b>jetzt Primetime!</b>' : '') + '</small>' +
          '<small>Bei guter Moderation ca. 🎧 ' + PT.fmt(p.listeners) + ' · 💶 ' + PT.money(p.money) + ' · 📣 +' + Math.round(p.promo.pct * 100) + ' % Reichweite, ' + p.promo.fans + ' Radiohörer</small>' +
          (c.ok ? '' : '<small style="color:var(--bad)">' + esc(c.err) + '</small>') +
          '<div class="pt-row"><button data-act="show" data-s="' + s.id + '" class="pri"' + (c.ok ? '' : ' disabled') + '>🔴 Auf Sendung' + (mg ? ' (' + esc(mg.name) + ')' : '') + '</button><button data-act="quick" data-s="' + s.id + '"' + (c.ok ? '' : ' disabled') + '>Schnell senden</button></div></div></div>';
      }).join('') + '</div>';
      if (r.log.length) h += '<h3>Letzte Sendungen</h3><ul class="pt-mini">' + r.log.slice(0, 5).map(e => { const s = R.showById(e.show); return '<li>Tag ' + e.day + ': ' + (s ? s.icon + ' ' + esc(s.name) : '') + ' – ' + PT.fmt(e.listeners) + ' Hörer, ' + PT.money(e.money) + ', +' + Math.round(e.pct * 100) + ' %</li>'; }).join('') + '</ul>';
      return h;
    }
    function render() {
      pnl.set('<div class="pt-tabs"><button data-act="tab" data-t="live" class="' + (view === 'live' ? 'sel' : '') + '">🎧 AnMaCha24 hören</button><button data-act="tab" data-t="studio" class="' + (view === 'studio' ? 'sel' : '') + '">🎙️ Radiostudio</button></div>' + (view === 'live' ? liveHtml() : studioHtml()));
      const vol = pnl.root.querySelector('[data-radio-vol]'); if (vol) vol.oninput = () => P.setVolume(vol.value / 100);
    }
    function finish(id, score) {
      const out = R.runShow(st, id, score);
      if (!out.ok) { UI.toast(out.err, 'bad'); return; }
      PT.Audio && PT.Audio.fx('onair');
      const pr = out.promo;
      const p = UI.panel(out.show.icon + ' ' + out.show.name, '<p>Auf Sendung bei AnMaCha24' + (out.prime ? ' – zur Primetime!' : '') + '</p><ul class="pt-mini">' +
        '<li>🎧 <b>' + PT.fmt(out.listeners) + '</b> Radiohörer</li><li>💶 <b>' + PT.money(out.money) + '</b></li><li>💛 <b>+' + out.fans + '</b> Fans</li>' +
        '<li>📣 Nächste Podcast-Folge: <b>+' + Math.round(pr.pct * 100) + ' % Reichweite</b> und <b>' + PT.fmt(pr.fans) + '</b> Radiohörer werden Fans (bis Tag ' + pr.until + ')</li></ul>' +
        '<p class="pt-hint">Jetzt eine Folge veröffentlichen, damit die Radio-Werbung wirkt!</p>', { icon: '' });
      p.footer('<button data-act="x" data-primary class="pri">Weiter</button>'); UI.bind(p.root, { x: () => p.close() });
      G().afterAction();
    }
    UI.bind(pnl.root, {
      tab: b => { view = b.dataset.t; render(); },
      toggle: () => { P.toggle(); render(); },
      st: b => { P.play(b.dataset.s); render(); },
      quick: b => { pnl.close(); finish(b.dataset.s, 0.35); },
      show: b => {
        const id = b.dataset.s, s = R.showById(id); pnl.close();
        G().runMG(s.mg, { ctx: { prod: 'radio' }, title: '📻 ' + s.name, onDone: res => finish(id, res ? (res.score || 0) / 100 : 0.2) });
      }
    });
    render();
    return pnl;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = UI;
})(typeof window !== 'undefined' ? window : globalThis);
