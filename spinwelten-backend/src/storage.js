/* Persistenz: ein JSON-Zustand im Speicher, gebündelt auf die Platte geschrieben (tmp + fsync + rename),
 * dazu ein append-only Audit-Log (JSONL) je Buchung. Schreibvorgänge laufen strikt nacheinander.
 * Für mehr als einige tausend Konten: Adapter mit gleicher Schnittstelle (open/data/markDirty/audit/flush/close),
 * z. B. auf Firestore, statt der Datei. */
'use strict';
const fs = require('fs'), fsp = fs.promises, path = require('path');

const SCHEMA = 1;
const COLLECTIONS = ['accounts', 'teams', 'trades', 'revenge', 'nonces'];

class StorageError extends Error {}

function emptyState() {
  const d = { v: SCHEMA };
  for (const c of COLLECTIONS) d[c] = {};
  return d;
}

class FileStorage {
  constructor(opts) {
    this.dir = path.resolve(opts.dir);
    this.file = path.join(this.dir, 'state.json');
    this.tmp = this.file + '.tmp';
    this.bak = this.file + '.bak';
    this.auditFile = path.join(this.dir, 'audit.jsonl');
    this.flushMs = opts.flushMs != null ? opts.flushMs : 400;
    this.maxWaitMs = opts.maxWaitMs != null ? opts.maxWaitMs : 3000;
    this.backupEveryMs = opts.backupEveryMs != null ? opts.backupEveryMs : 10 * 60e3;
    this.data = null;
    this.dirty = false;
    this.auditQueue = [];
    this.timer = null; this.firstDirty = 0; this.lastBackup = 0;
    this.writing = null;   // laufender Schreibvorgang (Promise)
    this.closed = false;
  }

  open() {
    fs.mkdirSync(this.dir, { recursive: true });
    if (!fs.existsSync(this.file)) {
      if (fs.existsSync(this.bak)) throw new StorageError(`${this.file} fehlt, aber ${this.bak} existiert. Bitte Sicherung prüfen und ggf. als state.json zurückkopieren – Start abgebrochen, um keine Daten zu überschreiben.`);
      this.data = emptyState();
      return this;
    }
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(this.file, 'utf8')); }
    catch (e) { throw new StorageError(`${this.file} ist beschädigt (${e.message}). Start abgebrochen. Datei bleibt unverändert; letzte Sicherung: ${fs.existsSync(this.bak) ? this.bak : 'keine'}.`); }
    if (!parsed || parsed.v !== SCHEMA || COLLECTIONS.some(c => !parsed[c] || typeof parsed[c] !== 'object' || Array.isArray(parsed[c])))
      throw new StorageError(`${this.file} hat ein unbekanntes Format (erwartet Schema ${SCHEMA}). Start abgebrochen, Datei bleibt unverändert.`);
    this.data = parsed;
    return this;
  }

  audit(entry) { this.auditQueue.push(JSON.stringify(entry)); }

  markDirty() {
    if (this.closed) return;
    const now = Date.now();
    if (!this.dirty) this.firstDirty = now;
    this.dirty = true;
    if (this.timer) clearTimeout(this.timer);
    const wait = Math.max(0, Math.min(this.flushMs, this.firstDirty + this.maxWaitMs - now));
    this.timer = setTimeout(() => { this.timer = null; this.flush().catch(e => console.error('[storage] Schreiben fehlgeschlagen:', e)); }, wait);
    if (this.timer.unref) this.timer.unref();
  }

  // Serielle Schreib-Queue: nie zwei Schreibvorgänge gleichzeitig; Änderungen während des Schreibens → weiterer Durchgang
  flush() {
    if (this.writing) return this.writing.then(() => (this.dirty || this.auditQueue.length) ? this.flush() : undefined);
    if (!this.dirty && !this.auditQueue.length) return Promise.resolve();
    const text = JSON.stringify(this.data), lines = this.auditQueue.splice(0);
    this.dirty = false;
    this.writing = this._write(text, lines).catch(e => {
      // nicht verlieren: beim nächsten Durchgang erneut versuchen
      this.auditQueue.unshift(...lines); this.dirty = true; throw e;
    }).finally(() => { this.writing = null; });
    return this.writing;
  }

  async _write(text, lines) {
    if (lines.length) {
      const fa = await fsp.open(this.auditFile, 'a');
      try { await fa.writeFile(lines.join('\n') + '\n'); await fa.sync(); } finally { await fa.close(); }
    }
    const fh = await fsp.open(this.tmp, 'w');
    try { await fh.writeFile(text); await fh.sync(); } finally { await fh.close(); }
    const now = Date.now();
    if (now - this.lastBackup >= this.backupEveryMs && fs.existsSync(this.file)) {
      await fsp.copyFile(this.file, this.bak); this.lastBackup = now;
    }
    await fsp.rename(this.tmp, this.file);
    try { const d = await fsp.open(this.dir, 'r'); try { await d.sync(); } finally { await d.close(); } } catch (e) { /* Verzeichnis-fsync nicht überall möglich */ }
  }

  // Für das Beenden: synchron alles schreiben
  flushSync() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this.auditQueue.length) {
      const fd = fs.openSync(this.auditFile, 'a');
      try { fs.writeSync(fd, this.auditQueue.splice(0).join('\n') + '\n'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    }
    if (!this.dirty) return;
    const fd = fs.openSync(this.tmp, 'w');
    try { fs.writeSync(fd, JSON.stringify(this.data)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    fs.renameSync(this.tmp, this.file);
    this.dirty = false;
  }

  async close() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this.writing) await this.writing.catch(() => {});
    await this.flush();
    this.closed = true;
  }
}

module.exports = { FileStorage, StorageError, emptyState, COLLECTIONS, SCHEMA };
