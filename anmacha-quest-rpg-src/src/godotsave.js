// Übernahme alter Spielstände der Godot-Fassung (FileAccess.store_var in IndexedDB „/userfs“, Datei anmacha_quest2.save).
// Liest das Godot-4-Variant-Format (nur die Typen, die der Spielstand nutzt) und gibt ein einfaches Objekt zurück.
export function parseGodotSave(bytes) {
  try {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let p = 4;   // store_var: zuerst die Länge (uint32)
    const u32 = () => { const v = dv.getUint32(p, true); p += 4; return v; };
    const i32 = () => { const v = dv.getInt32(p, true); p += 4; return v; };
    const val = (depth = 0) => {
      if (depth > 16) throw new Error('tief');
      const head = u32(), type = head & 0xff, f64 = (head >> 16) & 1;
      switch (type) {
        case 0: return null;
        case 1: return u32() !== 0;
        case 2: { if (f64) { const v = Number(dv.getBigInt64(p, true)); p += 8; return v; } return i32(); }
        case 3: { if (f64) { const v = dv.getFloat64(p, true); p += 8; return v; } const v = dv.getFloat32(p, true); p += 4; return v; }
        case 4: case 21: {
          const n = u32();
          const s = new TextDecoder().decode(new Uint8Array(bytes.buffer, bytes.byteOffset + p, n));
          p += n + ((4 - (n % 4)) % 4);
          return s;
        }
        case 5: { const x = dv.getFloat32(p, true), y = dv.getFloat32(p + 4, true); p += 8; return { x, y }; }
        case 6: { const x = i32(), y = i32(); return { x, y }; }
        case 27: { const n = u32() & 0x7fffffff, o = {}; for (let i = 0; i < n; i++) { const k = val(depth + 1); o[String(k)] = val(depth + 1); } return o; }
        case 28: { const n = u32() & 0x7fffffff, a = []; for (let i = 0; i < n; i++) a.push(val(depth + 1)); return a; }
        default: throw new Error('Typ ' + type);
      }
    };
    const d = val();
    if (!d || !Array.isArray(d.party) || !d.map) return null;
    return { v: 2, party: d.party, inv: d.inv || {}, gold: d.gold | 0, gear: d.gear | 0, flags: d.flags || {}, map: d.map, gp: d.gp, t: +d.t || 0 };
  } catch (e) {
    return null;
  }
}

// Sucht im Browser nach einem alten Godot-Spielstand (nur wenn es noch keinen neuen gibt)
export function readGodotSave() {
  return new Promise((res) => {
    if (typeof indexedDB === 'undefined') return res(null);
    let req;
    try { req = indexedDB.open('/userfs'); } catch (e) { return res(null); }
    req.onupgradeneeded = () => { try { req.transaction.abort(); } catch (e) { } res(null); };
    req.onerror = () => res(null);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('FILE_DATA')) { db.close(); return res(null); }
      let found = null;
      const c = db.transaction('FILE_DATA', 'readonly').objectStore('FILE_DATA').openCursor();
      c.onsuccess = () => {
        const cur = c.result;
        if (!cur) { db.close(); return res(found); }
        if (typeof cur.key === 'string' && /anmacha_quest2\.save$/.test(cur.key) && cur.value && cur.value.contents) found = parseGodotSave(new Uint8Array(cur.value.contents));
        cur.continue();
      };
      c.onerror = () => { db.close(); res(found); };
    };
  });
}
