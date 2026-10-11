import { decodeSignal, encodeSignal } from './signal';

/** Öffentlicher STUN-Server, damit Verbindungen auch über verschiedene Netze (Handy-Daten ↔ WLAN) gelingen. Er sieht nur Verbindungsdaten, keine Spielinhalte. */
export const STUN_SERVERS = ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'];

export type LinkState = 'connecting' | 'open' | 'closed';

/** Ein Datenkanal zu einem Mitspieler (JSON-Nachrichten) mit Verbindungsüberwachung */
export class Link {
  state: LinkState = 'connecting';
  private msgCbs: Array<(m: unknown) => void> = [];
  private closeCbs: Array<() => void> = [];

  constructor(
    private readonly pc: RTCPeerConnection,
    private readonly dc: RTCDataChannel,
  ) {
    dc.onmessage = (e) => {
      if (typeof e.data !== 'string' || e.data.length > 400_000) return;
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
  const dc = pc.createDataChannel('partyverse', { ordered: true });
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
      return new Link(pc, dc);
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
    pc.ondatachannel = (e) => {
      const dc = e.channel;
      const go = (): void => {
        clearTimeout(t);
        resolve(new Link(pc, dc));
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
