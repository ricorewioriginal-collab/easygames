// Einstellungen (lokal gespeichert): Grafikstufe, Empfindlichkeit, Touch-Tasten, Lautstärke.
const KEY = 'klotzfunk.settings';

// Grafikstufen: Pixeldichte-Obergrenze, Sichtweite (Chunks), Wolken, Arbeitsbudget fürs Nachladen (ms je Bild)
export const QUALITY = {
  eco: { name: 'Eco', dpr: 0.75, view: 3, clouds: false, budget: 3 },
  mobile: { name: 'Mobil', dpr: 1.25, view: 4, clouds: true, budget: 4 },
  standard: { name: 'Standard', dpr: 1.5, view: 6, clouds: true, budget: 6 },
  high: { name: 'Hoch', dpr: 2, view: 9, clouds: true, budget: 8 }
};

export const DEFAULTS = {
  quality: 'auto',      // auto | eco | mobile | standard | high
  mouseSens: 1,         // Faktor
  touchSens: 1,
  joySens: 1,           // >1: volle Geschwindigkeit bei kürzerem Ziehen
  btnScale: 1,          // Größe der Touch-Tasten
  lefty: false,         // Linkshänder: Tasten links, Laufen rechts
  invertY: false,
  placeDelay: true,     // Setzen erst nach kurzem Halten wiederholen
  sfxVol: 0.8,
  musicVol: 0.8,
  showFps: false,
  deathLoss: 'keep'     // keep | grave (Vorrat bleibt am Todesort liegen)
};

export function loadSettings() {
  let s = {};
  try { s = JSON.parse(globalThis.localStorage.getItem(KEY)) || {}; } catch (e) { s = {}; }
  const out = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) if (s[k] !== undefined && typeof s[k] === typeof DEFAULTS[k]) out[k] = s[k];
  if (out.quality !== 'auto' && !QUALITY[out.quality]) out.quality = 'auto';
  if (!['keep', 'grave'].includes(out.deathLoss)) out.deathLoss = 'keep';
  return out;
}
export function saveSettings(s) {
  try { globalThis.localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
}
// Startstufe für „Automatisch“
export function autoBase(coarse) { return coarse ? 'mobile' : 'standard'; }
