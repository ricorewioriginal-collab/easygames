/* GayLife – Nachrichten auf dem Handy. Personen schreiben dir (Terminerinnerungen, Konflikte, Dank nach Dates, Antworten aus der Dating-App);
   manche Nachrichten haben Antwortmöglichkeiten, die die Beziehung beeinflussen.
   S.msgs: [{ id, n (npcId), d (Tag), h (Uhrzeit), t (Text), u (ungelesen), r ([[Label, dRomantik, dFreundschaft, Antwort]]), done }] */
(function () {
  'use strict';
  var S = GL.S;
  var M = GL.msg = {};
  var pending = []; // zeitverzögerte Nachrichten { at: absolute Minute, n, t, r }

  function absNow() { var h = GL.life.hour(); return (S.life.day - 1) * 1440 + h * 60; }
  M.unread = function () { return S.msgs.filter(function (m) { return m.u; }).length; };
  M.push = function (npc, text, replies, silent) {
    S.msgs.unshift({ id: Date.now() + Math.random(), n: npc, d: S.life.day, h: GL.life.clock(), t: text, u: 1, r: replies || null, done: 0 });
    if (S.msgs.length > 40) S.msgs.length = 40;
    var nn = GL.social.npc(npc);
    if (!silent && GL.W && GL.W.on) GL.core.toast('📱 ' + (nn ? nn.n : 'Neue Nachricht') + ': ' + text.slice(0, 42) + (text.length > 42 ? '…' : ''));
    GL.save();
  };
  /* verzögert (Spielminuten) */
  M.later = function (npc, text, replies, minutes) {
    S.dating.queue = S.dating.queue || [];
    S.dating.queue.push({ at: absNow() + minutes, n: npc, t: text, r: replies || null }); GL.save();
  };
  M.flush = function () {
    var q = S.dating.queue; if (!q || !q.length) return; var now = absNow(), keep = [];
    q.forEach(function (x) { if (x.at <= now) M.push(x.n, x.t, x.r); else keep.push(x); });
    S.dating.queue = keep;
  };
  M.reply = function (id, k) {
    var m = S.msgs.filter(function (x) { return x.id === id; })[0]; if (!m || m.done || !m.r || !m.r[k]) return null;
    var o = m.r[k]; m.done = 1; m.u = 0;
    var r = GL.dating.rel(m.n); r.r = GL.clamp(r.r + (o[1] || 0), 0, 100); r.f = GL.clamp(r.f + (o[2] || 0), 0, 100);
    if (o[4] === 'sorry' && r.conflict) { r.conflict = 0; GL.dating.mem(m.n, 'Streit beigelegt'); }
    GL.save(); return o[3];
  };
  var t = 0;
  GL.on('tick', function (dt) { t += dt; if (t > 3) { t = 0; M.flush(); } });
})();
