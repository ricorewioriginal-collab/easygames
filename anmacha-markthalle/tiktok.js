'use strict';
/* Marktrausch × TikTok LIVE: eigene Spiel-Aktionen für die TikTok-Steuerung (../stream-tiktok.js – in der Windows-App direkt im
   Spielfenster, im Browser über stream.html?game=anmacha-markthalle&tiktok=1). Geschenke, Likes und Chat-Befehle (!kaufen, !wetter …)
   lösen echte Ereignisse im Laden aus; Zuschauer kommen mit ihrem Namen als Kunden in den Laden. Jede Aktion hat einen eigenen
   Cooldown, damit der Chat das Spiel nicht zuspammt. „defaults“ ist die empfohlene Belegung, solange in den TikTok-Einstellungen
   keine eigene für Marktrausch gespeichert ist. Läuft ohne TikTok einfach nicht an (nur die Liste wird angelegt). */
(() => {
  const G = () => window.__amh, now = () => Date.now(), last = {};
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const nm = u => String(u || 'Jemand').replace(/[<>&"]/g, '').trim().slice(0, 18) || 'Jemand';

  // ---------- gut sichtbare Einblendung im Spiel (auch ohne Stream-Overlay) ----------
  let box = null; const q = [];
  function alertBox() {
    if (box) return box;
    const css = document.createElement('style');
    css.textContent = '#ttAlerts{position:fixed;left:50%;top:max(64px,9vh);transform:translateX(-50%);z-index:2147482000;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;width:min(92vw,560px)}' +
      '#ttAlerts .a{display:flex;align-items:center;gap:10px;padding:9px 16px 9px 10px;border-radius:16px;font:800 clamp(14px,2.2vw,19px)/1.2 system-ui,"Segoe UI",sans-serif;color:#fff;max-width:100%;' +
      'background:linear-gradient(rgba(14,10,30,.86),rgba(14,10,30,.86)) padding-box,linear-gradient(100deg,#25f4ee,#fe2c55) border-box;border:2px solid transparent;box-shadow:0 10px 28px rgba(0,0,0,.45),0 0 22px rgba(254,44,85,.28);' +
      'animation:ttaIn .45s cubic-bezier(.2,1.4,.4,1),ttaOut .45s ease-in 4.2s forwards}' +
      '#ttAlerts .a i{font-style:normal;font-size:1.7em;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))}#ttAlerts .a b{color:#ffd84a}#ttAlerts .a small{display:block;font-weight:600;font-size:.72em;opacity:.8}' +
      '@keyframes ttaIn{from{transform:translateY(-18px) scale(.8);opacity:0}to{transform:none;opacity:1}}@keyframes ttaOut{to{transform:translateY(-10px);opacity:0}}';
    document.head.appendChild(css); box = document.createElement('div'); box.id = 'ttAlerts'; document.body.appendChild(box); return box;
  }
  function alert(icon, user, text, sub) {
    const b = alertBox(), d = document.createElement('div'), e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    d.className = 'a'; d.innerHTML = `<i>${icon}</i><span><b>${e(user)}</b> ${e(text)}${sub ? `<small>${e(sub)}</small>` : ''}</span>`;
    b.appendChild(d); while (b.children.length > 3) b.firstChild.remove(); setTimeout(() => d.remove(), 4800);
  }

  // ---------- Aktionen ----------
  // cd = Sekunden bis zur nächsten gleichen Aktion, open = nur bei offenem Laden (Kunden), f(S, user) → Text oder false (nicht möglich)
  const open = S => S.phase === 'open';
  const shelfProds = S => { const s = {}; S.objs.forEach(o => { if (G().Sim.isShelf(o) && o.p) s[o.p] = 1; }); return Object.keys(s); };
  function setWeather(S, to) {
    const D = G().D; if (!D.WEATHER[to] || S.weather === to) return false; S.weather = to;
    if (to === 'heiss' && !S.ev.some(x => x.k === 'hitze')) S.ev.push({ k: 'hitze', t0: S.t, t1: G().Sim.dayLen(S), done: 1 });
    return D.WEATHER[to].e + ' ' + D.WEATHER[to].name;
  }
  const weatherAct = (id, to, icon) => ({ id, icon, label: 'Wetter: ' + (to ? to[0].toUpperCase() + to.slice(1) : 'zufällig'), cd: 20,
    f: S => { const ks = Object.keys(G().D.WEATHER).filter(k => k !== S.weather), r = setWeather(S, to || pick(ks)); return r && ['macht das Wetter: ' + r, 'Das wirkt sofort auf Kundschaft und Nachfrage.']; } });
  const ACTS = [
    { id: 'kunde', icon: '🛍️', label: 'Zuschauer kommt als Kunde', cd: 0, open: 1, max: 30,
      f: (S, u) => { const c = G().Sim.spawn(S); if (!c) return false; c.name = nm(u); c.mood = Math.min(100, c.mood + 10); return ['kommt zum Einkaufen in deinen Laden!', 'Bedien ' + nm(u) + ' gut – sonst gibt’s eine schlechte Bewertung.']; } },
    { id: 'ansturm', icon: '🛒', label: 'Kundenansturm (8 Kunden)', cd: 25, open: 1,
      f: S => { let n = 0; for (let i = 0; i < 8; i++) if (G().Sim.spawn(S)) n++; return n && ['schickt einen Kundenansturm! 🛒×' + n, 'Alle Kassen besetzen!']; } },
    { id: 'lieferung', icon: '🚚', label: 'Gratis-Lieferung (3 Kartons)', cd: 30,
      f: S => { const P = G().D.PRODUCTS, ps = shelfProds(S).length ? shelfProds(S) : Object.keys(P).filter(p => S.lic[P[p].cat]); if (!ps.length) return false;
        const got = []; for (let i = 0; i < 3; i++) { const p = pick(ps); S.backlog.push({ p, n: P[p].box, age: 0 }); got.push(P[p].e); } return ['schenkt dir eine Lieferung: ' + got.join(' '), 'Die Kartons stehen gleich an der Warenannahme im Hof.']; } },
    { id: 'rabatt', icon: '🏷️', label: 'Tagesangebot (−20 %, mehr Nachfrage)', cd: 30,
      f: S => { const P = G().D.PRODUCTS, ps = shelfProds(S).filter(p => !S.promo[p]); if (!ps.length) return false; Object.keys(S.promo).forEach((p, i, a) => { if (a.length >= 2 && i === 0) delete S.promo[p]; });
        const p = pick(ps); S.promo[p] = true; return ['startet ein Angebot: ' + P[p].e + ' ' + P[p].name + ' −20 %', 'Heute doppelt so gefragt.']; } },
    { id: 'diebe', icon: '🦹', label: 'Diebesbande (3 Diebe)', cd: 60, open: 1,
      f: S => { let n = 0; for (let i = 0; i < 3; i++) { const c = G().Sim.spawn(S, 'stud'); if (c) { c.thief = true; n++; } } return n && ['schickt eine Diebesbande! 🦹×' + n, 'Schnapp sie dir, bevor sie abhauen!']; } },
    { id: 'testerin', icon: '🧐', label: 'Testerin besucht den Laden', cd: 90, open: 1,
      f: S => { const c = G().Sim.spawn(S, 'krit'); return !!c && ['schickt eine strenge Testerin!', 'Sauber, voll, günstig – jetzt zählt alles.']; } },
    { id: 'strom', icon: '⚡', label: 'Stromausfall (30 s)', cd: 120, open: 1,
      f: S => { if (S.ev.some(e => e.k === 'stromausfall' && S.t <= e.t1)) return false; S.ev.push({ k: 'stromausfall', t0: S.t, t1: S.t + 30 }); return ['knipst das Licht aus! Stromausfall!', S.up.notstrom ? 'Zum Glück hast du Notstrom.' : 'Kühlware in Gefahr!']; } },
    { id: 'pfuetze', icon: '💦', label: 'Pfützen im Laden', cd: 30, open: 1,
      f: S => { if (S.messes.length >= 12) return false; const dt = G().Sim.doorTile(S); for (let i = 0; i < 3 && S.messes.length < 12; i++) S.messes.push({ x: Math.max(0, Math.min(S.W - 1, dt[0] + i - 1)), y: Math.max(0, dt[1] - 1 - (i % 2)), id: S.nid++ }); return ['macht Pfützen am Eingang 💦', 'Schnell wischen!']; } },
    { id: 'trinkgeld', icon: '💶', label: 'Trinkgeld +20 €', cd: 3, f: S => { S.money += 2000; S.fx.push({ t: 'cash' }); return ['gibt 20 € Trinkgeld!']; } },
    { id: 'geldregen', icon: '💸', label: 'Geldregen +250 €', cd: 15, f: S => { S.money += 25000; S.fx.push({ t: 'cash' }); return ['lässt es Geld regnen: +250 €!']; } },
    { id: 'werbung', icon: '📣', label: 'Werbung: mehr Kundschaft & Ruf', cd: 45, f: S => { S.buzz = Math.min(.5, (S.buzz || 0) + .05); S.rep = Math.min(100, S.rep + 2); return ['macht Werbung für deinen Laden!', 'Mehr Laufkundschaft, Ruf +2.']; } },
    weatherAct('wetter', null, '🌦️'), weatherAct('sonne', 'sonne', '☀️'), weatherAct('regen', 'regen', '🌧️'), weatherAct('schnee', 'schnee', '🌨️'), weatherAct('hitze', 'heiss', '🔥'), weatherAct('gewitter', 'gewitter', '⛈️')
  ];
  let perMin = [];   // Kunden mit Zuschauernamen begrenzen (Laden bleibt spielbar)
  function run(a, user) {
    const g = G(), S = g && g.S; if (!S || S.phase === 'summary') return false;
    if (a.open && !open(S)) { alert('🔒', nm(user), 'wollte „' + a.label + '“', 'Geht erst, wenn der Laden offen ist.'); return false; }
    if (a.cd && now() - (last[a.id] || 0) < a.cd * 1000) return false;
    if (a.max) { perMin = perMin.filter(t => now() - t < 60000); if (perMin.length >= a.max) return false; }
    const r = a.f(S, user); if (!r) return false;
    last[a.id] = now(); if (a.max) perMin.push(now());
    g.Sim.note(S, a.icon + ' TikTok: ' + nm(user) + ' ' + r[0], 'info'); alert(a.icon, nm(user), r[0], r[1]); return true;
  }

  const G1 = (gift, icon, act, label) => ({ gift, icon, action: 'game:' + act, label });
  window.EasyGamesStream = {
    actions: ACTS.map(a => ({ id: a.id, icon: a.icon, label: a.label, run: u => run(a, u) })),
    defaults: {
      cooldown: 8,
      commands: [['kaufen', 'game:kunde'], ['einkaufen', 'game:kunde'], ['wetter', 'game:wetter'], ['sonne', 'game:sonne'], ['regen', 'game:regen'], ['schnee', 'game:schnee'], ['werbung', 'game:werbung']],
      gifts: [G1('Rose', '🌹', 'kunde', 'Du kommst als Kunde'), G1('Finger Heart', '🫰', 'trinkgeld', 'Trinkgeld +20 €'), G1('Doughnut', '🍩', 'rabatt', 'Tagesangebot'),
        G1('Hand Hearts', '🫶', 'lieferung', 'Gratis-Lieferung'), G1('Confetti', '🎊', 'ansturm', 'Kundenansturm'), G1('Corgi', '🐕', 'testerin', 'Testerin kommt'),
        G1('Money Gun', '💸', 'geldregen', 'Geldregen +250 €'), G1('Galaxy', '🌌', 'diebe', 'Diebesbande'), G1('Lion', '🦁', 'strom', 'Stromausfall'), { gift: 'Universe', icon: '🪐', action: 'game:gewitter+game:pfuetze+game:ansturm', label: 'Unwetter + Ansturm' }],
      likes: { every: 150, action: 'game:kunde', label: 'Ein Kunde mehr' }
    }
  };
})();
