/* Gemeinsame Hilfen: Fehler, Validierung, Zeitschlüssel, Namensfilter */
'use strict';

class ApiError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
const fail = (status, code) => { throw new ApiError(status, code); };

const NONCE_RE = /^[A-Za-z0-9_-]{8,64}$/;
const PID_RE = /^[0-9a-f]{24}$/;
const CARD_RE = /^w(0[1-9]|[12][0-9]|30)c[1-8]$/;
const ID_RE = /^[a-z0-9]{8,24}$/;

const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const DAY = 864e5, HOUR = 36e5, MIN = 6e4;
const dayKey = t => Math.floor(t / DAY);
const weekKey = t => Math.floor((Math.floor(t / DAY) + 3) / 7);   // Wochen ab Montag (UTC)

// Anzeigename nur aus dem Token: Buchstaben, Ziffern, Leerzeichen, - _ . ; max. 20 Zeichen
function cleanName(raw) {
  if (typeof raw !== 'string') return '';
  const s = raw.normalize('NFC').replace(/[^\p{L}\p{N} ._-]/gu, '').replace(/\s+/g, ' ').trim();
  return Array.from(s).slice(0, 20).join('').trim();
}

module.exports = { ApiError, fail, NONCE_RE, PID_RE, CARD_RE, ID_RE, isInt, isObj, DAY, HOUR, MIN, dayKey, weekKey, cleanName };
