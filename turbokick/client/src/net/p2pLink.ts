import { decodeSignal, encodeSignal } from './signal';

/** Öffentlicher STUN-Server, damit Verbindungen auch über verschiedene Netze (Handy-Daten ↔ WLAN) gelingen. Er sieht nur Verbindungsdaten, keine Spielinhalte. */
export const STUN_SERVERS = ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'];

export type LinkState = 'connecting' | 'open' | 'closed';

/** Ein Datenkanal zu einem Mitspieler (JSON-Nachrichten) mit Verbindungsüberwachung */
export class Link {
  state: LinkState = 'connecting';
  private msgCbs: Array<(m: unknown) => void> = [];
  private fastCbs: Array<(d: string | ArrayBuffer) => void> = [];
  private closeCbs: Array<() => void> = [];
  private fast: RTCDataChannel | null = null;

  constructor(
    private readonly pc: RTCPeerConnection,
    private readonly dc: RTCDataChannel,
    fast: RTCDataChannel | null = null,
  ) {
    dc.binaryType = 'arraybuffer';
    if (fast) this.attachFast(fast);
    dc.onmessage = (e) => {
      if (typeof e.data !== 'string') {
        for (const c of this.fastCbs) c(e.data as ArrayBuffer);
        return;
      }
      if (e.data.length > 400_000) return;
      let m: unknown;
      try {
        m = JSON.parse(e.data);
      } catch {
        return;
      }
      for (const c of this.msgCbs) c(m);
    };
    dc.onclose = () => this.markClosed();
    dc.onerror = () => this.markClosed();
    pc.addEventListener('connectionstatechange', () => {
      if (
        pc.connectionState === 'failed' ||
        pc.connectionState === 'closed' ||
        pc.connectionState === 'disconnected'
      )
        this.disconnectedSoon();
    });
    if (dc.readyState === 'open') this.state = 'open';
  }

  private timer: ReturnType<typeof setTimeout> | null = null;
  /** „disconnected" kann sich von selbst erholen – erst nach einer Gnadenfrist als getrennt behandeln */
  private disconnectedSoon(): void {
    if (this.pc.connectionState === 'disconnected') {
      if (this.timer) return;
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.pc.connectionState !== 'connected') this.markClosed();
      }, 6000);
    } else this.markClosed();
  }

  private markClosed(): void {
    if (this.state === 'closed') return;
    this.state = 'closed';
    if (this.timer) clearTimeout(this.timer);
    for (const c of this.closeCbs) c();
  }

  /** Schneller, unzuverlässiger Kanal (Eingaben, Zustandsbilder): neueste Daten zählen, verlorene Pakete stören nicht */
  attachFast(ch: RTCDataChannel): void {
    ch.binaryType = 'arraybuffer';
    ch.onmessage = (e) => {
      const d = e.data as string | ArrayBuffer;
      if (typeof d === 'string' ? d.length > 100_000 : d.byteLength > 100_000) return;
      for (const c of this.fastCbs) c(d);
    };
    this.fast = ch;
  }
  onFast(cb: (d: string | ArrayBuffer) => void): void {
    this.fastCbs.push(cb);
  }
  /** Schickt über den schnellen Kanal (Rückfall: zuverlässiger Kanal) */
  sendFast(data: string | Uint8Array): void {
    if (this.state !== 'open') return;
    const ch = this.fast && this.fast.readyState === 'open' ? this.fast : this.dc;
    if (ch.readyState !== 'open') return;
    try {
      ch.send(data as unknown as string);
    } catch {
      /* Kanal gerade geschlossen */
    }
  }
  onMessage(cb: (m: unknown) => void): void {
    this.msgCbs.push(cb);
  }
  onClose(cb: () => void): void {
    this.closeCbs.push(cb);
  }
  send(m: unknown): void {
    if (this.state !== 'open' || this.dc.readyState !== 'open') return;
    try {
      this.dc.send(JSON.stringify(m));
    } catch {
      /* Kanal gerade geschlossen */
    }
  }
  close(): void {
    try {
      this.dc.close();
      this.pc.close();
    } catch {
      /* ignorieren */
    }
    this.markClosed();
  }
}

function newPc(useStun: boolean): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: useStun ? [{ urls: STUN_SERVERS }] : [],
    iceCandidatePoolSize: 0,
  });
}

