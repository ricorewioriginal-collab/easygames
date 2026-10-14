/* Einstiegspunkt: wartet auf die Grafik-Engine (index.html lädt sie mit echter Fortschrittsanzeige),
   lädt dann das Spiel nach und startet es. Fehler werden sichtbar angezeigt, mit „Nochmal versuchen“. */
import './styles/main.css';

declare global {
  interface Window { __boot?: { set(p: number, t?: string): void; fail(m: string): void; done(): void }; __threeReady?: Promise<void>; __started?: boolean; __bi2?: unknown }
}
const boot = window.__boot ?? { set: () => {}, fail: (m: string) => console.error(m), done: () => {} };

async function main(): Promise<void> {
  try { await window.__threeReady; } catch { return; }
  if (!(window as unknown as { THREE?: unknown }).THREE) { boot.fail('Grafik-Engine fehlt'); return; }
  window.__started = true;
  boot.set(57, 'Lade Spielwelt …');
  const app = await import('./app.ts');
  await app.start();
}
main().catch(e => { console.error(e); boot.fail(e instanceof Error ? e.message : String(e)); });
