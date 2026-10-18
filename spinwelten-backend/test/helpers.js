/* Test-Hilfen: eigenes RSA-Schlüsselpaar als „Zertifikatsquelle“, Token signieren, Server mit steuerbarer Uhr starten */
'use strict';
process.env.NODE_ENV = 'test';
const crypto = require('crypto'), fs = require('fs'), os = require('os'), path = require('path');
const { createApp } = require('../src/app');
const { createServer } = require('../src/server');
const { FileStorage } = require('../src/storage');
const { loadConfig } = require('../src/config');

const PROJECT = 'ricorewi-games-save';
const KID = 'test-kid-1';
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const other = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const TEST_KEYS = { [KID]: publicKey.export({ type: 'spki', format: 'pem' }) };

const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
function sign(claims, opt) {
  opt = opt || {};
  const header = { alg: 'RS256', kid: opt.kid || KID, typ: 'JWT' };
  const data = b64(header) + '.' + b64(claims);
  const sig = crypto.sign('RSA-SHA256', Buffer.from(data), opt.wrongKey ? other.privateKey : privateKey).toString('base64url');
  return data + '.' + sig;
}
function token(uid, o) {
  o = o || {};
  const nowSec = Math.floor((o.nowMs || Date.now()) / 1000);
  const c = {
    iss: 'https://securetoken.google.com/' + (o.iss || PROJECT), aud: o.aud || PROJECT, sub: uid,
    iat: nowSec - 10, auth_time: nowSec - 100, exp: nowSec + (o.expIn != null ? o.expIn : 3600),
    firebase: { sign_in_provider: o.anonymous ? 'anonymous' : 'google.com' }
  };
  if (o.name !== undefined) c.name = o.name;
  return sign(c, o);
}

function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'swb-')); }

function clock(start) {
  let t = start || Date.UTC(2026, 9, 18, 12, 0, 0);
  const f = () => t;
  f.add = ms => { t += ms; return t; };
  f.set = ms => { t = ms; };
  return f;
}

// App + echter HTTP-Server auf zufälligem Port
async function start(o) {
  o = o || {};
  const dir = o.dir || tmpDir();
  const config = Object.assign(loadConfig({ AUTH_MODE: 'test', NODE_ENV: 'test', DATA_DIR: dir, PORT: '0', ALLOWED_ORIGINS: 'https://ricorewioriginal-collab.github.io,http://localhost:8080' }), o.config || {});
  const store = new FileStorage({ dir, flushMs: 20, maxWaitMs: 100 }).open();
  const now = o.now || clock();
  const app = createApp({ config, store, now, testKeys: TEST_KEYS, rate: o.rate || { spin: [1e6, 1e6], action: [1e6, 1e6], ip: [1e6, 1e6] } });
  const server = createServer(app, config);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  async function call(method, p, body, tok, headers) {
    const h = Object.assign({}, headers || {});
    if (tok) h.Authorization = 'Bearer ' + tok;
    if (body !== undefined) h['Content-Type'] = 'application/json';
    const r = await fetch(base + p, { method, headers: h, body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)) });
    const text = await r.text();
    let json = null; try { json = JSON.parse(text); } catch (e) {}
    return { status: r.status, json, text, headers: r.headers };
  }
  // Direkt über die Logik-Schicht (ohne HTTP)
  async function direct(method, p, body, tok) {
    const u = new URL(p, 'http://x');
    const r = await app.handle({ method, path: u.pathname, query: u.searchParams, headers: tok ? { authorization: 'Bearer ' + tok } : {}, rawBody: body === undefined ? '' : JSON.stringify(body), ip: '1.2.3.4' });
    return { status: r.status, json: JSON.parse(r.body), text: r.body };
  }
  let n = 0;
  const nonce = () => 'n' + Date.now().toString(36) + '_' + (n++).toString(36) + crypto.randomBytes(3).toString('hex');
  // Spieler mit Konto anlegen
  async function player(uid, name, opts2) {
    const tk = () => token(uid, Object.assign({ name, nowMs: now() }, opts2 || {}));
    const r = await call('POST', '/v1/account/init', {}, tk());
    if (r.status !== 200) throw new Error('init fehlgeschlagen: ' + r.text);
    const p = {
      uid, tok: tk, state: r.json.state,
      call: (m, path2, body) => call(m, path2, body, tk()),
      act: (path2, body) => call('POST', path2, Object.assign({ nonce: nonce() }, body || {}), tk()),
      patch: body => call('POST', '/v1/test/patch', body, tk()),
      me: async () => (await call('GET', '/v1/me', undefined, tk())).json.state
    };
    return p;
  }
  async function stop() { const p = new Promise(r => server.close(r)); server.closeAllConnections(); await p; await store.close(); }
  return { app, server, store, base, call, direct, now, dir, config, player, nonce, stop, E: app.ctx.E };
}

module.exports = { start, token, sign, clock, tmpDir, TEST_KEYS, PROJECT, KID };
