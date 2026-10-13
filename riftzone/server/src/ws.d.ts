// Minimale Typen für das Paket „ws“ (vermeidet eine zusätzliche @types-Abhängigkeit).
declare module 'ws' {
  import type { IncomingMessage, Server as HttpServer } from 'node:http';
  import type { EventEmitter } from 'node:events';

  export type RawData = Buffer | ArrayBuffer | Buffer[];

  export class WebSocket extends EventEmitter {
    static readonly OPEN: number;
    readonly readyState: number;
    readonly bufferedAmount: number;
    binaryType: 'nodebuffer' | 'arraybuffer' | 'fragments';
    send(data: string | ArrayBuffer | Buffer | Uint8Array, cb?: (err?: Error) => void): void;
    close(code?: number, reason?: string): void;
    terminate(): void;
    ping(): void;
    on(event: 'message', cb: (data: RawData, isBinary: boolean) => void): this;
    on(event: 'close', cb: (code: number, reason: Buffer) => void): this;
    on(event: 'pong', cb: () => void): this;
    on(event: 'error', cb: (err: Error) => void): this;
  }

  export interface ServerOptions {
    server?: HttpServer;
    path?: string;
    maxPayload?: number;
    perMessageDeflate?: boolean;
    verifyClient?: (info: { origin: string; req: IncomingMessage; secure: boolean }) => boolean;
  }

  export class WebSocketServer extends EventEmitter {
    constructor(opts: ServerOptions);
    readonly clients: Set<WebSocket>;
    on(event: 'connection', cb: (ws: WebSocket, req: IncomingMessage) => void): this;
    close(cb?: () => void): void;
  }
}
