// Offline-Modus: Match läuft in einem Web Worker (gleicher Code wie der Server).
import type { Cosmetics, MatchConfig } from '../../../shared/src/types';
import type { Transport } from './transport';

/** Startet den Spiel-Worker (Offline-Match oder Gastgeber ohne Server). Die URL steht nur hier, der esbuild-Build biegt sie um. */
export function spawnWorker(): Worker {
  return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
}

export class LocalTransport implements Transport {
  readonly online = false;
  onMessage: ((data: ArrayBuffer | string) => void) | null = null;
  onClose: ((reason: string) => void) | null = null;
  private worker: Worker;

  constructor(cfg: MatchConfig, name: string, cos: Cosmetics, heights: Uint16Array | null) {
    this.worker = spawnWorker();
    this.worker.onmessage = (ev: MessageEvent) => this.onMessage?.(ev.data as ArrayBuffer | string);
    this.worker.onerror = (e) => {
      console.error('Worker-Fehler', e);
      this.onClose?.('Der Offline-Server ist abgestürzt: ' + (e.message || 'unbekannter Fehler'));
    };
    const copy = heights ? heights.slice().buffer : null;
    this.worker.postMessage({ type: 'create', cfg, name, cos, heights: copy }, copy ? [copy] : []);
  }

  send(data: ArrayBuffer): void {
    this.worker.postMessage({ type: 'input', data }, [data]);
  }

  pause(p: boolean): void {
    this.worker.postMessage({ type: 'pause', paused: p });
  }

  leave(): void {
    this.worker.postMessage({ type: 'leave' });
    setTimeout(() => this.worker.terminate(), 200);
  }
}
