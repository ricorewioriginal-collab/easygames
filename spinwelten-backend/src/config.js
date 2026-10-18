/* Konfiguration aus Umgebungsvariablen (keine Secrets im Repo). Ungültige Kombinationen verhindern den Start. */
'use strict';
const fs = require('fs'), path = require('path');

const DEFAULT_ORIGINS = 'https://ricorewioriginal-collab.github.io';

function loadConfig(env) {
  env = env || process.env;
  const mode = env.AUTH_MODE || 'firebase';
  if (mode !== 'firebase' && mode !== 'test') throw new Error('AUTH_MODE muss "firebase" oder "test" sein');
  const testMode = mode === 'test';
  if (testMode && env.NODE_ENV !== 'test') throw new Error('AUTH_MODE=test ist nur zusammen mit NODE_ENV=test erlaubt – Start verweigert.');
  let secret = env.TARGET_SECRET || '';
  if (!secret) {
    if (!testMode) throw new Error('TARGET_SECRET fehlt (mind. 32 zufällige Zeichen, z. B. "openssl rand -hex 32") – Start verweigert.');
    secret = 'test-secret-only-for-tests-0000000000';
  }
  if (secret.length < 16) throw new Error('TARGET_SECRET ist zu kurz (mind. 16 Zeichen, empfohlen 64 Hex-Zeichen).');
  let testKeys = null;
  if (testMode && env.AUTH_TEST_KEYS_FILE) testKeys = JSON.parse(fs.readFileSync(path.resolve(env.AUTH_TEST_KEYS_FILE), 'utf8'));
  const port = Number(env.PORT || 8080);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT ungültig');
  return {
    port, host: env.HOST || '0.0.0.0',
    dataDir: path.resolve(env.DATA_DIR || path.join(__dirname, '..', 'data')),
    projectId: env.FIREBASE_PROJECT_ID || 'ricorewi-games-save',
    origins: (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS).split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean),
    trustProxy: env.TRUST_PROXY === '1' || env.TRUST_PROXY === 'true',
    gameDir: env.SPINWELTEN_GAME_DIR || '',
    targetSecret: secret, testMode, testKeys
  };
}
module.exports = { loadConfig, DEFAULT_ORIGINS };
