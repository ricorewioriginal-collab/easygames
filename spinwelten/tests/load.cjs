// Lädt die Spiel-Logik (ohne DOM) in globalThis.SW – für Node-Tests und Simulationen.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..', 'js');
const FILES = ['core/rng', 'data/reels', 'core/economy', 'data/worlds', 'data/cards', 'data/quests', 'data/achievements', 'data/story',
  'data/companions', 'data/bots', 'data/events', 'core/save', 'core/clock',
  'game/core', 'game/companions', 'game/spin', 'game/village', 'game/bots', 'game/attacks', 'game/raid', 'game/collectibles', 'game/campaigns'];
module.exports = function load() {
  globalThis.SW = {};
  for (const f of FILES) { try { const p = require.resolve(path.join(ROOT, f + '.js')); delete require.cache[p]; require(p); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } }
  return globalThis.SW;
};
module.exports.FILES = FILES;
