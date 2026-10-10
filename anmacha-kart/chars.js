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
if (typeof module !== 'undefined') module.exports = CHARS;
