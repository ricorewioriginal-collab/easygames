/* Urwaldlager – Prüfungs-Baukasten: Kulisse (Dschungel/Studio), Moderation, Regeln, Countdown, Sterne, Zeit, Abbruch, Testpilot */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, UI = UL.UI, In = UL.In;
  const Tr = UL.Trials = { impl: {} };
  Tr.reg = (id, impl) => { Tr.impl[id] = impl; };

  class TrialStage extends R.Stage {
    constructor(theme, envOpts = {}) {
      super();
      this.theme = theme;
      if (theme === 'studio') { this.env = UL.Env.studio(this.scene, Object.assign({ radius: 16, screenText: ['URWALDPRÜFUNG', envOpts.title || ''] }, envOpts)); this.updaters.push(dt => this.env.update(dt)); }
      else if (envOpts.none) this.env = null;
      else this.env = UL.Env.jungle(this.scene, Object.assign({ tod: 'day', radius: 18 }, envOpts));
      this.parts = R.particles(this.scene, { n: 160 });
      this.updaters.push(dt => this.parts.update(dt));
      this.cine = new UL.Cine(this.camera);
    }
    update(dt) { this.tick(dt); if (this.ctx && this.ctx._frame) this.ctx._frame(dt); }
  }
  Tr.Stage = TrialStage;

  // Steuerungs-Tabelle für das Regelfenster
  function ctlHtml(ctrl) {
    const g = (k) => k === 'move' ? (In.device === 'pad' ? '<kbd class="g g-' + In.kind() + ' wide">L</kbd>' : In.device === 'kb' ? '<kbd class="g g-kb wide">WASD</kbd>' : '🕹️ Stick links') :
      k === 'look' ? (In.device === 'pad' ? '<kbd class="g g-' + In.kind() + ' wide">R</kbd>' : In.device === 'kb' ? '<kbd class="g g-kb wide">Maus</kbd>' : '👆 rechts wischen') :
        (In.device === 'touch' ? '<b class="pill on" style="padding:3px 10px">' + ({ ok: 'Aktion', alt: '2. Knopf', menu: 'Menü' }[k] || k) + '</b>' : In.glyph(k));
    return '<div class="ctl">' + ctrl.map(([k, t]) => `<span>${g(k)}</span><span>${UL.esc(t)}</span>`).join('') +
      `<span>${In.device === 'touch' ? '<b class="pill" style="padding:3px 10px">❚❚</b>' : In.glyph('select') + ' halten'}</span><span>„${UL.D.SHOW.exit}“ (Abbruch, keine Sterne)</span></div>`;
  }

  // Prüfung spielen → { stars, max, quit }
  Tr.run = (id, opt = {}) => new Promise(async (resolve) => {
    const def = UL.D.TRIAL[id], impl = Tr.impl[id];
    const theme = opt.theme || 'dschungel';
    const dk = UL.D.DIFF[opt.diff || 'normal'].k;
    const short = !!opt.short;
    const max = short ? Math.max(3, Math.round(def.stars * 0.5)) : def.stars;
    const stage = new TrialStage(theme, impl.env ? impl.env(theme) : {});
    const ctx = {
      id, def, theme, k: dk, short, max, stage, scene: stage.scene, cam: stage.camera, stars: 0, time: def.time ? Math.round(def.time * (short ? 0.55 : 1)) : 0, timeMax: 0,
      running: false, done: false, quit: false, meters: [], t: 0, name: opt.name || 'Du', look: opt.look || UL.D.CAST[0].look, opt,
      hostPos: new T.Vector3(0, 0, -6), hostRy: 0,
      rng: new UL.RNG((opt.seed || Date.now()) & 0xffffffff),
      inp: { mx: 0, my: 0, ok: false, okD: false, alt: false, altD: false, lx: 0, ly: 0 },
      addStar(pos) {
        if (ctx.stars >= max) return;
        ctx.stars++; UL.Audio.sfx('star'); In.rumble(80, 0.2, 0.5);
        if (ctx.stars === max || Math.random() < 0.3) { UL.Audio.sfx('yay'); Tr.shout(UL.pick(['JAAA!', 'STERN!', 'Geschafft!', 'Weiter so!']), 'gold'); }
        if (pos) stage.parts.burst(pos.x, pos.y, pos.z, 24, 3, 3, [0xffd23a, 0xffffff, 0xffa020]);
        if (stage.env && stage.env.cheer !== undefined) stage.env.cheer = 1.2;
        if (ctx.hosts && Math.random() < 0.5) UL.pick(ctx.hosts).play('cheer');
        hud(true);
        if (ctx.stars >= max) UL.after(0.6, () => ctx.end('alle'));
      },
      bad(txt, kind) {
        UL.Audio.sfx('bad'); In.rumble(140, 0.6, 0.3); R.shake = 0.5; if (txt) UI.toast(txt, '😖', 1500);
        // Drama: Schrei, Ausruf, Bildblitz, Reaktion von Publikum und Moderatoren
        const now = ctx.t; if (now - (ctx._dr || -9) < 0.9) return; ctx._dr = now;
        const k = kind || UL.pick(['scream', 'yuck', 'ugh']);
        UL.Audio.sfx(k); Tr.shout(UL.pick(SHOUT[k] || SHOUT.scream), k === 'yuck' ? 'green' : 'red');
        if (stage.env && stage.env.cheer !== undefined && Math.random() < 0.6) { UL.Audio.sfx('ooh'); }
        if (ctx.hosts && Math.random() < 0.35) { const h = UL.pick(ctx.hosts); h.play(Math.random() < 0.5 ? 'cheer' : 'interact'); if (Math.random() < 0.5) UL.Audio.sfx('laugh'); }
      },
      end(reason) { if (ctx.done) return; ctx.done = true; ctx.running = false; ctx.reason = reason || 'ende'; finish(); },
      player: null,
      // eigenes Overlay für die Prüfung (Takt-Leiste, Antworten …)
      overlay(html) { if (!ctx.ui) { ctx.ui = document.createElement('div'); ctx.ui.className = 'tui'; document.getElementById('ui').insertBefore(ctx.ui, document.getElementById('cap')); } ctx.ui.innerHTML = html; ctx.ui.hidden = !html; return ctx.ui; }
    };
    ctx.timeMax = ctx.time;
    stage.ctx = ctx;
    // Spielfigur
    ctx.player = UL.makeFig(ctx.look, 1.75); stage.scene.add(ctx.player.root); stage.figs.push(ctx.player);
    try { impl.setup(ctx); } catch (e) { console.error(e); }
    // Moderatoren an ihrem Platz
    ctx.hosts = UL.D.HOSTS.map((h, i) => { const f = UL.makeFig(h.look, i ? 1.82 : 1.72); const side = new T.Vector3(Math.cos(ctx.hostRy), 0, -Math.sin(ctx.hostRy)).multiplyScalar(i ? 0.7 : -0.7); f.root.position.copy(ctx.hostPos).add(side); f.root.rotation.y = ctx.hostRy; stage.scene.add(f.root); stage.figs.push(f); return f; });
    R.set(stage);
    UL.Audio.music('tense'); UL.Audio.atmo(theme === 'studio' ? 'studio' : 'jungle');
    UI.hint({}); UI.cmd([]); UI.hud('');
    const vars = { n: ctx.name, t: def.name, m: max };
    // Intro: Kamera auf die Moderatoren, dann Rundflug über die Prüfung
    const hp = ctx.hostPos, fw = new T.Vector3(Math.sin(ctx.hostRy), 0, Math.cos(ctx.hostRy));
    stage.cine.cut(hp.clone().add(fw.clone().multiplyScalar(5)).add(new T.Vector3(0, 1.8, 0)), hp.clone().add(new T.Vector3(0, 1.3, 0)));
    await UI.fade(false, 0.4);
    if (!UL.bot) {
      await UI.banner(def.icon + ' ' + def.name, short ? 'Finale · ' + (opt.course || '') : UL.D.SHOW.trial);
      for (const [w, t] of [UL.pick(UL.D.MOD.intro)]) await UI.say(w, UI.fmt(t, vars));
      if (ctx.intro) { stage.cine.move(ctx.intro.pos, ctx.intro.look, 2.5); await UI.say(UL.pick(['lotte', 'mats']), def.desc); }
      else await UI.say(UL.pick(['lotte', 'mats']), def.desc);
      const go = await UI.choose(def.icon + ' ' + def.name, `<b>Ziel:</b> ${max} Sterne${ctx.time ? ` · <b>Zeit:</b> ${UL.fmtTime(ctx.time)}` : ''}<br>${ctlHtml(def.ctrl)}`, [
        { label: 'Los geht’s!', icon: '⭐', value: 'go' }, { label: UL.D.SHOW.exit, icon: '🏳️', sub: 'Prüfung gar nicht erst antreten – das Camp bekommt nichts.', value: 'quit' }], { cls: 'clear' });
      if (go === 'quit') { ctx.quit = true; ctx.end('quit'); return; }
    }
    if (impl.start) impl.start(ctx);
    UI.hint(Object.fromEntries(def.ctrl.map(([k, t]) => [k, t]).concat([['select', 'Halten: Abbruch']])));
    UL.Audio.music('trial'); UL.Audio.voicePitch = opt.form === 'm' ? 0.62 : opt.form === 'w' ? 1.05 : 0.85;
    if (!UL.bot) { for (const n of ['3', '2', '1']) { UL.Audio.sfx('drum'); await UI.banner(n, '', 650); } UL.Audio.sfx('gong'); UI.banner('LOS!', '', 700); }
    ctx.running = true;
    hud(true);

    let quitHold = 0, hudT = 0, lastStars = -1;
    ctx._frame = (dt) => {
      if (!ctx.running) { if (impl.idle) impl.idle(dt, ctx); return; }
      ctx.t += dt;
      // Eingabe (oder Testpilot)
      const I = ctx.inp;
      if (UL.bot && impl.bot) { I.mx = I.my = 0; I.ok = I.alt = I.okD = I.altD = false; I.lx = I.ly = 0; impl.bot(dt, ctx, I); }
      else { I.mx = In.move.x; I.my = In.move.y; I.ok = In.pressed('ok'); I.okD = In.down('ok'); I.alt = In.pressed('alt'); I.altD = In.down('alt'); I.lx = In.look.x; I.ly = In.look.y; I.menu = In.pressed('menu'); }
      if (UL.query.get('fast') && ctx.t > 6) { ctx.end('zeit'); return; }   // nur für automatische Tests
      if (ctx.time) { ctx.time -= dt; if (ctx.time <= 0) { ctx.time = 0; ctx.end('zeit'); return; } }
      try { impl.update(dt, ctx); } catch (e) { console.error(e); ctx.end('fehler'); return; }
      // „Ich bin raus!“: Select / H halten
      if (In.down('select')) { quitHold += dt; if (quitHold > 1.5) { ctx.quit = true; ctx.end('quit'); return; } } else quitHold = 0;
      hudT -= dt; if (hudT <= 0 || lastStars !== ctx.stars) { hudT = 0.2; lastStars = ctx.stars; hud(false, quitHold); }
    };
    function hud(pop, qh = 0) {
      const st = `<span class="chip big">⭐ <b>${ctx.stars}</b> / ${max}</span>`;
      const tm = ctx.time ? `<span class="chip big ${ctx.time < 10 ? 'warn' : ''}">⏱ ${UL.fmtTime(ctx.time)}</span>` : '';
      const q = qh > 0 ? `<span class="chip warn">🏳️ „Ich bin raus …“ <span class="bar"><i style="width:${Math.min(100, qh / 1.5 * 100)}%"></i></span></span>` : '';
      UI.hud(st + tm + (ctx.extraHud || '') + q);
      const m = document.getElementById('meter');
      if (ctx.meters.length) { const hb = document.getElementById('hud').getBoundingClientRect(); m.style.top = Math.round(hb.bottom + 6) + 'px'; m.hidden = false; m.innerHTML = ctx.meters.map(x => `<div class="meter ${x.danger ? 'danger' : ''}">${x.label}<div class="bar"><i style="width:${Math.round(UL.clamp(x.v, 0, 1) * 100)}%;${x.color ? 'background:' + x.color : ''}"></i></div></div>`).join(''); }
      else m.hidden = true;
    }
    ctx.hud = hud;
    UL.Trials.current = ctx;

    async function finish() {
      UL.Trials.current = null;
      UI.hint({}); document.getElementById('meter').hidden = true;
      if (impl.finish) try { impl.finish(ctx); } catch (e) { console.error(e); }
      if (ctx.ui) { ctx.ui.remove(); ctx.ui = null; }
      const stars = ctx.quit ? 0 : ctx.stars;
      Object.assign(vars, { s: stars });
      UL.Audio.music('show');
      if (!UL.bot) {
        await UI.banner(ctx.quit ? 'ABBRUCH!' : ctx.reason === 'alle' ? 'ALLE STERNE!' : ctx.reason === 'zeit' ? 'ZEIT!' : 'ENDE!', ctx.quit ? '„' + UL.D.SHOW.exit + '“' : '', 1500);
        stage.cine.move(hp.clone().add(fw.clone().multiplyScalar(4.2)).add(new T.Vector3(0, 1.7, 0)), hp.clone().add(new T.Vector3(0, 1.3, 0)), 1.2);
        ctx.hosts.forEach(h => UL.faceTo(h, hp.x + fw.x * 5, hp.z + fw.z * 5));
        const key = ctx.quit ? 'quit' : stars >= max * 0.75 ? 'good' : stars >= max * 0.4 ? 'mid' : 'bad';
        if (key === 'good') { UL.Audio.sfx('cheer'); ctx.hosts.forEach(h => h.play('cheer')); }
        await UI.mod(key, vars);
        await UI.choose(def.icon + ' ' + def.name, `<div class="stars">${'⭐'.repeat(stars)}<span class="off">${'⭐'.repeat(max - stars)}</span></div><p>${stars} von ${max} Sternen${opt.practice ? '' : ' – das sind ' + stars + ' Portionen fürs Camp'}.</p>`, [{ label: 'Weiter', value: 1 }], { cls: 'clear' });
      }
      await UI.fade(true, 0.35);
      UI.hud('');
      resolve({ stars, max, quit: ctx.quit });
    }
  });

  // ---------- Ausrufe und Bildblitze ----------
  const SHOUT = { scream: ['AAAAH!', 'HILFE!', 'NEIN, NEIN, NEIN!', 'Ich will nach Hause!'], yuck: ['IIIIH!', 'Bäääh!', 'Igitt!', 'Das stinkt!'], ugh: ['Uff!', 'Autsch!', 'Mist!', 'Oh nee …'] };
  Tr.shout = (text, tone = 'red') => {
    const ui = document.getElementById('ui'); if (!ui) return;
    const f = document.createElement('div'); f.className = 'flash ' + tone; ui.appendChild(f); setTimeout(() => f.remove(), 450);
    const s = document.createElement('div'); s.className = 'shout ' + tone; s.textContent = text; s.style.left = (30 + Math.random() * 40) + '%'; ui.appendChild(s); setTimeout(() => s.remove(), 1300);
  };

  // ---------- Bausteine für mehrere Prüfungen ----------
  // Verfolgerkamera hinter einer Figur
  Tr.follow = (cam, fig, { dist = 5, h = 2.6, look = 1.2, yaw = null, k = 6 } = {}, dt = 0.016) => {
    const ry = yaw == null ? fig.root.rotation.y : yaw;
    const want = new T.Vector3(fig.root.position.x - Math.sin(ry) * dist, fig.root.position.y + h, fig.root.position.z - Math.cos(ry) * dist);
    cam.position.lerp(want, 1 - Math.exp(-k * dt));
    cam.lookAt(fig.root.position.x, fig.root.position.y + look, fig.root.position.z);
  };
  // Krabbeltiere (instanziert): Käfer/Kakerlaken als kleine Körper
  Tr.bugs = (scene, n, color = 0x3a2210) => {
    const g = new T.SphereGeometry(0.5, 8, 6); g.scale(1, 0.45, 1.5);
    const m = new T.InstancedMesh(g, new T.MeshLambertMaterial({ color: R.lin(color) }), n); m.castShadow = false;
    scene.add(m);
    const list = []; for (let i = 0; i < n; i++) list.push({ x: 0, y: 0, z: 0, r: 0, s: 0.05, vx: 0, vz: 0 });
    const M = new T.Matrix4(), Q = new T.Quaternion(), E = new T.Euler(), S = new T.Vector3(), P = new T.Vector3();
    return {
      mesh: m, list,
      sync() { list.forEach((b, i) => { E.set(0, b.r, 0); Q.setFromEuler(E); S.setScalar(b.s); P.set(b.x, b.y, b.z); M.compose(P, Q, S); m.setMatrixAt(i, M); }); m.instanceMatrix.needsUpdate = true; }
    };
  };
  // Beschriftung „Prüfungs-Schild“ im Dschungel oder Studio
  Tr.sign = (ctx, x, z, ry = 0) => {
    const s = R.sign([ctx.def.icon + ' ' + ctx.def.name.toUpperCase(), UL.D.SHOW.trial], 3.4, 1.1, { bg: ctx.theme === 'studio' ? '#141824' : '#5a3a1e', w: 640, h: 200, font: '900 54px system-ui' });
    s.position.set(x, 2.6, z); s.rotation.y = ry; ctx.scene.add(s);
    if (ctx.theme !== 'studio') for (const sx of [-1.5, 1.5]) { const p = new T.Mesh(new T.CylinderGeometry(0.07, 0.08, 3, 6), R.mat(0x5a3a1e)); p.position.set(x + Math.cos(ry) * sx, 1.5, z - Math.sin(ry) * sx); ctx.scene.add(p); }
    return s;
  };
})();
