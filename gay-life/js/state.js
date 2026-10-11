/* GayLife – Spielstand, Migration und Ereignisbus.
   Wird als erstes Skript geladen und legt den einzigen globalen Namensraum `GL` an.
   Der Spielstand liegt unter dem localStorage-Schlüssel `anmachaGayLife` (wird von ../cloud/anmacha-cloud.js synchronisiert).
   Versionen: v1 = ursprüngliches Gay Life! (Minispiele + 3D-Kiez), v2 = Lebenssimulation (Uhr, Bedürfnisse, Geld, Wohnung, Kontakte). */
(function () {
  'use strict';
  var KEY = 'anmachaGayLife', BACKUP = 'anmachaGayLife_v1backup', VERSION = 2;
  var GL = window.GL = { KEY: KEY, VERSION: VERSION };

  function def() {
    return { v: VERSION, name: 'Du', look: { skin: 1, hair: 1, hc: 1, beard: 1, acc: 0, top: 0, tc: 0, eye: 0 }, glitzer: 0, xp: 0,
      club: { coins: 0, total: 0, items: {}, best: 0, shifts: 0 }, world: { x: 0, z: 14, yaw: 0, t: .3, q: 0, stars: [], dog: 0, cat: 0, qv: 4, done: 0, intro: 0, side: {}, zut: [] }, dates: {}, quiz: { best: 0, runs: 0 }, match: { best: 0 }, run: { best: 0 }, gym: { best: 0 }, rave: { best: {} }, style: { best: 0 }, sound: true, world3d: true, own: {}, dance: { best: 0 }, pool: { best: 0 }, kara: { best: 0 }, sauna: { best: 0 }, dark: { best: 0 }, cast: { best: 0 },
      // ab v2
      life: { day: 1, needs: { energy: 85, hunger: 75, hygiene: 80, social: 60, stress: 20 }, boost: 0, money: 150, log: [], food: 2, inside: 0, ix: 0, iz: 3, warn: {}, stats: { meals: 0, showers: 0, sleeps: 0 } },
      jobs: { bar: { xp: 0, shifts: 0, earned: 0 } },
      rel: {}, msgs: [], cal: [], dating: { ints: [] }, home: { own: {}, placed: {}, partner: '', rentDay: 0, debt: 0 },
      settings: { q: -1 } };
  }
  function merge(d, s) {
    if (!s || typeof s !== 'object') return d;
    for (var k in s) {
      if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) d[k] = merge(d[k], s[k]);
      else if (s[k] !== undefined && s[k] !== null) d[k] = s[k];
    }
    return d;
  }
  /* Migration: rohes Objekt aus dem Speicher -> aktuelle Version. Wird nie mit fremden Daten aufgerufen, prüft aber Typen. */
  function migrate(raw) {
    if (!raw || typeof raw !== 'object') return def();
    var from = +raw.v || 1;
    if (from < 2) {
      // v1 -> v2: alles Bisherige bleibt erhalten, neue Bereiche kommen über def() dazu.
      // Wer schon viel gespielt hat, startet mit etwas mehr Erspartem (aus dem verdienten Club-Trinkgeld).
      var c = raw.club && +raw.club.total > 0 ? Math.min(250, Math.floor(+raw.club.total / 20)) : 0;
      raw.life = { money: 150 + c };
      raw.v = 2;
    }
    var s = merge(def(), raw);
    s.v = VERSION;
    return s;
  }
  function load() {
    var txt = null, raw = null;
    try { txt = localStorage.getItem(KEY); } catch (e) {}
    if (txt) { try { raw = JSON.parse(txt); } catch (e) { raw = null; } }
    if (raw && typeof raw === 'object' && (+raw.v || 1) < VERSION) {
      // Vor der Migration einmalig sichern (nicht überschreiben, falls schon vorhanden)
      try { if (!localStorage.getItem(BACKUP)) localStorage.setItem(BACKUP, txt); } catch (e) {}
    }
    return raw ? migrate(raw) : def();
  }
  var S = GL.S = load();
  GL.def = def; GL.merge = merge; GL.migrate = migrate;
  GL.save = function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  /* Ereignisbus: Module melden sich an, statt sich gegenseitig direkt zu ändern. */
  var ev = {};
  GL.on = function (n, fn) { (ev[n] || (ev[n] = [])).push(fn); };
  GL.emit = function (n, a, b) {
    var l = ev[n], r; if (!l) return;
    for (var i = 0; i < l.length; i++) { try { var x = l[i](a, b); if (x !== undefined) r = x; } catch (e) { if (window.console) console.error('[GL] ' + n, e); } }
    return r;
  };
  GL.clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
})();
