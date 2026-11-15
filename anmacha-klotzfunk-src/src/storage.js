// Lokales Speichern (localStorage) – beliebig viele Welten, mit Versionsnummer, Sicherungskopie, Export und Import.
// Bis 1.14 gab es 3 feste Plätze (0–2); sie bleiben unter denselben Schlüsseln einfach weitere Welten.
//
// Schlüssel: klotzfunk.world.N (Spielstand), klotzfunk.meta.N (Kurzinfo fürs Menü),
// klotzfunk-bak.world.N (ältere Sicherung, bewusst außerhalb des Cloud-Präfixes „klotzfunk.“ – bleibt nur lokal).
// Format 1: Änderungen als Zahlenpaare [index, typ, …] je Chunk. Format 2: dieselben Paare kompakt als Base64 (3 Byte je Änderung).
export const SLOTS = 3; // nur noch für alte Aufrufer: die drei früheren festen Plätze
export const MAX_WORLDS = 200;
export const SAVE_VERSION = 2;
export const MODES = ['survival', 'creative', 'story'];
const W = i => 'klotzfunk.world.' + i, M = i => 'klotzfunk.meta.' + i, BK = i => 'klotzfunk-bak.world.' + i, BKT = i => 'klotzfunk-bak.time.' + i;
const BACKUP_EVERY = 10 * 60 * 1000; // Sicherung höchstens alle 10 Minuten erneuern

const ls = () => { try { return globalThis.localStorage || null; } catch (e) { return null; } };
const get = k => { try { return ls().getItem(k); } catch (e) { return null; } };
const parse = s => { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } };

// ---------- Änderungen kodieren ----------
export function encodeEdits(edits) {
  const out = {};
  for (const [k, m] of edits) {
    if (!m.size) continue;
    const bytes = new Uint8Array(m.size * 3);
    let o = 0;
    for (const [i, t] of m) { bytes[o++] = i & 255; bytes[o++] = i >> 8; bytes[o++] = t; }
    let bin = '';
    for (let j = 0; j < bytes.length; j += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(j, j + 8192));
    out[k] = btoa(bin);
  }
  return out;
}
// akzeptiert Format 1 (Zahlen-Array) und Format 2 (Base64)
export function decodeEdits(obj) {
  const edits = new Map();
  if (!obj || typeof obj !== 'object') return edits;
  for (const k of Object.keys(obj)) {
    const v = obj[k], m = new Map();
    if (Array.isArray(v)) {
      for (let i = 0; i + 1 < v.length; i += 2) if (Number.isInteger(v[i]) && Number.isInteger(v[i + 1])) m.set(v[i], v[i + 1] & 255);
    } else if (typeof v === 'string') {
      let bin = '';
      try { bin = atob(v); } catch (e) { continue; }
      for (let j = 0; j + 2 < bin.length; j += 3) m.set(bin.charCodeAt(j) | (bin.charCodeAt(j + 1) << 8), bin.charCodeAt(j + 2));
    }
    const key = Number(k);
    if (m.size && Number.isFinite(key)) edits.set(key, m);
  }
  return edits;
}

// Selbst gedrehte Deko: { Chunk-Key: [Index, Drehung, …] } (optional im Spielstand)
export function encodeRot(rot) {
  const out = {};
  if (rot) for (const [k, m] of rot) if (m.size) { const a = []; for (const [i, r] of m) a.push(i, r); out[k] = a; }
  return out;
}
export function decodeRot(obj) {
  const rot = new Map();
  if (!obj || typeof obj !== 'object') return rot;
  for (const k of Object.keys(obj)) {
    const v = obj[k], key = Number(k), m = new Map();
    if (!Array.isArray(v) || !Number.isFinite(key)) continue;
    for (let i = 0; i + 1 < v.length; i += 2) if (Number.isInteger(v[i]) && v[i] >= 0 && v[i] < 65536 && Number.isInteger(v[i + 1])) m.set(v[i], v[i + 1] & 3);
    if (m.size) rot.set(key, m);
  }
  return rot;
}

// ---------- Prüfen ----------
export function validSave(s) {
  return !!s && typeof s === 'object' && Number.isFinite(s.seed) && MODES.includes(s.mode) && typeof s.name === 'string' &&
    (s.edits === undefined || (typeof s.edits === 'object' && s.edits !== null));
}

// ---------- Lesen / Schreiben ----------
export function readMeta(i) { return parse(get(M(i))); }
export function readWorld(i) { const s = parse(get(W(i))); return validSave(s) ? s : null; }
export function readBackup(i) { const s = parse(get(BK(i))); return validSave(s) ? s : null; }
export function hasBackup(i) { return get(BK(i)) !== null; }

const metaOf = save => ({ name: save.name, mode: save.mode, seed: save.seed, gen: save.gen || 1, preset: save.preset || undefined, terrain: save.terrain || undefined, savedAt: save.savedAt, q: save.story ? (save.story.done ? -1 : save.story.i) : undefined, qc: save.story ? save.story.c : undefined });

