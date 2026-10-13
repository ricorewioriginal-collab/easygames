// RIFTZONE-Spielserver: HTTP (Gesundheit, Rangliste, optional statische Dateien) + WebSocket (/ws).
//   PORT=2610 ALLOWED_ORIGINS=https://deinname.github.io node server/dist/server.mjs
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { WebSocketServer, type RawData } from 'ws';
import { getTerrain } from '../../shared/src/terrain';
import { PROTOCOL_VERSION } from '../../shared/src/constants';
import { loadConfig } from './config';
import { Lobby } from './lobby';
import { StatsStore } from './stats';

const cfg = loadConfig();
const t0 = Date.now();
getTerrain(); // Insel einmal berechnen (≈ 2 s)
console.log(`[start] Insel berechnet in ${Date.now() - t0} ms`);
const stats = new StatsStore(cfg.dataDir);
const lobby = new Lobby(cfg, stats);
lobby.start();

const originOk = (origin: string | undefined): boolean => !cfg.allowedOrigins.length || (!!origin && cfg.allowedOrigins.includes(origin));

const MIME: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.bin': 'application/octet-stream', '.webmanifest': 'application/manifest+json' };
const staticRoot = cfg.staticDir ? resolve(cfg.staticDir) : '';

function json(res: ServerResponse, code: number, body: unknown, origin?: string): void {
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': originOk(origin) ? origin ?? '*' : 'null',
  });
  res.end(JSON.stringify(body));
}

const http = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? '/', 'http://x');
  const origin = req.headers.origin;
  if (url.pathname === '/health') return json(res, 200, { ok: true, version: PROTOCOL_VERSION, uptime: Math.round(process.uptime()), ...lobby.status() }, origin);
  if (url.pathname === '/api/leaderboard') return json(res, 200, { entries: lobby.leaderboard() }, origin);
  if (url.pathname === '/api/status') return json(res, 200, lobby.status(), origin);
  if (staticRoot) {
    let p = decodeURIComponent(url.pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(staticRoot, p));
    if (file.startsWith(staticRoot) && existsSync(file) && statSync(file).isFile()) {
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      createReadStream(file).pipe(res);
      return;
    }
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('RIFTZONE-Server läuft. WebSocket unter /ws, Status unter /health.');
});

const wss = new WebSocketServer({
  server: http,
  path: '/ws',
  maxPayload: 16 * 1024,
  perMessageDeflate: false,
  verifyClient: (info) => originOk(info.origin),
});

wss.on('connection', (ws, req) => {
  ws.binaryType = 'arraybuffer';
  const conn = lobby.connect({
    send: (d) => {
      if (ws.readyState === 1) ws.send(d);
    },
    close: (code, reason) => ws.close(code, reason),
    buffered: () => ws.bufferedAmount,
  });
  let alive = true;
  ws.on('pong', () => (alive = true));
  const ping = setInterval(() => {
    if (!alive) {
      ws.terminate();
      return;
    }
    alive = false;
    ws.ping();
  }, 15000);
  ws.on('message', (data: RawData, isBinary: boolean) => {
    if (isBinary) {
      const buf = data instanceof ArrayBuffer ? data : Buffer.isBuffer(data) ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : null;
      if (buf) lobby.onBinary(conn, buf as ArrayBuffer);
    } else lobby.onText(conn, Buffer.isBuffer(data) ? data.toString('utf8') : data instanceof ArrayBuffer ? Buffer.from(data).toString('utf8') : '');
  });
  ws.on('close', () => {
    clearInterval(ping);
    lobby.disconnect(conn);
  });
  ws.on('error', () => undefined);
  void req;
});

http.listen(cfg.port, cfg.host, () => {
  console.log(`[start] RIFTZONE-Server auf http://${cfg.host}:${cfg.port}  (WebSocket /ws, Matchgröße ${cfg.publicSize}, Wartezeit ${cfg.queueWait} s, max. ${cfg.maxMatches} Matches)`);
  if (!cfg.allowedOrigins.length) console.log('[hinweis] ALLOWED_ORIGINS ist leer – alle Webseiten dürfen verbinden (nur zum Testen empfohlen).');
});

const shutdown = (): void => {
  console.log('[stop] Server wird beendet …');
  stats.flush();
  lobby.stop();
  wss.close();
  http.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
