/* Fahrer-Figuren: Menschen, Tiere und Fantasiewesen (reine Daten; die 3D-Modelle baut view.js). */
const CHARS = [
  { id: 'mia', name: 'Mia', emoji: '👩', kind: 'Mensch', acc: '#ff2d95', skin: '#f0c090', body: '#f4f6fb' },
  { id: 'fuchs', name: 'Rufus', emoji: '🦊', kind: 'Tier', acc: '#ff7a1a', skin: '#ff8a2a', body: '#fff0e0' },
  { id: 'baer', name: 'Brumm', emoji: '🐻', kind: 'Tier', acc: '#c4453a', skin: '#8a5a2a', body: '#e8d8b8' },
  { id: 'katze', name: 'Luna', emoji: '🐱', kind: 'Tier', acc: '#8b5cf6', skin: '#9aa3b8', body: '#e8ecf8' },
  { id: 'frosch', name: 'Quak', emoji: '🐸', kind: 'Tier', acc: '#00c46a', skin: '#4cc84a', body: '#d8f8c8' },
  { id: 'drache', name: 'Funke', emoji: '🐲', kind: 'Fantasie', acc: '#e8412a', skin: '#3da84a', body: '#ffd890' },
  { id: 'einhorn', name: 'Stella', emoji: '🦄', kind: 'Fantasie', acc: '#ff6ac8', skin: '#fdfdff', body: '#e8f0ff' },
  { id: 'pinguin', name: 'Pico', emoji: '🐧', kind: 'Tier', acc: '#00a8e8', skin: '#252a3a', body: '#252a3a' },
  { id: 'roboter', name: 'Bolt', emoji: '🤖', kind: 'Fantasie', acc: '#00e5ff', skin: '#9aa8c8', body: '#6a7898' },
  { id: 'alien', name: 'Zorp', emoji: '👽', kind: 'Fantasie', acc: '#7cff6a', skin: '#9a5cff', body: '#5a3aa8' },
  { id: 'panda', name: 'Bao', emoji: '🐼', kind: 'Tier', acc: '#ffd24a', skin: '#fafafa', body: '#2a2a32' },
  { id: 'hase', name: 'Hoppel', emoji: '🐰', kind: 'Tier', acc: '#ffa0c8', skin: '#fff0f6', body: '#ffd0e4' }
];

/* Kart-Typen (Werte als Faktoren): mv Tempo, ma Beschleunigung, mt Lenken, mr Gelände (Tempo neben der Strecke), md Drift-Aufladung, mw Gewicht */
const KARTS = [
  { id: 'allrounder', name: 'Allrounder', emoji: '🏎️', mv: 1, ma: 1, mt: 1, mr: 0.55, md: 1, mw: 1, desc: 'Ausgewogen – gut für den Einstieg' },
  { id: 'flitzer', name: 'Flitzer', emoji: '⚡', mv: 1.07, ma: 0.92, mt: 0.9, mr: 0.5, md: 1, mw: 0.9, desc: 'Höchstes Tempo, träge in Kurven' },
  { id: 'buggy', name: 'Buggy', emoji: '🚙', mv: 0.97, ma: 1.02, mt: 1.08, mr: 0.82, md: 1, mw: 1, desc: 'Fährt auch neben der Strecke fast voll' },
  { id: 'cruiser', name: 'Cruiser', emoji: '🚛', mv: 1, ma: 0.88, mt: 0.94, mr: 0.55, md: 1, mw: 1.4, desc: 'Schwer – rammt Gegner einfach weg' },
  { id: 'dragster', name: 'Dragster', emoji: '🚀', mv: 1.03, ma: 1.22, mt: 0.84, mr: 0.5, md: 0.9, mw: 1, desc: 'Brutale Beschleunigung' },
  { id: 'wolke', name: 'Wolkenflitzer', emoji: '☁️', mv: 0.94, ma: 1.05, mt: 1.16, mr: 0.6, md: 1.3, mw: 0.8, desc: 'Wendig, lädt Drift-Turbos schnell auf' }
];
if (typeof module !== 'undefined') module.exports = { CHARS, KARTS };
