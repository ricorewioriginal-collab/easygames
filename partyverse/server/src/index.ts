import http from 'node:http';
import express from 'express';
import { Server, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { ROOM_NAME } from '@shared/net/protocol';
import { PartyRoom } from './PartyRoom';
import { DEFAULT_TIMING, FAST_TIMING, Timing } from './timing';

export interface ServerOptions {
  port?: number;
  /** Erlaubte Browser-Herkünfte (leer = alle). Beispiel: ['https://name.github.io'] */
  allowedOrigins?: string[];
  timing?: Partial<Timing> | 'fast';
}

/** Erzeugt den Colyseus-Server (ohne ihn zu starten). */
export function createGameServer(opts: ServerOptions = {}): { gameServer: Server; httpServer: http.Server; listen: (port?: number) => Promise<number>; stop: () => Promise<void> } {
  const origins = (opts.allowedOrigins ?? []).filter(Boolean);
  const allowed = (origin: string | undefined): boolean => origins.length === 0 || (!!origin && origins.includes(origin));
  PartyRoom.timing = opts.timing === 'fast' ? { ...FAST_TIMING } : { ...DEFAULT_TIMING, ...(opts.timing ?? {}) };

  const app = express();
  app.disable('x-powered-by');
  app.get('/health', (_req, res) => {
    res.json({ ok: true, game: 'partyverse', rooms: matchMaker.stats.local.roomCount, clients: matchMaker.stats.local.ccu });
  });
  const httpServer = http.createServer(app);
  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: httpServer,
      maxPayload: 128 * 1024,
      verifyClient: (info, done) => (allowed(info.origin) ? done(true) : done(false, 403, 'Herkunft nicht erlaubt')),
    }),
  });
  // Matchmaking-HTTP-Anfragen: nur erlaubte Herkünfte bekommen CORS-Freigabe
  matchMaker.controller.getCorsHeaders = (req: { headers?: Record<string, string | string[] | undefined> }) => {
    const origin = req.headers?.origin as string | undefined;
    return { 'Access-Control-Allow-Origin': allowed(origin) ? origin || '*' : 'null' };
  };
  gameServer.define(ROOM_NAME, PartyRoom);
  return {
    gameServer,
    httpServer,
    listen: async (port = opts.port ?? 2567) => {
      await gameServer.listen(port);
      const addr = httpServer.address();
      return typeof addr === 'object' && addr ? addr.port : port;
    },
    stop: async () => {
      await gameServer.gracefullyShutdown(false).catch(() => undefined);
    },
  };
}

// Start als eigenständiger Dienst (npm run server)
const isMain = process.argv[1] !== undefined && /server[\\/]src[\\/]index\.[tj]s$|server\.mjs$/.test(process.argv[1]);
if (isMain) {
  const port = Number(process.env.PORT ?? 2567);
  const origins = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const srv = createGameServer({ port, allowedOrigins: origins });
  srv.listen(port).then((p) => console.log(`PARTYVERSE-Server läuft auf Port ${p}${origins.length ? ' (Herkünfte: ' + origins.join(', ') + ')' : ' (alle Herkünfte erlaubt)'}`));
}
