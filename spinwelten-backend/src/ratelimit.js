/* Token-Bucket je Schlüssel (uid oder IP). take() liefert 0 (erlaubt) oder die Wartezeit in Sekunden. */
'use strict';

class Buckets {
  constructor(now) { this.now = now || Date.now; this.m = new Map(); }
  take(key, rate, burst) {
    const t = this.now();
    let b = this.m.get(key);
    if (!b) { b = { tokens: burst, at: t }; this.m.set(key, b); }
    else { b.tokens = Math.min(burst, b.tokens + (t - b.at) / 1000 * rate); b.at = t; }
    if (b.tokens >= 1) { b.tokens -= 1; return 0; }
    return Math.max(1, Math.ceil((1 - b.tokens) / rate));
  }
  sweep(maxIdleMs) {
    const t = this.now();
    for (const [k, b] of this.m) if (t - b.at > maxIdleMs) this.m.delete(k);
  }
}
module.exports = { Buckets };
