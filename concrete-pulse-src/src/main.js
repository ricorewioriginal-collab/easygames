// CONCRETE PULSE – Start
import { createEngine, autoQuality } from './gfx.js';
import { Input } from './input.js';
import { UI } from './ui.js';
import { Game } from './game.js';
import { save, persist } from './save.js';
import * as A from './audio.js';

const tv = /SmartTV|SMART-TV|Tizen|Web0S|webOS|BRAVIA|AFT[A-Z]|Android TV|GoogleTV|HbbTV/i.test(navigator.userAgent) || new URLSearchParams(location.search).has('tv');
if (!save.settings.quality) { save.settings.quality = autoQuality(); if (tv) { save.settings.quality = 'low'; save.settings.easy = true; save.settings.autoPush = true; } persist(); }
A.vol.music = save.settings.music; A.vol.sfx = save.settings.sfx;
if (matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0) document.documentElement.classList.add('touch');
addEventListener('mousedown', e => { if (e.isTrusted && !document.documentElement.classList.contains('eg-pad')) document.documentElement.classList.remove('touch'); });
addEventListener('touchstart', e => { if (e.isTrusted) document.documentElement.classList.add('touch'); }, { passive: true });

const canvas = document.getElementById('cv');
const engine = createEngine(canvas);
const input = new Input();
const ui = new UI();
const game = new Game(engine, input, ui);
ui.bind(game);
input.bindTouch(document.getElementById('touch'));
window.CP = game;   // für Tests

let musicStarted = false;
const startMenuMusic = () => { A.initAudio(); if (!musicStarted && game.state === 'menu') { musicStarted = true; A.playMusic(3); } };
addEventListener('pointerdown', startMenuMusic, { once: true });
addEventListener('keydown', startMenuMusic, { once: true });

game.showcase(0).then(() => { ui.show('mMain', false); window.READY = 1; }).catch(e => { console.error(e); document.getElementById('ldTxt').textContent = 'Fehler beim Laden: ' + e.message; window.READY = 1; });