/** Wartet, bis alle Verbindungswege gesammelt sind (oder die Zeit abläuft) – es gibt kein „Nachreichen", der Code muss vollständig sein. */
function iceComplete(pc: RTCPeerConnection, ms = 5000): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') return resolve();
    const done = (): void => {
      clearTimeout(t);
      pc.removeEventListener('icegatheringstatechange', on);
      resolve();
    };
    const on = (): void => {
      if (pc.iceGatheringState === 'complete') done();
    };
    const t = setTimeout(done, ms);
    pc.addEventListener('icegatheringstatechange', on);
  });
}

export const p2pSupported = (): boolean =>
  typeof RTCPeerConnection !== 'undefined' && typeof CompressionStream !== 'undefined';

export interface Invite {
  /** Einladungs-Code (als Text und als QR-Code zeigen) */
  code: string;
  /** Nimmt den Antwort-Code des Mitspielers entgegen und wartet, bis der Kanal offen ist */
  accept(answerCode: string): Promise<Link>;
  cancel(): void;
}

/** Gastgeber: erzeugt einen Einladungs-Code für genau einen Mitspieler */
export async function createInvite(useStun: boolean): Promise<Invite> {
  const pc = newPc(useStun);
  const dc = pc.createDataChannel('rel', { ordered: true });
  const fast = pc.createDataChannel('fast', { ordered: false, maxRetransmits: 0 });
  await pc.setLocalDescription(await pc.createOffer());
  await iceComplete(pc);
  const desc = pc.localDescription;
  if (!desc) throw new Error('Die Verbindung konnte nicht vorbereitet werden.');
  const code = await encodeSignal({ kind: 'offer', sdp: desc.sdp });
  return {
    code,
    async accept(answerCode: string): Promise<Link> {
      const ans = await decodeSignal(answerCode, 'answer');
      await pc.setRemoteDescription({ type: 'answer', sdp: ans.sdp });
      await new Promise<void>((resolve, reject) => {
        if (dc.readyState === 'open') return resolve();
        const t = setTimeout(
          () =>
            reject(
              new Error(
                'Die Verbindung kam nicht zustande. Sind beide im selben WLAN oder ist ein Netz sehr streng? Versuche es erneut.',
              ),
            ),
          25000,
        );
        dc.addEventListener('open', () => {
          clearTimeout(t);
          resolve();
        });
        pc.addEventListener('connectionstatechange', () => {
          if (pc.connectionState === 'failed') {
            clearTimeout(t);
            reject(new Error('Die Verbindung ist fehlgeschlagen. Versuche es erneut.'));
          }
        });
      });
      return new Link(pc, dc, fast);
    },
    cancel: () => {
      try {
        dc.close();
        pc.close();
      } catch {
        /* ignorieren */
      }
    },
  };
}

export interface Reply {
  /** Antwort-Code (dem Gastgeber zeigen) */
  code: string;
  /** Wird erfüllt, sobald der Gastgeber die Antwort eingegeben hat und der Kanal offen ist */
  opened: Promise<Link>;
  cancel(): void;
}

/** Gast: nimmt den Einladungs-Code des Gastgebers und erzeugt den Antwort-Code */
export async function answerInvite(offerCode: string, useStun: boolean): Promise<Reply> {
  const offer = await decodeSignal(offerCode, 'offer');
  const pc = newPc(useStun);
  const opened = new Promise<Link>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error('Die Verbindung kam nicht zustande (Zeit abgelaufen). Bitte erneut versuchen.')),
      180000,
    );
    let link: Link | null = null;
    let fastCh: RTCDataChannel | null = null;
    pc.ondatachannel = (e) => {
      const dc = e.channel;
      if (dc.label === 'fast') {
        fastCh = dc;
        link?.attachFast(dc);
        return;
      }
      const go = (): void => {
        clearTimeout(t);
        link = new Link(pc, dc, fastCh);
        resolve(link);
      };
      if (dc.readyState === 'open') go();
      else dc.addEventListener('open', go);
    };
    pc.addEventListener('connectionstatechange', () => {
      if (pc.connectionState === 'failed') {
        clearTimeout(t);
        reject(new Error('Die Verbindung ist fehlgeschlagen. Versuche es erneut.'));
      }
    });
  });
  opened.catch(() => undefined);
  await pc.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await iceComplete(pc);
  const desc = pc.localDescription;
  if (!desc) throw new Error('Die Antwort konnte nicht erstellt werden.');
  const code = await encodeSignal({ kind: 'answer', sdp: desc.sdp });
  return {
    code,
    opened,
    cancel: () => {
      try {
        pc.close();
      } catch {
        /* ignorieren */
      }
    },
  };
}
