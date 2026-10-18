// Lädt alle Kernmodule in Node (ohne DOM) – gemeinsam genutzt von den Tests.
const path = require('path');
const FILES = ['core/rng.js', 'data/cosmetics.js', 'data/maps.js', 'data/roles.js', 'data/cases.js', 'core/grid.js', 'core/tasks.js', 'core/sabotage.js',
  'core/meeting.js', 'core/rules.js', 'core/evidence.js', 'core/modes.js', 'core/sim.js', 'data/words-de.js', 'core/word-game.js', 'ai/memories.js', 'ai/nav.js',
  'ai/discussion.js', 'ai/brain.js', 'ai/word-ai.js', 'network/protocol.js', 'network/lobby.js'];
const fs = require('fs');
for (const f of FILES) { const p = path.join(__dirname, '..', 'src', f); if (fs.existsSync(p)) require(p); }
module.exports = globalThis.AMU;
