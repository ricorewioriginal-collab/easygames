/* PWA: eigener Service Worker mit eigenem Bereich (./), Update-Hinweis mit kontrollierter Übernahme. */
import { btn, h, uiRoot } from './ui/dom.ts';

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:' || /[?&](test|nosw)=1/.test(location.search)) return;
  navigator.serviceWorker.register('./sw.js', { scope: './' }).then(reg => {
    const offer = (w: ServiceWorker) => {
      if (document.querySelector('.update-bar')) return;
      const bar = h('div', { class: 'update-bar panel' }, h('span', null, '✨ Eine neue Version von Bunte Insel 2 ist da!'),
        btn('Jetzt aktualisieren', () => { w.postMessage({ type: 'SKIP_WAITING' }); bar.remove(); }, 'green small'),
        btn('Später', () => bar.remove(), 'ghost small'));
      uiRoot().append(bar);
    };
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); });
    });
    setInterval(() => { reg.update().catch(() => {}); }, 30 * 60 * 1000);
  }).catch(e => console.warn('[BI2] Service Worker nicht aktiv:', e));
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return; reloading = true;
    const g = (window as unknown as { __bi2game?: { persist(): void } }).__bi2game;
    try { g?.persist(); } catch { /* egal */ }
    location.reload();
  });
}
