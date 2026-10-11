/**
 * Verbindungs-Codes für den Online-Modus ohne Server: Eine WebRTC-Beschreibung (Angebot/Antwort) wird verkleinert,
 * komprimiert und als Text kodiert. Dieser Text wird als QR-Code gezeigt/gescannt oder per Chat kopiert.
 */
export type SignalKind = 'offer' | 'answer';
export interface Signal {
  kind: SignalKind;
  sdp: string;
}

const PREFIX = 'PV1';
const MAX_CODE = 6000;

const toB64Url = (bytes: Uint8Array): string => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64Url = (t: string): Uint8Array => {
  const s = atob(t.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
};

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const w = stream.writable.getWriter();
  void w.write(data as unknown as BufferSource).catch(() => undefined);
  void w.close().catch(() => undefined);
  const chunks: Uint8Array[] = [];
  const r = stream.readable.getReader();
  let total = 0;
  for (;;) {
    const { value, done } = await r.read();
    if (done) break;
    chunks.push(value as Uint8Array);
    total += (value as Uint8Array).length;
    if (total > 64 * 1024) throw new Error('Code zu groß');
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

interface Compact {
  /** o = Angebot, a = Antwort */
  k: 'o' | 'a';
  u: string;
  p: string;
  /** Fingerabdruck (sha-256, Hex ohne Doppelpunkte) */
  f: string;
  /** DTLS-Rolle: a = actpass, c = active, p = passive */
  r: 'a' | 'c' | 'p';
  /** Kandidaten: [Fundament, Priorität, Adresse, Port, Typ, rAdresse?, rPort?] */
  c: Array<[string, number, string, number, string, string?, number?]>;
}

const ROLE: Record<string, Compact['r']> = { actpass: 'a', active: 'c', passive: 'p' };
const ROLE_BACK: Record<Compact['r'], string> = { a: 'actpass', c: 'active', p: 'passive' };
const TOKEN = /^[A-Za-z0-9+/=:._-]{1,200}$/;

/** Zieht aus einer Daten-Kanal-Beschreibung nur das Nötige heraus (Zugangsdaten, Fingerabdruck, UDP-Kandidaten) */
export function compactSdp(kind: SignalKind, sdp: string): Compact {
  const lines = sdp.split(/\r?\n/);
  const get = (re: RegExp): string => {
    for (const l of lines) {
      const m = re.exec(l);
      if (m) return m[1] as string;
    }
    throw new Error(
      'Die Verbindungsbeschreibung ist unvollständig (dein Browser wird möglicherweise nicht unterstützt).',
    );
  };
  const fp = get(/^a=fingerprint:sha-256 ([0-9A-Fa-f:]+)$/);
  const c: Compact['c'] = [];
  for (const l of lines) {
    const m =
      /^a=candidate:(\S+) 1 udp (\d+) (\S+) (\d+) typ (host|srflx|prflx|relay)(?: raddr (\S+) rport (\d+))?/.exec(
        l,
      );
    if (m)
      c.push([
        m[1] as string,
        Number(m[2]),
        m[3] as string,
        Number(m[4]),
        m[5] as string,
        ...(m[6] ? [m[6], Number(m[7])] : []),
      ] as Compact['c'][number]);
  }
  const role = ROLE[get(/^a=setup:(\w+)$/)];
  if (!role)
    throw new Error(
      'Die Verbindungsbeschreibung ist unvollständig (dein Browser wird möglicherweise nicht unterstützt).',
    );
  return {
    k: kind === 'offer' ? 'o' : 'a',
    u: get(/^a=ice-ufrag:(\S+)$/),
    p: get(/^a=ice-pwd:(\S+)$/),
    f: fp.replace(/:/g, '').toUpperCase(),
    r: role,
    c,
  };
}

/** Baut aus den Eckdaten wieder eine vollständige Beschreibung. Prüft jedes Feld streng (der Code kommt von Fremden!). */
export function expandSdp(c: Compact): string {
  if (
    !TOKEN.test(c.u) ||
    !TOKEN.test(c.p) ||
    !/^[0-9A-F]{64}$/.test(c.f) ||
    !(c.r in ROLE_BACK) ||
    !Array.isArray(c.c) ||
    c.c.length > 12
  )
    throw new Error('bad');
  const fp = c.f.match(/../g)?.join(':') ?? '';
  const out = [
    'v=0',
    'o=- 4611731400430051336 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0',
    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
    'c=IN IP4 0.0.0.0',
    `a=ice-ufrag:${c.u}`,
    `a=ice-pwd:${c.p}`,
    `a=fingerprint:sha-256 ${fp}`,
    `a=setup:${ROLE_BACK[c.r]}`,
    'a=mid:0',
    'a=sctp-port:5000',
    'a=max-message-size:262144',
  ];
  for (const k of c.c) {
    const [f, prio, addr, port, typ, raddr, rport] = k;
    if (
      !TOKEN.test(String(f)) ||
      !Number.isInteger(prio) ||
      !TOKEN.test(String(addr)) ||
      !Number.isInteger(port) ||
      port < 0 ||
      port > 65535 ||
      !['host', 'srflx', 'prflx', 'relay'].includes(String(typ))
    )
      throw new Error('bad');
    let line = `a=candidate:${f} 1 udp ${prio} ${addr} ${port} typ ${typ}`;
    if (raddr !== undefined) {
      if (!TOKEN.test(String(raddr)) || !Number.isInteger(rport)) throw new Error('bad');
      line += ` raddr ${raddr} rport ${rport}`;
    }
    out.push(line + ' generation 0');
  }
  out.push('a=end-of-candidates');
  return out.join('\r\n') + '\r\n';
}

/** Prüft grob, ob eine Beschreibung nur das enthält, was für einen Daten-Kanal nötig ist (keine Medien) */
export function looksLikeDataSdp(sdp: string): boolean {
  if (!/^v=0/m.test(sdp) || sdp.length > 20000) return false;
  const media = sdp.match(/^m=.*$/gm) ?? [];
  return media.length === 1 && /^m=application .* (webrtc-datachannel|DTLS\/SCTP)/.test(media[0] as string);
}

export async function encodeSignal(sig: Signal): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(compactSdp(sig.kind, sig.sdp)));
  const packed = await pipe(raw, new CompressionStream('deflate-raw'));
  return `${PREFIX}.${toB64Url(packed)}`;
}

