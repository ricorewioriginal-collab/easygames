/* GayLife – Leistungswächter: Im Qualitäts-Modus „Auto“ senkt er die Auflösung stufenweise, wenn die Bildrate über längere Zeit zu niedrig ist.
   Er hebt sie nie von selbst wieder an (kein Hin und Her); wer die Qualität von Hand wählt, wird nicht überstimmt. */
(function () {
  'use strict';
  var P = GL.perf = { cap: 2, low: 0, fps: 0 }, last = 0, acc = 0, frames = 0;
  P.judge = function (fps) {
    P.fps = fps;
    if (GL.S.settings.q >= 0 || P.cap <= 0) { P.low = 0; return false; }
    P.low = fps < 24 ? P.low + 1 : 0;
    if (P.low >= 2) { P.low = 0; P.cap--; GL.perfCap = P.cap; if (GL.phone && GL.phone.applyQuality) GL.phone.applyQuality(); return true; }
    return false;
  };
  GL.on('tick', function () {
    var n = performance.now(); if (!last) { last = n; return; }
    var d = n - last; last = n; if (d > 1000) return;       /* Pausen (Tabwechsel, Menü) zählen nicht */
    acc += d; frames++;
    if (acc >= 4000) { P.judge(frames / acc * 1000); acc = 0; frames = 0; }
  });
})();
