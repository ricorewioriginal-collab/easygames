/* Lädt alle Simulationsmodule in Node (ohne DOM). */
'use strict';
const files = ['data', 'core', 'world', 'battle', 'city', 'heroes', 'econ', 'march', 'ai', 'diplo', 'waves', 'campaign', 'game', 'save'];
let PW;
files.forEach(f => { PW = require('../js/' + f + '.js'); });
module.exports = PW;
