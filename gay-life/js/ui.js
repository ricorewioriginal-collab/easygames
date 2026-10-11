/* GayLife – gemeinsame Oberflächen-Bausteine: Menü-Blatt, Szenenwechsel (Abblenden), Vollbild, Tastenkürzel.
   Nutzt das vorhandene Overlay #maps (auch vom Mehrspieler-Fenster verwendet) und das neue #fade. */
(function () {
  'use strict';
  var C = function () { return GL.core; };
  var ui = GL.ui = {};
  function el(id) { return document.getElementById(id); }

  /* Menü-Blatt: title, Untertitel, Einträge [{t, s, e, dis, fn}] */
  ui.menu = function (title, sub, items, key) {
    var m = el('maps'), esc = C().esc, h = '<div class="box"><div class="gh"><h2>' + esc(title) + '</h2><button class="btn sm" id="mx">Schließen</button></div>' + (sub ? '<p class="sub">' + sub + '</p>' : '');
    items.forEach(function (it, i) {
      h += '<button class="row2" data-i="' + i + '"' + (it.dis ? ' disabled style="opacity:.5"' : '') + '><span class="e">' + (it.e || '•') + '</span><span style="flex:1"><b>' + esc(it.t) + '</b>' + (it.s ? '<br><small class="sub">' + it.s + '</small>' : '') + '</span>' + (it.r ? '<small class="sub">' + esc(it.r) + '</small>' : '') + '</button>';
    });
    m.innerHTML = h + '</div>'; m.style.display = 'block'; m.dataset.k = key || 'menu';
    el('mx').onclick = ui.close;
    [].forEach.call(m.querySelectorAll('[data-i]'), function (b) { b.onclick = function () { var it = items[+b.dataset.i]; if (it && !it.dis && it.fn) it.fn(); }; });
  };
  ui.close = function () { var m = el('maps'); if (m) { m.style.display = 'none'; m.dataset.k = ''; } };
  ui.open = function () { var m = el('maps'), p = el('phone'); return !!((m && m.style.display === 'block') || (p && p.classList.contains('on')) || ui.fading); };

  /* Szenenwechsel: abblenden, Text zeigen, Aktion ausführen, aufblenden */
  ui.fading = false;
  ui.fade = function (text, cb, ms) {
    var f = el('fade'); if (!f || ui.fading) { if (cb) cb(); return; }
    ui.fading = true; f.innerHTML = '<div>' + C().esc(text) + '</div>'; f.classList.add('on');
    setTimeout(function () {
      try { if (cb) cb(); } catch (e) { if (window.console) console.error(e); }
      setTimeout(function () { f.classList.remove('on'); ui.fading = false; }, 250);
    }, ms || 900);
  };

  /* Vollbild */
  ui.fullscreen = function () {
    var d = document, e = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else if (e.requestFullscreen) e.requestFullscreen().catch(function () { C().toast('Vollbild wird hier nicht unterstützt.'); });
      else if (e.webkitRequestFullscreen) e.webkitRequestFullscreen();
      else C().toast('Vollbild wird hier nicht unterstützt.');
    } catch (x) { C().toast('Vollbild wird hier nicht unterstützt.'); }
  };

  GL.on('blocked', function () { return ui.open() || undefined; });

  GL.on('worldBuilt', function () {
    var fs = el('wFs'); if (fs) fs.onclick = ui.fullscreen;
    document.addEventListener('keydown', function (e) {
      var W = GL.W; if (!W || !W.on || e.repeat) return;
      var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (el('modal').style.display === 'block') return;
      var k = e.key.toLowerCase();
      if (k === 'escape') { if (GL.phone && GL.phone.isOpen()) GL.phone.close(); else if (el('maps').style.display === 'block') ui.close(); else if (!ui.fading && !W.dlg) GL.emit('pause'); return; }
      if (ui.fading || W.dlg) return;
      if (k === 'p' || k === 'tab') { e.preventDefault(); GL.phone.toggle(); }
      else if (k === 'm') { GL.emit('openMap'); }
      else if (k === 'f') { ui.fullscreen(); }
    });
  });
})();
