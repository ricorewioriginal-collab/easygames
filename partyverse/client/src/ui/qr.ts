import qrcode from 'qrcode-generator';
import { t } from '../i18n';

/** Zeichnet einen QR-Code (Einladungslink) auf ein Canvas */
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
