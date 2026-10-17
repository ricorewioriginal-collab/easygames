import './styles.css';
import { App } from './app';

const bar = document.querySelector<HTMLElement>('#boot .bar i');
const msg = document.querySelector<HTMLElement>('#boot small');
const progress = (p: number, text: string): void => {
  if (bar) bar.style.width = `${Math.round(p * 100)}%`;
  if (msg) msg.textContent = text;
};

let app: App | null = null;
const fail = (text: string): void => {
  if (app) app.fatal(text);
  else {
    document.getElementById('boot')?.remove();
    const d = document.createElement('div');
    d.id = 'err';
    d.innerHTML = '<div><h2>RicoLife 3D konnte nicht starten</h2><p></p><button class="btn" onclick="location.reload()">Neu laden</button></div>';
    d.querySelector('p')!.textContent = text;
    document.body.append(d);
  }
};
window.addEventListener('error', (e) => {
  console.error(e.error ?? e.message);
  if (!app) fail(String(e.message));
});
window.addEventListener('unhandledrejection', (e) => console.error(e.reason));

async function boot(): Promise<void> {
  try {
    app = new App();
    await app.start(progress);
    progress(1, 'Fertig!');
    document.getElementById('boot')?.remove();
  } catch (err) {
    console.error(err);
    app = null;
    fail(
      String(err).includes('WebGL')
        ? 'Dein Browser stellt kein WebGL bereit. Bitte aktiviere die Hardwarebeschleunigung oder nutze einen aktuellen Browser.'
        : `Fehler beim Start: ${String(err)}`,
    );
  }
  registerSW();
}

/** Eigener Service Worker (offline spielbar). Updates werden angeboten, nie ungefragt mitten im Spiel aktiviert. */
function registerSW(): void {
  const e2e = new URLSearchParams(location.search).has('e2e');
  let framed = false;
  try {
    framed = top !== self;
  } catch {
    framed = true;
  }
  if (!import.meta.env.PROD || e2e || framed || !('serviceWorker' in navigator)) return;
  if (/RicoReWiApp/.test(navigator.userAgent) || location.hostname === 'appassets.local') return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  let reload = false;
  let offered = false;
  navigator.serviceWorker
    .register('sw.js', { updateViaCache: 'none' })
    .then((r) => {
      const offer = (w: ServiceWorker | null): void => {
        if (offered || !w) return;
        offered = true;
        const d = document.createElement('div');
        d.id = 'egUpdate';
        d.setAttribute('role', 'status');
        d.className = 'update';
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = 'Jetzt aktualisieren';
        b.onclick = () => {
          reload = true;
          b.disabled = true;
          b.textContent = 'Lädt …';
          app?.saveNow();
          w.postMessage({ type: 'EG_SKIP_WAITING' });
        };
        d.append('✨ Ein Update ist bereit ', b);
        document.body.append(d);
      };
      if (r.waiting && navigator.serviceWorker.controller) offer(r.waiting);
      r.addEventListener('updatefound', () => {
        const w = r.installing;
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reload) location.reload();
      });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) void r.update().catch(() => undefined);
      });
    })
    .catch((e) => console.warn('Service Worker:', e));
}

void boot();
