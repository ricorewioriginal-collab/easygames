// Online ohne eigenen Server: Ein Gerät eröffnet einen Raum und ist selbst der Server (dieselbe Lobby wie server/src,
// im Spiel-Worker), die anderen treten mit dem Raumcode bei. Den Verbindungsaufbau vermittelt Firebase über
// ../../cloud/fire-peer.js (wie bei allen easygames-Spielen, Rückfall PeerJS); gespielt wird direkt per WebRTC.
// Für OnlineClient sehen beide Seiten wie ein WebSocket aus (SockLike), Lobby, Gruppen und Matches laufen unverändert.
import { spawnWorker } from './local';
import type { SockLike } from './online';

interface PeerConn {
  open: boolean;
  bufferSize?: number;
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

export const P2P_PREFIX = 'riftzone-';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const normCode = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
export const isCode = (s: string): boolean => /^[A-HJ-NP-Z2-9]{5}$/.test(s);
const newCode = (): string => Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
const errType = (e: unknown): string => String((e as { type?: string } | undefined)?.type ?? '');

let libP: Promise<PeerCtor> | null = null;
/** fire-peer.js erst laden, wenn jemand ohne Server online spielt */
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
  return libP;
}

/** Verbindung im Stil eines WebSockets */
class Sock implements SockLike {
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string | ArrayBuffer }) => void) | null = null;
  onclose: ((ev: { code: number; reason: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(
    private readonly tx: (d: string | ArrayBuffer) => void,
    private readonly bye: () => void,
  ) {}
  opened(): void {
    if (this.readyState !== 0) return;
    this.readyState = 1;
    this.onopen?.();
  }
  deliver(d: string | ArrayBuffer): void {
    if (this.readyState === 1) this.onmessage?.({ data: d });
  }
  send(d: string | ArrayBuffer): void {
    if (this.readyState === 1) this.tx(d);
  }
  /** von außen beendet (Gegenseite weg, Fehler) */
  ended(code: number, reason: string): void {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.bye();
    this.onclose?.({ code, reason });
  }
  close(code = 1000, reason = ''): void {
    this.ended(code, reason);
  }
}

/** Gastgeber: Lobby im Worker, nimmt Verbindungen über Firebase/PeerJS und die eigene (lokale) an. */
export class P2PHost {
  code = '';
  onError: ((msg: string) => void) | null = null;
  private readonly worker: Worker;
  private peer: PeerLike | null = null;
  private next = 1;
  private readonly out = new Map<number, { send: (d: string | ArrayBuffer) => void; close: (code: number, reason: string) => void }>();
  private stopped = false;

  constructor(heights: Uint16Array | null) {
    this.worker = spawnWorker();
    this.worker.onmessage = (ev: MessageEvent) => {
      const m = ev.data as { type: string; id: number; data?: string | ArrayBuffer; code?: number; reason?: string };
      const o = this.out.get(m.id);
      if (!o) return;
      if (m.type === 'hsend' && m.data !== undefined) o.send(m.data);
      else if (m.type === 'hclose') o.close(m.code ?? 1000, m.reason ?? '');
    };
    this.worker.onerror = (e) => this.onError?.('Der Raum-Server ist abgestürzt: ' + (e.message || 'unbekannter Fehler'));
    const copy = heights ? heights.slice().buffer : null;
    // Ein Match gleichzeitig; Matchmaking (öffentlich) nach 20 s mit Bots, sonst wie der Server
    this.worker.postMessage({ type: 'host', heights: copy, cfg: { publicSize: 100, queueWait: 20, maxMatches: 1, snapshotEvery: 2, botSkill: 1, minHumans: 1 } }, copy ? [copy] : []);
  }

  /** Raum im Netz anmelden. Liefert den Code (bei belegtem Code ein neuer). */
  async listen(): Promise<string> {
    const P = await loadPeer();
    for (let i = 0; i < 6 && !this.stopped; i++) {
      const code = newCode();
      const peer = await new Promise<PeerLike | null>((res, rej) => {
        const p = new P(P2P_PREFIX + code);
        let done = false;
        const t = setTimeout(() => fin(() => rej(new Error('Zeitüberschreitung beim Vermittler'))), 15000);
        const fin = (f: () => void): void => {
          if (done) return;
          done = true;
          clearTimeout(t);
          f();
        };
        p.on('open', () => fin(() => res(p)));
        p.on('error', (e) => {
          if (done) return;
          try {
            p.destroy();
          } catch {
            /* egal */
          }
          fin(() => (errType(e) === 'unavailable-id' ? res(null) : rej(new Error('Vermittler nicht erreichbar'))));
        });
      });
      if (!peer) continue;
      if (this.stopped) {
        peer.destroy();
        break;
      }
      this.peer = peer;
      this.code = code;
      peer.on('connection', (c) => this.accept(c as PeerConn));
      return code;
    }
    throw new Error('Kein freier Raumcode');
  }

  private accept(c: PeerConn): void {
    const id = this.next++;
    let on = false;
    const gone = (): void => {
      if (!on) return;
      on = false;
      this.out.delete(id);
      this.worker.postMessage({ type: 'hgone', id });
    };
    c.on('open', () => {
      if (this.stopped) return c.close();
      on = true;
      this.out.set(id, {
        send: (d) => {
          // Überlastschutz wie auf dem Server: Zustandspakete fallen weg, wenn die Leitung voll ist
          if (!c.open || (typeof d !== 'string' && (c.bufferSize ?? 0) > 512 * 1024)) return;
          try {
            c.send(d);
          } catch {
            /* Kanal zu */
          }
        },
        close: () => {
          gone();
          try {
            c.close();
          } catch {
            /* egal */
          }
        },
      });
      this.worker.postMessage({ type: 'hopen', id });
    });
    c.on('data', (d) => {
      if (on && (typeof d === 'string' || d instanceof ArrayBuffer)) this.worker.postMessage({ type: 'hdata', id, data: d });
    });
    c.on('close', gone);
    c.on('error', gone);
  }

  /** Verbindung des Gastgebers selbst, ohne Netz */
  local(): SockLike {
    const id = this.next++;
    const s = new Sock(
      (d) => this.worker.postMessage({ type: 'hdata', id, data: d }),
      () => {
        if (this.out.delete(id)) this.worker.postMessage({ type: 'hgone', id });
      },
    );
    this.out.set(id, { send: (d) => s.deliver(d), close: (code, reason) => s.ended(code, reason) });
    setTimeout(() => {
      if (s.readyState !== 0) return;
      this.worker.postMessage({ type: 'hopen', id });
      s.opened();
    }, 0);
    return s;
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    try {
      this.peer?.destroy();
    } catch {
      /* egal */
    }
    for (const o of [...this.out.values()]) o.close(1001, 'Raum geschlossen');
    this.worker.postMessage({ type: 'leave' });
    setTimeout(() => this.worker.terminate(), 200);
  }
}

/** Gast: Verbindung zum Raum eines anderen Geräts */
export function guestSocket(code: string): SockLike {
  let peer: PeerLike | null = null,
    conn: PeerConn | null = null;
  const s = new Sock(
    (d) => {
      try {
        conn?.send(d);
      } catch {
        /* Kanal zu */
      }
    },
    () => {
      clearTimeout(t);
      try {
        conn?.close();
      } catch {
        /* egal */
      }
      try {
        peer?.destroy();
      } catch {
        /* egal */
      }
    },
  );
  const t = setTimeout(() => s.ended(1006, `Keine Antwort von Raum ${code}`), 25000);
  loadPeer().then(
    (P) => {
      if (s.readyState === 3) return;
      peer = new P();
      // Nur vor dem Verbinden zählt ein Fehler; danach trägt der direkte Kanal (Vermittler-Störungen sind egal)
      peer.on('error', (e) => s.readyState === 0 && s.ended(1006, errType(e) === 'peer-unavailable' ? `Raum ${code} nicht gefunden` : 'Verbindung nicht möglich'));
      peer.on('open', () => {
        if (s.readyState === 3 || !peer) return;
        const c = (conn = peer.connect(P2P_PREFIX + code, { reliable: true }));
        c.on('open', () => {
          clearTimeout(t);
          s.opened();
        });
        c.on('data', (d) => {
          if (typeof d === 'string' || d instanceof ArrayBuffer) s.deliver(d);
        });
        c.on('close', () => s.ended(1006, 'Verbindung zum Gastgeber getrennt'));
      });
    },
    () => s.ended(1006, 'Verbindungsdienst nicht ladbar (Internet?)'),
  );
  return s;
}
