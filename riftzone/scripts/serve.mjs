#!/usr/bin/env node
// Kleiner statischer Server für den gebauten Ordner app/ (Vorschau und Browser-Tests).
//   node scripts/serve.mjs [port]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'app');
const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.bin': 'application/octet-stream', '.webmanifest': 'application/manifest+json' };

export function startServer(p = port) {
  const server = createServer((req, res) => {
    let path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(root, path));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('nicht gefunden');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' });
    createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(p, () => r(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await startServer();
  console.log(`RIFTZONE-Vorschau: http://localhost:${port}/`);
}
