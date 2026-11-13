/* AnMaCha – Der Podcast – „Die verrückte KI-Quizshow“ (nach AnMaCha Spezial #2).
   1 Spieler gegen den KI-Kollegen oder 2 Spieler an einem Gerät: Andrew gegen Marco.
   Spieler 1: Controller 1 · Tasten 1–4 · linke Hälfte der Antwortknöpfe. Spieler 2: Controller 2 · Tasten 7–0 · rechte Hälfte. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, D = AMC.Data, W = AMC.World, I = AMC.Input, ST = AMC.Studio;
  const Q = AMC.Quiz = { active: false };
  let S = null;
  const BTN = ['a', 'b', 'x', 'y'];

  Q.start = function (cfg) {
    const p1 = cfg.host || 'andrew', p2 = p1 === 'andrew' ? 'marco' : 'andrew';
    S = { cfg, two: cfg.players === 2, ids: [p1, p2], score: [0, 0], qs: U.shuffle(D.QUIZ).slice(0, 10), i: -1, phase: 'intro', t: 0, ans: [null, null], at: [0, 0], cpuAt: 0, cpuAns: null, ended: false };
    Q.active = true; AMC.multiPad = S.two;
    ST.enter('quiz');
    // Spieler 1 links (orange), Spieler 2 rechts (blau)
    S.ids.forEach((id, i) => { const f = W.hosts[id]; if (f) { f.root.position.set(i ? 1.6 : -1.6, 0, 2.3); f.root.rotation.y = 0; } });
    AMC.Audio.music('quiz');
    const ui = U.el('div', 'quiz-ui'); ui.id = 'quizUi';
    ui.innerHTML = '<div class="qz-top"><div class="qz-p glass p1"><img src="' + AMC.UI.face(p1) + '" alt=""><b>' + D.HOSTS[p1].name + (S.two ? ' <small>Spieler 1</small>' : ' <small>Du</small>') + '</b><span id="qzS0">0</span></div>' +
      '<div class="qz-n glass" id="qzN">KI-Quizshow</div>' +
      '<div class="qz-p glass p2"><span id="qzS1">0</span><b>' + D.HOSTS[p2].name + (S.two ? ' <small>Spieler 2</small>' : ' <small>KI-Kollege</small>') + '</b><img src="' + AMC.UI.face(p2) + '" alt=""></div></div>' +
      '<div class="qz-q glass" id="qzQ"><small id="qzCat"></small><p id="qzTxt">Die verrückte KI-Quizshow</p><i class="mg-bar"><em id="qzBar"></em></i></div>' +
      '<div class="qz-a" id="qzA"></div><div class="qz-help" id="qzHelp"></div>';
    U.$('ui').appendChild(ui);
    U.$('qzHelp').innerHTML = S.two
      ? 'Spieler 1: ' + (I.padCount() > 0 ? 'Controller 1 oder ' : '') + 'Tasten 1–4 · Spieler 2: ' + (I.padCount() > 1 ? 'Controller 2 oder ' : '') + 'Tasten 7–0 · Am Handy: linke/rechte Hälfte der Antwort'
      : (I.device === 'pad' ? 'Antworten mit ' + AMC.glyph('a') + AMC.glyph('b') + AMC.glyph('x') + AMC.glyph('y') : I.device === 'touch' ? 'Antwort antippen' : 'Antworten mit Tasten 1–4 oder Klick') + ' – schneller = mehr Punkte';
    sayKi('Willkommen zur verrückten KI-Quizshow! Zehn Fragen. Wer ist schneller?');
    setTimeout(() => S && next(), 2200);
  };
  Q.stop = function () { Q.active = false; AMC.multiPad = false; S = null; const u = U.$('quizUi'); if (u) u.remove(); ST.leave(); };

  function sayKi(t) { const e = U.$('qzTxt'); if (e) e.textContent = t; AMC.Audio.sfx('talk'); }
  function next() {
    if (!S) return;
    S.i++; if (S.i >= S.qs.length) return end();
    const q = S.qs[S.i], opts = U.shuffle([1, 2, 3, 4].map(k => q[k]));
    S.cur = { q, opts, right: opts.indexOf(q[1]) };
    S.ans = [null, null]; S.at = [0, 0]; S.phase = 'ask'; S.t = 0; S.limit = 12;
    S.cpuAt = U.rand(2.5, 8.5); S.cpuAns = Math.random() < 0.62 ? S.cur.right : U.irand(0, 3);
    U.$('qzN').textContent = 'Frage ' + (S.i + 1) + ' / ' + S.qs.length; U.$('qzCat').textContent = q[5]; U.$('qzTxt').textContent = q[0];
    const box = U.$('qzA'); box.innerHTML = '';
    opts.forEach((o, i) => {
      const b = U.el('div', 'qz-opt', '<span class="g">' + (I.device === 'pad' ? AMC.glyph(BTN[i]) : '') + '<em>' + (i + 1) + (S.two ? '/' + [7, 8, 9, 0][i] : '') + '</em></span><span class="t">' + U.esc(o) + '</span><span class="who"></span>' +
        (S.two ? '<button type="button" class="half l" aria-label="Spieler 1"></button><button type="button" class="half r" aria-label="Spieler 2"></button>' : '<button type="button" class="half full" aria-label="Antwort"></button>'));
      b.querySelectorAll('.half').forEach(h => h.addEventListener('click', () => answer(h.classList.contains('r') ? 1 : 0, i)));
      box.appendChild(b);
    });
    AMC.Audio.sfx('onair');
    ST.buzz.forEach(b => b.material.emissive && b.material.emissive.set(0x600000));
  }
  function answer(p, i) {
    if (!S || S.phase !== 'ask' || S.ans[p] !== null) return;
    if (p === 1 && !S.two) return;
    S.ans[p] = i; S.at[p] = S.t; AMC.Audio.sfx('buzz');
    const f = W.hosts[S.ids[p]]; f && f.play('push', { once: true, restart: true }); setTimeout(() => f && f.play('idle', { fade: 0.3 }), 600);
    if (ST.buzz[p]) ST.buzz[p].material.emissive.set(0xff3030);
    const who = U.$('qzA').children[i].querySelector('.who'); who.innerHTML += '<i class="p' + (p + 1) + '">' + D.HOSTS[S.ids[p]].name[0] + '</i>';
    if (S.ans[0] !== null && S.ans[1] !== null) setTimeout(reveal, 400);
  }
  function reveal() {
    if (!S || S.phase !== 'ask') return; S.phase = 'reveal';
    const r = S.cur.right, opts = U.$('qzA').children;
    for (let i = 0; i < opts.length; i++) opts[i].classList.add(i === r ? 'right' : 'wrong');
    const firstRight = [0, 1].filter(p => S.ans[p] === r).sort((a, b) => S.at[a] - S.at[b])[0];
    [0, 1].forEach(p => {
      const ok = S.ans[p] === r, f = W.hosts[S.ids[p]];
      if (ok) { const pts = 100 + Math.round(Math.max(0, S.limit - S.at[p]) * 10) + (p === firstRight ? 50 : 0); S.score[p] += pts; f && f.play('yes', { fade: 0.2 }); W.particles.burst(p ? 1.6 : -1.6, 2.2, 2.3, p ? 0x3dd6ff : 0xff8a1e, 26, { speed: 5 }); }
      else f && f.play('down', { fade: 0.2, once: true });
      setTimeout(() => f && f.play('idle', { fade: 0.4 }), 1500);
      U.$('qzS' + p).textContent = U.fmt(S.score[p]);
    });
    AMC.Audio.sfx(S.ans[0] === r ? 'perfect' : 'miss');
    sayKi((S.ans[0] === r || S.ans[1] === r ? 'Richtig: ' : 'Leider nein. Richtig wäre: ') + S.cur.opts[r]);
    setTimeout(() => S && next(), 2300);
  }
  function end() {
    S.phase = 'end'; S.ended = true;
    const [a, b] = S.score, win = a === b ? -1 : a > b ? 0 : 1;
    sayKi(win < 0 ? 'Unentschieden! Ihr seid beide verrückt gut.' : D.HOSTS[S.ids[win]].name + ' gewinnt die KI-Quizshow!');
    if (win >= 0) { const f = W.hosts[S.ids[win]]; f && f.play('dance'); AMC.Audio.sfx('win'); W.particles.burst(win ? 1.6 : -1.6, 2.5, 2.3, 0xffd23f, 60, { speed: 8 }); }
    const res = { score: S.score, two: S.two, win, ids: S.ids };
    if (!S.two) { AMC.Save.data.best.quiz = Math.max(AMC.Save.data.best.quiz, a); if (win === 0) AMC.Save.data.stats.quizWins++; AMC.Save.save(); }
    setTimeout(() => { if (!S) return; const cb = S.cfg.onEnd; Q.stop(); cb && cb(res); }, 3200);
  }

  Q.update = function (dt) {
    if (!S) return;
    S.t += dt;
    if (S.phase === 'ask') {
      // Spieler 1
      const p0 = I.padHits[0] || [], p1 = I.padHits[1] || [];
      BTN.forEach((b, i) => { if (p0.includes(b)) answer(0, i); if (S.two && p1.includes(b)) answer(1, i); });
      ['k1', 'k2', 'k3', 'k4'].forEach((k, i) => { if (I.hit(k)) answer(0, i); });
      if (S.two) ['k7', 'k8', 'k9', 'k0'].forEach((k, i) => { if (I.hit(k)) answer(1, i); });
      if (!S.two && S.ans[1] === null && S.t >= S.cpuAt) { S.ans[1] = null; answerCpu(); }
      U.$('qzBar').style.width = Math.max(0, 100 - S.t / S.limit * 100) + '%';
      if (S.t >= S.limit) { if (S.ans[0] === null) S.ans[0] = -1; if (S.ans[1] === null) S.ans[1] = -1; reveal(); }
    }
    ST.update(dt, { led: { hype: 70, text: 'KI-QUIZ', sub: S.cur ? 'Frage ' + (S.i + 1) + ' · ' + S.score[0] + ' : ' + S.score[1] : 'Die verrückte KI-Quizshow' } });
  };
  function answerCpu() { const two = S.two; S.two = true; answer(1, S.cpuAns); S.two = two; }
  Q.render = () => ST.render();
})(typeof window !== 'undefined' ? window : globalThis);
