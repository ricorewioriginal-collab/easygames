// Lädt die reinen Spielmodule (ohne Browser) für die Tests
'use strict';
const path = require('path');
const src = path.join(__dirname, '..', 'src');
const CPU = require(path.join(src, 'core/rng.js'));
['core/board', 'core/rules', 'core/levelgen', 'core/bots', 'core/levels', 'data/worlds', 'data/levels', 'data/puzzles', 'modes/modes'].forEach(f => require(path.join(src, f + '.js')));
module.exports = CPU;
