/* Sprachstruktur: Texte stehen auf Deutsch direkt in Daten und Oberfläche. PT.t(key) liefert kurze, häufig genutzte
   Begriffe aus einer Tabelle je Sprache; weitere Sprachen können hier ergänzt werden (fehlende Schlüssel fallen auf Deutsch zurück). */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const T = {
    de: { money: 'Geld', fans: 'Fans', rep: 'Ruf', day: 'Tag', build: 'Bauen', episode: 'Folge', team: 'Team', journal: 'Journal', map: 'Karte', pause: 'Pause', back: 'Zurück', next: 'Weiter', cancel: 'Abbrechen', online: '🌐 Online' },
    en: { money: 'Money', fans: 'Fans', rep: 'Reputation', day: 'Day', build: 'Build', episode: 'Episode', team: 'Team', journal: 'Journal', map: 'Map', pause: 'Pause', back: 'Back', next: 'Next', cancel: 'Cancel', online: '🌐 Online' }
  };
  let lang = 'de';
  PT.I18N = { langs: Object.keys(T), set(l) { if (T[l]) lang = l; }, get lang() { return lang; } };
  PT.t = key => (T[lang] && T[lang][key]) || T.de[key] || key;
})(typeof window !== 'undefined' ? window : globalThis);
