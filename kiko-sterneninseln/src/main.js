import {Game} from './game.js?v=9';
try{window.kikoGame=new Game()}catch(e){console.error(e);document.querySelector('#screen').innerHTML='<section class="panel"><h1>Startfehler</h1><p>Das Spiel konnte nicht gestartet werden.</p><button onclick="location.reload()">Erneut versuchen</button></section>'}
