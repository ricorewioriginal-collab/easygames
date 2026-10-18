/* AnMaCha UNDERCOVER 3D – öffentliche Räume (Firestore über FirePeer.firebase, anonyme Anmeldung).
   Eintrag undercover_pub/<CODE>: h (Konto des Gastgebers), n (Raumname), m (Modus), c (Belegung), x (Plätze), t (Serverzeit).
   Nur der Gastgeber des Raums (Besitzer von p2p/amu-<CODE>) darf schreiben – siehe Block „AnMaCha UNDERCOVER“ in cloud/firestore.rules.
   Sind die Regeln noch nicht veröffentlicht (403), meldet state() 'locked' → Anzeige „Freischaltung erforderlich“. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const COL = 'undercover_pub', STALE = 3 * 60 * 1000, MODES = ['jagd', 'wort', 'detektiv', 'chaos', 'jagen', 'rollen'];
  let state = 'unknown';   // unknown | ok | locked | off
  let pubTimer = null, last = null;

  function fb() { return root.FirePeer && root.FirePeer.firebase; }
  function mark(e) { if (e && e.status === 403) state = 'locked'; return e; }
  /** Prüft Verfügbarkeit (ohne zu schreiben) */
  function check() {
    const F = fb(); if (!F) { state = 'off'; return Promise.resolve(state); }
    return F.available().then(ok => {
      if (!ok) { state = 'off'; return state; }
      return F.query('', { from: [{ collectionId: COL }], limit: 1 }).then(() => { state = 'ok'; return state; }, e => { mark(e); if (state !== 'locked') state = 'off'; return state; });
    }, () => { state = 'off'; return state; });
  }
  function clean(r) {
    const name = AMU.U ? AMU.U.cleanName(r.n, 24) : String(r.n || '').slice(0, 24);
    return { code: r.id, n: name || 'Raum', m: MODES.includes(r.m) ? r.m : 'jagd', c: Math.max(0, Math.min(12, r.c | 0)), x: Math.max(1, Math.min(12, r.x | 0)), t: r.t };
  }
  /** Liste der offenen Räume (neueste zuerst, veraltete ausgeblendet) */
  function list() {
    const F = fb(); if (!F) return Promise.resolve({ state: 'off', rooms: [] });
    return F.query('', { from: [{ collectionId: COL }], orderBy: [{ field: { fieldPath: 't' }, direction: 'DESCENDING' }], limit: 20 }).then(rows => {
      state = 'ok';
      const now = Date.now();
      const rooms = rows.filter(r => r && AMU.Net.validCode(r.id) && r.t && now - r.t < STALE && (r.c | 0) < (r.x | 0)).map(clean);
      return { state, rooms };
    }, e => { mark(e); return { state: state === 'locked' ? 'locked' : 'off', rooms: [] }; });
  }
  /** Raum veröffentlichen / aktualisieren (alle 60 s erneuert, damit veraltete verschwinden) */
  function publish(code, info) {
    const F = fb(); if (!F || !AMU.Net.validCode(code)) return Promise.resolve(false);
    last = { code, info };
    clearInterval(pubTimer); pubTimer = setInterval(() => { if (last) write(last.code, last.info); }, 60000);
    return write(code, info);
  }
  function write(code, info) {
    const F = fb();
    return F.uid().then(uid => F.write(COL + '/' + code, { h: uid, n: String(info.n || 'Raum').slice(0, 24), m: MODES.includes(info.m) ? info.m : 'jagd', c: info.c | 0, x: info.x | 0 }))
      .then(() => { state = 'ok'; return true; }, e => { mark(e); return false; });
  }
  function update(info) { if (last) { last.info = Object.assign({}, last.info, info); return write(last.code, last.info); } return Promise.resolve(false); }
  function unpublish(code) {
    clearInterval(pubTimer); pubTimer = null;
    const F = fb(); if (!F || !last || last.code !== code) { last = null; return Promise.resolve(); }
    last = null;
    return F.del(COL + '/' + code, true).catch(() => {});
  }
  AMU.PublicRooms = { check, list, publish, update, unpublish, state: () => state, COL };
})(typeof window !== 'undefined' ? window : globalThis);
