import './styles.css';
import { App } from './app';

const w = window as unknown as { RBApp?: App };
try {
  w.RBApp = new App();
} catch (e) {
  const el = document.getElementById('loadTip');
  if (el) el.textContent = 'Dein Gerät kann leider kein 3D (WebGL). Bitte einen aktuellen Browser verwenden.';
  console.error(e);
}
