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
      '#ttAlerts .av{position:relative;flex:none;width:2.6em;height:2.6em;border-radius:50%;padding:2px;background:conic-gradient(#25f4ee,#fe2c55,#25f4ee);display:grid;place-items:center;font-size:1em;font-weight:900;color:#fff}' +
      '#ttAlerts .av img{width:100%;height:100%;border-radius:50%;object-fit:cover;background:#222;display:block}#ttAlerts .av i{position:absolute;right:-.45em;bottom:-.35em;font-style:normal;font-size:1.15em;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6))}#ttAlerts .a em{font-style:normal;font-weight:600;font-size:.72em;opacity:.65}' +
      '#ttAlerts .a b{color:#ffd84a}#ttAlerts .a small{display:block;font-weight:600;font-size:.72em;opacity:.8}' +
      '@keyframes ttaIn{from{transform:translateY(-18px) scale(.8);opacity:0}to{transform:none;opacity:1}}@keyframes ttaOut{to{transform:translateY(-10px);opacity:0}}';
    document.head.appendChild(css); box = document.createElement('div'); box.id = 'ttAlerts'; document.body.appendChild(box); return box;
  }
  function alert(icon, user, text, sub, pf) {
    const b = alertBox(), d = document.createElement('div'), e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const pic = pf && /^https:\/\//.test(pf.pic || '') ? pf.pic : '', hd = pf && pf.handle ? '@' + String(pf.handle).replace(/^@/, '') : '';
    // TikTok-Profilbild (Ring in TikTok-Farben, Symbol der Aktion als Plakette) – ohne Bild der Anfangsbuchstabe
    const av = `<span class="av">${pic ? `<img src="${e(pic)}" alt="" referrerpolicy="no-referrer" onerror="this.replaceWith(document.createTextNode('${e(String(user)[0] || '?').replace(/'/g, '')}'))">` : e(String(user)[0] || '?')}<i>${icon}</i></span>`;
    d.className = 'a'; d.innerHTML = `${av}<span><b>${e(user)}</b>${hd && hd.slice(1) !== user ? ` <em>${e(hd)}</em>` : ''} ${e(text)}${sub ? `<small>${e(sub)}</small>` : ''}</span>`;
    b.appendChild(d); while (b.children.length > 3) b.firstChild.remove(); setTimeout(() => d.remove(), 4800);
  }

  // ---------- Bildschirm-Effekte: jede Aktion ist sichtbar (Regen, Blitz, Wackeln, großes Symbol, Durchfahrt, Dunkel, Stempel) ----------
  let fxl = null;
  function fxLayer() {
    if (fxl) return fxl; alertBox();
    const css = document.createElement('style');
    css.textContent = '#ttFx{position:fixed;inset:0;z-index:2147481990;pointer-events:none;overflow:hidden}#ttFx>*{position:absolute}' +
      '#ttFx .r{top:-60px;font-size:clamp(26px,4.5vw,46px);animation:ttfRain linear forwards}@keyframes ttfRain{to{transform:translateY(115vh) rotate(var(--rot))}}' +
      '#ttFx .up{bottom:-60px;font-size:clamp(26px,4.5vw,46px);animation:ttfUp ease-out forwards}@keyframes ttfUp{to{transform:translateY(-115vh) rotate(var(--rot));opacity:.2}}' +
      '#ttFx .fl{inset:0;animation:ttfFlash .9s ease-out forwards}@keyframes ttfFlash{from{opacity:.6}to{opacity:0}}' +
      '#ttFx .big{left:50%;top:50%;font-size:min(34vw,34vh);line-height:1;filter:drop-shadow(0 12px 30px rgba(0,0,0,.5));animation:ttfBig 1.6s cubic-bezier(.2,1.5,.4,1) forwards}@keyframes ttfBig{0%{transform:translate(-50%,-50%) scale(.1) rotate(-20deg);opacity:0}25%{transform:translate(-50%,-50%) scale(1.1) rotate(6deg);opacity:1}75%{opacity:1}100%{transform:translate(-50%,-50%) scale(1.25);opacity:0}}' +
      '#ttFx .drv{bottom:12vh;left:-30vw;font-size:clamp(60px,12vw,140px);animation:ttfDrive 2.6s ease-in-out forwards}@keyframes ttfDrive{to{left:110vw}}' +
      '#ttFx .dk{inset:0;background:#000;animation:ttfDark 3s steps(1) forwards}@keyframes ttfDark{0%{opacity:.85}10%{opacity:.2}14%{opacity:.9}60%{opacity:.8}64%{opacity:.3}68%{opacity:.85}100%{opacity:0}}' +
      '#ttFx .st{left:50%;top:46%;padding:.15em .5em;border:.12em solid currentColor;border-radius:.2em;font:900 clamp(40px,11vw,130px)/1.2 system-ui,"Segoe UI",sans-serif;letter-spacing:.04em;text-shadow:0 4px 18px rgba(0,0,0,.5);animation:ttfStamp 2.2s cubic-bezier(.2,1.6,.4,1) forwards}@keyframes ttfStamp{0%{transform:translate(-50%,-50%) rotate(-14deg) scale(3);opacity:0}18%{transform:translate(-50%,-50%) rotate(-10deg) scale(1);opacity:1}80%{opacity:1}100%{transform:translate(-50%,-50%) rotate(-10deg) scale(1);opacity:0}}' +
      '#ttFx .spl{left:50%;top:50%;width:150vmax;height:150vmax;border-radius:50%;background:radial-gradient(circle,rgba(154,205,50,.0) 30%,rgba(120,170,30,.55) 31%,rgba(154,205,50,.35) 45%,transparent 46%),radial-gradient(circle at 30% 40%,rgba(130,180,20,.6) 0 6%,transparent 7%),radial-gradient(circle at 70% 60%,rgba(130,180,20,.6) 0 5%,transparent 6%),radial-gradient(circle at 55% 25%,rgba(130,180,20,.6) 0 4%,transparent 5%);animation:ttfSplat 2.4s ease-out forwards}@keyframes ttfSplat{0%{transform:translate(-50%,-50%) scale(.05);opacity:1}20%{transform:translate(-50%,-50%) scale(.6);opacity:1}100%{transform:translate(-50%,-50%) scale(.7);opacity:0}}' +
      '@keyframes ttfShake{0%,100%{translate:0 0}20%{translate:-12px 6px}40%{translate:10px -7px}60%{translate:-8px -5px}80%{translate:9px 7px}}';
    document.head.appendChild(css); fxl = document.createElement('div'); fxl.id = 'ttFx'; document.body.appendChild(fxl); return fxl;
  }
  const el = (cls, html, ms, style) => { const d = document.createElement('div'); d.className = cls; if (html) d.textContent = html; if (style) d.style.cssText = style; fxLayer().appendChild(d); setTimeout(() => d.remove(), ms); return d; };
  function vfx(v) {
    if (!v) return; const L = fxLayer(), icons = [].concat(v.rain || v.up || []);
    if (v.flash) el('fl', '', 1000, 'background:' + v.flash);
    if (v.dark) el('dk', '', 3100);
    if (v.splat) el('spl', '', 2500);
    if (icons.length) { const n = Math.min(40, v.n || 18); for (let i = 0; i < n; i++) { const dur = 1.4 + Math.random() * 1.6; el(v.up ? 'up' : 'r', icons[i % icons.length], (dur + .8) * 1000, `left:${Math.random() * 96}vw;animation-duration:${dur}s;animation-delay:${Math.random() * .9}s;--rot:${Math.round(Math.random() * 720 - 360)}deg`); } }
    if (v.big) el('big', v.big, 1700);
    if (v.drive) el('drv', v.drive, 2700);
    if (v.stamp) el('st', v.stamp[0], 2300, 'color:' + (v.stamp[1] || '#fe2c55'));
    if (v.shake) { const b = document.body; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = 'ttfShake .12s linear ' + Math.round(v.shake / .12); setTimeout(() => { b.style.animation = ''; }, v.shake * 1000 + 150); }
    while (L.children.length > 90) L.firstChild.remove();
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
  const WXV = { sonne: { rain: ['☀️', '😎'], n: 10, flash: 'rgba(255,220,80,.55)' }, heiss: { rain: ['🔥', '🥵', '🍦'], flash: 'rgba(255,120,0,.55)' }, regen: { rain: ['💧', '🌧️', '☔'], n: 30, flash: 'rgba(80,140,255,.4)' }, schnee: { rain: ['❄️', '⛄', '🌨️'], n: 30, flash: 'rgba(230,240,255,.6)' }, gewitter: { rain: ['⚡', '🌧️', '💧'], n: 26, flash: 'rgba(255,255,255,.85)', shake: .8 }, kalt: { rain: ['🥶', '❄️'], flash: 'rgba(150,200,255,.5)' }, nebel: { rain: ['🌫️'], n: 12, flash: 'rgba(200,200,210,.6)' }, wolke: { rain: ['☁️', '⛅'], n: 12, flash: 'rgba(180,190,210,.4)' } };
  const weatherAct = (id, to, icon) => ({ id, icon, label: 'Wetter: ' + (to ? to[0].toUpperCase() + to.slice(1) : 'zufällig'), cd: 20,
    f: S => { const ks = Object.keys(G().D.WEATHER).filter(k => k !== S.weather), r = setWeather(S, to || pick(ks)); if (r) vfx(Object.assign({ big: G().D.WEATHER[S.weather].e }, WXV[S.weather])); return r && ['macht das Wetter: ' + r, 'Das wirkt sofort auf Kundschaft und Nachfrage.']; } });
  const ACTS = [
    { id: 'kunde', v: { big: '🛍️', rain: ['🛍️', '👋'], n: 8 },  icon: '🛍️', label: 'Zuschauer kommt als Kunde', cd: 0, open: 1, max: 30,
      f: (S, u) => { const c = G().Sim.spawn(S); if (!c) return false; c.name = nm(u); c.mood = Math.min(100, c.mood + 10); return ['kommt zum Einkaufen in deinen Laden!', 'Bedien ' + nm(u) + ' gut – sonst gibt’s eine schlechte Bewertung.']; } },
    { id: 'ansturm', v: { big: '🛒', rain: ['🛒', '🏃', '🛍️'], n: 30, shake: .6 },  icon: '🛒', label: 'Kundenansturm (8 Kunden)', cd: 25, open: 1,
      f: S => { let n = 0; for (let i = 0; i < 8; i++) if (G().Sim.spawn(S)) n++; return n && ['schickt einen Kundenansturm! 🛒×' + n, 'Alle Kassen besetzen!']; } },
    { id: 'lieferung', v: { drive: '🚚', rain: ['📦'], n: 14 },  icon: '🚚', label: 'Gratis-Lieferung (3 Kartons)', cd: 30,
      f: S => { const P = G().D.PRODUCTS, ps = shelfProds(S).length ? shelfProds(S) : Object.keys(P).filter(p => S.lic[P[p].cat]); if (!ps.length) return false;
        const got = []; for (let i = 0; i < 3; i++) { const p = pick(ps); S.backlog.push({ p, n: P[p].box, age: 0 }); got.push(P[p].e); } return ['schenkt dir eine Lieferung: ' + got.join(' '), 'Die Kartons stehen gleich an der Warenannahme im Hof.']; } },
    { id: 'rabatt', v: { stamp: ['−20 %', '#ffd84a'], rain: ['🏷️', '💥'], n: 16 },  icon: '🏷️', label: 'Tagesangebot (−20 %, mehr Nachfrage)', cd: 30,
      f: S => { const P = G().D.PRODUCTS, ps = shelfProds(S).filter(p => !S.promo[p]); if (!ps.length) return false; Object.keys(S.promo).forEach((p, i, a) => { if (a.length >= 2 && i === 0) delete S.promo[p]; });
        const p = pick(ps); S.promo[p] = true; return ['startet ein Angebot: ' + P[p].e + ' ' + P[p].name + ' −20 %', 'Heute doppelt so gefragt.']; } },
    { id: 'diebe', v: { big: '🦹', rain: ['🦹', '🚨', '💰'], n: 18, flash: 'rgba(255,40,40,.5)', shake: .5 },  icon: '🦹', label: 'Diebesbande (3 Diebe)', cd: 60, open: 1,
      f: S => { let n = 0; for (let i = 0; i < 3; i++) { const c = G().Sim.spawn(S, 'stud'); if (c) { c.thief = true; n++; } } return n && ['schickt eine Diebesbande! 🦹×' + n, 'Schnapp sie dir, bevor sie abhauen!']; } },
    { id: 'testerin', v: { big: '🧐', rain: ['📝', '⭐'], n: 12, flash: 'rgba(255,255,255,.45)' },  icon: '🧐', label: 'Testerin besucht den Laden', cd: 90, open: 1,
      f: S => { const c = G().Sim.spawn(S, 'krit'); return !!c && ['schickt eine strenge Testerin!', 'Sauber, voll, günstig – jetzt zählt alles.']; } },
    { id: 'strom', v: { dark: 1, rain: ['⚡'], n: 6 },  icon: '⚡', label: 'Stromausfall (30 s)', cd: 120, open: 1,
      f: S => { if (S.ev.some(e => e.k === 'stromausfall' && S.t <= e.t1)) return false; S.ev.push({ k: 'stromausfall', t0: S.t, t1: S.t + 30 }); return ['knipst das Licht aus! Stromausfall!', S.up.notstrom ? 'Zum Glück hast du Notstrom.' : 'Kühlware in Gefahr!']; } },
    { id: 'pfuetze', v: { big: '💦', rain: ['💧', '💦'], n: 22, flash: 'rgba(80,160,255,.35)' },  icon: '💦', label: 'Pfützen im Laden', cd: 30, open: 1,
      f: S => { if (S.messes.length >= 12) return false; const dt = G().Sim.doorTile(S); for (let i = 0; i < 3 && S.messes.length < 12; i++) S.messes.push({ x: Math.max(0, Math.min(S.W - 1, dt[0] + i - 1)), y: Math.max(0, dt[1] - 1 - (i % 2)), id: S.nid++ }); return ['macht Pfützen am Eingang 💦', 'Schnell wischen!']; } },
    { id: 'trinkgeld', v: { big: '💶', rain: ['💶', '🪙'], n: 12, flash: 'rgba(60,220,120,.35)' },  icon: '💶', label: 'Trinkgeld +20 €', cd: 3, f: S => { S.money += 2000; S.fx.push({ t: 'cash' }); return ['gibt 20 € Trinkgeld!']; } },
    { id: 'geldregen', v: { big: '💸', rain: ['💸', '💶', '🪙', '💰'], n: 40, flash: 'rgba(60,220,120,.45)' },  icon: '💸', label: 'Geldregen +250 €', cd: 15, f: S => { S.money += 25000; S.fx.push({ t: 'cash' }); return ['lässt es Geld regnen: +250 €!']; } },
    { id: 'werbung', v: { big: '📣', rain: ['📣', '⭐', '✨'], n: 16, shake: .3 },  icon: '📣', label: 'Werbung: mehr Kundschaft & Ruf', cd: 45, f: S => { S.buzz = Math.min(.5, (S.buzz || 0) + .05); S.rep = Math.min(100, S.rep + 2); return ['macht Werbung für deinen Laden!', 'Mehr Laufkundschaft, Ruf +2.']; } },
    { id: 'plus', icon: '🤑', label: 'Plus +100 €', cd: 3, v: { big: '🤑', rain: ['💶', '💶', '🪙'], n: 20, flash: 'rgba(60,220,120,.45)', stamp: ['+100 €', '#3ddc84'] }, f: S => { S.money += 10000; S.fx.push({ t: 'cash' }); return ['schenkt dir 100 €!']; } },
    { id: 'minus', icon: '💸', label: 'Minus −100 €', cd: 3, v: { up: ['💶', '💸'], n: 20, flash: 'rgba(255,40,40,.45)', stamp: ['−100 €', '#ff4d4d'] }, f: S => { S.money -= 10000; S.fx.push({ t: 'bad' }); return ['klaut dir 100 €!', 'Das Geld fliegt davon …']; } },
    { id: 'bankrott', icon: '💀', label: 'Bankrott! Kasse auf 0', cd: 120, v: { stamp: ['BANKROTT', '#ff4d4d'], up: ['💶', '💸', '🪙'], n: 34, flash: 'rgba(0,0,0,.7)', shake: 1 }, f: S => { if (S.money <= 0) return false; const was = S.money; S.money = 0; S.fx.push({ t: 'bad' }); return ['macht dich bankrott! 💀', G().fmt(was) + ' sind weg – die Kasse ist leer.']; } },
    { id: 'loeschen', icon: '💥', label: 'Spielstand löschen 😱', cd: 300, v: { stamp: ['GELÖSCHT', '#ff4d4d'], big: '💥', rain: ['💥', '🔥', '😱'], n: 30, flash: 'rgba(255,255,255,.9)', shake: 1.5 }, f: (S, u) => { wipe(u); return ['hat deinen Spielstand gelöscht! 😱', 'Der Streamer kann ihn in den TikTok-Einstellungen wiederherstellen.']; } },
    { id: 'umbenennen', icon: '🪧', label: 'Markt umbenennen', cd: 30, v: { big: '🪧', rain: ['🪧', '✨', '🎉'], n: 18, flash: 'rgba(255,216,74,.4)' },
      f: (S, u) => { const n = nm(u).slice(0, 12), names = [n + 's Ramschladen', n + '-Discount', 'Chez ' + n, n + 's Resterampe', 'Billig-' + n, n + ' Mega-Markt', 'Kaufhaus ' + n, n + 's Tante-Emma']; G().Sim.setIdentity(S, { name: pick(names) }); return ['benennt deinen Markt um: „' + S.shopName + '“', 'Steht jetzt am Schild über der Tür.']; } },
    { id: 'kotzen', icon: '🤮', label: 'In den Laden kotzen', cd: 15, v: { splat: 1, big: '🤮', rain: ['🤢', '🤮'], n: 10, flash: 'rgba(130,190,30,.45)', shake: .4 },
      f: S => { if (S.messes.length >= 12) return false; const c = S.customers.length ? pick(S.customers) : null, dt = G().Sim.doorTile(S), x = Math.floor(c ? c.x : S.player.x), y = Math.floor(c ? c.y : S.player.y);
        const tx = Math.max(0, Math.min(S.W - 1, isFinite(x) ? x : dt[0])), ty = Math.max(1, Math.min(S.H - 1, isFinite(y) ? y : dt[1] - 1)); S.messes.push({ x: tx, y: ty, id: S.nid++, k: 'kotze' });
        S.customers.forEach(k => { if (Math.hypot(k.x - tx, k.y - ty) < 4) { k.mood -= 12; k.bub = '🤢'; k.bt = 2.2; } }); S.fx.push({ t: 'bad' }); return [c ? 'lässt ' + c.name + ' in den Laden kotzen! 🤮' : 'kotzt in deinen Laden! 🤮', 'Schnell aufwischen, die Kunden ekeln sich.']; } },
    { id: 'pluendern', icon: '🏴‍☠️', label: 'Regal plündern', cd: 30, v: { big: '🏴‍☠️', up: ['📦', '🥫', '🍫', '🧃'], n: 26, flash: 'rgba(255,60,60,.4)', shake: .5 },
      f: S => { const Sim = G().Sim, P = G().D.PRODUCTS, sh = S.objs.filter(o => Sim.isShelf(o) && o.p && o.qty > 0).sort((a, b) => b.qty - a.qty)[0]; if (!sh) return false;
        const n = sh.qty; sh.qty = 0; S.today.stolen += n * Sim.wholesale(S, sh.p); S.fx.push({ t: 'flee' }); return ['plündert das Regal: ' + n + '× ' + P[sh.p].e + ' ' + P[sh.p].name + ' weg!', 'Nachfüllen, bevor die Kunden kommen.']; } },
    weatherAct('wetter', null, '🌦️'), weatherAct('sonne', 'sonne', '☀️'), weatherAct('regen', 'regen', '🌧️'), weatherAct('schnee', 'schnee', '🌨️'), weatherAct('hitze', 'heiss', '🔥'), weatherAct('gewitter', 'gewitter', '⛈️')
  ];
  // Spielstand löschen mit Sicherung (TikTok-Einstellungen → „Wiederherstellen“, gleiches Format wie stream-tiktok.js)
  function wipe(u) {
    const bak = {}; try { for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k && k.indexOf('amh_') === 0) bak[k] = localStorage.getItem(k); }
      localStorage.setItem('eg-tiktok-backup:anmacha-markthalle', JSON.stringify({ t: Date.now(), keys: bak, by: nm(u) })); } catch (e) { }
    window.__egNoSave = 1;   // game.js speichert dann nicht mehr beim Neuladen
    setTimeout(() => { try { Object.keys(bak).forEach(k => localStorage.removeItem(k)); } catch (e) { } location.reload(); }, 2600);
  }
  let perMin = [];   // Kunden mit Zuschauernamen begrenzen (Laden bleibt spielbar)
  function run(a, user, pf) {
    const g = G(), S = g && g.S; if (!S || S.phase === 'summary') return false;
    if (a.open && !open(S)) { alert('🔒', nm(user), 'wollte „' + a.label + '“', 'Geht erst, wenn der Laden offen ist.', pf); return false; }
    if (a.cd && now() - (last[a.id] || 0) < a.cd * 1000) return false;
    if (a.max) { perMin = perMin.filter(t => now() - t < 60000); if (perMin.length >= a.max) return false; }
    const r = a.f(S, user); if (!r) return false;
    last[a.id] = now(); if (a.max) perMin.push(now());
    g.Sim.note(S, a.icon + ' TikTok: ' + nm(user) + ' ' + r[0], 'info'); alert(a.icon, nm(user), r[0], r[1], pf); vfx(a.v); return true;
  }

  const G1 = (gift, icon, act, label) => ({ gift, icon, action: 'game:' + act, label });
  window.EasyGamesStream = {
    actions: ACTS.map(a => ({ id: a.id, icon: a.icon, label: a.label, run: (u, pf) => run(a, u, pf) })),
    defaults: {
      cooldown: 8,
      commands: [['kaufen', 'game:kunde'], ['einkaufen', 'game:kunde'], ['wetter', 'game:wetter'], ['sonne', 'game:sonne'], ['regen', 'game:regen'], ['schnee', 'game:schnee'], ['werbung', 'game:werbung'], ['kotzen', 'game:kotzen']],
      gifts: [G1('Rose', '🌹', 'kunde', 'Du kommst als Kunde'), G1('Finger Heart', '🫰', 'trinkgeld', 'Trinkgeld +20 €'), G1('Doughnut', '🍩', 'rabatt', 'Tagesangebot'),
        G1('Hand Hearts', '🫶', 'lieferung', 'Gratis-Lieferung'), G1('Confetti', '🎊', 'ansturm', 'Kundenansturm'), G1('Corgi', '🐕', 'testerin', 'Testerin kommt'),
        G1('Money Gun', '💸', 'geldregen', 'Geldregen +250 €'), G1('Rosa', '🌸', 'plus', '+100 €'), G1('Perfume', '🧴', 'minus', '−100 €'), G1('Paper Crane', '🕊️', 'kotzen', 'Jemand kotzt'), G1('Little Crown', '👑', 'umbenennen', 'Markt umbenennen'),
        G1('Cap', '🧢', 'pluendern', 'Regal plündern'), G1('Swan', '🦢', 'bankrott', 'Bankrott!'), G1('Galaxy', '🌌', 'diebe', 'Diebesbande'), G1('Lion', '🦁', 'strom', 'Stromausfall'), { gift: 'Universe', icon: '🪐', action: 'game:gewitter+game:pfuetze+game:ansturm', label: 'Unwetter + Ansturm' }, G1('TikTok Universe', '🌠', 'loeschen', 'Spielstand löschen 😱')],
      likes: { every: 150, action: 'game:kunde', label: 'Ein Kunde mehr' }
    }
  };
})();
