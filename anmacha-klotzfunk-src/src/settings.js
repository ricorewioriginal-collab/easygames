// Einstellungen (lokal gespeichert): Grafikstufe, Empfindlichkeit, Touch-Tasten, Lautstärke.
const KEY = 'klotzfunk.settings';

// Grafikstufen: Pixeldichte-Obergrenze, Sichtweite (Chunks), Wolken, Arbeitsbudget fürs Nachladen (ms je Bild)
export const QUALITY = {
// Etappe 11: shadow = Größe der Schattenkarte (0 = aus), shadowR = Schattenbereich um den Spieler, shadowEvery = jedes n-te Bild,
// vclouds = 3D-Wolken aus Blöcken, post = Leuchten/Farbabstimmung, wind = wiegende Blätter
  eco: { name: 'Eco', dpr: 0.75, view: 3, clouds: false, budget: 3, shadow: 0, vclouds: false, post: false, wind: false },
  mobile: { name: 'Mobil', dpr: 1.25, view: 4, clouds: true, budget: 4, shadow: 1024, shadowR: 28, shadowEvery: 3, vclouds: false, post: false, wind: true },
  standard: { name: 'Standard', dpr: 1.5, view: 6, clouds: true, budget: 6, shadow: 2048, shadowR: 44, shadowEvery: 1, vclouds: true, post: true, wind: true },
  high: { name: 'Hoch', dpr: 2, view: 9, clouds: true, budget: 8, shadow: 2048, shadowR: 60, shadowEvery: 1, vclouds: true, post: true, wind: true }
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
  ambVol: 0.7,          // Umgebung: Schritte, Wasser, Tiere
  showFps: false,
  deathLoss: 'keep',    // keep | grave (Vorrat bleibt am Todesort liegen)
  enemies: true,        // Gegner im Überlebensmodus (aus = friedlich)
  preview: true,        // Platzierungsvorschau (weißer Rahmen)
  stun: true,           // Mehrspieler: öffentlichen STUN-Server nutzen
  mpName: '',           // Mehrspieler: eigener Name
  minimap: true,        // Minikarte oben links
  keys: {},             // eigene Tastenbelegung (Aktion -> KeyboardEvent.code)
  padKeys: {},          // eigene Controller-Belegung (Aktion -> Tastennummer im Standard-Layout)
  padSens: 1,           // Kamera mit dem rechten Stick
  padRumble: 0.8,       // Vibrationsstärke (0 = aus)
  padDead: 0.18,        // Totzone der Sticks
  padInvertY: false,    // rechter Stick: oben/unten umkehren
  touchPos: {}          // verschobene Touch-Tasten (id -> [x, y] in Bildschirmanteilen)
};

export function loadSettings() {
  let s = {};
  try { s = JSON.parse(globalThis.localStorage.getItem(KEY)) || {}; } catch (e) { s = {}; }
  const out = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) if (s[k] !== undefined && typeof s[k] === typeof DEFAULTS[k] && (s[k] === null) === (DEFAULTS[k] === null)) out[k] = s[k];
  if (out.quality !== 'auto' && !QUALITY[out.quality]) out.quality = 'auto';
  if (!['keep', 'grave'].includes(out.deathLoss)) out.deathLoss = 'keep';
  return out;
}
export function saveSettings(s) {
  try { globalThis.localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
}
// Startstufe für „Automatisch“
export function autoBase(coarse) { return coarse ? 'mobile' : 'standard'; }
