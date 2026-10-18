/* Lädt die Spiel-Logik (rng.js, reels.js, economy.js) wie ein Browser-Skript in einen eigenen vm-Kontext.
 * Eine Quelle der Wahrheit: Der Server rechnet mit exakt denselben Tabellen und Formeln wie das Spiel. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), { webcrypto } = require('crypto');

const FILES = ['js/core/rng.js', 'js/data/reels.js', 'js/core/economy.js'];

function gameDir(dir) {
  const backendRoot = path.join(__dirname, '..');
  return path.resolve(backendRoot, dir || process.env.SPINWELTEN_GAME_DIR || '../spinwelten');
}

function loadGame(dir) {
  const root = gameDir(dir);
  const sandbox = { crypto: webcrypto };   // SW.rng.secure() nutzt crypto.getRandomValues
  vm.createContext(sandbox);
  for (const f of FILES) {
    const file = path.join(root, f);
    if (!fs.existsSync(file)) throw new Error('Spiel-Logik nicht gefunden: ' + file + ' (SPINWELTEN_GAME_DIR prüfen)');
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }
  const SW = sandbox.SW;
  if (!SW || !SW.rng || !SW.REELS || !SW.ECON) throw new Error('Spiel-Logik unvollständig geladen aus ' + root);
  const need = ['roll', 'evaluate', 'spinReward', 'buildCost', 'repairCost', 'attackReward', 'raidLootCap', 'multsFor', 'clampInt', 'base'];
  for (const k of need) if (typeof SW.ECON[k] !== 'function') throw new Error('SW.ECON.' + k + ' fehlt');
  // Plausibilitätsprüfung: ein Wurf muss drei bekannte Symbole liefern
  const r = SW.ECON.roll(SW.rng.secure());
  if (!Array.isArray(r.ids) || r.ids.length !== 3 || !r.ids.every(id => SW.ECON.IDS.includes(id))) throw new Error('SW.ECON.roll liefert ungültige Symbole');
  return SW;
}

module.exports = { loadGame, gameDir };
