/* Wobbel – Tageslevel: jeden Tag ein anderes Hauptlevel, mit Muschel-Bonus und Serie. */
import { Save } from '../storage.js';
export const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayNum = s => Math.round(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5);
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
/** Welches Level ist heute dran? (gleichmäßig über alle, aber nie zweimal hintereinander dasselbe) */
export function dailyIndex(day, n) { if (n <= 1) return 0; const a = hash('wobbel' + day) % n, prev = hash('wobbel' + dayStr(new Date(dayNum(day) * 864e5 - 864e5 + 12 * 36e5))) % n; return a === prev ? (a + 1) % n : a; }
export const dailyStatus = (day = dayStr()) => { const d = Save.daily; return { done: d.done === day, streak: d.last === day || d.last === dayStr(new Date(dayNum(day) * 864e5 - 864e5 + 12 * 36e5)) ? d.streak : 0 }; };
export const dailyReward = streak => 10 + Math.min(streak, 5) * 2;
/** Nach dem Lösen des Tageslevels aufrufen. Gibt {reward, streak} zurück oder null, wenn heute schon erledigt. */
export function completeDaily(day = dayStr()) {
  const d = Save.daily; if (d.done === day) return null;
  const y = dayStr(new Date(dayNum(day) * 864e5 - 864e5 + 12 * 36e5)), streak = d.last === y ? d.streak + 1 : 1, reward = dailyReward(streak);
  Save.setDaily({ done: day, last: day, streak }); Save.addCoins(reward); Save.maxStat('bestStreak', streak); return { reward, streak };
}
