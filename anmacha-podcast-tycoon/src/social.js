/* AnMaCha – Der Podcast · Beziehungen und Club-Feeling: Fans in der Stadt werden zu Bekannten, Fans, Superfans und besten Fans.
   Soziale Aktionen (Selfie, Autogramm, High-Five, Tanzen, Geschenk, Insider-Witz, Show-Einladung), Freundebuch und Bonus für die Folge. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, D = AMC.Data, Save = AMC.Save;
  const SO = AMC.Social = {};
  const LV = [[0, 'Neu', '🙂'], [10, 'Bekannt', '👋'], [30, 'Fan', '🧡'], [60, 'Superfan', '💖'], [100, 'Bester Fan', '👑']];
  SO.LEVELS = LV;
  const db = () => { const s = Save.data.social = Save.data.social || {}; s.f = s.f || {}; return s; };
  SO.points = name => db().f[name] || 0;
  SO.level = name => { const p = SO.points(name); let r = LV[0]; for (const l of LV) if (p >= l[0]) r = l; return { min: r[0], name: r[1], icon: r[2], i: LV.indexOf(r), next: (LV[LV.indexOf(r) + 1] || [])[0] }; };
  SO.label = name => { const l = SO.level(name); return l.icon + ' ' + l.name; };
  SO.superfans = () => Object.values(db().f).filter(p => p >= 60).length;
  const today = () => { const c = AMC.Career ? AMC.Career.state() : { today: {} }; c.today.soc = c.today.soc || {}; return c.today; };
  // Freundschaft steigt; Aufstieg wird gefeiert
  SO.add = function (name, n) {
    const s = db(), before = SO.level(name).i;
    s.f[name] = Math.min(120, (s.f[name] || 0) + n); Save.save();
    const l = SO.level(name);
    if (l.i > before && l.i >= 2) { AMC.Audio.sfx('combo'); AMC.UI.toast(l.icon + ' ' + name + ' ist jetzt ' + (l.i === 4 ? 'euer bester Fan' : l.name) + '!' + (l.i >= 3 ? ' (+2 % Hörer pro Superfan)' : ''), 3600); }
    return l;
  };
  // Persönliche Begrüßung für Fans, die euch kennen (Sprechblasen in der Stadt)
  SO.greet = function (name, host) {
    const l = SO.level(name), H = (D.HOSTS[host] || {}).name || 'ihr';
    if (l.i < 2) return null;
    return U.pick(l.i >= 3 ? [H + '! Mein Lieblings-Host! 💖', 'Da ist ja mein ' + H + '! 🧡', 'Ich hab euer Selfie eingerahmt! 🖼️', 'Hab allen von euch erzählt! 📣'] : ['Hey ' + H + '! 👋', 'Wieder in der Stadt? 😄', 'Neue Folge schon fertig? 🎙️']);
  };

  const GIFTS = ['🧁 Muffin', '🌻 Sonnenblume', '🎧 Sticker-Set', '☕ Kaffee to go', '🧦 AnMaCha-Socken'];
  const JOKES = ['„Warum hat Gisela kein WLAN? Sie hat nur Camping-Netz.“', '„Wie viele Podcaster braucht man für eine Glühbirne? Zwei – und 45 Minuten Einleitung.“', '„Andrew, ist das Mikro an?“ – „Seit drei Folgen.“', '„Marco, was ist dein Lieblingssender?“ – „Gisela FM.“'];
  // [id, Icon, Name, Punkte, Kosten, Mindeststufe, Wirkung]
  const ACT = [
    ['hi5', '🙌', 'High-Five', 4, 0, 0, (n, S) => { emote(S, n, 'arms'); return '🙌 Klatsch! ' + n.name + ' strahlt.'; }],
    ['selfie', '🤳', 'Selfie zusammen', 8, 0, 0, (n, S) => { flash(); emote(S, n, 'yes'); Save.earn(3); return '🤳 Selfie mit ' + n.name + ' · +3 🎟️'; }],
    ['auto', '✍️', 'Autogramm geben', 6, 0, 1, n => { Save.earn(2); return '✍️ ' + n.name + ': „Das kommt an den Kühlschrank!“ · +2 🎟️'; }],
    ['dance', '💃', 'Zusammen tanzen', 10, 0, 1, (n, S) => { if (AMC.CityVibe && !(AMC.CityVibe.state() || {}).dancing) AMC.CityVibe.emote('dance'); emote(S, n, 'dance', 4); return '💃 ' + n.name + ' tanzt mit – die Straße schaut zu!'; }],
    ['gift', '🎁', 'Geschenk machen', 18, 15, 1, n => '🎁 ' + U.pick(GIFTS) + ' für ' + n.name + '. Riesenfreude!'],
    ['joke', '😂', 'Insider-Witz', 7, 0, 2, (n, S) => { emote(S, n, 'arms'); return '😂 ' + U.pick(JOKES) + ' – ' + n.name + ' lacht Tränen.'; }],
    ['guest', '⭐', 'Als Gast in die nächste Folge einladen', 12, 0, 3, n => { today().guestFan = n.name; return '⭐ ' + n.name + ' ist heute Abend Studiogast! (+10 % Hörer bei der Aufnahme)'; }]
  ];
  function emote(S, n, a, t) { if (n.fig) { n.fig.play(a, { restart: true, fade: 0.1 }); n.anim = a; n.danceT = t || 1.6; if (S && S.pl) n.fig.root.rotation.y = Math.atan2(S.pl.x - n.x, S.pl.z - n.z); } }
  function flash() { const fl = U.el('div', 'hm-selfie'); document.body.appendChild(fl); setTimeout(() => fl.remove(), 600); }

  // Fan treffen: Panel mit allen Aktionen, jede einmal am Tag pro Fan
  SO.open = function (n, S) {
    const t = today(), key = a => n.name + ':' + a[0];
    const draw = () => {
      const l = SO.level(n.name), p = SO.points(n.name);
      const rows = ACT.map((a, i) => {
        const lock = l.i < a[5], used = t.soc[key(a)], guestTaken = a[0] === 'guest' && t.guestFan && t.guestFan !== n.name, off = lock || used || guestTaken;
        const sub = lock ? '🔒 ab ' + LV[a[5]][2] + ' ' + LV[a[5]][1] : used ? 'Heute schon gemacht' : guestTaken ? t.guestFan + ' ist heute schon Gast' : '+' + a[3] + ' ❤️' + (a[4] ? ' · ' + a[4] + ' 🎟️' : '');
        return '<button type="button" class="st-item" data-nav data-s="' + i + '"' + (off ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + a[1] + '</span><span><b>' + a[2] + '</b><small>' + sub + '</small></span></button>';
      }).join('');
      const pct = l.next ? Math.round((p - l.min) / (l.next - l.min) * 100) : 100;
      return '<p class="hint">' + l.icon + ' <b>' + l.name + '</b> · ❤️ ' + Math.min(p, 100) + (l.next ? ' / ' + l.next : '') + ' · 🎟️ ' + U.fmt(Save.data.fan) + '</p><div class="so-bar"><i style="width:' + pct + '%"></i></div><div class="st-list" id="soL">' + rows + '</div>';
    };
    const s = AMC.UI.open('<div class="panel glass"><header><h2>💬 ' + U.esc(n.name) + '</h2><button class="btn small" data-nav id="soB">' + AMC.glyph('b') + ' Zurück</button></header><div id="soBody">' + draw() + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#soB').onclick = () => AMC.UI.close(s);
    s.el.querySelector('#soBody').addEventListener('click', e => {
      const b = e.target.closest('[data-s]'); if (!b || b.getAttribute('aria-disabled')) return; const a = ACT[+b.dataset.s];
      if (a[4]) { if (Save.data.fan < a[4]) { AMC.Audio.sfx('miss'); AMC.UI.toast('Zu wenig Fan-Punkte (' + a[4] + ' 🎟️ nötig).'); return; } Save.data.fan -= a[4]; }
      t.soc[key(a)] = 1; t.socN = (t.socN || 0) + 1; if (AMC.Career) AMC.Career.mark('dance');
      AMC.UI.close(s); AMC.Audio.sfx('ok');
      const txt = a[6](n, S); SO.add(n.name, a[3]);
      AMC.UI.toast(txt + ' · +' + a[3] + ' ❤️', 3400);
    });
    return s;
  };

  // Freundebuch: alle Fans, die ihr kennt
  SO.book = function () {
    const f = db().f, names = Object.keys(f).sort((a, b) => f[b] - f[a]);
    const rows = names.length ? names.map(nm => { const l = SO.level(nm); return '<div class="st-item"><span class="st-ic">' + l.icon + '</span><span><b>' + U.esc(nm) + '</b><small>' + l.name + ' · ❤️ ' + Math.min(f[nm], 100) + '</small></span></div>'; }).join('')
      : '<p class="hint">Noch niemand. Sprich Fans in der Stadt an und triff sie danach wieder.</p>';
    const s = AMC.UI.open('<div class="panel glass"><header><h2>❤️ Freundebuch</h2><button class="btn small" data-nav id="sbB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">' + names.length + ' Bekanntschaften · 💖 ' + SO.superfans() + ' Superfans (je +2 % Hörer, bis +10 %)</p><div class="st-list" id="sbL">' + rows + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#sbB').onclick = () => AMC.UI.close(s);
    return s;
  };
  // Einfluss auf die Folge (Career.episode)
  SO.bonus = function () { const t = today(); return Math.min(0.1, SO.superfans() * 0.02) + (t.guestFan ? 0.1 : 0); };
})(typeof window !== 'undefined' ? window : globalThis);
