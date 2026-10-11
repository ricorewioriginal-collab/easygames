import './style.css';

const params = new URLSearchParams(location.search);

/** Startet entweder ein Entwickler-Labor (?lab=, ?charlab=, ?worldlab=) oder das Spiel */
async function boot(): Promise<void> {
  const lab = params.get('lab');
  if (lab) {
    const { startLab } = await import('./dev/lab');
    startLab(lab, params);
    return;
  }
  if (params.get('charlab')) {
    const { startCharLab } = await import('./dev/charlab');
    startCharLab(params);
    return;
  }
  if (params.get('worldlab')) {
    const { startWorldLab } = await import('./dev/worldlab');
    startWorldLab(params);
    return;
  }
  const host = document.getElementById('app');
  if (!host) return;
  host.textContent = 'PARTYVERSE lädt …';
  try {
    const { App } = await import('./app/app');
    const app = new App(host);
    (window as unknown as { __app: unknown }).__app = app;
    await app.go('menu');
  } catch (e) {
    console.error(e);
    host.textContent = 'PARTYVERSE konnte nicht gestartet werden. Dein Browser unterstützt WebGL möglicherweise nicht – bitte aktualisiere ihn oder versuche einen anderen.';
  }
}
void boot();