/** Liest einen Code. Wirft einen verständlichen Fehler bei Tippfehlern, abgeschnittenem Text oder falschem Inhalt. */
export async function decodeSignal(code: string, expect?: SignalKind): Promise<Signal> {
  const text = code.replace(/\s+/g, '');
  if (!text.startsWith(PREFIX + '.')) throw new Error('Das ist kein PARTYVERSE-Code.');
  if (text.length > MAX_CODE) throw new Error('Der Code ist zu lang.');
  let obj: Compact;
  try {
    const bytes = await pipe(
      fromB64Url(text.slice(PREFIX.length + 1)),
      new DecompressionStream('deflate-raw'),
    );
    obj = JSON.parse(new TextDecoder().decode(bytes)) as Compact;
  } catch {
    throw new Error('Der Code ist unvollständig oder beschädigt. Bitte noch einmal kopieren oder scannen.');
  }
  if (!obj || (obj.k !== 'o' && obj.k !== 'a')) throw new Error('Der Code hat einen ungültigen Inhalt.');
  const kind: SignalKind = obj.k === 'o' ? 'offer' : 'answer';
  if (expect && kind !== expect)
    throw new Error(
      expect === 'offer'
        ? 'Das ist ein Antwort-Code. Hier wird der Einladungs-Code des Gastgebers gebraucht.'
        : 'Das ist ein Einladungs-Code. Hier wird der Antwort-Code des Mitspielers gebraucht.',
    );
  let sdp: string;
  try {
    sdp = expandSdp(obj);
  } catch {
    throw new Error('Der Code hat einen ungültigen Inhalt.');
  }
  return { kind, sdp };
}
