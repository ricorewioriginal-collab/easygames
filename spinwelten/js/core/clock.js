/* Spinwelten 3D – faire Uhr: Energie-Nachladen, Tageswechsel, Event-Kalender, Erkennung zurückgestellter Uhren.
 * Regeln: Geht die Gerätezeit rückwärts, wird nichts gutgeschrieben (Zeitstempel wird neu gesetzt, Hinweis clockWarn).
 * Offline-Zeit zählt höchstens 48 h (Bots) bzw. bis die Energie voll ist. */
(function (SW) {
  'use strict';
  const H = 3600000, D = 86400000;
  const pad = n => (n < 10 ? '0' : '') + n;
  function dayKey(t) { const d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function weekKey(t) {   // ISO-Woche
    const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const w1 = new Date(d.getFullYear(), 0, 4);
    return d.getFullYear() + '-W' + pad(1 + Math.round(((d - w1) / D - 3 + ((w1.getDay() + 6) % 7)) / 7));
  }
  // Energie nachladen; liefert gutgeschriebene Spins
  function regen(state, now, regenMs, max) {
    if (now < state.energyT - 60000) { state.energyT = now; state.clockWarn = true; return 0; }
    if (state.energy >= max) { state.energyT = now; return 0; }
    const n = Math.floor((now - state.energyT) / regenMs);
    if (n <= 0) return 0;
    const add = Math.min(n, max - state.energy);
    state.energy += add;
    state.energyT = state.energy >= max ? now : state.energyT + n * regenMs;
    return add;
  }
  function nextIn(state, now, regenMs, max) { return state.energy >= max ? 0 : Math.max(0, state.energyT + regenMs - now); }
  // Aktuelles Event aus dem Datum (UTC, deterministisch)
  function eventAt(t) {
    const len = SW.EVENT_DAYS * D, k = Math.floor((t - SW.EVENT_EPOCH) / len);
    const i = ((k % SW.EVENTS.length) + SW.EVENTS.length) % SW.EVENTS.length;
    const start = SW.EVENT_EPOCH + k * len;
    return { def: SW.EVENTS[i], idx: i, start, end: start + len };
  }
  function fmtDur(ms, lang) {
    const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    if (h >= 24) { const d = Math.floor(h / 24); return d + (lang === 'en' ? 'd ' : ' T ') + (h % 24) + ' h'; }
    if (h > 0) return h + ' h ' + pad(m) + ' min';
    return m + ':' + pad(x);
  }
  SW.Clock = { H, D, dayKey, weekKey, regen, nextIn, eventAt, fmtDur };
})(globalThis.SW = globalThis.SW || {});
