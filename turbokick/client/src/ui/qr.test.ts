import jsQR from 'jsqr';
import qrcode from 'qrcode-generator';
import { describe, expect, it } from 'vitest';
import { encodeSignal } from '../net/signal';

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
  it('ein echter Einladungs-Code überlebt Zeichnen und Lesen', async () => {
    const sdp = [
      'v=0',
      'o=- 1 2 IN IP4 127.0.0.1',
      's=-',
      't=0 0',
      'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
      'c=IN IP4 0.0.0.0',
      'a=candidate:1 1 udp 2113937151 3f2a1b2c-0000-4000-8000-aaaaaaaaaaaa.local 51234 typ host generation 0',
      'a=candidate:2 1 udp 1677729535 203.0.113.9 40000 typ srflx raddr 0.0.0.0 rport 0 generation 0',
      'a=ice-ufrag:abcd',
      'a=ice-pwd:0123456789abcdef01234567',
      'a=fingerprint:sha-256 ' + 'AB:'.repeat(31) + 'AB',
      'a=setup:actpass',
      '',
    ].join('\r\n');
    const code = await encodeSignal({ kind: 'offer', sdp });
    expect(code.length).toBeLessThan(700);
    expect(roundTrip(code)).toBe(code);
  });
  it('auch lange Texte (bis 1200 Zeichen) bleiben lesbar', () => {
    const text = 'PV1.' + 'abcDEF0123-_'.repeat(100);
    expect(roundTrip(text)).toBe(text);
  });
});
