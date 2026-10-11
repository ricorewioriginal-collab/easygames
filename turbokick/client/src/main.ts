import './style.css';

const params = new URLSearchParams(location.search);

/** Startet entweder ein Entwickler-Labor (?lab=arena|actors|match) oder das Spiel */
async function boot(): Promise<void> {
  const lab = params.get('lab');
  if (lab === 'arena') {
    const { startArenaLab } = await import('./dev/arenalab');
    return startArenaLab(params);
  }
  if (lab === 'actors') {
    const { startActorsLab } = await import('./dev/actorslab');
    return startActorsLab(params);
  }
  const host = document.getElementById('app');
  if (!host) return;
  host.textContent = 'TURBOKICK lädt …';
  try {
    const { App } = await import('./app/app');
    const app = new App(host);
    (window as unknown as { __app: unknown }).__app = app;
    await app.go('menu');
  } catch (e) {
    console.error(e);
    host.textContent =
      'TURBOKICK konnte nicht gestartet werden. Dein Browser unterstützt WebGL möglicherweise nicht – bitte aktualisiere ihn oder versuche einen anderen.';
  }
}
void boot();
