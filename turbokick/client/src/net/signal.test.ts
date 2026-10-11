import { describe, expect, it } from 'vitest';
import { decodeSignal, encodeSignal, looksLikeDataSdp } from './signal';

const SDP = [
  'v=0',
  'o=- 4611731400430051336 2 IN IP4 127.0.0.1',
  's=-',
  't=0 0',
  'a=group:BUNDLE 0',
  'a=extmap-allow-mixed',
  'a=msid-semantic: WMS',
  'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
  'c=IN IP4 0.0.0.0',
  'a=candidate:1 1 udp 2113937151 3f2a1b2c-0000-4000-8000-aaaaaaaaaaaa.local 51234 typ host generation 0',
  'a=candidate:2 1 tcp 1518280447 192.168.1.5 9 typ host tcptype active generation 0',
  'a=ice-ufrag:abcd',
  'a=ice-pwd:0123456789abcdef0123456789',
  'a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99',
  'a=setup:actpass',
  'a=mid:0',
  'a=sctp-port:5000',
  'a=max-message-size:262144',
  '',
].join('\r\n');

describe('Verbindungs-Codes', () => {
  it('Hin- und Rückweg erhält die Beschreibung (ohne TCP-Kandidaten)', async () => {
    const code = await encodeSignal({ kind: 'offer', sdp: SDP });
    expect(code.startsWith('PV1.')).toBe(true);
    expect(code).toMatch(/^[A-Za-z0-9._-]+$/);
    const back = await decodeSignal(code, 'offer');
    expect(back.kind).toBe('offer');
    expect(back.sdp).toContain('a=ice-ufrag:abcd');
    expect(looksLikeDataSdp(back.sdp)).toBe(true);
    expect(back.sdp).not.toContain(' tcp ');
    expect(back.sdp).toContain('a=fingerprint:sha-256 AA:BB:CC');
    expect(back.sdp).toContain('a=setup:actpass');
    expect(back.sdp).toContain('typ host');
  });
  it('der Code ist deutlich kürzer als die Beschreibung', async () => {
    expect((await encodeSignal({ kind: 'answer', sdp: SDP })).length).toBeLessThan(SDP.length);
  });
  it('Leerzeichen und Zeilenumbrüche beim Kopieren stören nicht', async () => {
    const code = await encodeSignal({ kind: 'answer', sdp: SDP });
    const wrapped = code.replace(/(.{20})/g, '$1\n ');
    expect((await decodeSignal(wrapped, 'answer')).kind).toBe('answer');
  });
  it('verständliche Fehler bei falschen, abgeschnittenen oder vertauschten Codes', async () => {
    const code = await encodeSignal({ kind: 'offer', sdp: SDP });
    await expect(decodeSignal('hallo')).rejects.toThrow(/kein PARTYVERSE-Code/);
    await expect(decodeSignal(code.slice(0, code.length - 15))).rejects.toThrow(/unvollständig|ungültig/);
    await expect(decodeSignal(code, 'answer')).rejects.toThrow(/Einladungs-Code/);
    const ans = await encodeSignal({ kind: 'answer', sdp: SDP });
    await expect(decodeSignal(ans, 'offer')).rejects.toThrow(/Antwort-Code/);
    await expect(decodeSignal('PV1.' + 'A'.repeat(7000))).rejects.toThrow(/zu lang/);
  });
  it('lehnt Beschreibungen mit Medien oder Müll ab', () => {
    expect(looksLikeDataSdp(SDP)).toBe(true);
    expect(looksLikeDataSdp(SDP + 'm=video 9 UDP/TLS/RTP/SAVPF 96\r\n')).toBe(false);
    expect(looksLikeDataSdp('irgendwas')).toBe(false);
  });
  it('der Code ist klein genug für einen QR-Code', async () => {
    const code = await encodeSignal({ kind: 'offer', sdp: SDP });
    expect(code.length).toBeLessThan(400);
  });
  it('bösartige Felder werden abgelehnt (kein Einschleusen von SDP-Zeilen)', async () => {
    const evil = { k: 'o', u: 'abcd\r\nm=video 9 RTP/AVP 0', p: 'x', f: 'A'.repeat(64), r: 'a', c: [] };
    const raw = new TextEncoder().encode(JSON.stringify(evil));
    const cs = new CompressionStream('deflate-raw');
    const w = cs.writable.getWriter();
    void w.write(raw);
    void w.close();
    const buf = new Uint8Array(await new Response(cs.readable).arrayBuffer());
    let s = '';
    buf.forEach((b) => (s += String.fromCharCode(b)));
    const code = 'PV1.' + btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await expect(decodeSignal(code)).rejects.toThrow(/ungültigen Inhalt/);
  });
});
