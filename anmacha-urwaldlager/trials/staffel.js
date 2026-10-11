/* Prüfung: Der Dschungel-Dreikampf – drei aufeinanderfolgende Aufgaben aus den klassischen Urwaldlager-Prüfungen
   (Krabbelkiste → Tierstimmen-Echo → Schleimbecken), technisch in den neuen Prüfungs-Host eingebettet */
(function () {
  'use strict';
  const T = UTrials, L = window.Trials, clamp = UE.clamp;
  const PARTS = [{ id: 'kiste', n: 'Krabbelkiste', e: '🪲', how: 'Sterne antippen – Krabbeltiere nicht berühren!' }, { id: 'echo', n: 'Tierstimmen-Echo', e: '🦜', how: 'Reihenfolge merken und nachspielen (Tippen oder 1–4).' }, { id: 'schleim', n: 'Schleimbecken', e: '🟢', how: 'Halten = tauchen, Zeiger = schwimmen, Luft beachten!' }];
  T.def({
    id: 'staffel', name: 'Der Dschungel-Dreikampf', kind: 'Alles', stat: 'ekel', e: '🏅', mode: '2d', controls: false,
    desc: 'Drei Aufgaben direkt hintereinander: erst in die <b>Krabbelkiste</b> (Sterne greifen, Gummi-Krabbler meiden), dann das <b>Tierstimmen-Echo</b> (Reihenfolgen merken), zum Schluss ins <b>Schleimbecken</b> (Pudding-Schleim, Luft einteilen). Jede Aufgabe bringt eigene Sterne.',
    how: { pc: 'Kiste: Sterne anklicken · Echo: Felder anklicken oder <b>1–4</b> · Becken: Maus halten = tauchen, Maus bewegen bzw. <b>A/D</b> = schwimmen', touch: 'Kiste: Sterne antippen · Echo: Felder antippen · Becken: Finger halten = tauchen, Finger bewegen = schwimmen' },
    create(ctx) {
      const per = PARTS.map((p, i) => Math.floor(ctx.max / 3) + (i < ctx.max % 3 ? 1 : 0));
      const TOP = 92; let pi = -1, g = null, game = null, got = 0, inter = 0, partStars = [], done = false;
      const keyMap = e => e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const kd = e => { if (game && game.key && !inter) game.key(1, keyMap(e)); }, ku = e => { if (game && game.key) game.key(0, keyMap(e)); };
      addEventListener('keydown', kd); addEventListener('keyup', ku);
      function startPart() {
        pi++; if (pi >= PARTS.length) { done = true; ctx.finish(got, 'done'); return; }
        const p = PARTS[pi]; g = { ctx: ctx.c, W: ctx.W, H: ctx.H - TOP, time: 0, max: per[pi], shown: 0, frac: 1, opt: Object.assign({ echoBase: 2 + ctx.level }, ctx.who), short: true, handi: clamp(ctx.handi + ctx.diff * .25 - .1, 0, .6), end: null };
        g.end = () => { if (inter) return; partStars[pi] = clamp(g.shown, 0, g.max); got += partStars[pi]; ctx.hud.stars(got); inter = 2.2; ctx.S.win(); };
        game = L.T[p.id](g); game.init && game.init(); game.resize && game.resize();
        ctx.hud.part(`AUFGABE ${pi + 1} VON 3 · ${p.e} ${p.n}`); ctx.hud.hint(''); inter = 0; intro = 1.6;
      }
      let intro = 0;
      startPart();
      return {
        update(dt) {
          if (done) return;
          if (intro > 0) { intro -= dt; return; }
          if (inter > 0) { inter -= dt; if (inter <= 0) startPart(); return; }
          game.update(dt); ctx.hud.time(null, g.frac); ctx.hud.stars(got + clamp(g.shown, 0, g.max));
        },
        draw(c) {
          c.fillStyle = '#06130c'; c.fillRect(0, 0, ctx.W, ctx.H); if (!game) return;
          c.save(); c.translate(0, TOP); game.draw(c); c.restore();
          const D = T.draw, W = ctx.W, H = ctx.H;
          if (intro > 0 || inter > 0) {
            c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(0, 0, W, H);
            if (intro > 0) { D.text(c, `${PARTS[pi].e} Aufgabe ${pi + 1}: ${PARTS[pi].n}`, W / 2, H / 2 - 16, Math.min(34, W * .07), '#ffd24a', 'center', 900); D.text(c, PARTS[pi].how, W / 2, H / 2 + 24, Math.min(18, W * .04), '#fff', 'center', 700); }
            else { D.text(c, `${PARTS[pi].n}: ${partStars[pi]} von ${per[pi]} ★`, W / 2, H / 2, Math.min(32, W * .07), '#fff', 'center', 900); }
          }
        },
        pointer(t, x, y) { if (game && game.pointer && !inter && intro <= 0) game.pointer(t, x, y - TOP); },
        resize(w, h) { if (g) { g.W = w; g.H = h - TOP; game.resize && game.resize(); } },
        dispose() { removeEventListener('keydown', kd); removeEventListener('keyup', ku); },
        debug: () => ({ part: pi, got, partStars, inter }),
        details: () => ({ teile: partStars.slice() }),
        bot() {
          if (!game || inter > 0 || intro > 0) return null; const d = game.dbg ? game.dbg() : null; if (!d) return null; const id = PARTS[pi].id;
          if (id === 'kiste') { const s = d.stars.find(s => s.a > .5 && !d.bugs.some(b => Math.hypot(b.x - s.x, b.y - s.y) < 50)); return s && Math.random() < .5 ? { pointer: [['down', s.x, s.y + TOP], ['up', s.x, s.y + TOP]] } : null; }
          if (id === 'echo') { if (d.state !== 'input' || Math.random() < .7) return null; const r = d.rects[d.seq[d.pi]]; return { pointer: [['down', r.x + r.w / 2, r.y + r.h / 2 + TOP], ['up', r.x + r.w / 2, r.y + r.h / 2 + TOP]] }; }
          if (id === 'schleim') { const it = d.items[0]; const tx = it ? it.x * g.W : g.W / 2, wantDown = it && d.air > .35 && d.py < it.d + .05; return { pointer: [['move', tx, (wantDown ? g.H * .8 : g.H * .2) + TOP], [wantDown ? 'down' : 'up', tx, g.H * .5 + TOP]] }; }
          return null;
        }
      };
    }
  });
})();
