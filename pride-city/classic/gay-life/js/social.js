/* GayLife – Kontakte und Freundschaft (Grundlage für das spätere Beziehungs- und Dating-System).
   S.rel[id] = { met: Tag des Kennenlernens, f: Freundschaft 0–100, talks: Anzahl Gespräche, last: Tag des letzten Gesprächs }.
   Pro Person zählt das erste Gespräch eines Tages für die Freundschaft; jedes Gespräch hilft dem Bedürfnis „Kontakte“. */
(function () {
  'use strict';
  var S = GL.S, L = S.life;
  var soc = GL.social = {};

  soc.get = function (id) { return S.rel[id] || null; };
  soc.level = function (f) { return f >= 70 ? 'Enge Freundschaft' : f >= 40 ? 'Befreundet' : f >= 15 ? 'Bekannt' : 'Neu kennengelernt'; };
  soc.npc = function (id) { return GL.core.NPCDEF.filter(function (x) { return x.id === id; })[0]; };

  GL.on('talk', function (id) {
    if (!soc.npc(id)) return;
    var r = S.rel[id], first = !r;
    if (!r) r = S.rel[id] = { met: L.day, f: 0, talks: 0, last: 0 };
    r.talks++;
    if (r.last !== L.day) { r.last = L.day; r.f = Math.min(100, r.f + 4); GL.life.change({ social: 8 }); }
    else GL.life.change({ social: 2 });
    if (first) setTimeout(function () { GL.core.toast('Neuer Kontakt im Handy: ' + soc.npc(id).n); }, 400);
    GL.save();
  });
})();
