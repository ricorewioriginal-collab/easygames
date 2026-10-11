import jsQR from 'jsqr';
import qrcode from 'qrcode-generator';
import { t } from '../i18n';
import { btn, h } from './dom';

/** Zeichnet einen QR-Code (Fehlerkorrektur L, damit auch lange Codes groß genug bleiben) auf ein Canvas */
export function qrCanvas(text: string, px = 300): HTMLCanvasElement {
  const qr = qrcode(0, 'L');
  qr.addData(text, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 3;
  const cell = Math.max(2, Math.floor(px / (n + quiet * 2)));
  const size = cell * (n + quiet * 2);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  c.style.cssText = `width:${Math.min(px, size * 2)}px;height:${Math.min(px, size * 2)}px;max-width:100%;image-rendering:pixelated;background:#fff;border-radius:10px`;
  c.setAttribute('role', 'img');
  c.setAttribute('aria-label', t('qr.alt'));
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = '#fff';
    g.fillRect(0, 0, size, size);
    g.fillStyle = '#000';
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        if (qr.isDark(y, x)) g.fillRect((x + quiet) * cell, (y + quiet) * cell, cell, cell);
  }
  return c;
}

export const cameraSupported = (): boolean =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

interface Detector {
  detect(src: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
}

/**
 * Öffnet die Kamera und liest einen QR-Code. Ruft `onCode` mit dem Text auf (nur einmal) und räumt danach auf.
 * Gibt eine Funktion zum Abbrechen zurück. Fehler (z. B. Kamera verweigert) gehen an `onError` – es gibt immer den Weg über Text einfügen.
 */
export function startScanner(
  host: HTMLElement,
  onCode: (text: string) => void,
  onError: (msg: string) => void,
): () => void {
  const video = h('video', { class: 'scan-video', 'aria-label': t('qr.scan') });
  video.setAttribute('playsinline', 'true');
  video.muted = true;
  const stop = btn(t('qr.stop'), () => cancel(), 'ghost');
  const box = h('div', { class: 'scanbox' }, video, h('p', null, t('qr.hint')), stop);
  host.appendChild(box);
  let stream: MediaStream | null = null;
  let alive = true;
  let raf = 0;
  const cancel = (): void => {
    alive = false;
    cancelAnimationFrame(raf);
    stream?.getTracks().forEach((tr) => tr.stop());
    box.remove();
  };
  const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector })
    .BarcodeDetector;
  const detector = BD ? new BD({ formats: ['qr_code'] }) : null;
  const canvas = document.createElement('canvas');
  const g = canvas.getContext('2d', { willReadFrequently: true });
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false })
    .then(async (s) => {
      if (!alive) return void s.getTracks().forEach((tr) => tr.stop());
      stream = s;
      video.srcObject = s;
      await video.play().catch(() => undefined);
      let busy = false;
      let tick = 0;
      const loop = async (): Promise<void> => {
        if (!alive) return;
        raf = requestAnimationFrame(() => void loop());
        if (busy || video.readyState < 2 || ++tick % 3 !== 0) return;
        busy = true;
        try {
          let text = '';
          if (detector) text = (await detector.detect(video))[0]?.rawValue ?? '';
          if (!text && g) {
            const w = video.videoWidth;
            const hh = video.videoHeight;
            const k = Math.min(1, 900 / Math.max(w, hh));
            canvas.width = Math.round(w * k);
            canvas.height = Math.round(hh * k);
            g.drawImage(video, 0, 0, canvas.width, canvas.height);
            const img = g.getImageData(0, 0, canvas.width, canvas.height);
            text = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })?.data ?? '';
          }
          if (text && alive) {
            cancel();
            onCode(text);
          }
        } catch {
          /* einzelne Bilder dürfen fehlschlagen */
        }
        busy = false;
      };
      void loop();
    })
    .catch((e: unknown) => {
      cancel();
      onError(e instanceof DOMException && e.name === 'NotAllowedError' ? t('qr.denied') : t('qr.noCamera'));
    });
  return cancel;
}
