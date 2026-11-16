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
    // Zuschauen: ein Mit-Camper absolviert die Prüfung (KI steuert, zögert je nach Mut, bricht evtl. ab)
    const ai = opt.ai || null, auto = UL.bot || !!ai;
    const ctx = {
      id, def, theme, k: dk, short, max, stage, scene: stage.scene, cam: stage.camera, stars: 0, time: def.time ? Math.round(def.time * (short ? 0.55 : 1)) : 0, timeMax: 0,
      running: false, done: false, quit: false, skip: false, ai, meters: [], t: 0, name: opt.name || 'Du', look: opt.look || UL.D.CAST[0].look, opt,
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
        if (k !== 'ugh' && !impl.noCrawl) Tr.crawl(2 + Math.floor(Math.random() * 3));
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
    }
    if (ai && !UL.bot) {
      await UI.say(UL.pick(['lotte', 'mats']), UL.pick([`Und jetzt schauen wir ${ctx.name} zu. Wird ${ctx.name} sich trauen?`, `${ctx.name} ist dran – das Camp drückt die Daumen!`, `Mal sehen, ob ${ctx.name} heute Sterne holt … oder den Satz sagt.`]));
      const b = document.createElement('button'); b.className = 'aiskip'; b.textContent = '⏩ Überspringen';
      b.onclick = () => { if (ctx.running) { ctx.skip = true; ctx.end('skip'); } };
      document.getElementById('ui').appendChild(b); ctx._skipBtn = b;
    } else if (!UL.bot) {
      const go = await UI.choose(def.icon + ' ' + def.name, `<b>Ziel:</b> ${max} Sterne${ctx.time ? ` · <b>Zeit:</b> ${UL.fmtTime(ctx.time)}` : ''}<br>${ctlHtml(def.ctrl)}`, [
        { label: 'Los geht’s!', icon: '⭐', value: 'go' }, { label: UL.D.SHOW.exit, icon: '🏳️', sub: 'Prüfung gar nicht erst antreten – das Camp bekommt nichts.', value: 'quit' }], { cls: 'clear' });
      if (go === 'quit') { ctx.quit = true; ctx.end('quit'); return; }
    }
    if (impl.start) impl.start(ctx);
    UI.hint(ai ? { select: 'Überspringen' } : Object.fromEntries(def.ctrl.map(([k, t]) => [k, t]).concat([['select', 'Halten: Abbruch']])));
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
      if (auto && impl.bot) {
        I.mx = I.my = 0; I.ok = I.alt = I.okD = I.altD = false; I.lx = I.ly = 0;
        if (ai && aiTick(dt)) return;
        if (!(ai && ai.hes > 0)) impl.bot(dt, ctx, I);
      }
      else { I.mx = In.move.x; I.my = In.move.y; I.ok = In.pressed('ok'); I.okD = In.down('ok'); I.alt = In.pressed('alt'); I.altD = In.down('alt'); I.lx = In.look.x; I.ly = In.look.y; I.menu = In.pressed('menu'); }
      if (UL.query.get('fast') && ctx.t > 6) { ctx.end('zeit'); return; }   // nur für automatische Tests
      if (ctx.time) { ctx.time -= dt; if (ctx.time <= 0) { ctx.time = 0; ctx.end('zeit'); return; } }
      try { impl.update(dt, ctx); } catch (e) { console.error(e); ctx.end('fehler'); return; }
      // „Ich bin raus!“: Select / H halten
      if (ai) { if (In.pressed('select') || In.pressed('menu')) { ctx.skip = true; ctx.end('skip'); return; } }
      else if (In.down('select')) { quitHold += dt; if (quitHold > 1.5) { ctx.quit = true; ctx.end('quit'); return; } } else quitHold = 0;
      hudT -= dt; if (hudT <= 0 || lastStars !== ctx.stars) { hudT = 0.2; lastStars = ctx.stars; hud(false, quitHold); }
    };
    // KI-Camper: zögert (Eingaben ruhen), ruft vor Angst, sagt vielleicht den Satz
    function aiTick(dt) {
      ai.hes = (ai.hes || 0) - dt; ai.next = (ai.next ?? 1.5) - dt;
      if (ai.quitAt && ctx.t > ai.quitAt) { Tr.shout('„' + UL.D.SHOW.exit + '“', 'red'); ctx.player.play('faint'); ctx.quit = true; ctx.end('quit'); return true; }
      if (ai.next <= 0) {
        ai.next = UL.rand(1.2, 3.2);
        if (Math.random() < (1 - (ai.skill ?? 0.6)) * 0.7) {
          ai.hes = UL.rand(0.4, 1.4);
          if (Math.random() < 0.45) Tr.shout(UL.pick(['Ich kann nicht …', 'Oh Gott …', 'Moment!', 'Nee, nee, nee …', 'Muss das sein?']), 'red');
        }
      }
      return false;
    }
    function hud(pop, qh = 0) {
      const st = `<span class="chip big">⭐ <b>${ctx.stars}</b> / ${max}</span>`;
      const tm = ctx.time ? `<span class="chip big ${ctx.time < 10 ? 'warn' : ''}">⏱ ${UL.fmtTime(ctx.time)}</span>` : '';
      const q = qh > 0 ? `<span class="chip warn">🏳️ „Ich bin raus …“ <span class="bar"><i style="width:${Math.min(100, qh / 1.5 * 100)}%"></i></span></span>` : '';
      UI.hud((ai ? `<span class="chip">📺 ${UL.esc(ctx.name)}</span>` : '') + st + tm + (ctx.extraHud || '') + q);
      const m = document.getElementById('meter');
      if (ctx.meters.length) { const hb = document.getElementById('hud').getBoundingClientRect(); m.style.top = Math.round(hb.bottom + 6) + 'px'; m.hidden = false; m.innerHTML = ctx.meters.map(x => `<div class="meter ${x.danger ? 'danger' : ''}">${x.label}<div class="bar"><i style="width:${Math.round(UL.clamp(x.v, 0, 1) * 100)}%;${x.color ? 'background:' + x.color : ''}"></i></div></div>`).join(''); }
      else m.hidden = true;
    }
    ctx.hud = hud;
    UL.Trials.current = ctx;

    async function finish() {
      UL.Trials.current = null; Tr.crawlClear();
      UI.hint({}); document.getElementById('meter').hidden = true;
      if (impl.finish) try { impl.finish(ctx); } catch (e) { console.error(e); }
      if (ctx.ui) { ctx.ui.remove(); ctx.ui = null; }
      if (ctx._skipBtn) { ctx._skipBtn.remove(); ctx._skipBtn = null; }
      if (ctx.skip) { await UI.fade(true, 0.3); UI.hud(''); resolve({ stars: ctx.stars, max, quit: false, skip: true }); return; }
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

  // ---------- Ekel-Gekrabbel über den Bildschirm (Kakerlaken, Spinnen, Maden) ----------
  // Tr.crawl(n, Arten) lässt Tiere übers Bild krabbeln; günstig: eine 2D-Leinwand, läuft nur solange Tiere da sind
  let cv = null, cx = null, bugs2 = [], raf = 0, lastT = 0;
  const KINDS = ['roach', 'spider', 'maggot', 'roach', 'beetle'];
  function drawBug(g, b, t) {
    const s = b.s, w = Math.sin(t * b.ws + b.ph);
    g.save(); g.translate(b.x, b.y); g.rotate(b.a);
    g.lineCap = 'round';
    if (b.k === 'maggot') {
      g.fillStyle = '#efe0b8'; g.strokeStyle = '#b89c6a'; g.lineWidth = s * 0.06;
      for (let i = 5; i >= 0; i--) { const x = -i * s * 0.22, y = Math.sin(t * 9 + i * 0.9 + b.ph) * s * 0.09; g.beginPath(); g.ellipse(x, y, s * 0.17, s * 0.13, 0, 0, 7); g.fill(); g.stroke(); }
      g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(s * 0.12, 0, s * 0.04, 0, 7); g.fill();
    } else if (b.k === 'spider') {
      g.strokeStyle = '#140c08'; g.lineWidth = s * 0.06;
      for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { const a = (i - 1.5) * 0.45 + w * 0.25 * (i % 2 ? 1 : -1); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * s * 0.45, sd * s * 0.55, Math.cos(a) * s * 0.8, sd * s * (0.55 + Math.abs(Math.sin(a)) * 0.2)); g.stroke(); }
      g.fillStyle = '#1e140e'; g.beginPath(); g.ellipse(-s * 0.18, 0, s * 0.3, s * 0.24, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(s * 0.16, 0, s * 0.15, s * 0.13, 0, 0, 7); g.fill();
      g.fillStyle = '#c0302a'; g.beginPath(); g.arc(s * 0.27, -s * 0.05, s * 0.03, 0, 7); g.arc(s * 0.27, s * 0.05, s * 0.03, 0, 7); g.fill();
    } else {
      const col = b.k === 'beetle' ? '#1d3a1a' : '#5a2e12', hi = b.k === 'beetle' ? '#4a8a3a' : '#9a5a2a';
      g.strokeStyle = '#2a1408'; g.lineWidth = s * 0.045;
      for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) { const ph = w * (i % 2 ? 1 : -1) * sd * 0.35, x0 = (i - 1) * s * 0.18; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + s * 0.12 + ph * s * 0.3, sd * s * 0.3); g.lineTo(x0 - s * 0.05 + ph * s * 0.4, sd * s * 0.46); g.stroke(); }
      g.beginPath(); g.moveTo(s * 0.35, -s * 0.05); g.quadraticCurveTo(s * 0.7, -s * 0.3 + w * s * 0.05, s * 0.9, -s * 0.25); g.moveTo(s * 0.35, s * 0.05); g.quadraticCurveTo(s * 0.7, s * 0.3 - w * s * 0.05, s * 0.9, s * 0.25); g.stroke();
      const gr = g.createLinearGradient(0, -s * 0.2, 0, s * 0.2); gr.addColorStop(0, hi); gr.addColorStop(1, col);
      g.fillStyle = gr; g.beginPath(); g.ellipse(-s * 0.05, 0, s * 0.36, s * 0.2, 0, 0, 7); g.fill();
      g.fillStyle = col; g.beginPath(); g.ellipse(s * 0.32, 0, s * 0.1, s * 0.12, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(-s * 0.38, 0); g.lineTo(s * 0.22, 0); g.stroke();
    }
    g.restore();
  }
  function crawlLoop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016); lastT = now;
    const W = cv.width, H = cv.height, t = now / 1000;
    cx.clearRect(0, 0, W, H);
    for (let i = bugs2.length - 1; i >= 0; i--) {
      const b = bugs2[i]; b.life -= dt;
      b.turn += (Math.random() - 0.5) * 6 * dt; b.turn *= 0.96; b.a += b.turn * dt;
      if (b.stop > 0) b.stop -= dt; else { b.x += Math.cos(b.a) * b.v * dt; b.y += Math.sin(b.a) * b.v * dt; if (Math.random() < dt * 0.4) b.stop = Math.random() * 0.5; }
      const out = b.x < -b.s * 2 || b.y < -b.s * 2 || b.x > W + b.s * 2 || b.y > H + b.s * 2;
      if (out && b.life < 0) { bugs2.splice(i, 1); continue; }
      if (b.life > 0 && out) { b.a = Math.atan2(H / 2 - b.y, W / 2 - b.x) + (Math.random() - 0.5); }
      drawBug(cx, b, t);
    }
    if (bugs2.length) raf = requestAnimationFrame(crawlLoop); else { raf = 0; cv.hidden = true; }
  }
  Tr.crawl = (n = 4, kinds = KINDS, life = 2.5) => {
    if (UL.settings && UL.settings.noCrawl) return;
    const ui = document.getElementById('ui'); if (!ui) return;
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'crawl'; cx = cv.getContext('2d'); }
    if (cv.parentNode !== ui) ui.appendChild(cv);
    const k = Math.min(2, devicePixelRatio || 1), W = Math.round(innerWidth * k), H = Math.round(innerHeight * k);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    cv.hidden = false;
    const base = Math.min(W, H) * 0.075;
    for (let i = 0; i < n && bugs2.length < 40; i++) {
      const side = Math.floor(Math.random() * 4), x = side === 0 ? -base : side === 1 ? W + base : Math.random() * W, y = side === 2 ? -base : side === 3 ? H + base : Math.random() * H;
      const k2 = UL.pick(kinds);
      bugs2.push({ k: k2, x, y, a: Math.atan2(H * (0.3 + Math.random() * 0.4) - y, W * (0.2 + Math.random() * 0.6) - x), turn: 0, v: base * (k2 === 'maggot' ? 0.8 : k2 === 'spider' ? 4 : 3) * (0.7 + Math.random() * 0.6), s: base * (k2 === 'spider' ? 1.3 : k2 === 'maggot' ? 0.9 : 1) * (0.7 + Math.random() * 0.6), ws: k2 === 'spider' ? 22 : 30, ph: Math.random() * 6, stop: 0, life: life * (0.6 + Math.random() * 0.8) });
    }
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(crawlLoop); }
  };
  Tr.crawlClear = () => { bugs2.length = 0; if (cv) { cx.clearRect(0, 0, cv.width, cv.height); cv.hidden = true; } };

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
