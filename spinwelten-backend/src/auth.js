/* Anmeldung: Firebase-ID-Token (RS256) mit den öffentlichen Google-Zertifikaten prüfen.
 * Im Testmodus (AUTH_MODE=test, nur zusammen mit NODE_ENV=test) werden eigene öffentliche Schlüssel als
 * Zertifikatsquelle eingesetzt – geprüft wird über DENSELBEN Pfad (Signatur, aud, iss, exp, iat, auth_time, sub). */
'use strict';
const crypto = require('crypto');
const { ApiError } = require('./util');

const GOOGLE_CERTS = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const SKEW = 300;   // Sekunden Toleranz für Uhrabweichungen

function b64json(part) {
  const s = Buffer.from(part, 'base64url').toString('utf8');
  const v = JSON.parse(s);
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('kein Objekt');
  return v;
}

function toKey(pem) {
  if (typeof pem !== 'string') throw new Error('Schlüssel ist kein Text');
  if (pem.includes('BEGIN CERTIFICATE')) return new crypto.X509Certificate(pem).publicKey;
  return crypto.createPublicKey(pem);   // Testmodus: reiner öffentlicher Schlüssel
}

function keysFromJson(obj) {
  const m = new Map();
  for (const [kid, pem] of Object.entries(obj || {})) m.set(kid, toKey(pem));
  return m;
}

// Zertifikate von Google, Cache gemäß Cache-Control: max-age
function googleCertSource(fetchImpl) {
  const f = fetchImpl || globalThis.fetch;
  return async function () {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await f(GOOGLE_CERTS, { signal: ctl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const cc = r.headers.get('cache-control') || '', m = /max-age=(\d+)/i.exec(cc);
      return { keys: await r.json(), maxAgeSec: m ? Math.min(86400, Number(m[1])) : 3600 };
    } finally { clearTimeout(to); }
  };
}

function createVerifier(opts) {
  const projectId = opts.projectId;
  const nowSec = () => Math.floor((opts.now ? opts.now() : Date.now()) / 1000);
  const source = opts.certSource;
  let keys = new Map(), validUntil = 0, inflight = null, lastForced = 0;

  async function load(force) {
    const t = nowSec();
    if (!force && keys.size && t < validUntil) return keys;
    if (inflight) return inflight;
    inflight = (async () => {
      try {
        const { keys: raw, maxAgeSec } = await source();
        keys = keysFromJson(raw); validUntil = nowSec() + (maxAgeSec || 3600);
        return keys;
      } catch (e) {
        if (keys.size) return keys;   // alte Schlüssel weiterverwenden, falls Google kurz nicht erreichbar
        throw new ApiError(503, 'auth_unavailable');
      } finally { inflight = null; }
    })();
    return inflight;
  }

  async function verify(token) {
    const bad = code => new ApiError(401, code || 'invalid_token');
    if (typeof token !== 'string' || token.length > 4096) throw bad();
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some(p => !/^[A-Za-z0-9_-]+$/.test(p))) throw bad();
    let header, payload;
    try { header = b64json(parts[0]); payload = b64json(parts[1]); } catch (e) { throw bad(); }
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw bad();
    let ks = await load(false), key = ks.get(header.kid);
    if (!key && nowSec() - lastForced > 60) { lastForced = nowSec(); ks = await load(true); key = ks.get(header.kid); }
    if (!key) throw bad();
    const ok = crypto.verify('RSA-SHA256', Buffer.from(parts[0] + '.' + parts[1]), key, Buffer.from(parts[2], 'base64url'));
    if (!ok) throw bad();
    const t = nowSec();
    if (payload.aud !== projectId) throw bad();
    if (payload.iss !== 'https://securetoken.google.com/' + projectId) throw bad();
    if (typeof payload.sub !== 'string' || !payload.sub.length || payload.sub.length > 128) throw bad();
    if (!Number.isFinite(payload.exp) || payload.exp <= t) throw bad('token_expired');
    if (!Number.isFinite(payload.iat) || payload.iat > t + SKEW) throw bad();
    if (!Number.isFinite(payload.auth_time) || payload.auth_time > t + SKEW) throw bad();
    const fb = payload.firebase && typeof payload.firebase === 'object' ? payload.firebase : {};
    const provider = typeof fb.sign_in_provider === 'string' ? fb.sign_in_provider : '';
    return { uid: payload.sub, name: typeof payload.name === 'string' ? payload.name : '', provider, anonymous: provider === 'anonymous' };
  }

  return { verify };
}

module.exports = { createVerifier, googleCertSource, keysFromJson, GOOGLE_CERTS };
