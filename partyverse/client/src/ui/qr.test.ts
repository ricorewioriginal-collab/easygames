import jsQR from 'jsqr';
import qrcode from 'qrcode-generator';
import { describe, expect, it } from 'vitest';

/** Zeichnet dieselbe Matrix wie qrCanvas() in ein Pixelfeld und liest sie mit dem Kamera-Leser (jsQR) wieder aus */
function roundTrip(text: string, cell = 4): string | null {
  const qr = qrcode(0, 'L');
  qr.addData(text, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 3;
  const size = (n + quiet * 2) * cell;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (qr.isDark(y, x))
        for (let dy = 0; dy < cell; dy++)
          for (let dx = 0; dx < cell; dx++) {
            const i = (((y + quiet) * cell + dy) * size + (x + quiet) * cell + dx) * 4;
            data[i] = data[i + 1] = data[i + 2] = 0;
          }
  return jsQR(data, size, size)?.data ?? null;
}

describe('QR-Codes', () => {
  it('ein Einladungslink überlebt Zeichnen und Lesen', () => {
    const url = 'https://ricorewioriginal-collab.github.io/easygames/partyverse/app/?room=AB2CD';
    expect(roundTrip(url)).toBe(url);
  });
});
