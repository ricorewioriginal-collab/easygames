/* Spinwelten 3D – Client für das optionale Server-Backend (spinwelten-backend)
 * Serverautoritativ: Der Browser schickt nur Wünsche (Spin, Bauen, Angriff …), der Server würfelt, bucht und antwortet.
 * Ohne eingetragene Server-Adresse meldet configured() false und status() { state: 'off' } – das Spiel läuft dann offline weiter.
 * Adresse: localStorage 'spinweltenSettings'.apiBase (Einstellungen) oder window.SPINWELTEN_API_BASE (index.html).
 * Nur https:// (bzw. http://localhost / 127.0.0.1 zum Testen). Anmeldung über das vorhandene easygames-Login (AnMaChaCloud).
 * Jede Konto-Aktion trägt eine nonce; bei Netzfehlern wird bis zu 2× mit DERSELBEN nonce wiederholt (keine Doppelbuchung).
 * Alle Methoden liefern ein Promise mit { ok, result, state? } oder werfen einen Error mit .code
 * ('not-configured', 'needs-login', 'network', 'timeout' oder dem Fehlercode des Servers, z. B. 'not_enough_energy'). */
(function (SW) {
  'use strict';
  const W = typeof window !== 'undefined' ? window : globalThis;
  const TIMEOUT = 10000, HEALTH_TIMEOUT = 6000, RETRIES = 2;

  function normalizeBase(u) {
    if (typeof u !== 'string') return '';
    u = u.trim();
    if (!u) return '';
    let p;
    try { p = new URL(u); } catch (e) { return ''; }
    if (p.username || p.password || p.search || p.hash) return '';
    const local = p.hostname === 'localhost' || p.hostname === '127.0.0.1';
    if (p.protocol !== 'https:' && !(p.protocol === 'http:' && local)) return '';
    return (p.origin + p.pathname).replace(/\/+$/, '');
  }
  function base() {
    try {
      const s = JSON.parse((W.localStorage && W.localStorage.getItem('spinweltenSettings')) || 'null');
      const b = normalizeBase(s && s.apiBase);
      if (b) return b;
    } catch (e) { /* kein Speicher / ungültiges JSON */ }
    return normalizeBase(W.SPINWELTEN_API_BASE || '');
  }
  const configured = () => !!base();

  function fail(code, status) { const e = new Error(code); e.code = code; if (status) e.status = status; return e; }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function nonce() {
    if (SW.rng && SW.rng.uid) return SW.rng.uid(16);
    const a = new Uint8Array(12); (W.crypto || globalThis.crypto).getRandomValues(a);
    return Array.from(a, x => x.toString(16).padStart(2, '0')).join('');
  }

  async function account() {
    const C = W.AnMaChaCloud;
    if (!C || typeof C.account !== 'function') return null;
    try { const a = await C.account(); return a && a.token ? a : null; } catch (e) { return null; }
  }

  async function attempt(url, method, body, token, timeout) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => { if (ctl) ctl.abort(); }, timeout);
    try {
      const headers = {};
      if (token) headers.Authorization = 'Bearer ' + token;
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      const r = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ctl ? ctl.signal : undefined, cache: 'no-store', credentials: 'omit' });
      let data = null;
      try { data = await r.json(); } catch (e) { data = null; }
      return { status: r.status, data };
    } finally { clearTimeout(timer); }
  }

  // Eine Anfrage; Netzfehler, Zeitüberschreitung und 5xx werden bis zu 2× wiederholt – mit unverändertem Body (gleiche nonce)
  async function request(method, path, body, auth) {
    const b = base();
    if (!b) throw fail('not-configured');
    let token = null;
    if (auth !== false) { const a = await account(); if (!a) throw fail('needs-login'); token = a.token; }
    let last = null;
    for (let i = 0; i <= RETRIES; i++) {
      if (i) await sleep(300 * i);
      let res;
      try { res = await attempt(b + path, method, body, token, TIMEOUT); }
      catch (e) { last = fail(e && e.name === 'AbortError' ? 'timeout' : 'network'); continue; }
      if (res.data && res.data.ok) return res.data;
      if (res.status >= 500 && i < RETRIES) { last = fail((res.data && res.data.error) || 'http_' + res.status, res.status); continue; }
      throw fail((res.data && res.data.error) || 'http_' + res.status, res.status);
    }
    throw last;
  }
  const get = (p, auth) => request('GET', p, undefined, auth);
  const act = (p, body) => request('POST', p, Object.assign({ nonce: nonce() }, body || {}));   // nonce einmal erzeugt, bei Wiederholung gleich

  async function status() {
    const b = base();
    if (!b) return { state: 'off' };
    let h;
    try { h = await attempt(b + '/v1/health', 'GET', undefined, null, HEALTH_TIMEOUT); } catch (e) { return { state: 'unreachable' }; }
    if (!h.data || !h.data.ok) return { state: 'unreachable' };
    const a = await account();
    return { state: a ? 'ok' : 'needs-login', version: h.data.version };
  }

  const q = encodeURIComponent;
  SW.OnlineAPI = {
    configured, status, base, normalizeBase,
    init: () => request('POST', '/v1/account/init', { nonce: nonce() }),
    me: () => get('/v1/me'),
    spin: mult => act('/v1/spin', { mult }),
    build: b => act('/v1/build', { b }),
    repair: b => act('/v1/repair', { b }),
    targets: () => get('/v1/targets'),
    attack: (target, b) => act('/v1/attack', { target, b }),
    raid: (target, picks) => act('/v1/raid', { target, picks }),
    revenge: token => act('/v1/revenge', { token }),
    history: () => get('/v1/history'),
    leaderboard: kind => get('/v1/leaderboard?kind=' + q(kind || 'islands')),
    events: () => get('/v1/events', false),
    deleteAccount: () => request('DELETE', '/v1/account'),
    teams: {
      names: () => get('/v1/teams/names', false),
      create: name => act('/v1/teams/create', { name }),
      join: id => act('/v1/teams/join', { team: id }),
      leave: () => act('/v1/teams/leave'),
      mine: () => get('/v1/teams/mine'),
      list: () => get('/v1/teams?open=1'),
      gift: to => act('/v1/teams/gift', { to })
    },
    trades: {
      offer: (to, give, want) => act('/v1/trades/offer', { to, give, want }),
      accept: id => act('/v1/trades/accept', { trade: id }),
      cancel: id => act('/v1/trades/cancel', { trade: id }),
      list: () => get('/v1/trades')
    },
    rooms: {
      publish: (code, mode, players, max) => request('POST', '/v1/rooms/publish', { code, mode, players, max }),
      unpublish: () => request('POST', '/v1/rooms/unpublish', {}),
      list: () => get('/v1/rooms'),
      quick: mode => get('/v1/rooms/quick' + (mode ? '?mode=' + q(mode) : ''))
    }
  };
})(globalThis.SW = globalThis.SW || {});
