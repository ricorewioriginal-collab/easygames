'use strict';
/* Ladebildschirm, Titelbild und Hauptmenü im Konsolen-Stil (Pfeiltasten/Enter/Esc, Maus, Touch).
   Solange das Menü offen ist (body.mm), ruht das Spiel und zeichnet nicht neu (siehe game.js). */
(() => {
  const $ = id => document.getElementById(id), B = document.body, G = window.__amh;
  if (!G) { if (window.mmFail) mmFail(); return; }
  const API = G.API, coarse = matchMedia('(pointer:coarse)').matches, t0 = performance.now();
  const TIPS = ['Kartons stapeln sich auf der Rampe – trag sie zu den passenden Regalen.', 'Zu teuer? Kunden vergleichen mit der Konkurrenz. Unter „Preise“ siehst du deren Preise.', 'Mit dem Bestell-PC (oder später der Bestell-App) füllst du dein Lager rechtzeitig auf.', 'Frische Ware verdirbt – bestelle lieber öfter kleinere Mengen.', 'Personal kann kassieren und einräumen, kostet aber jeden Tag Lohn.', 'Am Feierabend siehst du Umsatz, Kosten und Gewinn des Tages.', 'Alkohol nur ab 16 bzw. 18 – prüfe den Ausweis genau!'];
  let state = 'load', items = [], sel = 0, pause = false, confirmNew = false, tipI = 0, tipT = 0;

  // ---------- Laden → Titelbild ----------
  tipT = setInterval(() => { tipI = (tipI + 1) % TIPS.length; $('mmTip').textContent = TIPS[tipI]; }, 2600);
  mmStep(.96, 'Fast fertig …');
  // erst nach dem ersten gezeichneten Bild fertigmelden; kurze Mindestzeit, damit nichts flackert
  requestAnimationFrame(() => requestAnimationFrame(() => {
    mmStep(1, 'Bereit');
    setTimeout(() => { clearInterval(tipT); $('mmLoad').hidden = true; $('mmPress').textContent = coarse ? 'Tippe, um zu starten' : 'Drücke eine beliebige Taste'; $('mmTitle').hidden = false; state = 'title'; }, Math.max(250, 900 - (performance.now() - t0)));
  }));

  // ---------- Hauptmenü ----------
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function build() {
    const has = G.hasProgress();
    if (confirmNew) return [
      { id: 'no', ic: '↩', t: 'Nein, Laden behalten', d: 'Zurück zum Hauptmenü. Dein Spielstand bleibt erhalten.' },
      { id: 'yes', ic: '✦', t: 'Ja, neu beginnen', d: 'Dein aktueller Laden wird gelöscht und du startest bei Tag 1. Das lässt sich nicht rückgängig machen.', dng: 1 }];
    return [
      has ? { id: 'go', ic: '▶', t: pause ? 'Zurück ins Spiel' : 'Weiter spielen', d: 'Mach dort weiter, wo du aufgehört hast.', save: 1 }
        : { id: 'go', ic: '▶', t: 'Spiel starten', d: 'Eröffne deinen eigenen Supermarkt: Ware bestellen, Regale füllen, kassieren und die Markthalle groß machen.' },
      has && { id: 'new', ic: '✦', t: 'Neues Spiel', d: 'Mit einem neuen Laden bei Tag 1 beginnen. Dein bisheriger Spielstand wird dabei überschrieben.' },
      { id: 'save', ic: '💾', t: 'Spielstand', d: 'Jetzt speichern und mit Google sichern, um auf jedem Gerät mit deinem Laden weiterzuspielen.', save: has },
      { id: 'menu', ic: '⚙', t: 'Optionen', d: 'Grafik, Ton, Einräum-Hilfe, Wegweiser und Kartenzahlung einstellen.' },
      { id: 'hilfe', ic: '?', t: 'Anleitung', d: 'Schnellstart, Steuerung, Kasse, Preise und Tipps für deinen Laden.' },
      { id: 'quit', ic: '⌂', t: 'Alle Spiele', d: 'Zurück zur AnMaCha-Spielesammlung. Dein Laden wird vorher gespeichert.' }].filter(Boolean);
  }
  function saveCard() {
    const S = G.S, st = G.Sim.stars(S);
    return `<div class="mm-save"><div class="wide"><small>Laden</small><b>🏪 ${esc(S.shopName)}</b></div><div><small>Tag</small><b>${S.day} · ${G.Sim.DOW[(S.day - 1) % 7]}</b></div><div><small>Kontostand</small><b class="${S.money < 0 ? 'bad' : 'good'}">${G.fmt(S.money)}</b></div><div><small>Bewertung</small><b>⭐ ${st.toFixed(1)}</b></div><div><small>Stufe</small><b>${S.level}</b></div></div>`;
  }
  function info() { const it = items[sel]; $('mmInfo').innerHTML = `<h3>${it.t}</h3><p>${it.d}</p>${it.save ? saveCard() : ''}`; }
  function render() {
    items = build(); sel = Math.min(sel, items.length - 1);
    $('mmTag').textContent = confirmNew ? 'NEUES SPIEL?' : pause ? 'PAUSE' : 'HAUPTMENÜ';
    $('mmList').innerHTML = items.map((it, i) => `<button class="mm-it${it.dng ? ' dng' : ''}" role="menuitem" tabindex="-1" data-i="${i}"><span class="ic">${it.ic}</span>${it.t}<span class="ar">◀</span></button>`).join('');
    focus(sel, true);
  }
  function focus(i, quiet) {
    sel = (i + items.length) % items.length; const bs = $('mmList').children;
    for (let k = 0; k < bs.length; k++) bs[k].classList.toggle('on', k === sel);
    if (bs[sel]) bs[sel].scrollIntoView({ block: 'nearest' });
    if (!quiet) G.sfx.tick(); info();
  }
  function show(p, keep) {
    pause = !!p; confirmNew = false; if (!keep) sel = 0; B.classList.add('mm', 'ready'); $('boot').hidden = false; $('mmLoad').hidden = $('mmTitle').hidden = true; $('mmMain').hidden = false; state = 'menu';
    try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
    render();
  }
  function hide() { $('boot').hidden = true; B.classList.remove('mm'); state = 'off'; }
  function openPanel(n) { hide(); API.back = true; G.openPanel(n); }
  function choose(i) {
    const it = items[i]; if (!it) return; G.sfx.ok();
    switch (it.id) {
      case 'go': hide(); G.play(); break;
      case 'new': confirmNew = true; sel = 0; render(); break;
      case 'no': confirmNew = false; sel = 1; render(); break;
      case 'yes': hide(); G.fresh(); break;
      case 'quit': G.save(); location.href = '../'; break;
      default: openPanel(it.id);
    }
  }
  function back() {
    if (confirmNew) { confirmNew = false; sel = 1; render(); G.sfx.tick(); }
    else if (pause) { hide(); G.play(); }
  }
  API.onBack = () => show(pause, true);
  API.onMenu = () => show(true);
  $('bMenu').onclick = () => show(true);

  // ---------- Eingabe ----------
  // Capture-Phase: solange das Menü offen ist, sehen die Spieltasten nichts davon
  addEventListener('keydown', e => {
    if (state === 'off' || state === 'load' || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key; e.stopPropagation();
    if (state === 'title') { if (!e.repeat && k !== 'Tab' && k !== 'Shift') { e.preventDefault(); show(false); } return; }
    if (k === 'ArrowDown' || k === 's' || k === 'S') focus(sel + 1);
    else if (k === 'ArrowUp' || k === 'w' || k === 'W') focus(sel - 1);
    else if (k === 'Home') focus(0); else if (k === 'End') focus(items.length - 1);
    else if ((k === 'Enter' || k === ' ' || k === 'e' || k === 'E') && !e.repeat) choose(sel);
    else if ((k === 'Escape' || k === 'Backspace') && !e.repeat) back();
    else if (k === 'Tab') focus(sel + (e.shiftKey ? -1 : 1));
    else return;
    e.preventDefault();
  }, true);
  $('mmTitle').addEventListener('click', () => { if (state === 'title') show(false); });
  const list = $('mmList');
  list.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const b = e.target.closest('.mm-it'); if (b && +b.dataset.i !== sel) focus(+b.dataset.i); });
  list.addEventListener('click', e => { const b = e.target.closest('.mm-it'); if (b) { focus(+b.dataset.i, true); choose(+b.dataset.i); } });
})();
