// Entry point: boot screen, error handling, game start.
import { Game } from './game/game.js';

const bar = document.getElementById('bootbar'), txt = document.getElementById('boottext'), boot = document.getElementById('boot');
const progress = (p, t) => { bar.style.width = Math.round(p * 100) + '%'; if (t) txt.textContent = t; };
const TIPS = ['Tipp: Typen zählen! Wasser löscht Feuer, Pflanze wurzelt im Wasser, Feuer verbrennt Pflanzen.', 'Tipp: Im hohen Gras raschelt es – dort warten wilde Taschis.', 'Tipp: Mit Google-Anmeldung im Titelmenü folgt dir dein Spielstand auf jedes Gerät.', 'Tipp: Scheue Taschis fliehen, angriffslustige stürmen auf dich zu.', 'Tipp: Rätselhinweise stehen immer in der Welt – schau dir Säulen und Wandbilder genau an.'];
document.getElementById('boottip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];

async function start() {
  try {
    progress(0.05, 'Spiel wird gestartet …');
    const game = new Game(document.getElementById('ui'), document.getElementById('game'));
    await game.boot(progress);
    boot.classList.add('fade');
    setTimeout(() => boot.remove(), 700);
  } catch (e) {
    console.error('TASCHI boot failed', e);
    txt.textContent = 'Das Spiel konnte nicht starten: ' + (e?.message || e) + ' – bitte Seite neu laden. Falls das Problem bleibt, unterstützt dein Browser vermutlich kein WebGL.';
    bar.style.background = '#e05a4a';
    window.__error = String(e?.message || e);
  }
}
start();
