/* Urwaldlager – Start, Hauptschleife, Pause */
(function () {
  'use strict';
  const UL = window.UL, R = UL.R, In = UL.In, UI = UL.UI;
  UL.paused = false;

  async function boot() {
    const tip = document.getElementById('ldTip'); tip.textContent = '💡 ' + UL.pick(UL.D.TIPS);
    try { R.init(); } catch (e) {
      document.getElementById('ldMsg').textContent = 'Dein Gerät unterstützt kein WebGL – Urwaldlager braucht 3D-Grafik.'; return;
    }
    In.bindTouchButtons();
    const bar = document.getElementById('ldBar'), msg = document.getElementById('ldMsg');
    await UL.A.loadAll(p => { bar.style.width = Math.round(10 + p * 85) + '%'; msg.textContent = p < 0.5 ? 'Pflanze Palmen …' : p < 0.9 ? 'Camper packen ihre Rucksäcke …' : 'Moderatoren pudern sich die Nase …'; });
    bar.style.width = '100%';
    requestAnimationFrame(loop);
    document.getElementById('loading').classList.add('done');
    setTimeout(() => document.getElementById('loading').remove(), 700);
    const q = UL.query;
    if (q.get('trial') && UL.D.TRIAL[q.get('trial')]) {
      // Entwickler-/Teststart: index.html?trial=kisten&theme=studio&bot=1&short=1
      const r = await UL.Trials.run(q.get('trial'), { theme: q.get('theme') === 'studio' ? 'studio' : 'dschungel', diff: q.get('diff') || 'normal', short: q.get('short') === '1', practice: true, name: 'Testpilot', ai: q.get('ai') ? { skill: +q.get('ai') || 0.6 } : null, team: q.get('team') ? UL.D.CAST.slice(0, +q.get('team') || 4) : null, heli: q.get('heli') === '1' });
      window.TRIAL_RESULT = r;
      UL.Menus.title();
      return;
    }
    UL.Menus.title();
  }

  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.1) dt = 0.1; if (dt <= 0) dt = 0.001;
    In.update(dt);
    UI.tickOverlay(dt);
    const blocked = UI.update(dt);
    if (blocked || UI._cap) { In.eat(); In.move.x = In.move.y = 0; In.look.x = In.look.y = 0; }
    if (!UL.paused) {
      UL.tickTimers(dt);
      const s = R.stage;
      if (s && s.update) { try { s.update(dt); } catch (e) { console.error(e); } }
      if (In.pressed('start') && !blocked && !UI._cap && s && !s.noPause) UL.Menus.pause();
    }
    R.render(dt);
    if (R.stage) UL.Tags.update(dt, R.stage.camera);
    R.adapt(dt);
  }

  // Seite verlassen / ausgeblendet → Pause und Speichern
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (UL.Show && UL.Show.save) UL.Show.save(); if (R.stage && !R.stage.noPause && !UL.paused && !UI.blocking()) UL.Menus.pause(); } });
  addEventListener('pagehide', () => { if (UL.Show && UL.Show.save) UL.Show.save(); });
  window.addEventListener('DOMContentLoaded', boot);
})();
