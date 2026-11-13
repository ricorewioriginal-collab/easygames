'use strict';
/* Bunte Insel – Insel-Handy 📱 (Pause-Menü im Konsolen-Stil): statt einer langen Liste ein Handy mit bunten App-Kacheln (wie ein Insel-Telefon),
   Statusleiste (Uhrzeit, Tag, Sterne, Spielstand) und eine Einstellungen-App mit Reitern (Steuerung · Bild & Ton · Spiel · Eltern).
   Die vorhandenen Knöpfe (bResume, bGuide, bMusic …) werden nur umgehängt – ihre Funktion bleibt dieselbe. ⚙️ im Spiel öffnet direkt die Einstellungen.
   Controller: Steuerkreuz/Stick bewegt, A wählt, B = zurück zur Startseite, L1/R1 = Reiter wechseln. */
BI.createKonsole = function (G) {
  const $ = id => document.getElementById(id), K = { page: 'home', tab: 0 }, pz = $('pause'), card = pz && pz.querySelector('.pauseCard');
  if (!card) return K;
  const mk = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const css = mk('style'); css.textContent = `
#pause .pauseCard.kPhone{width:min(560px,100%);border-radius:38px;background:linear-gradient(180deg,#fdf8e8 0,#f3f9ee 60%,#e8f5f2 100%);border:6px solid #fff;box-shadow:0 0 0 3px #b9d8c8,0 18px 40px rgba(20,40,60,.35);overflow:hidden}
.kStatus{flex:none;display:flex;align-items:center;gap:10px;padding:12px 22px 6px;font-weight:800;color:#4a6a5a;font-size:15px}
.kStatus .kTime{font-size:26px;color:#2f4f44;letter-spacing:.5px}.kStatus .kDay{font-size:13px;opacity:.8;line-height:1.1}.kStatus .kSp{flex:1}
.kStatus .kStars{background:#fff;border-radius:999px;padding:4px 10px;box-shadow:0 2px 0 rgba(0,0,0,.08)}
.kTitle{flex:none;text-align:center;font-weight:900;font-size:clamp(22px,6vw,28px);color:#ff8a3a;margin:2px 0 6px;text-shadow:0 2px 0 #fff}
.kPage{min-height:0;flex:1;overflow-y:auto;overscroll-behavior:contain;padding:6px 16px 16px}
.kPage[hidden]{display:none}
.kGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 10px;padding:4px 2px}
@media (min-width:520px) and (min-height:520px){.kGrid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (max-height:520px){.kGrid{grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.kApp .kIc{width:52px;height:52px;font-size:28px}.kStatus{padding-top:6px}.kTitle{display:none}}
.kApp{all:unset;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:6px 2px;border-radius:18px;text-align:center;-webkit-tap-highlight-color:transparent}
.kApp .kIc{width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:34px;box-shadow:inset 0 -5px 0 rgba(0,0,0,.12),0 4px 8px rgba(30,60,50,.18);transition:transform .12s}
.kApp .kLb{font-size:13px;font-weight:800;color:#3b5248;line-height:1.1}
.kApp:hover .kIc,.kApp:focus-visible .kIc,.kApp.gp-focus .kIc{transform:translateY(-3px) scale(1.06)}
.kApp.gp-focus{outline:none!important;box-shadow:0 0 0 4px #ffb02a!important;background:rgba(255,255,255,.7)}
.kApp:active .kIc{transform:scale(.94)}
.kTabs{display:flex;gap:6px;background:#e3efe7;border-radius:999px;padding:4px;margin:0 0 10px;position:sticky;top:0;z-index:2}
.kTab{all:unset;flex:1;text-align:center;padding:8px 4px;border-radius:999px;font-weight:800;font-size:13px;color:#4a6a5a;cursor:pointer}
.kTab.sel{background:#fff;color:#ff7a1a;box-shadow:0 2px 0 rgba(0,0,0,.08)}
.kSec{display:none;flex-direction:column;gap:8px}.kSec.sel{display:flex}
.kRow{display:flex;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:8px 12px;min-height:48px;box-shadow:0 2px 0 rgba(0,0,0,.06)}
.kRow>.kL{flex:1;font-weight:800;color:#3b5248;font-size:15px}.kRow>.kL small{display:block;font-weight:600;opacity:.7;font-size:12px}
.kSeg{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
.kSeg button{border:0;border-radius:999px;padding:7px 11px;font:800 13px inherit;background:#eef3ef;color:#4a6a5a;cursor:pointer;min-height:36px}
.kSeg button.sel{background:#4cc07a;color:#fff}
.kSec .tb{position:static!important;width:100%!important;height:auto!important;min-height:48px;display:flex!important;align-items:center;gap:10px;justify-content:flex-start;background:#fff!important;color:#3b5248!important;border:0!important;border-radius:16px!important;padding:8px 12px!important;font:800 15px inherit!important;box-shadow:0 2px 0 rgba(0,0,0,.06)!important;margin:0!important}
.kSec #bMusic::after,.kSec #bVoice::after{content:'AN';margin-left:auto;background:#4cc07a;color:#fff;border-radius:999px;padding:4px 10px;font-size:12px}
.kSec #bMusic.off::after,.kSec #bVoice.off::after{content:'AUS';background:#c9d3cf}
.kSec .pauseGroup,.kSec .pauseHelp{margin:0}
.kSec .pill{min-height:44px}
.kBack{all:unset;cursor:pointer;font-weight:900;color:#4a6a5a;padding:6px 12px;border-radius:999px;background:#fff;box-shadow:0 2px 0 rgba(0,0,0,.08)}
#pause .pauseHead,#pause .pauseActions{display:none}
body.kPaused #toast{display:none}
.kSec #bSteer::before{content:'Touch-Steuerung:';margin-right:2px}
body.dlgOpen #toast{bottom:auto;top:calc(max(10px,env(safe-area-inset-top)) + 120px)}
`;
  document.head.appendChild(css);
  card.classList.add('kPhone');
  const scroll = card.querySelector('.pauseScroll');
  /* Statusleiste + Titel */
  const status = mk('div', 'kStatus', '<span class="kTime"></span><span class="kDay"></span><span class="kSp"></span><span class="kStars"></span>');
  const title = mk('div', 'kTitle', '📱 Insel-Handy');
  card.insertBefore(title, card.firstChild); card.insertBefore(status, card.firstChild);
  /* Startseite: App-Kacheln */
  const home = mk('div', 'kPage'); home.id = 'kHome'; const grid = mk('div', 'kGrid'); home.appendChild(grid);
  const set = mk('div', 'kPage'); set.id = 'kSet'; set.hidden = true;
  card.insertBefore(home, scroll); card.insertBefore(set, scroll); scroll.hidden = true; scroll.style.display = 'none';
  const resumeThen = id => () => { G.resume(); setTimeout(() => { const b = $(id); if (b) b.click(); }, 30); };
  const APPS = [
    ['▶️', 'Weiter', '#ffb347', () => G.resume(), 'kResume'], ['🧭', 'Wohin?', '#6ac8ff', resumeThen('bGuide')], ['📋', 'Aufgaben', '#ffd23f', resumeThen('bLog')],
    ['🎒', 'Tasche', '#ff8a6a', resumeThen('bPack')], ['🎉', 'Spaß', '#ff7ac0', resumeThen('bFun')], ['🏗️', 'Bauen', '#a0d468', resumeThen('bBuild')],
    ['🗺️', 'Karte', '#58c8a8', resumeThen('mini')], ['📚', 'Handbuch', '#b48aff', () => $('bBuchP').click()], ['👥', 'Online', '#4cc0e8', () => $('bFriendsP').click(), 'kOnline'],
    ['💾', 'Speichern', '#7ad07a', () => { $('bSaveNow').click(); title.textContent = '✔ Gespeichert!'; clearTimeout(K.tt); K.tt = setTimeout(() => { title.textContent = '📱 Insel-Handy'; }, 1800); }], ['⚙️', 'Einstellungen', '#9aa8b8', () => K.show('set')], ['🏠', 'Titelbild', '#e8a87a', () => $('bToMenu').click()]
  ];
  for (const [ic, lb, col, fn, id] of APPS) { const b = mk('button', 'kApp', '<span class="kIc" style="background:' + col + '">' + ic + '</span><span class="kLb">' + lb + '</span>'); b.type = 'button'; if (id) b.id = id; b.setAttribute('aria-label', lb); b.addEventListener('click', fn); grid.appendChild(b); }
  /* Einstellungen-App: Reiter */
  const head = mk('div', null); head.style.cssText = 'display:flex;align-items:center;gap:10px;margin:0 0 8px'; const back = mk('button', 'kBack', '◀ Zurück'); back.type = 'button'; back.id = 'kBack'; back.onclick = () => K.show('home');
  head.appendChild(back); head.appendChild(mk('b', null, '⚙️ Einstellungen')); set.appendChild(head);
  const TABS = [['🎮', 'Steuerung'], ['🖼️', 'Bild & Ton'], ['🌍', 'Spiel'], ['👪', 'Eltern']], tabs = mk('div', 'kTabs'), secs = [];
  TABS.forEach(([i, n], k) => { const t = mk('button', 'kTab', i + ' ' + n); t.type = 'button'; t.onclick = () => K.setTab(k); tabs.appendChild(t); const s = mk('div', 'kSec'); secs.push(s); });
  set.appendChild(tabs); for (const s of secs) set.appendChild(s);
  const move = (sec, el) => { if (el) secs[sec].appendChild(el); };
  const row = (sec, label, sub, opts, get, put) => { const r = mk('div', 'kRow', '<span class="kL">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</span>'), sg = mk('div', 'kSeg'); r.appendChild(sg);
    const paint = () => { sg.innerHTML = ''; for (const [v, t] of opts) { const b = mk('button', get() === v ? 'sel' : '', t); b.type = 'button'; b.onclick = () => { put(v); paint(); }; sg.appendChild(b); } }; r.paint = paint; paint(); secs[sec].appendChild(r); return r; };
  const rows = [];
  /* Steuerung */
  move(0, $('bSteer'));
  const pad = () => G.pad && G.pad();
  rows.push(row(0, '🎮 Controller-Art', 'Tastensymbole und Belegung', [['auto', 'Auto'], ['ps', 'PlayStation'], ['nin', 'Switch'], ['xbox', 'Xbox']], () => (pad() ? pad().opt.layout : 'auto'), v => pad() && pad().setOpt('layout', v)));
  rows.push(row(0, '📳 Vibration', 'Controller rüttelt bei Sternen', [[true, 'An'], [false, 'Aus']], () => (pad() ? pad().opt.rumble : true), v => { if (pad()) { pad().setOpt('rumble', v); pad().rumble(150, .5, .3); } }));
  rows.push(row(0, '💡 Tasten-Hinweise', 'Leiste unten am Bildschirm', [[true, 'An'], [false, 'Aus']], () => (pad() ? pad().opt.hints : true), v => pad() && pad().setOpt('hints', v)));
  move(0, $('bKeys')); move(0, scroll.querySelector('.pauseHelp'));
  /* Bild & Ton */
  rows.push(row(1, '🖼️ Grafik', 'Sparsam = flüssiger auf alten Handys', [['auto', 'Auto'], ['sharp', 'Scharf'], ['eco', 'Sparsam']], () => G.save.gfx || 'auto', v => G.setGfx(v)));
  for (const id of ['bMusic', 'bSound', 'bVoice', 'bNight']) move(1, $(id));
  /* Spiel */
  for (const g of scroll.querySelectorAll('.pauseGroup')) { if (g.querySelector('#breakOpts') || g.querySelector('.pauseTools')) continue; move(2, g); }
  for (const id of ['bCodeP', 'bBugP']) move(2, $(id));
  /* Eltern */
  for (const g of scroll.querySelectorAll('.pauseGroup')) if (g.querySelector('#breakOpts')) move(3, g);
  move(3, $('bParent'));
  /* Restliche Knöpfe aus dem alten ⚙️-Fenster (Handbuch, Code, Fehler, Modus) bleiben unsichtbar erreichbar */
  K.setTab = function (k) { K.tab = (k + TABS.length) % TABS.length; tabs.querySelectorAll('.kTab').forEach((t, i) => t.classList.toggle('sel', i === K.tab)); secs.forEach((s, i) => s.classList.toggle('sel', i === K.tab)); for (const r of rows) r.paint(); set.scrollTop = 0; };
  K.show = function (p) { K.page = p; home.hidden = p !== 'home'; set.hidden = p !== 'set'; if (p === 'set') K.setTab(K.tab); const f = document.querySelector('.gp-focus'); if (f) f.classList.remove('gp-focus'); tick(); };
  const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  function tick() { const d = new Date(); status.querySelector('.kTime').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); status.querySelector('.kDay').innerHTML = DAYS[d.getDay()] + '<br>' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; status.querySelector('.kStars').textContent = '⭐ ' + (G.save.stars | 0); }
  /* Öffnen/Schließen beobachten: immer auf der Startseite beginnen (außer ⚙️ wollte die Einstellungen) */
  let want = null; new MutationObserver(() => { document.body.classList.toggle('kPaused', !pz.hidden); if (!pz.hidden) { K.show(want || 'home'); want = null; } }).observe(pz, { attributes: true, attributeFilter: ['hidden'] });
  K.openSettings = () => { want = 'set'; if (pz.hidden) G.pause(); else K.show('set'); };
  /* ⚙️ im Spiel = Einstellungen-App */
  const bt = $('bTools'); if (bt) bt.addEventListener('click', e => { e.stopImmediatePropagation(); e.preventDefault(); K.openSettings(); }, true);
  /* Zurück: Esc / Controller-B auf einer Unterseite → Startseite */
  K.back = function () { if (pz.hidden || K.page === 'home') return false; const r = card.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + 40); if (!t || !card.contains(t)) return false; K.show('home'); return true; };
  addEventListener('bi-gp-tab', e => { if (pz.hidden) return; if (K.page === 'home') K.show('set'); else K.setTab(K.tab + e.detail); });
  K.dbg = { home, set, secs, rows };
  return K;
};
