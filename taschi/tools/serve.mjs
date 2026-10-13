// Minimal static development server (no dependencies). Serves the whole
// easygames repository so ../bunte-insel/vendor and ../cloud resolve exactly
// like on GitHub Pages. Usage: node tools/serve.mjs [port] [root]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const port = Number((isMain && process.argv[2]) || process.env.PORT || 8080);
const root = resolve((isMain && process.argv[3]) || join(here, '..', '..'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };

export function startServer(p = port, r = root) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x');
      let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
      let file = resolve(r, path);
      if (!file.startsWith(r)) { res.writeHead(403); return res.end('forbidden'); }
      let st = await stat(file).catch(() => null);
      if (st?.isDirectory()) { file = join(file, 'index.html'); st = await stat(file).catch(() => null); }
      if (!st) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(await readFile(file));
    } catch (e) { res.writeHead(500); res.end(String(e)); }
  });
  return new Promise(ok => server.listen(p, '0.0.0.0', () => ok(server)));
}

if (isMain) {
  startServer().then(() => console.log(`TASCHI dev server: http://localhost:${port}/taschi/`));
}
