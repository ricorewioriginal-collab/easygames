/* Wobbel – Eigene Level (localStorage). Eintrag: {id, name, world, map, verified:{moves,pushes,by}|null, updated} */
const KEY = 'wobbelCustom1';
let list = []; try { const r = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(r)) list = r.filter(e => e && Array.isArray(e.map)); } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } };
export const Custom = {
  all: () => list.slice().sort((a, b) => b.updated - a.updated),
  get: id => list.find(e => e.id === id) || null,
  save(e) { const old = list.find(x => x.id === e.id); const entry = Object.assign(old || {}, e, { updated: Date.now() }); if (!entry.id) entry.id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); if (!old) list.push(entry); persist(); return entry; },
  remove(id) { list = list.filter(e => e.id !== id); persist(); },
  count: () => list.length
};
