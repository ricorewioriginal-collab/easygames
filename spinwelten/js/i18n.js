/* Spinwelten 3D – Sprache (Deutsch Standard, Englisch vollständig) und Zahlenformat ohne Exponent. */
(function (SW) {
  'use strict';
  SW.lang = 'de';
  SW.setLang = function (l) { SW.lang = l === 'en' ? 'en' : 'de'; if (globalThis.document) document.documentElement.lang = SW.lang; };
  // L('Deutsch', 'English') – jeder Text steht direkt zweisprachig im Code, so fehlt nie eine Übersetzung
  SW.L = (de, en) => (SW.lang === 'en' ? en : de);
  // Textobjekt {de, en} auswählen
  SW.tx = o => (o == null ? '' : typeof o === 'string' ? o : (o[SW.lang] || o.de || ''));
  SW.fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (v && v[k] !== undefined ? v[k] : m));
  const UNITS = {
    de: [[1e15, 'Brd.'], [1e12, 'Bio.'], [1e9, 'Mrd.'], [1e6, 'Mio.']],
    en: [[1e15, 'Qa'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M']]
  };
  function group(n, sep) { return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep); }
  // Große Zahlen: bis 999.999 voll, darüber mit Einheit und bis zu 2 Nachkommastellen
  SW.fmt = function (n) {
    n = Math.floor(Number(n) || 0); const neg = n < 0; if (neg) n = -n;
    const de = SW.lang !== 'en', sep = de ? '.' : ',', dec = de ? ',' : '.';
    let out;
    if (n < 1e6) out = group(n, sep);
    else {
      const u = UNITS[de ? 'de' : 'en'].find(x => n >= x[0]);
      const v = n / u[0], digits = v >= 100 ? 0 : v >= 10 ? 1 : 2;
      let s = (Math.floor(v * Math.pow(10, digits)) / Math.pow(10, digits)).toFixed(digits).replace(/\.?0+$/, '');
      s = s.replace('.', dec);
      out = s + (de ? ' ' : '') + u[1];
    }
    return (neg ? '−' : '') + out;
  };
})(globalThis.SW = globalThis.SW || {});
