/* Pride City – Einstieg */
import './ui/ui.css';
import { Game } from './game/Game';

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const game = new Game(canvas);
(window as unknown as { __pc: Game }).__pc = game;
game.run().catch((e) => {
  console.error(e);
  const b = document.getElementById('loading');
  if (b) b.querySelector('.st')!.textContent = 'Fehler beim Laden – bitte neu laden.';
});
