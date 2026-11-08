/**
 * Online & Handys (PeerJS-kompatibel über ../cloud/fire-peer.js, Firebase-Vermittlung): Der Gastgeber (PC oder Fernseher) zieht
 * die Kugeln und prüft jeden Bingo-Ruf; Mitspieler treten per Link, Code oder QR-Code von überall bei und spielen ihre Karten
 * auf dem eigenen Gerät. Einladungslinks immer über die easygames-Homepage (EasyGamesLink.share).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Conn = any;
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789',
  PRE = 'radio-bingo-';
const loaded: Record<string, Promise<void>> = {};
function load(src: string, ok: () => boolean): Promise<void> {
  if (ok()) return Promise.resolve();
  return (loaded[src] ||= new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => (ok() ? res() : rej(new Error('load')));
    s.onerror = () => rej(new Error('load'));
    document.head.appendChild(s);
  }));
}
export const loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!(window as any).Peer);
export const loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!(window as any).qrcode);
export const normCode = (c: string) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);

export class Net {
  peer: any = null;
  role: '' | 'host' | 'guest' = '';
  code = '';
  conns = new Map<string, Conn>();
  onMsg: ((m: any, from: string) => void) | null = null;
  onJoin: ((id: string) => void) | null = null;
  onLeave: ((id: string) => void) | null = null;
  link(): string {
    const u = location.href.split('#')[0].split('?')[0] + '?join=' + this.code;
    const L = (window as any).EasyGamesLink;
    return L ? L.share(u) : u;
  }
  tvLink(): string {
    const u = location.href.split('#')[0].split('?')[0] + '?tv';
    const L = (window as any).EasyGamesLink;
    return L ? L.share(u) : u;
  }
  private reg(c: Conn, onOpen?: () => void) {
    c.on('open', () => {
      this.conns.set(c.peer, c);
      if (this.role === 'host') this.onJoin?.(c.peer);
      onOpen?.();
    });
    c.on('data', (m: any) => this.onMsg?.(m, c.peer));
    c.on('close', () => {
      this.conns.delete(c.peer);
      this.onLeave?.(c.peer);
    });
    c.on('error', () => {});
  }
  async host(): Promise<string> {
    this.close();
    await loadPeer();
    const Peer = (window as any).Peer;
    for (let k = 0; k < 6 && !this.peer; k++) {
      const code = Array.from({ length: 4 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
      const ok = await new Promise<boolean | 'err'>((res) => {
        const p = new Peer(PRE + code);
        let done = false;
        p.on('open', () => {
          done = true;
          this.peer = p;
          this.code = code;
          this.role = 'host';
          res(true);
        });
        p.on('error', (e: any) => {
          if (done) return;
          done = true;
          try {
            p.destroy();
          } catch {
            /* weg */
          }
          res(e && e.type === 'unavailable-id' ? false : 'err');
        });
      });
      if (ok === 'err') throw new Error('broker');
    }
    if (!this.peer) throw new Error('code');
    this.peer.on('connection', (c: Conn) => this.reg(c));
    this.peer.on('disconnected', () => {
      try {
        this.peer.reconnect();
      } catch {
        /* egal */
      }
    });
    return this.code;
  }
  async join(code: string): Promise<void> {
    code = normCode(code);
    if (code.length !== 4) throw new Error('code');
    this.close();
    await loadPeer();
    const Peer = (window as any).Peer;
    await new Promise<void>((res, rej) => {
      const p = new Peer();
      let done = false;
      const fail = (m: string) => {
        if (done) return;
        done = true;
        try {
          p.destroy();
        } catch {
          /* weg */
        }
        rej(new Error(m));
      };
      setTimeout(() => fail('timeout'), 15000);
      p.on('error', (e: any) => fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'));
      p.on('open', () => {
        this.peer = p;
        this.role = 'guest';
        this.code = code;
        this.reg(p.connect(PRE + code, { reliable: true }), () => {
          if (done) return;
          done = true;
          res();
        });
      });
    });
  }
  send(m: unknown, to?: string) {
    if (to) {
      const c = this.conns.get(to);
      if (c && c.open) c.send(m);
      return;
    }
    for (const c of this.conns.values()) if (c.open) c.send(m);
  }
  close() {
    for (const c of this.conns.values())
      try {
        c.close();
      } catch {
        /* weg */
      }
    this.conns.clear();
    if (this.peer)
      try {
        this.peer.destroy();
      } catch {
        /* weg */
      }
    this.peer = null;
    this.role = '';
    this.code = '';
  }
}
export const netError = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  return m === 'nocode' ? 'Diesen Code gibt es nicht (mehr) – frag nach dem aktuellen Code.' : m === 'timeout' ? 'Keine Verbindung – prüfe das Internet und versuch es nochmal.' : m === 'code' ? 'Bitte den 4-stelligen Code eingeben.' : 'Die Online-Verbindung klappt gerade nicht – versuch es gleich nochmal.';
};
