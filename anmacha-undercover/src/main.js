/* AnMaCha UNDERCOVER 3D – Lader: lädt alle Spieldateien der Reihe nach (mit Fortschrittsbalken und je 3 Versuchen)
   und startet dann AMU.App. Fehlt eine Pflichtdatei, erscheint eine verständliche Fehlermeldung statt eines leeren Bildschirms. */
(function (root) {
  'use strict';
  // [Pfad, Gewicht, optional]
  const FILES = [
    ['../vendor/three-r128.min.js', 30, true],
    ['src/core/rng.js', 1], ['src/data/cosmetics.js', 1], ['src/data/maps.js', 2], ['src/data/roles.js', 1], ['src/data/cases.js', 1],
    ['src/core/grid.js', 1], ['src/core/tasks.js', 3], ['src/core/sabotage.js', 1], ['src/core/meeting.js', 1], ['src/core/rules.js', 1],
    ['src/core/evidence.js', 1], ['src/core/modes.js', 2], ['src/core/sim.js', 2], ['src/data/words-de.js', 3], ['src/core/word-game.js', 2],
    ['src/ai/memories.js', 1], ['src/ai/nav.js', 1], ['src/ai/discussion.js', 1], ['src/ai/brain.js', 2], ['src/ai/word-ai.js', 1],
    ['src/network/protocol.js', 1], ['src/network/peer.js', 1], ['src/network/public-rooms.js', 1],
    ['src/world/kit.js', 2, true], ['src/world/actors.js', 3, true], ['src/world/scene-map.js', 3, true], ['src/world/scene-lounge.js', 1, true], ['src/world/renderer.js', 3, true],
    ['src/input/input.js', 2], ['src/input/touch.js', 1], ['src/ui/audio.js', 2],
    ['src/ui/core.js', 1], ['src/ui/save.js', 1], ['src/ui/tasks.js', 3], ['src/ui/hud.js', 2], ['src/ui/meeting-ui.js', 1], ['src/ui/word-ui.js', 1],
    ['src/ui/menus.js', 2], ['src/ui/editor.js', 2, true], ['src/ui/achievements.js', 1, true], ['src/ui/settings.js', 2, true], ['src/ui/help.js', 2, true],
    ['src/app.js', 3]
  ];
  const V = encodeURIComponent(root.AMU_BUILD || '1');
  function load(src, timeout) {
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src + '?v=' + V; s.async = false;
      const t = setTimeout(() => { s.onload = s.onerror = null; rej(new Error('Zeitüberschreitung: ' + src)); }, timeout);
      s.onload = () => { clearTimeout(t); res(); }; s.onerror = () => { clearTimeout(t); s.remove(); rej(new Error('Nicht geladen: ' + src)); };
      document.head.appendChild(s);
    });
  }
  function fatal(msg, e) {
    const l = document.getElementById('loading'); if (!l) return;
    l.innerHTML = '<div class="amu-fatal"><h2>😵 Ups</h2><p>' + msg + '</p>' + (e ? '<pre>' + String((e && e.message) || e).replace(/</g, '&lt;') + '</pre>' : '') +
      '<p><button class="ui-btn ui-pri" onclick="location.reload()">Neu laden</button> <a class="ui-btn" href="../index.html">← Easygames</a></p></div>';
    if (e && root.console) console.error(e);
  }
  async function boot() {
    const bar = document.getElementById('loadBar'), txt = document.getElementById('loadTxt');
    const total = FILES.reduce((t, f) => t + f[1], 0); let done = 0;
    for (const [src, w, opt] of FILES) {
      if (txt) txt.textContent = 'Lade ' + src.replace(/^.*\//, '') + ' …';
      let ok = false, err = null;
      for (let i = 0; i < 3 && !ok; i++) { try { await load(src, i ? 40000 : 25000); ok = true; } catch (e) { err = e; } }
      if (!ok && !opt) return fatal('Eine Spieldatei konnte nicht geladen werden (' + src + '). Bitte Verbindung prüfen und neu laden.', err);
      done += w; if (bar) bar.style.width = Math.round(done / total * 100) + '%';
    }
    // Schrift für Namensschilder (Canvas) vorladen, höchstens 1,5 s warten – sonst Ersatzschrift
    try { if (document.fonts && document.fonts.load) await Promise.race([document.fonts.load('700 20px Fredoka'), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* egal */ }
    try { root.AMU.App.init(); const l = document.getElementById('loading'); if (l) l.remove(); }
    catch (e) { fatal('Beim Start ist ein Fehler aufgetreten.', e); }
  }
  root.addEventListener('error', e => { if (document.getElementById('loading') && e && e.message) { /* Lader zeigt es an */ } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