// gibt true bei Erfolg zurück. Ein misslungener Schreibversuch lässt den alten Stand unverändert.
export function writeWorld(i, save) {
  const st = ls();
  if (!st) return false;
  let str;
  try { str = JSON.stringify(save); } catch (e) { return false; }
  const prev = get(W(i)), now = Date.now();
  // ältere, lesbare Fassung als Sicherung behalten (nicht bei jedem automatischen Speichern)
  if (prev && prev !== str && now - (Number(get(BKT(i))) || 0) > BACKUP_EVERY && validSave(parse(prev))) {
    try { st.setItem(BK(i), prev); st.setItem(BKT(i), String(now)); } catch (e) { try { st.removeItem(BK(i)); st.removeItem(BKT(i)); } catch (e2) { /* ignorieren */ } }
  }
  try { st.setItem(W(i), str); } catch (e) {
    // Speicher voll: Sicherungen opfern, Hauptstand hat Vorrang
    try { for (let k = 0; k < MAX_WORLDS; k++) if (get(BK(k)) !== null || get(BKT(k)) !== null) { st.removeItem(BK(k)); st.removeItem(BKT(k)); } st.setItem(W(i), str); } catch (e2) { return false; }
  }
  try { st.setItem(M(i), JSON.stringify(metaOf(save))); } catch (e) { /* Menüinfo ist zweitrangig */ }
  return true;
}
export function deleteWorld(i) {
  const st = ls(); if (!st) return;
  for (const k of [W(i), M(i), BK(i), BKT(i)]) { try { st.removeItem(k); } catch (e) { /* ignorieren */ } }
}
// Sicherung wird wieder Hauptstand (der bisherige Hauptstand wird zur Sicherung)
export function restoreBackup(i) {
  const st = ls(), bk = get(BK(i)), s = parse(bk);
  if (!st || !validSave(s)) return false;
  const cur = get(W(i));
  try {
    st.setItem(W(i), bk);
    if (cur) st.setItem(BK(i), cur); else st.removeItem(BK(i));
    st.setItem(BKT(i), String(Date.now()));
    st.setItem(M(i), JSON.stringify(metaOf(s)));
  } catch (e) { return false; }
  return true;
}

// ---------- Export / Import ----------
export function exportText(save) {
  return JSON.stringify({ format: 'klotzfunk-world', version: SAVE_VERSION, exportedAt: Date.now(), save });
}
// liefert den Spielstand oder null (akzeptiert auch einen nackten Spielstand)
export function importText(text) {
  const o = parse(text);
  if (!o) return null;
  const s = o.format === 'klotzfunk-world' ? o.save : o;
  if (!validSave(s)) return null;
  s.name = s.name.slice(0, 40);
  return s;
}
// Nummern aller gespeicherten Welten (aufsteigend). Liest die Schlüssel „klotzfunk.world.N“ und „klotzfunk.meta.N“.
export function listWorlds() {
  const st = ls(), ids = new Set();
  if (!st) return [];
  let n = 0;
  try { n = typeof st.key === 'function' ? st.length : 0; } catch (e) { n = 0; }
  if (n) {
    for (let k = 0; k < n; k++) {
      let key = null; try { key = st.key(k); } catch (e) { /* ignorieren */ }
      const m = key && /^klotzfunk\.(?:world|meta)\.(\d{1,4})$/.exec(key);
      if (m) ids.add(Number(m[1]));
    }
  } else { // Speicher ohne Schlüsselliste: Nummern durchprobieren
    for (let i = 0; i < MAX_WORLDS; i++) if (get(W(i)) !== null || get(M(i)) !== null) ids.add(i);
  }
  return [...ids].filter(i => i < MAX_WORLDS && get(W(i)) !== null).sort((a, b) => a - b);
}
// nächste freie Nummer für eine neue Welt (-1 = Höchstzahl erreicht)
export function freeSlot() {
  const used = new Set(listWorlds());
  for (let i = 0; i < MAX_WORLDS; i++) if (!used.has(i) && get(W(i)) === null) return i;
  return -1;
}
// Kurzinfo lesen; fehlt sie (z. B. nach Import aus der Cloud), aus dem Spielstand nachbauen
export function metaFor(i) {
  const m = readMeta(i);
  if (m && typeof m.name === 'string') return m;
  const s = readWorld(i);
  if (!s) return null;
  const nm = metaOf(s);
  try { ls().setItem(M(i), JSON.stringify(nm)); } catch (e) { /* ignorieren */ }
  return nm;
}
// Welt umbenennen (Spielstand und Menüinfo)
export function renameWorld(i, name) {
  const s = readWorld(i), st = ls();
  name = String(name || '').trim().slice(0, 40);
  if (!s || !st || !name) return false;
  s.name = name;
  try { st.setItem(W(i), JSON.stringify(s)); st.setItem(M(i), JSON.stringify(metaOf(s))); } catch (e) { return false; }
  return true;
}
// Kopie einer Welt in einem neuen Platz; liefert die neue Nummer oder -1
export function copyWorld(i) {
  const s = readWorld(i), j = freeSlot();
  if (!s || j < 0) return -1;
  s.name = (s.name + ' (Kopie)').slice(0, 40); s.savedAt = Date.now();
  return writeWorld(j, s) ? j : -1;
}
