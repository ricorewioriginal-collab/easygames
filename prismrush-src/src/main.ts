import './styles.css';
import { App } from './app';
import { SaveStore, memoryKV, type KV } from './core/storage';
import { qs } from './core/dom';

function storage(): KV {
  try {
    const ls = window.localStorage;
    const probe = '__prismrush_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return memoryKV();
  }
}

function boot(): void {
  const params = new URLSearchParams(location.search);
  const e2e = params.has('e2e');
  const canvas = qs<HTMLCanvasElement>('#scene');
  let app: App;
  try {
    app = new App(new SaveStore(storage()), {
      canvas,
      ui: qs('#ui'),
      hudHost: qs('#hud-host'),
      surface: qs('#app'),
    });
  } catch (err) {
    console.error(err);
    qs('#ui').innerHTML =
      '<section class="panel"><h2>WebGL nicht verfügbar</h2><p>PRISMRUSH benötigt einen Browser mit WebGL-Unterstützung. Bitte aktiviere die Hardwarebeschleunigung oder nutze einen aktuellen Browser.</p></section>';
    return;
  }
  if (e2e) {
    (window as unknown as { __PRISMRUSH__: ReturnType<App['testApi']> }).__PRISMRUSH__ =
      app.testApi();
  }
  if (import.meta.env.PROD && !e2e && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .catch((e) => console.warn('Service Worker:', e));
    });
  }
}

boot();
