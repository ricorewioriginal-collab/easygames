/* Wobbel – Erfolge (reine Logik über die Speicherdaten). check(LEVELS) vergibt neu erreichte und liefert sie zurück. */
import { Save } from '../storage.js';
import { WORLDS } from '../game/worlds.js';
const solvedCount = () => Object.values(Save.allLevels()).filter(l => l.plays > 0).length;
const threeStars = () => Object.values(Save.allLevels()).filter(l => l.stars >= 3).length;
const worldDone = (LEVELS, w) => { const ls = LEVELS.filter(l => l.world === w); return ls.length > 0 && ls.every(l => { const v = Save.level(l.index); return v && v.plays > 0; }); };
export const ACHIEVEMENTS = [
  { id: 'first', emoji: '👣', name: 'Erste Schritte', desc: 'Löse dein erstes Level.', reward: 5, test: () => solvedCount() >= 1 },
  { id: 'ten', emoji: '🔟', name: 'Warmgelaufen', desc: 'Löse 10 Level.', reward: 10, test: () => solvedCount() >= 10 },
  { id: 'thirty', emoji: '🏃', name: 'Dauerläufer', desc: 'Löse 30 Level.', reward: 20, test: () => solvedCount() >= 30 },
  { id: 'all', emoji: '🏆', name: 'Wobbel-Meister', desc: 'Löse alle Level.', reward: 60, test: (L) => L.length > 0 && solvedCount() >= L.length },
  { id: 'stars', emoji: '⭐', name: 'Sternesammler', desc: 'Sammle 30 Sterne.', reward: 15, test: () => Save.totalStars() >= 30 },
  { id: 'stars2', emoji: '🌟', name: 'Sternenhimmel', desc: 'Sammle 100 Sterne.', reward: 30, test: () => Save.totalStars() >= 100 },
  { id: 'perfect', emoji: '💎', name: 'Perfektionist', desc: 'Hole 3 Sterne in 10 Leveln.', reward: 15, test: () => threeStars() >= 10 },
  { id: 'clean', emoji: '🧠', name: 'Ohne Wenn und Aber', desc: 'Löse 5 Level (ab 10 Zügen) ganz ohne Rückgängig.', reward: 10, test: () => Save.stat('clean') >= 5 },
  ...WORLDS.map((w, i) => ({ id: 'w' + i, emoji: w.emoji, name: w.name + ' gemeistert', desc: `Löse alle Level der Welt „${w.name}".`, reward: 10, test: L => worldDone(L, i) })),
  { id: 'bonus1', emoji: '🎮', name: 'Spielkind', desc: 'Spiele jedes Bonusspiel einmal.', reward: 10, test: () => ['perlen', 'melodie', 'huschen', 'sortier'].every(id => Save.bonus(id).plays > 0) },
  { id: 'bonus2', emoji: '🕹', name: 'Bonus-Fan', desc: 'Spiele 20 Bonusrunden.', reward: 15, test: () => Save.stat('bonusPlays') >= 20 },
  { id: 'shop', emoji: '🛍', name: 'Modebewusst', desc: 'Kaufe 3 Dinge im Laden.', reward: 10, test: () => Save.stat('buys') >= 3 },
  { id: 'shop2', emoji: '👑', name: 'Königlich', desc: 'Kaufe 8 Dinge im Laden.', reward: 20, test: () => Save.stat('buys') >= 8 },
  { id: 'builder', emoji: '🛠', name: 'Baumeister', desc: 'Speichere ein eigenes Level im Editor.', reward: 10, test: () => Save.stat('editorSaves') >= 1 },
  { id: 'builder2', emoji: '🧩', name: 'Rätselbauer', desc: 'Löse ein selbst gebautes Level.', reward: 10, test: () => Save.stat('editorSolved') >= 1 },
  { id: 'streak3', emoji: '🔥', name: 'Dranbleiber', desc: 'Löse 3 Tage in Folge das Tageslevel.', reward: 10, test: () => Save.stat('bestStreak') >= 3 },
  { id: 'streak7', emoji: '☀️', name: 'Wochensieger', desc: 'Löse 7 Tage in Folge das Tageslevel.', reward: 25, test: () => Save.stat('bestStreak') >= 7 },
  { id: 'fast', emoji: '⚡', name: 'Blitzschnell', desc: 'Löse ein Level (ab 10 Zügen) in unter 15 Sekunden.', reward: 15, test: () => Save.stat('fast') >= 1 },
  { id: 'community', emoji: '🌍', name: 'Weltenbummler', desc: 'Löse ein Community-Level.', reward: 10, test: () => Save.stat('community') >= 1 }
];
export function checkAchievements(LEVELS) { const got = []; for (const a of ACHIEVEMENTS) { if (!Save.achieved(a.id) && a.test(LEVELS)) { Save.unlock(a.id); if (a.reward) Save.addCoins(a.reward); got.push(a); } } return got; }
