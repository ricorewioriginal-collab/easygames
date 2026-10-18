/* Spinwelten-Backend: HTTP-Schicht (CORS, Body-Limit 16 KB, Zeitlimits) und Programmstart.
 *   PORT=8080 TARGET_SECRET=… node src/server.js
 * Siehe README.md für alle Umgebungsvariablen. */
'use strict';
const http = require('http');
const { createApp } = require('./app');
const { FileStorage } = require('./storage');
const { loadConfig } = require('./config');

const BODY_LIMIT = 16 * 1024;

function createServer(app, cfg) {
  const origins = new Set(cfg.origins);
  const server = http.createServer((req, res) => {
    const origin = req.headers.origin;
    const allowed = origin && origins.has(origin);
    const headers = {
      'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'
    };
    if (allowed) { headers['Access-Control-Allow-Origin'] = origin; headers['Vary'] = 'Origin'; }
    const send = (status, body, extra) => {
      if (res.headersSent) return;
      res.writeHead(status, Object.assign(headers, extra || {}));
      res.end(body);
    };
    if (req.method === 'OPTIONS') {
      if (!allowed) return send(403, JSON.stringify({ ok: false, error: 'origin_not_allowed' }));
      return send(204, '', {
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Max-Age': '600'
      });
    }
    // Fremde Browser-Seiten werden abgewiesen (Anfragen ohne Origin, z. B. curl/Server, sind erlaubt)
    if (origin && !allowed) return send(403, JSON.stringify({ ok: false, error: 'origin_not_allowed' }));
    let url;
    try { url = new URL(req.url, 'http://x'); } catch (e) { return send(400, JSON.stringify({ ok: false, error: 'bad_url' })); }
    const chunks = []; let size = 0, tooBig = false;
    if (Number(req.headers['content-length'] || 0) > BODY_LIMIT) { send(413, JSON.stringify({ ok: false, error: 'body_too_large' }), { Connection: 'close' }); req.destroy(); return; }
    req.on('data', c => {
      if (tooBig) return;
      size += c.length;
      if (size > BODY_LIMIT) { tooBig = true; send(413, JSON.stringify({ ok: false, error: 'body_too_large' }), { Connection: 'close' }); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (tooBig) return;
      const ip = cfg.trustProxy && req.headers['x-forwarded-for']
        ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : (req.socket.remoteAddress || '?');
      app.handle({ method: req.method, path: url.pathname.replace(/\/+$/, '') || '/', query: url.searchParams, headers: req.headers,
        rawBody: Buffer.concat(chunks).toString('utf8'), ip })
        .then(r => send(r.status, r.body, r.headers))
        .catch(e => { console.error('[server]', e); send(500, JSON.stringify({ ok: false, error: 'internal' })); });
    });
    req.on('error', () => {});
  });
  server.requestTimeout = 15000; server.headersTimeout = 10000; server.keepAliveTimeout = 5000;
  server.maxHeadersCount = 50;
  return server;
}

async function main() {
  let cfg, store, app;
  try {
    cfg = loadConfig();
    store = new FileStorage({ dir: cfg.dataDir }).open();
    app = createApp({ config: cfg, store });
  } catch (e) {
    console.error('Start verweigert: ' + e.message);
    process.exit(1);
  }
  const server = createServer(app, cfg);
  const sweeper = setInterval(app.sweep, 5 * 60e3); sweeper.unref();
  server.listen(cfg.port, cfg.host, () => {
    const a = server.address();
    console.log(`spinwelten-backend ${app.version} auf ${a.address}:${a.port} (Auth: ${cfg.testMode ? 'TEST' : 'Firebase ' + cfg.projectId}, Daten: ${cfg.dataDir})`);
  });
  let stopping = false;
  const stop = sig => {
    if (stopping) return; stopping = true;
    console.log(sig + ' – speichere und beende …');
    server.close();
    store.close().then(() => process.exit(0), e => { console.error(e); try { store.flushSync(); } catch (x) { console.error(x); } process.exit(1); });
    setTimeout(() => process.exit(1), 8000).unref();
  };
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
}

if (require.main === module) main();

module.exports = { createServer, BODY_LIMIT };
