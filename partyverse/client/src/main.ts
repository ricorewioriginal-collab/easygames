import './style.css';

const params = new URLSearchParams(location.search);
const lab = params.get('lab');

async function boot(): Promise<void> {
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
  const el = document.getElementById('app');
  if (el) el.textContent = 'PARTYVERSE lädt …';
}
void boot();
