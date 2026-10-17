/**
 * Online mit Freunden über Firebase (wie alle easygames-Spiele): ../../cloud/fire-peer.js stellt eine PeerJS-kompatible
 * Klasse bereit. Firebase vermittelt nur den Verbindungsaufbau (Raumcode → Gastgeber), gespielt wird direkt Gerät zu Gerät
 * per WebRTC (mit STUN/TURN). Fällt Firebase aus, nimmt fire-peer.js automatisch PeerJS.
 * Der Gastgeber öffnet einen Raum mit 5-stelligem Code, Mitspieler treten per Code oder Einladungslink bei.
 */

export type LinkState = 'connecting' | 'open' | 'closed';

/** Ein Datenkanal zu einem Mitspieler (JSON-Nachrichten) */
export interface Link {
  readonly state: LinkState;
  onMessage(cb: (m: unknown) => void): void;
  onClose(cb: () => void): void;
  send(m: unknown): void;
  close(): void;
}

interface PeerConn {
  open: boolean;
  on(ev: string, fn: (x?: unknown) => void): unknown;
  send(d: unknown): void;
  close(): void;
}
interface PeerLike {
  on(ev: string, fn: (x?: unknown) => void): unknown;
  connect(id: string, opt?: Record<string, unknown>): PeerConn;
  destroy(): void;
}
type PeerCtor = (new (id?: string) => PeerLike) & { isFirePeer?: boolean };

export const P2P_PREFIX = 'partyverse-';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const normCode = (s: string): string =>
  s
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5);
export const isCode = (s: string): boolean => /^[A-HJ-NP-Z2-9]{5}$/.test(s);
const newCode = (): string =>
  Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
const errType = (e: unknown): string => String((e as { type?: string } | undefined)?.type ?? '');

export const p2pSupported = (): boolean => typeof RTCPeerConnection !== 'undefined';

let libP: Promise<PeerCtor> | null = null;
/** fire-peer.js erst laden, wenn jemand online spielt */
export function loadPeer(): Promise<PeerCtor> {
  const w = window as unknown as { Peer?: PeerCtor };
  if (w.Peer?.isFirePeer) return Promise.resolve(w.Peer);
  libP ??= new Promise<PeerCtor>((res, rej) => {
    const s = document.createElement('script');
    s.src = new URL('../../cloud/fire-peer.js', document.baseURI).href;
    s.onload = () => (w.Peer ? res(w.Peer) : rej(new Error('lib')));
    s.onerror = () => {
      libP = null;
      rej(new Error('lib'));
    };
    document.head.appendChild(s);
  });
  return libP.catch(() => {
    throw new Error('Die Online-Verbindung konnte nicht geladen werden. Bist du mit dem Internet verbunden?');
  });
}

