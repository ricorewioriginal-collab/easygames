/* AnMaCha UNDERCOVER 3D – Statistik und Erfolge.
   AMU.Ach.DEFS                 alle Erfolge { id, icon, title, desc } (+ interne Prüfung test(c))
   AMU.Ach.record(info) → { newAch: [defs] }   info = { kind:'sim'|'word', mode, online, won, me:{ id, role, team, alive, st }, result }
   AMU.Ach.sync()               schreibt den easygames-Standardschlüssel 'anmacha-gameach.anmacha-undercover'
   AMU.Ach.unlocked(), AMU.Ach.list(), AMU.Ach.screen(onBack)
   Zählt nur, was das Ergebnisobjekt hergibt; fehlende oder kaputte Felder werden ignoriert. Solo (gegen Bots) und Online getrennt. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const GA_KEY = 'anmacha-gameach.anmacha-undercover', TITLE = 'AnMaCha UNDERCOVER 3D';
  const MODE_N = { jagd: ['🎭', 'Verräter-Jagd'], wort: ['🤫', 'Imposter: Das geheime Wort'], detektiv: ['🔍', 'Detektiv & Alibi'],
    chaos: ['⚡', 'Sabotage-Chaos'], jagen: ['🔦', 'Verstecken & Jagen'], rollen: ['🃏', 'Rollen-Chaos'] };
  const MODE_IDS = Object.keys(MODE_N);
  const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  // Zahl aus dem Ergebnis: nur endliche, nicht negative Werte, pro Partie gedeckelt (Schutz gegen Müll)
  const num = (x, max) => (typeof x === 'number' && isFinite(x) && x > 0) ? Math.min(Math.floor(x), max || 999) : 0;

  // ---------- Erfolge (c = Partie-Kontext, c.s = Statistik nach dieser Partie) ----------
  const D = (id, icon, title, desc, test) => ({ id, icon, title, desc, test });
  const DEFS = [
    D('erster_verdacht', '🔎', 'Erster Verdacht', 'Stimme zum ersten Mal richtig ab – gegen einen Verräter oder Imposter.', c => num(c.st.votesRight) >= 1),
    D('alibi', '🎭', 'Alibi-Künstler', 'Gewinne als Verräter nach mindestens 2 Besprechungen, ohne rausgewählt zu werden.',
      c => c.kind === 'sim' && c.team === 'traitor' && c.won && c.me.alive === true && num(c.rs.meetings) >= 2),
    D('fuenf_runden', '🛟', 'Fünf Runden überlebt', 'Überlebe 5 Partien in Folge (nicht ausgeknipst, nicht rausgewählt).', c => c.s.survivedStreak >= 5),
    D('frequenz', '📻', 'Meister der Frequenz', 'Erledige insgesamt 50 Aufgaben im Funkhaus.', c => c.s.tasks >= 50),
    D('wortdetektiv', '🕵️', 'Wortdetektiv', 'Stimme im Wortspiel gegen den Imposter und gewinne mit den Wissenden.',
      c => c.kind === 'word' && c.role === 'knower' && c.won && num(c.st.votesRight) >= 1),
    D('bluff', '👑', 'Bluff-König', 'Gewinne als Imposter im Wortspiel, ohne rausgewählt zu werden.', c => c.kind === 'word' && c.role === 'impostor' && c.won && c.me.ejected === false),
    D('technikretter', '🔧', 'Technikretter', 'Schließe in einer Partie 3 Reparaturen ab.', c => num(c.st.repairs) >= 3),
    D('stoersender', '📡', 'Unentdeckter Störsender', 'Gewinne als Störsender und bleib bis zum Schluss im Spiel.', c => c.role === 'jammer' && c.won && c.me.alive === true),
    ...MODE_IDS.map(m => D('sieg_' + m, MODE_N[m][0], 'Sieg: ' + MODE_N[m][1], 'Gewinne eine Partie im Modus „' + MODE_N[m][1] + '“.', c => c.won && c.mode === m)),
    D('allrounder', '🌈', 'Allrounder', 'Gewinne in allen sechs Modi mindestens einmal.', c => MODE_IDS.every(m => c.s.modes[m].solo.w + c.s.modes[m].online.w > 0)),
    D('auf_sendung', '🎙️', 'Auf Sendung', 'Spiele deine erste Partie.', c => c.s.games >= 1),
    D('stammgast', '📅', 'Stammgast', 'Spiele 25 Partien.', c => c.s.games >= 25),
    D('fleissig', '✅', 'Fleißige Hände', 'Erledige 5 Aufgaben in einer Partie.', c => num(c.st.tasks) >= 5),
    D('dauersendung', '🏅', 'Dauersendung', 'Erledige insgesamt 200 Aufgaben.', c => c.s.tasks >= 200),
    D('entkommen', '🚪', 'Entkommen!', 'Entkomme bei Verstecken & Jagen durch einen Ausgang.', c => c.escaped),
    D('fluchtprofi', '🏃', 'Fluchtprofi', 'Entkomme insgesamt 10-mal.', c => c.s.escapes >= 10),
    D('kaefig', '🔓', 'Käfig-Knacker', 'Befreie gefangene Mitspieler aus dem Käfig.', c => num(c.st.rescues) >= 1),
    D('bakenbauer', '📶', 'Bakenbauer', 'Aktiviere insgesamt 10 Funkbaken.', c => c.s.beacons >= 10),
    D('spuernase', '👃', 'Spürnase', 'Finde als Ermittler 5 Spuren in einer Partie.', c => c.kind === 'sim' && c.role === 'detective' && num(c.st.clues) >= 5),
    D('aktenberg', '🗂️', 'Aktenberg', 'Sammle insgesamt 25 Spuren.', c => c.s.clues >= 25),
    D('scharfes_auge', '🔦', 'Scharfes Auge', 'Fange als Jäger 3-mal Flüchtende in einer Partie.', c => c.kind === 'sim' && c.team === 'hunter' && num(c.st.kills) >= 3),
    D('schattenschicht', '🌙', 'Schattenschicht', 'Knipse als Verräter 3 Personen in einer Partie aus.', c => c.kind === 'sim' && c.team === 'traitor' && num(c.st.kills) >= 3),
    D('gedankenleser', '🧠', 'Gedankenleser', 'Errate als enttarnter Imposter das geheime Wort.', c => c.kind === 'word' && num(c.st.guessed) >= 1),
    D('trickser', '🃏', 'Trickser-Triumph', 'Gewinne als Trickser, indem du dich rauswählen lässt.', c => c.role === 'trickster' && c.won),
    D('schutzengel', '🛡️', 'Schutzengel', 'Gewinne als Beschützer, nachdem du deinen Schutz eingesetzt hast.', c => c.role === 'guard' && c.won && num(c.st.abil) >= 1),
    D('alarm', '📣', 'Alarm im Funkhaus', 'Melde eine ausgeknipste Person.', c => num(c.st.reports) >= 1),
    D('gerechte_stimme', '⚖️', 'Gerechte Stimme', 'Hilf insgesamt 10-mal mit, einen Verräter rauszuwählen.', c => c.s.traitorsCaught >= 10),
    D('weltempfaenger', '🌐', 'Weltempfänger', 'Spiele eine Online-Partie mit anderen Geräten.', c => c.online),
    D('unverwuestlich', '🔥', 'Unverwüstlich', 'Überlebe 10 Partien in Folge.', c => c.s.bestStreak >= 10)
  ];
  const BY_ID = {}; DEFS.forEach(d => { BY_ID[d.id] = d; });
  const pub = d => ({ id: d.id, icon: d.icon, title: d.title, desc: d.desc });

  // ---------- Speicher ----------
  function unlocked() {
    const S = AMU.Save, o = {}; if (!S) return o;
    const a = S.get('ach', {});
    if (isObj(a)) for (const k in a) if (BY_ID[k] && typeof a[k] === 'number' && isFinite(a[k]) && a[k] > 0) o[k] = a[k];
    return o;
  }
  function sync(u) {
    u = u || unlocked();
    try {
      const ls = root.localStorage; if (!ls) return false;
      ls.setItem(GA_KEY, JSON.stringify({ t: TITLE, d: DEFS.map(pub), u }));
      return true;
    } catch (e) { return false; }
  }
  const seen = typeof WeakSet === 'function' ? new WeakSet() : null;   // dasselbe Ergebnis nie doppelt zählen

  function record(info) {
    const out = { newAch: [] };
    try {
      const S = AMU.Save; if (!S || !isObj(info)) return out;
      const res = isObj(info.result) ? info.result : null;
      if (!res || typeof res.winner !== 'string' || !Array.isArray(res.players)) return out;   // kein echtes Ergebnis
      if (seen) { if (seen.has(res)) return out; seen.add(res); }
      const kind = info.kind === 'word' || res.word != null ? 'word' : 'sim';
      const mode = kind === 'word' ? 'wort' : (MODE_IDS.includes(info.mode) && info.mode !== 'wort' ? info.mode : null);
      const im = isObj(info.me) ? info.me : {};
      const rp = res.players.find(p => isObj(p) && im.id != null && p.id === im.id) || null;
      if (!rp) return out;                                                        // ich war nicht dabei
      const me = Object.assign({}, im, rp);
      const st = isObj(rp.st) ? rp.st : (isObj(im.st) ? im.st : {});
      const role = typeof me.role === 'string' ? me.role : '';
      const team = typeof me.team === 'string' ? me.team : (AMU.ROLES && AMU.ROLES[role] ? AMU.ROLES[role].team : role);
      const won = Array.isArray(res.winners) ? res.winners.includes(me.id) : !!info.won;
      const online = !!info.online;
      const escaped = kind === 'sim' && (me.escaped === true || num(st.escaped) >= 1);
      // überlebt? (null = zählt für die Serie nicht, z. B. Jäger)
      let survived = null;
      if (kind === 'word') survived = me.ejected !== true;
      else if (mode === 'jagen') survived = team === 'runner' ? escaped : null;
      else survived = st.survived !== false && me.alive !== false;

      const s = S.stats();
      s.games++;
      if (mode) { const b = s.modes[mode][online ? 'online' : 'solo']; b.g++; if (won) b.w++; }
      if (kind === 'sim') {
        s.tasks += num(st.tasks); s.repairs += num(st.repairs); s.clues += num(st.clues); s.rescues += num(st.rescues);
        s.beacons += num(st.beacons, 20); s.traitorsCaught += num(st.ejectedTraitors, 5); if (escaped) s.escapes++;
        if (team === 'traitor') s.kills += num(st.kills, 20);
      } else {
        if (role === 'knower') s.wordHits += num(st.votesRight, 10);
        if (role === 'impostor' && num(st.guessed) >= 1) s.guesses++;
      }
      if (survived === true) { s.survivedStreak++; s.bestStreak = Math.max(s.bestStreak, s.survivedStreak); }
      else if (survived === false) s.survivedStreak = 0;
      S.saveStats(s);

      const c = { kind, mode, online, won, role, team, me, st, escaped, rs: isObj(res.stats) ? res.stats : {}, s };
      const u = unlocked(), now = Date.now();
      DEFS.forEach(d => {
        if (u[d.id]) return;
        let ok = false; try { ok = !!d.test(c); } catch (e) { ok = false; }
        if (ok) { u[d.id] = now; out.newAch.push(pub(d)); }
      });
      if (out.newAch.length) S.set('ach', u);
      sync(u);
    } catch (e) { /* nie das Spielende stören */ }
    return out;
  }
  function list() { const u = unlocked(); return DEFS.map(d => Object.assign(pub(d), { at: u[d.id] || 0 })); }

  // ---------- Bildschirm ----------
  const CSS = '.uic-ach-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}' +
    '.uic-ach{display:flex;gap:10px;align-items:flex-start;background:#0b1630;border:1px solid #29d3ff33;border-radius:12px;padding:10px}' +
    '.uic-ach>i{font-style:normal;font-size:26px;line-height:1;flex:0 0 auto}.uic-ach b{display:block}.uic-ach small{color:var(--mu);display:block}' +
    '.uic-ach.off{opacity:.5;filter:grayscale(1)}.uic-ach.off>i{opacity:.6}' +
    '.uic-bar{height:8px;border-radius:4px;background:#0006;overflow:hidden;margin:6px 0}.uic-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--cy),var(--or))}' +
    '.uic-tbl{width:100%;border-collapse:collapse;font-size:14px}.uic-tbl th,.uic-tbl td{padding:6px 4px;border-bottom:1px solid #29d3ff22;text-align:right}' +
    '.uic-tbl th:first-child,.uic-tbl td:first-child{text-align:left}.uic-tbl th{color:var(--mu);font-weight:600}' +
    '.uic-kv{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}.uic-kv div{background:#0b1630;border:1px solid #29d3ff22;border-radius:10px;padding:8px}' +
    '.uic-kv b{display:block;font-size:20px;color:var(--cy)}.uic-kv small{color:var(--mu)}' +
    '.uic-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.uic-head .ui-h1{flex:1;min-width:0}';
  function css() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('amu-uic-css');
    if (!el) { el = document.createElement('style'); el.id = 'amu-uic-css'; (document.head || document.documentElement).appendChild(el); }
    if (!el.dataset.ach) { el.dataset.ach = '1'; el.textContent += CSS; }
  }
  const pl = n => n + (n === 1 ? ' Partie' : ' Partien');
  const pct = (w, g) => g ? Math.round(w * 100 / g) + ' %' : '–';
  function statsHtml(s) {
    const esc = AMU.UI.esc;
    let so = 0, on = 0;
    const rows = MODE_IDS.map(m => {
      const x = s.modes[m]; so += x.solo.g; on += x.online.g;
      return '<tr><td>' + MODE_N[m][0] + ' ' + esc(MODE_N[m][1]) + '</td><td>' + x.solo.g + '</td><td>' + x.solo.w + '</td><td>' + x.online.g + '</td><td>' + x.online.w + '</td><td>' + pct(x.online.w, x.online.g) + '</td></tr>';
    }).join('');
    const kv = [['Partien', s.games], ['Aufgaben erledigt', s.tasks], ['Reparaturen', s.repairs], ['Verräter rausgewählt (mit Stimme)', s.traitorsCaught],
      ['Spuren gefunden', s.clues], ['Funkbaken aktiviert', s.beacons], ['Entkommen', s.escapes], ['Befreiungen', s.rescues], ['Ausgeknipst (als Verräter)', s.kills],
      ['Richtige Stimmen im Wortspiel', s.wordHits], ['Wort erraten (Imposter)', s.guesses], ['Überlebt in Folge', s.survivedStreak], ['Beste Serie', s.bestStreak]];
    return '<div class="ui-card"><h2 class="ui-h2">Partien je Modus</h2><div style="overflow-x:auto"><table class="uic-tbl"><thead><tr><th>Modus</th><th title="Partien solo gegen Bots">Solo</th><th title="Siege solo">Siege</th>' +
      '<th title="Partien online">Online</th><th title="Siege online">Siege</th><th title="Siegquote online">Quote</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="ui-muted ui-small">Solo-Partien gegen Bots sind Übung – sie zählen für Erfolge, aber nie als Rangliste. Online: ' + pl(on) + ', Solo: ' + pl(so) + '.</p></div>' +
      '<div class="ui-card"><h2 class="ui-h2">Gesamt</h2><div class="uic-kv">' + kv.map(k => '<div><b>' + (k[1] | 0) + '</b><small>' + esc(k[0]) + '</small></div>').join('') + '</div></div>';
  }
  function achHtml() {
    const esc = AMU.UI.esc, l = list(), n = l.filter(x => x.at).length;
    const fmt = t => { try { return new Date(t).toLocaleDateString('de-DE'); } catch (e) { return ''; } };
    return '<div class="ui-card"><b>' + n + ' von ' + l.length + ' Erfolgen</b><div class="uic-bar"><i style="width:' + Math.round(n * 100 / l.length) + '%"></i></div></div>' +
      '<div class="uic-ach-grid" role="list">' + l.map(a => '<div class="uic-ach' + (a.at ? '' : ' off') + '" role="listitem" tabindex="0" aria-label="' + esc(a.title + (a.at ? ' – freigeschaltet' : ' – gesperrt') + ': ' + a.desc) + '"><i aria-hidden="true">' + a.icon + '</i><div><b>' + esc(a.title) + '</b><small>' + esc(a.desc) + '</small>' +
        (a.at ? '<small>✔ freigeschaltet am ' + fmt(a.at) + '</small>' : '<small>🔒 noch gesperrt</small>') + '</div></div>').join('') + '</div>';
  }
  function screen(onBack, tab) {
    css();
    let cur = tab === 'ach' ? 'ach' : 'stats';
    const head = () => '<div class="uic-head"><button class="ui-btn ui-sm" data-a="back">← Zurück</button><h1 class="ui-h1">🏆 Statistik &amp; Erfolge</h1></div>' +
      AMU.UI.seg('tab', [['stats', '📊 Statistik'], ['ach', '🏅 Erfolge']], cur);
    const body = () => cur === 'ach' ? achHtml() : statsHtml(AMU.Save ? AMU.Save.stats() : {});
    const el = AMU.UI.screen('<div class="ui-wrap"><div class="uic-top">' + head() + '</div><div class="uic-body">' + body() + '</div></div>', {
      key: 'ach',
      on(a, v) {
        if (a === 'back') { if (onBack) onBack(); return; }
        if (a === 'seg' && v && v.indexOf('tab:') === 0) {
          const t = v.slice(4); if (t === cur) return; cur = t;
          el.querySelector('.uic-top').innerHTML = head();
          el.querySelector('.uic-body').innerHTML = body();
          const b = el.querySelector('.ui-segb.on'); if (b) b.focus();
        }
      }
    });
    return el;
  }

  AMU.Ach = { DEFS, GA_KEY, record, sync, unlocked, list, screen };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.Ach;
})(typeof window !== 'undefined' ? window : globalThis);
