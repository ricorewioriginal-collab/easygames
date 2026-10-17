/* Spielstände: 3 Slots, Autosave, Kreativ- und Herausforderungs-Stand, Einstellungen.
   Schlüssel: anmachaPodcastTycoon.<slot>.v1 (Präfix passt zu cloud/anmacha-cloud.js). Jeder geprüfte
   Speichervorgang wird zusätzlich als „.lastGood“ abgelegt; ein kaputter Stand wird daraus wiederhergestellt. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const PREFIX = 'anmachaPodcastTycoon', SAVE_SCHEMA = 1;
  const SLOTS = ['slot1', 'slot2', 'slot3', 'auto', 'creative', 'challenge'];
  const SLOT_NAMES = { slot1: 'Spielstand 1', slot2: 'Spielstand 2', slot3: 'Spielstand 3', auto: 'Automatisch', creative: 'Kreativmodus', challenge: 'Herausforderung' };

  // Migrationen: von Version n auf n+1 (Zustand wird an Ort und Stelle angepasst)
  const MIGRATE = {
    0: s => {
      s.stats = s.stats || {}; s.stats.distinctRubrics = s.stats.distinctRubrics || {};
      (s.episodes || []).forEach(e => { s.stats.distinctRubrics[e.rubric] = true; });
      s.story = s.story || { chaos: 0, publikum: 0, legende: 0, ending: null, choices: {} };
      s.v = 1;
    }
  };
  function valid(s) {
    return s && typeof s === 'object' && s.time && Number.isFinite(s.time.day) && Number.isFinite(s.money) && s.lots && s.lots.studio &&
      Array.isArray(s.lots.studio.objs) && Array.isArray(s.episodes) && s.missions && s.hosts;
  }
  function migrate(state, from) {
    let v = Number.isFinite(state.v) ? state.v : from || 0;
    while (v < SAVE_SCHEMA) { if (!MIGRATE[v]) throw new Error('Keine Migration von Version ' + v); MIGRATE[v](state); v++; }
    state.v = SAVE_SCHEMA; return state;
  }
  function clean(st) {
    // nur Daten, keine berechneten Zwischenspeicher
    const o = {}; Object.keys(st).forEach(k => { if (k[0] !== '_') o[k] = st[k]; }); return o;
  }

  function create(storage) {
    let store = storage;
    if (!store) { try { store = root.localStorage; store.setItem(PREFIX + '.probe', '1'); store.removeItem(PREFIX + '.probe'); } catch (e) { store = null; } }
    const mem = {};
    const get = k => { try { return store ? store.getItem(k) : (k in mem ? mem[k] : null); } catch (e) { return null; } };
    const set = (k, v) => { try { if (store) store.setItem(k, v); else mem[k] = v; return true; } catch (e) { return false; } };
    const del = k => { try { if (store) store.removeItem(k); else delete mem[k]; } catch (e) { /* egal */ } };
    const key = slot => PREFIX + '.' + slot + '.v1';
    function parse(raw) {
      if (!raw) return null;
      try {
        const env = JSON.parse(raw); if (!env || env.game !== 'anmacha-podcast-tycoon' || !env.state) return null;
        const st = migrate(env.state, env.saveSchema); return valid(st) ? { st, meta: env.meta || {}, at: env.at } : null;
      } catch (e) { return null; }
    }
    const repo = {
      SLOTS, SLOT_NAMES, key, available: !!store,
      save(slot, st) {
        if (!SLOTS.includes(slot)) return { ok: false, err: 'Unbekannter Slot.' };
        const env = { saveSchema: SAVE_SCHEMA, game: 'anmacha-podcast-tycoon', version: PT.VERSION || '1', at: Date.now(),
          meta: { mode: st.mode, day: st.time.day, money: Math.round(st.money), fans: st.fans, episodes: st.episodes.length, chapter: st.chapter || 1, name: st.name, diff: st.diff }, state: clean(st) };
        let raw; try { raw = JSON.stringify(env); } catch (e) { return { ok: false, err: 'Spielstand konnte nicht umgewandelt werden.' }; }
        if (!set(key(slot), raw)) return { ok: false, err: 'Speicher voll oder gesperrt.' };
        // Prüfen, was wirklich im Speicher steht; nur ein lesbarer Stand wird zur Sicherung
        if (!parse(get(key(slot)))) return { ok: false, err: 'Spielstand ließ sich nicht prüfen.' };
        set(key(slot) + '.lastGood', raw);
        return { ok: true, bytes: raw.length };
      },
      load(slot) {
        const raw = get(key(slot)), p = parse(raw);
        if (p) return { ok: true, state: p.st, meta: p.meta, at: p.at };
        const bak = parse(get(key(slot) + '.lastGood'));
        if (bak) return { ok: true, state: bak.st, meta: bak.meta, at: bak.at, restored: true };
        return { ok: false, err: raw ? 'Spielstand beschädigt.' : 'Leer', empty: !raw };
      },
      remove(slot) { del(key(slot)); del(key(slot) + '.lastGood'); return { ok: true }; },
      list() {
        return SLOTS.map(slot => { const p = parse(get(key(slot))) || parse(get(key(slot) + '.lastGood')); return p ? { slot, name: SLOT_NAMES[slot], meta: p.meta, at: p.at } : null; }).filter(Boolean);
      },
      latest() { return repo.list().sort((a, b) => (b.at || 0) - (a.at || 0))[0] || null; },
      settings(defaults) { try { return Object.assign({}, defaults, JSON.parse(get(PREFIX + '.settings.v1') || '{}')); } catch (e) { return Object.assign({}, defaults); } },
      saveSettings(s) { return set(PREFIX + '.settings.v1', JSON.stringify(s)); },
      best() { try { return JSON.parse(get(PREFIX + '.best.v1') || '{}'); } catch (e) { return {}; } },
      saveBest(b) { return set(PREFIX + '.best.v1', JSON.stringify(b)); },
      /** Autosave mit Entprellung: höchstens alle `ms` Millisekunden. */
      autosaver(getState, slotFn, ms) {
        let t = null, last = 0;
        const run = () => { t = null; last = Date.now(); const st = getState(); if (st) repo.save(slotFn(st), st); };
        return { poke() { if (t) return; const wait = Math.max(0, (ms || 4000) - (Date.now() - last)); t = setTimeout(run, wait); }, now() { if (t) clearTimeout(t); run(); } };
      }
    };
    return repo;
  }
  PT.Save = { create, PREFIX, SAVE_SCHEMA, valid, migrate };
  if (typeof module !== 'undefined' && module.exports) module.exports = PT.Save;
})(typeof window !== 'undefined' ? window : globalThis);
