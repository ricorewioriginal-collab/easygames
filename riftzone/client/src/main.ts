// Einstieg: Insel laden (vorberechnete Höhenkarte oder Berechnung), Renderer prüfen, Startbildschirm zeigen.
import './ui/styles.css';
import { Terrain, decodeHeights, setTerrain } from '../../shared/src/terrain';
import { App } from './app';
import { Renderer3D } from './render/renderer';
import { ColorMap } from './render/terrain';
import { h } from './core/dom';

const bootFill = document.getElementById('bootFill') as HTMLElement | null;
const bootMsg = document.getElementById('bootMsg') as HTMLElement | null;
const step = (pct: number, msg: string): Promise<void> => {
  if (bootFill) bootFill.style.width = `${pct}%`;
  if (bootMsg) bootMsg.textContent = msg;
  return new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
};

function fatal(msg: string): void {
  const boot = document.getElementById('boot');
  if (boot) boot.style.display = 'none';
  const ui = document.getElementById('ui')!;
  ui.replaceChildren(
    h(
      'div',
      { class: 'screen solid loading' },
      h('div', { class: 'logo' }, 'RIFT', h('span', null, 'ZONE')),
      h('h2', null, 'Start nicht möglich'),
      h('p', { class: 'muted', style: 'max-width:520px' }, msg),
      h('button', { class: 'btn', onclick: () => location.reload() }, 'Neu laden'),
    ),
  );
}

async function loadHeights(): Promise<Uint16Array | null> {
  try {
    const res = await fetch(new URL('heightmap.bin', document.baseURI).href);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength % 2 !== 0) return null;
    return new Uint16Array(buf);
  } catch {
    return null;
  }
}

async function boot(): Promise<void> {
  await step(8, 'Lade Insel …');
  let heights = await loadHeights();
  await step(30, 'Forme Gelände …');
  let terrain: Terrain;
  if (heights) {
    terrain = new Terrain(decodeHeights(heights));
    if (terrain.h.length !== heights.length) heights = null;
  } else {
    terrain = new Terrain();
  }
  setTerrain(terrain);
  await step(55, 'Färbe Landschaft …');
  const colors = new ColorMap(terrain);
  await step(80, 'Starte Grafik …');
  let renderer: Renderer3D;
  try {
    renderer = new Renderer3D(document.getElementById('game')!);
  } catch (e) {
    fatal(`${(e as Error).message} Bitte einen aktuellen Browser (Chrome, Firefox, Safari, Edge) verwenden oder die Hardwarebeschleunigung einschalten.`);
    return;
  }
  await step(100, 'Bereit');
  const app = new App(renderer, colors, heights);
  (window as unknown as { riftzone: App }).riftzone = app;
  const bootEl = document.getElementById('boot');
  if (bootEl) {
    bootEl.style.opacity = '0';
    setTimeout(() => bootEl.remove(), 500);
  }
  app.showTitle();
}

window.addEventListener('error', (e) => console.error('Fehler:', e.message));
window.addEventListener('unhandledrejection', (e) => console.error('Fehler:', e.reason));
boot().catch((e) => fatal(String((e as Error)?.message ?? e)));