const HOME = 'https://ricorewioriginal-collab.github.io/easygames/';
/** Einladungslink – Mehrspieler-Regel (easygames CLAUDE.md): immer über die easygames-Homepage, nie die lokale App-Adresse */
export function inviteLink(code: string): string {
  const u = new URL('./', location.href).href + '?room=' + code;
  const L = (window as unknown as { EasyGamesLink?: { share(u: string): string } }).EasyGamesLink;
  if (L) return L.share(u);
  return u.startsWith(HOME) ? u : u.replace(/^[a-z]+:\/\/[^?#]*?\/easygames\//i, HOME);
}

/** Datenkanal über eine PeerJS-/fire-peer-Verbindung */
class PeerLink implements Link {
  state: LinkState = 'connecting';
  private msgCbs: Array<(m: unknown) => void> = [];
  private closeCbs: Array<() => void> = [];

  constructor(
    private readonly conn: PeerConn,
    private readonly onEnd?: () => void,
  ) {
    if (conn.open) this.state = 'open';
    conn.on('open', () => {
      if (this.state === 'connecting') this.state = 'open';
    });
    conn.on('data', (d) => {
      let m: unknown = d;
      if (typeof d === 'string') {
        if (d.length > 400_000) return;
        try {
          m = JSON.parse(d);
        } catch {
          return;
        }
      }
      for (const c of this.msgCbs) c(m);
    });
    conn.on('close', () => this.markClosed());
    conn.on('error', () => this.markClosed());
  }

  private markClosed(): void {
    if (this.state === 'closed') return;
    this.state = 'closed';
    for (const c of this.closeCbs) c();
    this.onEnd?.();
  }
  onMessage(cb: (m: unknown) => void): void {
    this.msgCbs.push(cb);
  }
  onClose(cb: () => void): void {
    this.closeCbs.push(cb);
  }
  send(m: unknown): void {
    if (this.state !== 'open') return;
    try {
      this.conn.send(m);
    } catch {
      /* Kanal gerade geschlossen */
    }
  }
  close(): void {
    try {
      this.conn.close();
    } catch {
      /* ignorieren */
    }
    this.markClosed();
  }
}

export interface HostNet {
  /** 5-stelliger Raumcode */
  code: string;
  /** Neuer Mitspieler verbunden */
  onLink(cb: (l: Link) => void): void;
  /** Keine neuen Mitspieler mehr annehmen (Raumcode freigeben, Firebase nicht mehr abfragen); bestehende Verbindungen bleiben */
  stopListening(): void;
  close(): void;
}

/** Gastgeber: belegt einen freien Raumcode und nimmt Verbindungen an */
export async function openRoom(): Promise<HostNet> {
  const Peer = await loadPeer();
  const cbs: Array<(l: Link) => void> = [];
  for (let tries = 0; tries < 5; tries++) {
    const code = newCode();
    const peer = new Peer(P2P_PREFIX + code);
    const ok = await new Promise<boolean>((res, rej) => {
      const t = setTimeout(
        () => rej(new Error('Der Raum konnte nicht eröffnet werden (Zeit abgelaufen).')),
        20000,
      );
      peer.on('open', () => {
        clearTimeout(t);
        res(true);
      });
      peer.on('error', (e) => {
        clearTimeout(t);
        if (errType(e) === 'unavailable-id') res(false);
        else rej(new Error('Der Raum konnte nicht eröffnet werden. Bist du mit dem Internet verbunden?'));
      });
    }).catch((e: Error) => {
      peer.destroy();
      throw e;
    });
    if (!ok) {
      peer.destroy();
      continue;
    }
    peer.on('connection', (c) => {
      const conn = c as PeerConn;
      const go = (): void => {
        const l = new PeerLink(conn);
        for (const cb of cbs) cb(l);
      };
      if (conn.open) go();
      else conn.on('open', go);
    });
    return {
      code,
      onLink: (cb) => void cbs.push(cb),
      stopListening: () => (peer as PeerLike & { disconnect?: () => void }).disconnect?.(),
      close: () => peer.destroy(),
    };
  }
  throw new Error('Kein freier Raumcode gefunden. Bitte erneut versuchen.');
}

/** Mitspieler: verbindet sich mit dem Raum des Gastgebers */
export async function joinRoom(code: string): Promise<Link> {
  const Peer = await loadPeer();
  const peer = new Peer();
  return new Promise<Link>((res, rej) => {
    let done = false;
    const fail = (msg: string): void => {
      if (done) return;
      done = true;
      clearTimeout(t);
      peer.destroy();
      rej(new Error(msg));
    };
    const t = setTimeout(
      () => fail('Der Raum antwortet nicht. Stimmt der Code und ist der Gastgeber noch im Raum?'),
      25000,
    );
    peer.on('error', (e) =>
      fail(
        errType(e) === 'peer-unavailable'
          ? 'Diesen Raum gibt es nicht (mehr). Prüfe den Code.'
          : 'Keine Verbindung zum Raum. Bist du mit dem Internet verbunden?',
      ),
    );
    peer.on('open', () => {
      const conn = peer.connect(P2P_PREFIX + code, { reliable: true, serialization: 'json' });
      conn.on('open', () => {
        if (done) return;
        done = true;
        clearTimeout(t);
        res(new PeerLink(conn, () => peer.destroy()));
      });
      conn.on('error', () => fail('Die Verbindung zum Raum ist fehlgeschlagen. Bitte erneut versuchen.'));
    });
  });
}
