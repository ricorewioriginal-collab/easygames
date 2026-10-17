/* AnMaCha Podcast Tycoon 3D – Mehrspur-Schnitteditor.
   PT.EditorModel: reine Logik ohne DOM (Spuren, Clips, Aufgaben aus dem Seed, Bearbeitungsschritte, Wertung, Bot).
   PT.Editor.open(host, opts, done): Oberfläche mit Canvas-Zeitleiste, Knöpfen, Tastatur und Touch.
   Zeiten in Sekunden „Spielzeit“, auf 0,01 s gerundet (Determinismus, identisches Rückgängig/Wiederholen). */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const r2 = v => Math.round(v * 100) / 100;
  const fin = v => typeof v === 'number' && isFinite(v);
  const FORMATS = { kurz: 60, normal: 90, lang: 120 };
  const INTRO = 4, OUTRO = 4, GAP_OK = 0.8;
  const COLORS = { marco: '#6ef0ff', andrew: '#ffb02e', guest: '#c58bff', music: '#4be08a', atmo: '#8f98c8' };
  const VOICE = { marco: 150, andrew: 210, guest: 300 };
  // Aufgaben je Schwierigkeit (Locker, Standard, Profi)
  const CFG = [
    { um: 2, pause: 1, noise: 1, gain: 0, overlap: 0, order: false, misplace: false },
    { um: 3, pause: 2, noise: 1, gain: 1, overlap: 1, order: true, misplace: false },
    { um: 4, pause: 3, noise: 2, gain: 2, overlap: 2, order: true, misplace: true }
  ];
  const PRIO = { order: 0, overlap: 1, um: 2, noise: 3, gain: 4, pause: 5, fade: 6, intro: 7, outro: 8 };
  // kleiner Ganzzahl-Hash für Wellenform und Silben (nur Darstellung/Ton)
  function h2(a, b) {
    let x = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
    x = Math.imul(x ^ (x >>> 13), 1274126177);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
  }
  function tStr(t) { t = Math.max(0, Math.round(t)); const m = Math.floor(t / 60), s = t % 60; return m + ':' + (s < 10 ? '0' : '') + s; }

  /* ---------------------------------------------------------------- Modell */
  const M = PT.EditorModel = {};
  M.FORMATS = FORMATS;

  function rubricInfo(id) {
    const list = PT.DATA && PT.DATA.rubrics || [];
    const r = list.find(x => x.id === id);
    return r ? { id, name: r.short || r.name, color: r.color || '#6ea8ff', host: r.host || 'both' } : { id, name: String(id), color: '#6ea8ff', host: 'both' };
  }

  M.create = function (opts) {
    const o = opts || {};
    const diff = clamp(o.difficulty | 0, 0, 2), cfg = CFG[diff];
    const format = FORMATS[o.format] ? o.format : 'normal', D = FORMATS[format];
    const seed = (o.seed >>> 0) || 1;
    const segIds = (Array.isArray(o.segments) && o.segments.length ? o.segments : ['wenig', 'tec']).slice(0, 5).map(String);
    const rs = { seed: (seed ^ PT.hash(format + '|' + diff + '|' + segIds.join(',') + '|' + (o.guest ? 1 : 0))) >>> 0 };
    const hosts = Array.isArray(o.hosts) ? o.hosts : [];
    const guest = !!o.guest;
    const tracks = [
      { id: 'marco', name: String(hosts[0] || 'Marco'), kind: 'speech' },
      { id: 'andrew', name: String(hosts[1] || 'Andrew'), kind: 'speech' }
    ];
    if (guest) tracks.push({ id: 'guest', name: String(o.guestName || (typeof o.guest === 'string' ? 'Gast' : 'Gast')), kind: 'speech' });
    tracks.push({ id: 'music', name: 'Musik', kind: 'music' }, { id: 'atmo', name: 'Atmo', kind: 'atmo' });
    tracks.forEach(t => { t.color = COLORS[t.id]; });
    const segs = segIds.map(rubricInfo);

    // Sprechbeiträge je Rubrik-Block erzeugen
    const people = guest ? ['marco', 'andrew', 'guest'] : ['marco', 'andrew'];
    const share = (D - INTRO - OUTRO - 3) / segs.length;
    const items = [];
    segs.forEach((sg, si) => {
      let used = 0, first = true;
      let who = sg.host === 'andrew' ? 'andrew' : sg.host === 'marco' ? 'marco' : PT.pick(rs, ['marco', 'andrew']);
      while (used < share - 2.4) {
        let len = r2(3 + PT.rand(rs) * 3.5);
        const rest = share - used - 0.25;
        if (rest - len < 3) len = r2(clamp(rest, 2.5, 7));
        items.push({ seg: si, track: who, len, first, gap: first ? 0.4 : r2(0.15 + PT.rand(rs) * 0.2) });
        used += len + 0.25; first = false;
        who = PT.pick(rs, people.filter(p => p !== who));
      }
    });
    const srcs = {};
    items.forEach((it, i) => { it.src = 's' + i; srcs[it.src] = { id: it.src, n: i + 1, track: it.track, seg: it.seg, len: it.len, lvl: 0, noise: false, ums: [] }; });

    const problems = [];
    let pid = 0;
    const addP = (type, extra) => problems.push(Object.assign({ id: 'p' + (++pid), type }, extra || {}));
    const idx = items.map((_, i) => i);
    // „Ähm“-Stellen (zusätzliches Material mitten im Satz)
    const umSet = PT.shuffle(rs, idx.filter(i => items[i].len >= 3)).slice(0, cfg.um);
    umSet.sort((a, b) => a - b).forEach(i => {
      const s = srcs[items[i].src], u = r2(0.6 + PT.rand(rs) * 0.4), a = r2(s.len * (0.35 + PT.rand(rs) * 0.3));
      s.ums.push([a, r2(a + u)]); s.len = r2(s.len + u);
      addP('um', { src: s.id });
    });
    // Überlappungen (zwei Sprecher reden gleichzeitig)
    const ovSet = [];
    PT.shuffle(rs, idx.filter(i => i > 0 && !items[i].first && items[i - 1].track !== items[i].track && srcs[items[i - 1].src].len >= 3.5 && umSet.indexOf(i - 1) < 0))
      .forEach(i => { if (ovSet.length < cfg.overlap && ovSet.indexOf(i - 1) < 0 && ovSet.indexOf(i + 1) < 0) ovSet.push(i); });
    ovSet.sort((a, b) => a - b).forEach(i => { items[i].gap = -r2(1 + PT.rand(rs)); addP('overlap', { src: items[i].src }); });
    // lange Pausen
    PT.shuffle(rs, idx.filter(i => i > 0 && !items[i].first && ovSet.indexOf(i) < 0 && ovSet.indexOf(i - 1) < 0)).slice(0, cfg.pause)
      .sort((a, b) => a - b).forEach(i => { items[i].gap = r2(2 + PT.rand(rs) * 1.5); addP('pause', { src: items[i].src }); });
    // Rauschen und falscher Pegel
    const noiseSet = PT.shuffle(rs, idx).slice(0, cfg.noise).sort((a, b) => a - b);
    noiseSet.forEach(i => { srcs[items[i].src].noise = true; addP('noise', { src: items[i].src }); });
    PT.shuffle(rs, idx.filter(i => noiseSet.indexOf(i) < 0)).slice(0, cfg.gain).sort((a, b) => a - b).forEach(i => {
      srcs[items[i].src].lvl = (PT.rand(rs) < 0.5 ? -1 : 1) * (6 + 2 * PT.randInt(rs, 0, 2)); addP('gain', { src: items[i].src });
    });
    // Reihenfolge der Rubrik-Blöcke vertauschen
    let order = segs.map((_, i) => i);
    if (cfg.order && segs.length >= 2) {
      const a = PT.randInt(rs, 0, segs.length - 1); let b = PT.randInt(rs, 0, segs.length - 2); if (b >= a) b++;
      const x = order[a]; order[a] = order[b]; order[b] = x; addP('order');
    }
    // Zeitleiste auslegen
    const clips = [];
    let nextId = 0, t = INTRO + 0.2, firstBlock = true;
    const nid = () => 'c' + (++nextId);
    order.forEach(si => {
      items.filter(it => it.seg === si).forEach(it => {
        if (!(it.first && firstBlock)) t += it.gap;
        clips.push({ id: nid(), track: it.track, kind: 'speech', src: it.src, seg: si, off: 0, start: r2(t), len: srcs[it.src].len, gain: 0, nr: false, fi: 0, fo: 0 });
        t = r2(t + srcs[it.src].len);
      });
      firstBlock = false;
    });
    const progEnd = t;
    clips.push({ id: nid(), track: 'music', kind: 'bed', start: INTRO, len: 8, off: 0, gain: 0, nr: true, fi: 0, fo: 0 });
    addP('fade');
    if (cfg.misplace) {
      clips.push({ id: nid(), track: 'music', kind: 'intro', start: r2(progEnd * (0.25 + PT.rand(rs) * 0.1)), len: INTRO, off: 0, gain: 0, nr: true, fi: 0, fo: 0 });
      clips.push({ id: nid(), track: 'music', kind: 'outro', start: r2(progEnd * (0.5 + PT.rand(rs) * 0.1)), len: OUTRO, off: 0, gain: 0, nr: true, fi: 0, fo: 0 });
    }
    addP('intro'); addP('outro');
    clips.push({ id: nid(), track: 'atmo', kind: 'atmo', start: 0, len: r2(progEnd + OUTRO), off: 0, gain: 0, nr: true, fi: 1.5, fo: 1.5 });

    return {
      v: 1, seed, diff, format, dur: D, T: Math.ceil(D * 1.25), marks: diff < 2,
      tracks, segs, srcs, clips, problems, nextId, hist: [], fut: []
    };
  };

  /* ---- Helfer ---- */
  const end = c => r2(c.start + c.len);
  const ov = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  const speech = m => m.clips.filter(c => c.kind === 'speech');
  const ofSrc = (m, sid) => m.clips.filter(c => c.src === sid);
  const byId = (m, id) => m.clips.find(c => c.id === id);
  const trackOf = (m, id) => m.tracks.find(t => t.id === id);
  const kindClip = (m, k) => m.clips.find(c => c.kind === k);
  function snap(m) { return JSON.stringify({ c: m.clips, n: m.nextId }); }
  function restore(m, s) { const o = JSON.parse(s); m.clips = o.c; m.nextId = o.n; }
  function newClip(m, from, patch) { m.nextId++; return Object.assign({}, from, { id: 'c' + m.nextId }, patch); }
  M.end = end;
  M.speech = speech;
  /** Rubrik-Blöcke nach aktueller Lage: [{seg, start, end}] sortiert nach Start. */
  M.blocks = function (m) {
    const out = [];
    m.segs.forEach((s, i) => {
      const cs = m.clips.filter(c => c.kind === 'speech' && c.seg === i);
      if (cs.length) out.push({ seg: i, start: Math.min.apply(null, cs.map(c => c.start)), end: Math.max.apply(null, cs.map(end)) });
    });
    return out.sort((a, b) => a.start - b.start || a.seg - b.seg);
  };
  /** Zeitpunkt (Zeitleiste) einer Quellstelle oder null. */
  function srcTime(m, sid, s) {
    const c = ofSrc(m, sid).find(x => s >= x.off - 1e-6 && s <= x.off + x.len + 1e-6);
    return c ? r2(c.start + (s - c.off)) : null;
  }
  function firstPiece(m, sid) { const cs = ofSrc(m, sid); return cs.length ? cs.reduce((a, b) => b.off < a.off ? b : a) : null; }

  /* ---- Bearbeitungsschritte ---- */
  function cutClip(m, c, from, to) {
    const a = Math.max(from, c.start), b = Math.min(to, end(c));
    if (b - a <= 0.001) return false;
    const i = m.clips.indexOf(c);
    const left = r2(a - c.start), right = r2(end(c) - b);
    const parts = [];
    if (left >= 0.05) parts.push(Object.assign({}, c, { len: left, fo: Math.min(c.fo, left / 2) }));
    if (right >= 0.05) {
      const p = { start: r2(b), off: r2(c.off + (b - c.start)), len: right, fi: Math.min(c.fi, right / 2) };
      parts.push(parts.length ? newClip(m, c, p) : Object.assign({}, c, p));
    }
    if (parts.length === 2) { parts[0].fo = 0; parts[1].fi = 0; }
    m.clips.splice.apply(m.clips, [i, 1].concat(parts));
    return true;
  }
  const OPS = {
    cut(m, op) {
      if (!trackOf(m, op.track) || !fin(op.from) || !fin(op.to)) return { ok: false, err: 'Ungültiger Schnitt' };
      const a = r2(Math.min(op.from, op.to)), b = r2(Math.max(op.from, op.to));
      if (b - a < 0.05) return { ok: false, err: 'Bereich zu kurz' };
      let n = 0;
      m.clips.filter(c => c.track === op.track).forEach(c => { if (cutClip(m, c, a, b)) n++; });
      return n ? { ok: true, msg: 'Geschnitten' } : { ok: false, err: 'Dort liegt nichts' };
    },
    split(m, op) {
      if (!fin(op.at)) return { ok: false, err: 'Ungültig' };
      const at = r2(op.at);
      const c = op.clip ? byId(m, op.clip) : m.clips.slice().reverse().find(x => x.track === op.track && at > x.start + 0.05 && at < end(x) - 0.05);
      if (!c || !(at > c.start + 0.05 && at < end(c) - 0.05)) return { ok: false, err: 'Hier ist kein Clip zum Teilen' };
      const i = m.clips.indexOf(c), l = r2(at - c.start);
      const b = newClip(m, c, { start: at, off: r2(c.off + l), len: r2(c.len - l), fi: 0 });
      c.len = l; c.fo = 0;
      m.clips.splice(i + 1, 0, b);
      return { ok: true, msg: 'Geteilt', clip: b.id };
    },
    move(m, op) {
      const c = byId(m, op.clip); if (!c || !fin(op.dt)) return { ok: false, err: 'Kein Clip gewählt' };
      const set = op.ripple && c.kind === 'speech' ? m.clips.filter(x => x.kind === 'speech' && x.start >= c.start - 0.001) : [c];
      const lo = Math.min.apply(null, set.map(x => x.start)), hi = Math.max.apply(null, set.map(end));
      const dt = r2(clamp(op.dt, -lo, m.T - hi));
      if (Math.abs(dt) < 0.01) return { ok: false, err: 'Keine Bewegung' };
      set.forEach(x => { x.start = r2(x.start + dt); });
      return { ok: true, msg: 'Verschoben' };
    },
    fade(m, op) {
      const c = byId(m, op.clip); if (!c || !fin(op.len) || (op.side !== 'in' && op.side !== 'out')) return { ok: false, err: 'Kein Clip gewählt' };
      c[op.side === 'in' ? 'fi' : 'fo'] = r2(clamp(op.len, 0, Math.min(5, c.len / 2)));
      return { ok: true, msg: op.len > 0 ? (op.side === 'in' ? 'Eingeblendet' : 'Ausgeblendet') : 'Blende entfernt' };
    },
    noise(m, op) {
      const c = byId(m, op.clip); if (!c) return { ok: false, err: 'Kein Clip gewählt' };
      if (c.nr) return { ok: false, err: 'Clip ist schon sauber' };
      c.nr = true; return { ok: true, msg: 'Entrauscht' };
    },
    gain(m, op) {
      const c = byId(m, op.clip); if (!c || !fin(op.db)) return { ok: false, err: 'Kein Clip gewählt' };
      c.gain = r2(clamp(c.gain + op.db, -12, 12)); return { ok: true, msg: 'Pegel ' + (c.gain > 0 ? '+' : '') + c.gain + ' dB' };
    },
    place(m, op) {
      if ((op.kind !== 'intro' && op.kind !== 'outro') || !fin(op.at)) return { ok: false, err: 'Ungültig' };
      const len = op.kind === 'intro' ? INTRO : OUTRO, at = r2(clamp(op.at, 0, m.T - len));
      let c = kindClip(m, op.kind);
      if (c) { c.start = at; c.len = len; c.off = 0; }
      else { m.nextId++; c = { id: 'c' + m.nextId, track: 'music', kind: op.kind, start: at, len, off: 0, gain: 0, nr: true, fi: 0, fo: 0 }; m.clips.push(c); }
      return { ok: true, msg: (op.kind === 'intro' ? 'Intro' : 'Outro') + ' bei ' + tStr(at), clip: c.id };
    },
    delete(m, op) {
      const c = byId(m, op.clip); if (!c) return { ok: false, err: 'Kein Clip gewählt' };
      m.clips.splice(m.clips.indexOf(c), 1); return { ok: true, msg: 'Gelöscht' };
    },
    swap(m, op) {
      const bl = M.blocks(m), ia = bl.findIndex(b => b.seg === op.a), ib = bl.findIndex(b => b.seg === op.b);
      if (ia < 0 || ib < 0 || ia === ib) return { ok: false, err: 'Zwei verschiedene Rubrik-Blöcke wählen' };
      const gaps = bl.slice(1).map((b, i) => Math.max(0, r2(b.start - bl[i].end)));
      const neu = bl.slice(); neu[ia] = bl[ib]; neu[ib] = bl[ia];
      let cur = bl[0].start;
      neu.forEach((b, i) => {
        const d = r2(cur - b.start);
        m.clips.forEach(c => { if (c.kind === 'speech' && c.seg === b.seg) c.start = r2(c.start + d); });
        cur = r2(b.end + d + (gaps[i] || 0));
      });
      return { ok: true, msg: 'Blöcke getauscht' };
    }
  };
  /** Einen Schritt anwenden. Ungültige Schritte ändern nichts und liefern {ok:false, err}. */
  M.apply = function (m, op) {
    if (!m || !Array.isArray(m.clips) || !op || typeof op !== 'object') return { ok: false, err: 'Ungültig' };
    if (op.t === 'undo' || op.t === 'redo') {
      const from = op.t === 'undo' ? m.hist : m.fut, to = op.t === 'undo' ? m.fut : m.hist;
      if (!from.length) return { ok: false, err: op.t === 'undo' ? 'Nichts rückgängig zu machen' : 'Nichts zu wiederholen' };
      to.push(snap(m)); restore(m, from.pop());
      return { ok: true, msg: op.t === 'undo' ? 'Rückgängig' : 'Wiederholt' };
    }
    const fn = Object.prototype.hasOwnProperty.call(OPS, op.t) && OPS[op.t];
    if (!fn) return { ok: false, err: 'Unbekannte Aktion' };
    const before = snap(m);
    let res;
    try { res = fn(m, op); } catch (e) { res = { ok: false, err: 'Aktion fehlgeschlagen' }; }
    if (!res || !res.ok) { restore(m, before); return res || { ok: false, err: 'Ungültig' }; }
    if (snap(m) === before) return { ok: false, err: 'Keine Änderung' };
    m.hist.push(before); if (m.hist.length > 100) m.hist.shift();
    m.fut = [];
    return res;
  };

  /* ---- Prüfen und Werten ---- */
  function checkOne(m, p) {
    const s = p.src && m.srcs[p.src], who = s ? trackOf(m, s.track).name : '';
    const cs = s ? ofSrc(m, s.id) : [];
    const fp = s ? firstPiece(m, s.id) : null;
    const at = fp ? fp.start : null;
    switch (p.type) {
      case 'um': {
        const u = s.ums[0], left = cs.some(c => ov(c.off, c.off + c.len, u[0], u[1]) > 0.05), t = srcTime(m, s.id, u[0]);
        return { label: '„Ähm“ von ' + who + (left && t != null ? ' bei ' + tStr(t) : '') + ' herausschneiden', ok: !left, at: t, clip: fp && fp.id };
      }
      case 'pause': {
        if (!fp) return { label: 'Lange Pause vor ' + who + ' schließen', ok: false, at: null };
        let prev = -Infinity;
        speech(m).forEach(c => { if (c.id !== fp.id && c.start < fp.start - 0.001) prev = Math.max(prev, end(c)); });
        const ok = prev === -Infinity || fp.start - prev <= GAP_OK;
        return { label: 'Lange Pause vor ' + who + (ok ? '' : ' bei ' + tStr(prev)) + ' schließen', ok, at: ok ? at : prev, clip: fp.id };
      }
      case 'overlap': {
        const sp = speech(m);
        const ok = cs.length > 0 && cs.every(c => sp.every(o => o.track === c.track || ov(c.start, end(c), o.start, end(o)) <= 0.15));
        return { label: 'Überlappung von ' + who + (ok ? '' : ' bei ' + tStr(at)) + ' auflösen', ok, at, clip: fp && fp.id };
      }
      case 'noise':
        return { label: 'Rauschen bei ' + who + (at != null ? ' (' + tStr(at) + ')' : '') + ' entfernen', ok: cs.length > 0 && cs.every(c => c.nr), at, clip: fp && fp.id };
      case 'gain':
        return { label: (s.lvl > 0 ? 'Zu laute' : 'Zu leise') + ' Stelle von ' + who + (at != null ? ' (' + tStr(at) + ')' : '') + ' angleichen', ok: cs.length > 0 && cs.every(c => Math.abs(s.lvl + c.gain) <= 1.5), at, clip: fp && fp.id };
      case 'intro': {
        const c = kindClip(m, 'intro'), sp = speech(m), first = sp.length ? Math.min.apply(null, sp.map(x => x.start)) : 0;
        return { label: 'Intro an den Anfang setzen', ok: !!c && c.start <= 0.3 && c.len >= INTRO - 0.05 && first >= end(c) - 0.3, at: 0, clip: c && c.id };
      }
      case 'outro': {
        const c = kindClip(m, 'outro'), sp = speech(m), last = sp.length ? Math.max.apply(null, sp.map(end)) : 0;
        return { label: 'Outro direkt ans Ende setzen', ok: !!c && c.len >= OUTRO - 0.05 && c.start >= last - 0.3 && c.start <= last + GAP_OK, at: last, clip: c && c.id };
      }
      case 'fade': {
        const c = kindClip(m, 'bed');
        return { label: 'Musikbett ein- und ausblenden', ok: !!c && c.fi >= 0.9 && c.fo >= 0.9, at: c ? c.start : null, clip: c && c.id };
      }
      case 'order': {
        const bl = M.blocks(m);
        const ok = bl.length === m.segs.length && bl.every((b, i) => b.seg === i && (i === 0 || bl[i - 1].end <= b.start + 0.3));
        return { label: 'Rubriken in Reihenfolge: ' + m.segs.map(x => x.name).join(' › '), ok, at: bl.length ? bl[0].start : 0 };
      }
    }
    return { label: '?', ok: false };
  }
  /** Lücken (> 0,8 s) im Programm aus Sprache, Intro und Outro. */
  M.gaps = function (m) {
    const iv = m.clips.filter(c => c.kind === 'speech' || c.kind === 'intro' || c.kind === 'outro').map(c => [c.start, end(c)]).sort((a, b) => a[0] - b[0]);
    const out = []; let e = iv.length ? iv[0][1] : 0;
    for (let i = 1; i < iv.length; i++) { if (iv[i][0] - e > GAP_OK) out.push([e, iv[i][0]]); e = Math.max(e, iv[i][1]); }
    return out;
  };
  M.checks = function (m) {
    const ps = m.problems.slice().sort((a, b) => (PRIO[a.type] - PRIO[b.type]) || (a.id < b.id ? -1 : 1));
    const n = ps.length, base = Math.floor(100 / n), rest = 100 - base * n;
    const tasks = ps.map((p, i) => Object.assign({ id: p.id, type: p.type, pts: base + (i < rest ? 1 : 0) }, checkOne(m, p)));
    // Abzug: gute Stellen weggeschnitten
    let good = 0, kept = 0, umsGone = 0;
    Object.keys(m.srcs).forEach(k => {
      const s = m.srcs[k], ul = s.ums.reduce((a, u) => a + u[1] - u[0], 0);
      good += s.len - ul;
      ofSrc(m, k).forEach(c => { kept += c.len - s.ums.reduce((a, u) => a + ov(c.off, c.off + c.len, u[0], u[1]), 0); });
    });
    tasks.forEach(t => { if (t.type === 'um' && t.ok) umsGone++; });
    const lost = good - kept - (0.5 + 0.4 * umsGone);
    const pen = [];
    const cutPen = lost > 0 ? Math.min(30, Math.round(lost * 6)) : 0;
    if (cutPen) pen.push({ label: 'Zu viel geschnitten: ' + PT.round(good - kept, 1).toString().replace('.', ',') + ' s gute Aufnahme fehlen', ok: false, pts: -cutPen, penalty: true });
    const gaps = M.gaps(m);
    if (gaps.length) pen.push({ label: gaps.length + (gaps.length === 1 ? ' Lücke' : ' Lücken') + ' im Programm', ok: false, pts: -Math.min(15, gaps.length * 3), penalty: true, at: gaps[0][0] });
    const sp = speech(m); let ovn = 0, ovAt = null;
    for (let i = 0; i < sp.length; i++) for (let j = i + 1; j < sp.length; j++) {
      if (sp[i].track !== sp[j].track && ov(sp[i].start, end(sp[i]), sp[j].start, end(sp[j])) > 0.3) { ovn++; if (ovAt == null) ovAt = Math.max(sp[i].start, sp[j].start); }
    }
    if (ovn) pen.push({ label: ovn + '× reden zwei Personen gleichzeitig', ok: false, pts: -Math.min(12, ovn * 3), penalty: true, at: ovAt });
    return tasks.concat(pen);
  };
  M.score = function (m) {
    const checks = M.checks(m), tasks = checks.filter(c => !c.penalty), pens = checks.filter(c => c.penalty);
    const done = tasks.filter(c => c.ok).length;
    const sum = checks.reduce((a, c) => a + (c.penalty ? c.pts : c.ok ? c.pts : 0), 0);
    const score = clamp(Math.round(sum), 0, 100);
    let detail;
    if (done === tasks.length && !pens.length) detail = 'Sauberer Schnitt – alle ' + tasks.length + ' Aufgaben erledigt.';
    else {
      detail = done + ' von ' + tasks.length + ' Schnittaufgaben erledigt';
      const g = pens.find(p => /Lücke/.test(p.label)), c = pens.find(p => /geschnitten/.test(p.label)), o = pens.find(p => /gleichzeitig/.test(p.label));
      const extra = [g && 'Lücken bleiben', c && 'zu viel weggeschnitten', o && 'Stimmen überlappen'].filter(Boolean);
      detail += (extra.length ? ', ' + extra.join(', ') : '') + '.';
    }
    return { score, detail, checks, done, total: tasks.length };
  };

  /* ---- Bot: liefert Schritte, skill 1 ≈ perfekt ---- */
  M.clone = function (m) { const c = JSON.parse(JSON.stringify(m)); c.hist = []; c.fut = []; return c; };
  M.bot = function (m, skill) {
    skill = clamp(+skill || 0, 0, 1);
    if (!m || skill <= 0) return [];
    const w = M.clone(m), ops = [];
    const run = op => { if (M.apply(w, op).ok) ops.push(op); };
    const ps = w.problems.slice().sort((a, b) => (PRIO[a.type] - PRIO[b.type]) || (a.id < b.id ? -1 : 1));
    const k = Math.round(skill * ps.length), tidy = skill >= 0.8;
    ps.slice(0, k).forEach(p => {
      const s = p.src && w.srcs[p.src];
      if (p.type === 'order') {
        for (let n = 0; n < w.segs.length; n++) {
          const bl = M.blocks(w), i = bl.findIndex((b, j) => b.seg !== j);
          if (i < 0) break; run({ t: 'swap', a: bl[i].seg, b: i });
        }
      } else if (p.type === 'overlap') {
        ofSrc(w, s.id).forEach(c => {
          let e = -Infinity; speech(w).forEach(o => { if (o.track !== c.track && o.start < c.start && end(o) > c.start) e = Math.max(e, end(o)); });
          if (e > -Infinity) run({ t: 'move', clip: c.id, dt: r2(e - c.start + 0.05), ripple: true });
        });
      } else if (p.type === 'um') {
        const u = s.ums[0], c = ofSrc(w, s.id).find(x => x.off <= u[0] && x.off + x.len >= u[1]);
        if (!c) return;
        const from = r2(c.start + u[0] - c.off - 0.05), to = r2(c.start + u[1] - c.off + 0.05);
        run({ t: 'cut', track: c.track, from, to });
        const r = ofSrc(w, s.id).find(x => Math.abs(x.start - to) < 0.02);
        if (tidy && r) run({ t: 'move', clip: r.id, dt: r2(from - r.start), ripple: true });
      } else if (p.type === 'noise') {
        ofSrc(w, s.id).forEach(c => { if (!c.nr) run({ t: 'noise', clip: c.id }); });
      } else if (p.type === 'gain') {
        ofSrc(w, s.id).forEach(c => { const d = -(s.lvl + c.gain); if (d) run({ t: 'gain', clip: c.id, db: d }); });
      } else if (p.type === 'pause') {
        const fp = firstPiece(w, s.id); if (!fp) return;
        let prev = -Infinity; speech(w).forEach(c => { if (c.id !== fp.id && c.start < fp.start - 0.001) prev = Math.max(prev, end(c)); });
        if (prev > -Infinity && fp.start - prev > 0.3) run({ t: 'move', clip: fp.id, dt: r2(prev + 0.2 - fp.start), ripple: true });
      } else if (p.type === 'fade') {
        const c = kindClip(w, 'bed'); if (c) { run({ t: 'fade', clip: c.id, side: 'in', len: 1.5 }); run({ t: 'fade', clip: c.id, side: 'out', len: 1.5 }); }
      } else if (p.type === 'intro') run({ t: 'place', kind: 'intro', at: 0 });
      else if (p.type === 'outro') {
        const sp = speech(w); run({ t: 'place', kind: 'outro', at: r2((sp.length ? Math.max.apply(null, sp.map(end)) : 0) + 0.1) });
      }
    });
    return ops;
  };

  /* ---------------------------------------------------------------- Oberfläche */
  const CSS = `
.pt-ed{position:relative;display:flex;flex-direction:column;gap:8px;width:100%;height:100%;min-height:0;box-sizing:border-box;overflow:auto;
  background:#10142a;color:#e8ecff;font:15px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:8px;-webkit-tap-highlight-color:transparent}
.pt-ed *{box-sizing:border-box}
.pt-ed-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.pt-ed-title{font-weight:700;font-size:18px;color:#ff8a1e;margin-right:auto}
.pt-ed-stat{font-size:14px;color:#cfd6ff;background:#1a2042;border-radius:999px;padding:6px 12px;white-space:nowrap}
.pt-ed-stat b{color:#fff}
.pt-ed-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.pt-ed-grp{display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:3px;border-radius:12px;background:#151a35}
.pt-ed-btn{min-height:44px;min-width:44px;padding:0 10px;border-radius:10px;border:1px solid #2c3566;background:#1d2342;color:#e8ecff;
  font:inherit;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;touch-action:manipulation;user-select:none}
.pt-ed-btn:hover{border-color:#ff8a1e}
.pt-ed-btn:focus-visible{outline:2px solid #ff8a1e;outline-offset:1px}
.pt-ed-btn:disabled{opacity:.4;cursor:default;border-color:#2c3566}
.pt-ed-btn.pt-ed-on{background:#ff8a1e;color:#1a1000;border-color:#ff8a1e;font-weight:700}
.pt-ed-btn.pt-ed-go{background:#2f9e64;border-color:#4be08a;font-weight:700}
.pt-ed-btn.pt-ed-play{background:#ff8a1e;color:#1a1000;font-weight:700;min-width:64px}
.pt-ed-lbl{display:inline}
.pt-ed-main{display:flex;gap:8px;min-height:0;align-items:flex-start}
.pt-ed-tl{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px}
.pt-ed-cv{display:block;width:100%;border-radius:10px;touch-action:none;background:#0c1022;cursor:crosshair}
.pt-ed-scroll{width:100%;accent-color:#ff8a1e;height:28px;margin:0}
.pt-ed-info{min-height:22px;font-size:14px;color:#cfd6ff}
.pt-ed-info .pt-ed-msg{color:#ff8a1e;margin-left:8px}
.pt-ed-side{flex:0 0 280px;background:#151a35;border-radius:12px;padding:8px 10px;max-height:100%;overflow:auto}
.pt-ed-side h3{margin:2px 0 6px;font-size:15px;color:#ff8a1e}
.pt-ed-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px}
.pt-ed-item{display:flex;gap:8px;align-items:flex-start;padding:6px 6px;border-radius:8px;cursor:pointer;font-size:14px;min-height:34px}
.pt-ed-item:hover{background:#1d2342}
.pt-ed-item i{font-style:normal;width:18px;flex:0 0 18px;text-align:center}
.pt-ed-item.pt-ed-ok{color:#4be08a}
.pt-ed-item.pt-ed-ok span{text-decoration:line-through;opacity:.8}
.pt-ed-item.pt-ed-pen{color:#ff6b86}
.pt-ed-item em{font-style:normal;margin-left:auto;opacity:.8;white-space:nowrap}
.pt-ed-help{position:absolute;inset:0;background:rgba(8,10,24,.88);display:flex;align-items:center;justify-content:center;padding:12px;z-index:5}
.pt-ed-card{background:#1a2042;border:2px solid #ff8a1e;border-radius:14px;padding:14px 16px;max-width:560px;max-height:100%;overflow:auto}
.pt-ed-card h2{margin:0 0 8px;color:#ff8a1e;font-size:20px}
.pt-ed-card ul{margin:0 0 12px;padding-left:18px}
.pt-ed-card li{margin:4px 0}
@media (max-width:820px){.pt-ed-main{flex-direction:column;align-items:stretch}.pt-ed-side{flex:none;max-height:none}}
@media (max-width:560px),(max-height:500px){.pt-ed-lbl{display:none}.pt-ed{padding:6px;gap:6px}.pt-ed-title{font-size:16px}}
@media (max-height:500px){.pt-ed-head .pt-ed-btn,.pt-ed-bar .pt-ed-btn{min-height:40px}}
`;
  function ensureCss(doc) {
    if (doc.getElementById('pt-editor-css')) return;
    const s = doc.createElement('style'); s.id = 'pt-editor-css'; s.textContent = CSS; doc.head.appendChild(s);
  }

  const E = PT.Editor = {};
  E.open = function (host, opts, done) {
    const doc = host.ownerDocument || document, win = doc.defaultView || root;
    ensureCss(doc);
    const m = M.create(opts);
    const ui = { tool: 'select', ripple: true, sel: null, track: 0, pps: 8, scroll: 0, head: 0, play: false, drag: null, swap: null, msg: '', msgUntil: 0, fitted: false };
    let closed = false, raf = 0, lastNow = 0, W = 300, H = 200, dpr = 1, ro = null, finished = false;

    host.innerHTML = '';
    const el = doc.createElement('div'); el.className = 'pt-ed';
    el.innerHTML =
      '<div class="pt-ed-head"><div class="pt-ed-title">🎚️ Schnittplatz</div>' +
      '<div class="pt-ed-stat" data-r="prog"></div><div class="pt-ed-stat" data-r="score"></div>' +
      '<button class="pt-ed-btn" data-a="help" title="Hilfe">❔<span class="pt-ed-lbl"> Hilfe</span></button>' +
      '<button class="pt-ed-btn" data-a="cancel">Abbrechen</button>' +
      '<button class="pt-ed-btn pt-ed-go" data-a="done">✅ Fertig</button></div>' +
      '<div class="pt-ed-bar">' +
      '<div class="pt-ed-grp"><button class="pt-ed-btn" data-a="home" title="Zum Anfang">⏮</button>' +
      '<button class="pt-ed-btn pt-ed-play" data-a="play" title="Abspielen (Leertaste)">▶</button>' +
      '<span class="pt-ed-stat" data-r="time">0:00</span></div>' +
      '<div class="pt-ed-grp">' +
      '<button class="pt-ed-btn" data-tool="select" title="Auswahl (1): Clip antippen, ziehen verschiebt">👆<span class="pt-ed-lbl"> Auswahl</span></button>' +
      '<button class="pt-ed-btn" data-tool="cut" title="Schnitt (2): Bereich auf einer Spur ziehen">✂️<span class="pt-ed-lbl"> Schnitt</span></button>' +
      '<button class="pt-ed-btn" data-tool="split" title="Teilen (3 / S): Clip an der Stelle teilen">🔪<span class="pt-ed-lbl"> Teilen</span></button>' +
      '<button class="pt-ed-btn" data-tool="move" title="Verschieben (4): Clip ziehen">↔️<span class="pt-ed-lbl"> Verschieben</span></button>' +
      '<button class="pt-ed-btn" data-a="ripple" title="Beim Verschieben alle späteren Sprachclips mitziehen">🧲<span class="pt-ed-lbl"> Rest mitziehen</span></button></div>' +
      '<div class="pt-ed-grp">' +
      '<button class="pt-ed-btn" data-a="fi" data-need="1" title="Einblenden">◢<span class="pt-ed-lbl"> Ein</span></button>' +
      '<button class="pt-ed-btn" data-a="fo" data-need="1" title="Ausblenden">◣<span class="pt-ed-lbl"> Aus</span></button>' +
      '<button class="pt-ed-btn" data-a="noise" data-need="1" title="Entrauschen (N)">🧹<span class="pt-ed-lbl"> Entrauschen</span></button>' +
      '<button class="pt-ed-btn" data-a="down" data-need="1" title="Leiser (−2 dB)">🔉</button>' +
      '<button class="pt-ed-btn" data-a="up" data-need="1" title="Lauter (+2 dB)">🔊</button>' +
      '<button class="pt-ed-btn" data-a="del" data-need="1" title="Löschen (Entf)">🗑</button></div>' +
      '<div class="pt-ed-grp">' +
      '<button class="pt-ed-btn" data-a="intro" title="Intro am Abspielkopf einsetzen">🎺<span class="pt-ed-lbl"> Intro</span></button>' +
      '<button class="pt-ed-btn" data-a="outro" title="Outro am Abspielkopf einsetzen">🏁<span class="pt-ed-lbl"> Outro</span></button></div>' +
      '<div class="pt-ed-grp">' +
      '<button class="pt-ed-btn" data-a="undo" title="Rückgängig (Strg+Z)">↶</button>' +
      '<button class="pt-ed-btn" data-a="redo" title="Wiederholen (Strg+Y)">↷</button>' +
      '<button class="pt-ed-btn" data-a="zout" title="Verkleinern (−)">🔍−</button>' +
      '<button class="pt-ed-btn" data-a="zin" title="Vergrößern (+)">🔍+</button></div></div>' +
      '<div class="pt-ed-main"><div class="pt-ed-tl"><canvas class="pt-ed-cv"></canvas>' +
      '<input class="pt-ed-scroll" type="range" min="0" max="1000" value="0" aria-label="Ansicht verschieben">' +
      '<div class="pt-ed-info"></div></div>' +
      '<div class="pt-ed-side"><h3>Aufgaben</h3><ul class="pt-ed-list"></ul></div></div>';
    host.appendChild(el);
    const $ = s => el.querySelector(s);
    const cv = $('.pt-ed-cv'), g = cv.getContext('2d'), range = $('.pt-ed-scroll'), info = $('.pt-ed-info'), list = $('.pt-ed-list');
    const R = { prog: $('[data-r=prog]'), score: $('[data-r=score]'), time: $('[data-r=time]'), play: $('[data-a=play]') };

    // Maße
    const L = () => ({ ruler: 22, seg: 26, th: (win.innerHeight || 800) < 500 ? 40 : W < 560 ? 46 : 56, lab: W < 560 ? 60 : 86 });
    const lay = () => { const l = L(); l.top = l.ruler + l.seg; return l; };
    const minPps = () => (W - lay().lab - 4) / m.T;
    const x2t = x => ui.scroll + (x - lay().lab) / ui.pps;
    const t2x = t => lay().lab + (t - ui.scroll) * ui.pps;
    function clampView() {
      ui.pps = clamp(ui.pps, minPps(), 160);
      const vis = (W - lay().lab) / ui.pps;
      ui.scroll = clamp(ui.scroll, 0, Math.max(0, m.T - vis));
      const mx = Math.max(0, m.T - vis);
      range.disabled = mx <= 0.01;
      range.value = mx > 0 ? Math.round(ui.scroll / mx * 1000) : 0;
    }
    function resize() {
      const w = Math.max(240, Math.round(cv.clientWidth || el.clientWidth || 320));
      dpr = Math.min(3, win.devicePixelRatio || 1);
      W = w; const l = lay();
      H = l.top + m.tracks.length * l.th + 2;
      cv.style.height = H + 'px';
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      if (!ui.fitted) { ui.pps = Math.max(minPps(), Math.min(14, (W - l.lab) / 45)); ui.fitted = true; }
      clampView(); invalidate();
    }
    function zoom(f) {
      const vis = (W - lay().lab) / ui.pps, center = ui.head >= ui.scroll && ui.head <= ui.scroll + vis ? ui.head : ui.scroll + vis / 2;
      const fx = (center - ui.scroll) / vis;
      ui.pps *= f; clampView();
      ui.scroll = center - fx * (W - lay().lab) / ui.pps; clampView(); invalidate();
    }

    // Anzeige
    function say(t) { ui.msg = t; ui.msgUntil = Date.now() + 2600; refreshInfo(); }
    function exec(op, quiet) {
      const r = M.apply(m, op);
      if (r.ok) { if (r.clip) ui.sel = r.clip; if (!byId(m, ui.sel)) ui.sel = null; refresh(); if (!quiet && r.msg) say(r.msg); if (PT.Audio) PT.Audio.fx('click'); }
      else if (!quiet) { say(r.err || 'Geht nicht'); }
      return r;
    }
    function refreshInfo() {
      const c = ui.sel && byId(m, ui.sel);
      let s;
      if (c) {
        const tr = trackOf(m, c.track), src = c.src && m.srcs[c.src];
        s = '<b>' + PT.esc(c.kind === 'speech' ? tr.name : c.kind === 'bed' ? 'Musikbett' : c.kind === 'intro' ? 'Intro' : c.kind === 'outro' ? 'Outro' : 'Atmo') + '</b> ' + tStr(c.start) + '–' + tStr(end(c));
        if (src) { const e = src.lvl + c.gain; s += ' · Pegel ' + (e > 0 ? '+' : '') + PT.round(e, 1) + ' dB' + (Math.abs(e) > 1.5 ? (e > 0 ? ' (zu laut)' : ' (zu leise)') : ''); if (src.noise && !c.nr) s += ' · rauscht'; }
        if (c.fi || c.fo) s += ' · Blende ' + c.fi + ' / ' + c.fo + ' s';
      } else s = ui.tool === 'cut' ? 'Schnitt: auf einer Spur über die Stelle ziehen.' : ui.tool === 'split' ? 'Teilen: auf den Clip tippen.' : ui.tool === 'move' ? 'Verschieben: Clip ziehen (🧲 zieht den Rest mit).' : 'Clip antippen zum Auswählen – Leiste oben antippen springt.';
      if (ui.msg && Date.now() < ui.msgUntil) s += '<span class="pt-ed-msg">' + PT.esc(ui.msg) + '</span>';
      info.innerHTML = s;
      el.querySelectorAll('[data-need]').forEach(b => { b.disabled = !c; });
      $('[data-a=undo]').disabled = !m.hist.length; $('[data-a=redo]').disabled = !m.fut.length;
    }
    function refresh() {
      const sc = M.score(m);
      R.prog.innerHTML = '<b>' + sc.done + '</b> von ' + sc.total + ' erledigt';
      R.score.innerHTML = 'Wertung <b>' + sc.score + '</b>';
      list.innerHTML = sc.checks.map((c, i) => '<li class="pt-ed-item ' + (c.penalty ? 'pt-ed-pen' : c.ok ? 'pt-ed-ok' : '') + '" data-i="' + i + '"><i>' + (c.penalty ? '⚠' : c.ok ? '✓' : '○') + '</i><span>' + PT.esc(c.label) + '</span><em>' + (c.penalty ? c.pts : (c.ok ? '+' : '') + c.pts) + '</em></li>').join('');
      list._checks = sc.checks;
      el.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('pt-ed-on', b.dataset.tool === ui.tool));
      $('[data-a=ripple]').classList.toggle('pt-ed-on', ui.ripple);
      refreshInfo(); invalidate();
    }
    function seek(t) { ui.head = r2(clamp(t, 0, m.T)); follow(); invalidate(); }
    function follow() {
      const vis = (W - lay().lab) / ui.pps;
      if (ui.head < ui.scroll || ui.head > ui.scroll + vis * 0.92) { ui.scroll = ui.head - vis * 0.1; clampView(); }
    }

    // Zeichnen
    function rr(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
    function draw() {
      const l = lay(), vis0 = ui.scroll, vis1 = ui.scroll + (W - l.lab) / ui.pps;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = '#0c1022'; g.fillRect(0, 0, W, H);
      // Spurenhintergrund
      m.tracks.forEach((tr, i) => { g.fillStyle = i % 2 ? '#121731' : '#151a35'; g.fillRect(l.lab, l.top + i * l.th, W - l.lab, l.th); });
      // Lücken markieren
      M.gaps(m).forEach(gp => { if (gp[1] < vis0 || gp[0] > vis1) return; g.fillStyle = 'rgba(255,77,109,.10)'; g.fillRect(t2x(gp[0]), l.top, (gp[1] - gp[0]) * ui.pps, m.tracks.length * l.th); });
      // Lineal
      const step = ui.pps > 60 ? 1 : ui.pps > 25 ? 2 : ui.pps > 10 ? 5 : 10;
      g.font = '11px system-ui'; g.textAlign = 'left'; g.textBaseline = 'middle';
      for (let t = Math.floor(vis0 / step) * step; t <= vis1; t += step) {
        const x = t2x(t); if (x < l.lab) continue;
        g.fillStyle = '#2c3566'; g.fillRect(x, l.ruler - 6, 1, 6); g.fillRect(x, l.top, 1, H - l.top);
        g.fillStyle = '#8f98c8'; g.fillText(tStr(t), x + 3, 9);
      }
      const de = m.dur; if (de >= vis0 && de <= vis1) { g.fillStyle = 'rgba(255,138,30,.35)'; g.fillRect(t2x(de), l.ruler, 1, H - l.ruler); }
      // Rubrik-Blöcke
      M.blocks(m).forEach((b, i) => {
        const sg = m.segs[b.seg], x = Math.max(l.lab, t2x(b.start)), x2 = Math.min(W, t2x(b.end)); if (x2 <= x) return;
        g.fillStyle = sg.color; g.globalAlpha = 0.28; rr(x, l.ruler + 2, x2 - x, l.seg - 4, 6); g.fill(); g.globalAlpha = 1;
        if (ui.swap === b.seg) { g.strokeStyle = '#ff8a1e'; g.lineWidth = 2; rr(x, l.ruler + 2, x2 - x, l.seg - 4, 6); g.stroke(); }
        g.save(); g.beginPath(); g.rect(x, l.ruler, x2 - x, l.seg); g.clip();
        g.fillStyle = '#fff'; g.font = '600 12px system-ui'; g.fillText((b.seg + 1) + '. ' + sg.name, x + 6, l.ruler + l.seg / 2);
        g.restore();
      });
      // Clips
      const drag = ui.drag && ui.drag.type === 'move' && ui.drag.moved ? ui.drag : null;
      m.clips.forEach(c => {
        const ti = m.tracks.findIndex(t => t.id === c.track); if (ti < 0) return;
        const off = drag && drag.set.indexOf(c.id) >= 0 ? drag.dt : 0;
        const s = c.start + off, e = s + c.len; if (e < vis0 || s > vis1) return;
        drawClip(c, ti, s, l);
      });
      // Schnittbereich
      if (ui.drag && ui.drag.type === 'cut') {
        const d = ui.drag, a = Math.min(d.t0, d.t1), b = Math.max(d.t0, d.t1);
        g.fillStyle = 'rgba(255,138,30,.35)'; g.fillRect(t2x(a), l.top + d.ti * l.th, (b - a) * ui.pps, l.th);
        g.strokeStyle = '#ff8a1e'; g.lineWidth = 1.5; g.strokeRect(t2x(a), l.top + d.ti * l.th + 1, (b - a) * ui.pps, l.th - 2);
      }
      // Beschriftung links
      g.fillStyle = '#0c1022'; g.fillRect(0, 0, l.lab, H);
      g.fillStyle = '#8f98c8'; g.font = '11px system-ui'; g.fillText('Zeit', 6, 11);
      g.fillText('Rubriken', 6, l.ruler + l.seg / 2);
      m.tracks.forEach((tr, i) => {
        const y = l.top + i * l.th;
        if (i === ui.track) { g.fillStyle = '#1d2342'; g.fillRect(0, y, l.lab, l.th); }
        g.fillStyle = tr.color; g.fillRect(0, y + 4, 4, l.th - 8);
        g.fillStyle = '#e8ecff'; g.font = '600 ' + (W < 560 ? 11 : 13) + 'px system-ui';
        g.fillText(tr.name.length > 9 ? tr.name.slice(0, 8) + '…' : tr.name, 9, y + l.th / 2);
      });
      // Abspielkopf
      const hx = t2x(ui.head);
      if (hx >= l.lab) {
        g.fillStyle = '#ff8a1e'; g.fillRect(hx - 1, l.ruler - 4, 2, H - l.ruler + 4);
        g.beginPath(); g.moveTo(hx - 6, 0); g.lineTo(hx + 6, 0); g.lineTo(hx, 10); g.closePath(); g.fill();
      }
    }
    function drawClip(c, ti, s, l) {
      const tr = m.tracks[ti], y = l.top + ti * l.th + 3, h = l.th - 6;
      const x0 = t2x(s), x1 = t2x(s + c.len), cx0 = Math.max(l.lab, x0), cx1 = Math.min(W, x1);
      if (cx1 - cx0 < 0.5) return;
      const col = tr.color, src = c.src && m.srcs[c.src];
      g.save(); rr(x0, y, Math.max(2, x1 - x0), h, 6); g.clip();
      g.fillStyle = '#1d2342'; g.fillRect(cx0, y, cx1 - cx0, h);
      g.fillStyle = col; g.globalAlpha = 0.18; g.fillRect(cx0, y, cx1 - cx0, h); g.globalAlpha = 1;
      const mid = y + h / 2 + (c.kind === 'speech' ? 4 : 0), amp = (h - (c.kind === 'speech' ? 14 : 8)) / 2;
      const eff = src ? src.lvl + c.gain : 0, mul = Math.pow(10, eff / 20);
      for (let x = Math.floor(cx0); x < cx1; x += 3) {
        const lt = (x - x0) / ui.pps, st = c.off + lt;
        let a, color = col;
        if (src) {
          const um = src.ums.find(u => st >= u[0] && st <= u[1]);
          if (um) { a = 0.42 + 0.06 * Math.sin(st * 40); color = m.marks ? '#ff4d6d' : col; }
          else { const k = Math.floor(st / 0.08); a = h2(src.n, k >> 2) > 0.2 ? 0.25 + 0.7 * h2(src.n * 7 + 3, k) : 0.05; }
          a *= mul;
        } else if (c.kind === 'atmo') a = 0.12 + 0.08 * h2(9, Math.floor(st * 6));
        else a = 0.35 + 0.45 * Math.abs(Math.sin(st * 6.3 + (c.kind === 'outro' ? 1 : 0))) * (0.7 + 0.3 * h2(5, Math.floor(st * 4)));
        // Blenden
        const fin = c.fi > 0 ? clamp(lt / c.fi, 0, 1) : 1, fout = c.fo > 0 ? clamp((c.len - lt) / c.fo, 0, 1) : 1;
        a *= Math.min(fin, fout);
        const hh = Math.max(1, Math.min(1, a) * amp);
        g.fillStyle = a > 1 ? '#fff1a8' : color; g.fillRect(x, mid - hh, 2, hh * 2);
      }
      // Rauschen
      if (src && src.noise && !c.nr) {
        g.fillStyle = 'rgba(220,225,255,.55)';
        for (let x = Math.floor(cx0); x < cx1; x += 4) for (let k = 0; k < 3; k++) g.fillRect(x + (h2(x, k) * 3 | 0), y + 12 + h2(k, x) * (h - 14), 1, 1);
      }
      // Blenden-Dreiecke
      g.fillStyle = 'rgba(0,0,0,.45)';
      if (c.fi > 0) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + c.fi * ui.pps, y); g.lineTo(x0, y + h); g.closePath(); g.fill(); }
      if (c.fo > 0) { g.beginPath(); g.moveTo(x1, y); g.lineTo(x1 - c.fo * ui.pps, y); g.lineTo(x1, y + h); g.closePath(); g.fill(); }
      // Beschriftung
      const name = c.kind === 'speech' ? (src.noise && !c.nr ? '〰 ' : '') + (Math.abs(eff) > 1.5 ? (eff > 0 ? '▲ laut ' : '▼ leise ') : '') : c.kind === 'bed' ? '♪ Musikbett' : c.kind === 'intro' ? '♪ Intro' : c.kind === 'outro' ? '♪ Outro' : 'Raumatmo';
      if (name && x1 - cx0 > 30) { g.fillStyle = '#fff'; g.font = '600 11px system-ui'; g.fillText(name, cx0 + 5, y + 8); }
      g.restore();
      g.lineWidth = c.id === ui.sel ? 2.5 : 1; g.strokeStyle = c.id === ui.sel ? '#ff8a1e' : col;
      rr(x0 + 0.5, y + 0.5, Math.max(2, x1 - x0 - 1), h - 1, 6); g.stroke();
    }

    // Ton beim Abspielen
    const A = () => PT.Audio;
    function sound(t0, t1) {
      const au = A(); if (!au || t1 <= t0) return;
      let n = 0;
      m.clips.forEach(c => {
        if (n > 6) return;
        const s = c.start, e = end(c); if (e <= t0 || s >= t1) return;
        const a = Math.max(t0, s) - s + c.off, b = Math.min(t1, e) - s + c.off;
        if (c.kind === 'speech') {
          const src = m.srcs[c.src], base = VOICE[c.track] || 260, eff = src.lvl + c.gain;
          for (let k = Math.ceil(a / 0.16); k * 0.16 < b && n < 7; k++) {
            const st = k * 0.16, um = src.ums.find(u => st >= u[0] && st < u[1]);
            if (um) {
              if (st - um[0] < 0.16) { au.fx({ parts: [{ wave: 'sawtooth', f: base * 0.85, f2: base * 0.7, t: 0, d: Math.min(0.9, um[1] - um[0]), v: 0.13 * Math.pow(10, eff / 20), filter: { type: 'lowpass', f: 900 }, lfo: { f: 7, depth: 10 } }] }); n++; }
              continue;
            }
            if (src.noise && !c.nr && k % 2 === 0) { au.fx({ parts: [{ wave: 'noise', f: 0, t: 0, d: 0.34, v: 0.07, filter: { type: 'highpass', f: 2500 } }] }); n++; }
            if (h2(src.n, Math.floor(st / 0.08) >> 2) <= 0.2) continue;
            if (Math.abs(eff) <= 1.5 && au.blip) au.blip(c.track === 'guest' ? base : c.track);
            else au.fx({ parts: [{ wave: 'square', f: base * (0.9 + 0.25 * h2(src.n, k)), t: 0, d: 0.05, v: clamp(0.08 * Math.pow(10, eff / 20), 0.004, 0.5), filter: { type: 'lowpass', f: 1800 } }] });
            n++;
          }
        } else if (c.kind !== 'atmo') {
          const notes = c.kind === 'outro' ? [784, 659, 523, 392] : c.kind === 'intro' ? [392, 523, 659, 784] : [330, 392, 440, 392];
          for (let k = Math.ceil(a / 0.25); k * 0.25 < b && n < 7; k++) {
            const lt = k * 0.25, f = Math.min(c.fi > 0 ? lt / c.fi : 1, c.fo > 0 ? (c.len - lt) / c.fo : 1, 1);
            if (f <= 0.02) continue;
            au.fx({ parts: [{ wave: 'triangle', f: notes[k % 4], t: 0, d: 0.22, v: 0.16 * f }] }); n++;
          }
        }
      });
    }
    const progEnd = () => Math.max.apply(null, m.clips.filter(c => c.kind !== 'atmo').map(end).concat([1]));
    function setPlay(on) {
      ui.play = !!on; R.play.textContent = ui.play ? '⏸' : '▶';
      if (ui.play) { if (A() && A().unlock) A().unlock(); if (ui.head >= progEnd() - 0.05) ui.head = 0; lastNow = 0; }
      invalidate();
    }
    function frame(now) {
      raf = 0; if (closed) return;
      if (ui.play) {
        if (!lastNow) lastNow = now;
        const dt = Math.min(0.1, (now - lastNow) / 1000); lastNow = now;
        const t0 = ui.head; ui.head = Math.min(m.T, ui.head + dt);
        sound(t0, ui.head); follow();
        if (ui.head >= progEnd()) setPlay(false);
      }
      R.time.textContent = tStr(ui.head) + ' / ' + tStr(m.dur);
      if (ui.msg && Date.now() > ui.msgUntil) { ui.msg = ''; refreshInfo(); }
      draw();
      if (ui.play || ui.msg) raf = win.requestAnimationFrame(frame);
    }
    function invalidate() { if (!raf && !closed) raf = win.requestAnimationFrame(frame); }

    // Zeiger
    function pos(e) { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; }
    function clipAt(ti, t) { const id = m.tracks[ti] && m.tracks[ti].id; return m.clips.slice().reverse().find(c => c.track === id && t >= c.start && t <= end(c)); }
    function snapDt(d, dt) {
      const c = byId(m, d.clip), lim = 10 / ui.pps; let best = dt, bd = lim;
      const ns = c.start + dt;
      m.clips.forEach(o => {
        if (d.set.indexOf(o.id) >= 0 || o.kind === 'atmo') return;
        [o.start, end(o), 0].forEach(edge => { const dd = Math.abs(ns - edge); if (dd < bd) { bd = dd; best = edge - c.start; } });
      });
      return best;
    }
    cv.addEventListener('pointerdown', e => {
      if (closed) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (er) { /* egal */ }
      const p = pos(e), l = lay(), t = clamp(x2t(p.x), 0, m.T);
      if (p.x < l.lab && p.y >= l.top) { ui.track = clamp(Math.floor((p.y - l.top) / l.th), 0, m.tracks.length - 1); invalidate(); return; }
      if (p.y < l.ruler) { ui.drag = { type: 'seek' }; seek(t); return; }
      if (p.y < l.top) {
        const b = M.blocks(m).find(x => t >= x.start && t <= x.end);
        if (!b) { ui.swap = null; invalidate(); return; }
        if (ui.swap == null) { ui.swap = b.seg; say('Jetzt den Block antippen, mit dem getauscht wird.'); }
        else if (ui.swap === b.seg) ui.swap = null;
        else { const a = ui.swap; ui.swap = null; exec({ t: 'swap', a, b: b.seg }); }
        invalidate(); return;
      }
      const ti = clamp(Math.floor((p.y - l.top) / l.th), 0, m.tracks.length - 1); ui.track = ti;
      const c = clipAt(ti, t);
      if (ui.tool === 'cut') { ui.drag = { type: 'cut', ti, t0: t, t1: t }; invalidate(); return; }
      if (ui.tool === 'split') { if (c) exec({ t: 'split', clip: c.id, at: t }); else say('Hier ist kein Clip zum Teilen'); return; }
      if (c) {
        ui.sel = c.id; refreshInfo();
        const set = ui.ripple && c.kind === 'speech' ? m.clips.filter(x => x.kind === 'speech' && x.start >= c.start - 0.001).map(x => x.id) : [c.id];
        ui.drag = { type: 'move', clip: c.id, x0: p.x, dt: 0, moved: false, set };
      } else { ui.sel = null; refreshInfo(); seek(t); ui.drag = ui.tool === 'select' ? { type: 'seek' } : null; }
      invalidate();
    });
    cv.addEventListener('pointermove', e => {
      const d = ui.drag; if (!d || closed) return;
      const p = pos(e), t = clamp(x2t(p.x), 0, m.T);
      if (d.type === 'seek') seek(t);
      else if (d.type === 'cut') { d.t1 = t; invalidate(); }
      else if (d.type === 'move') {
        if (Math.abs(p.x - d.x0) > 6) d.moved = true;
        if (d.moved) { d.dt = snapDt(d, (p.x - d.x0) / ui.pps); invalidate(); }
      }
    });
    function up() {
      const d = ui.drag; ui.drag = null; if (!d || closed) return;
      if (d.type === 'cut') {
        if (Math.abs(d.t1 - d.t0) >= 0.05) exec({ t: 'cut', track: m.tracks[d.ti].id, from: d.t0, to: d.t1 });
        else { const c = clipAt(d.ti, d.t0); ui.sel = c ? c.id : null; seek(d.t0); refreshInfo(); }
      } else if (d.type === 'move' && d.moved) exec({ t: 'move', clip: d.clip, dt: d.dt, ripple: ui.ripple }, true);
      invalidate();
    }
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', () => { ui.drag = null; invalidate(); });
    cv.addEventListener('wheel', e => {
      if (e.ctrlKey) { e.preventDefault(); zoom(e.deltaY < 0 ? 1.25 : 0.8); return; }
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (d) { e.preventDefault(); ui.scroll += d / ui.pps; clampView(); invalidate(); }
    }, { passive: false });
    range.addEventListener('input', () => { const vis = (W - lay().lab) / ui.pps; ui.scroll = (+range.value / 1000) * Math.max(0, m.T - vis); invalidate(); });

    // Knöpfe
    const selClip = () => ui.sel && byId(m, ui.sel);
    function act(a) {
      const c = selClip();
      switch (a) {
        case 'play': setPlay(!ui.play); break;
        case 'home': seek(0); break;
        case 'ripple': ui.ripple = !ui.ripple; say(ui.ripple ? 'Rest mitziehen: an' : 'Rest mitziehen: aus'); refresh(); break;
        case 'fi': case 'fo': if (c) { const k = a === 'fi' ? 'fi' : 'fo'; exec({ t: 'fade', clip: c.id, side: a === 'fi' ? 'in' : 'out', len: c[k] >= 0.5 ? 0 : 1.5 }); } break;
        case 'noise': if (c) exec({ t: 'noise', clip: c.id }); break;
        case 'down': case 'up': if (c) exec({ t: 'gain', clip: c.id, db: a === 'up' ? 2 : -2 }); break;
        case 'del': if (c) exec({ t: 'delete', clip: c.id }); break;
        case 'intro': case 'outro': exec({ t: 'place', kind: a, at: ui.head }); break;
        case 'undo': case 'redo': exec({ t: a }); break;
        case 'zin': zoom(1.5); break;
        case 'zout': zoom(1 / 1.5); break;
        case 'help': help(true); break;
        case 'cancel': finish(null); break;
        case 'done': { const s = M.score(m); finish({ score: s.score, detail: s.detail, checks: s.checks }); break; }
      }
    }
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (b && el.contains(b)) {
        if (b.dataset.tool) { ui.tool = b.dataset.tool; ui.drag = null; refresh(); }
        else if (b.dataset.a) act(b.dataset.a);
        if (b.blur && !closed) b.blur();
        return;
      }
      const it = e.target.closest('.pt-ed-item');
      if (it && list._checks) {
        const ck = list._checks[+it.dataset.i];
        if (ck && ck.at != null) seek(Math.max(0, ck.at - 0.5));
        if (ck && ck.clip && byId(m, ck.clip)) { ui.sel = ck.clip; refreshInfo(); }
        invalidate();
      }
    });

    // Tastatur (nur solange offen)
    function splitAtHead() {
      const c = selClip(), tid = c ? c.track : m.tracks[ui.track].id;
      exec({ t: 'split', track: tid, at: ui.head });
    }
    function onKey(e) {
      if (closed || !el.isConnected) return;
      const tg = e.target, tag = tg && tg.tagName;
      if ((tag === 'INPUT' && tg !== range) || tag === 'TEXTAREA' || tag === 'SELECT' || (tg && tg.isContentEditable)) return;
      if (el.querySelector('.pt-ed-help')) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); help(false); } return; }
      const k = e.key, ctrl = e.ctrlKey || e.metaKey;
      let hit = true;
      if (ctrl && (k === 'z' || k === 'Z')) exec({ t: e.shiftKey ? 'redo' : 'undo' });
      else if (ctrl && (k === 'y' || k === 'Y')) exec({ t: 'redo' });
      else if (ctrl) hit = false;
      else if (k === ' ') setPlay(!ui.play);
      else if (k === 's' || k === 'S') splitAtHead();
      else if (k === 'Delete' || k === 'Backspace') { const c = selClip(); if (c) exec({ t: 'delete', clip: c.id }); }
      else if (k === 'ArrowLeft' || k === 'ArrowRight') seek(ui.head + (k === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 5 : 1));
      else if (k === 'ArrowUp' || k === 'ArrowDown') { ui.track = clamp(ui.track + (k === 'ArrowUp' ? -1 : 1), 0, m.tracks.length - 1); const c = clipAt(ui.track, ui.head); ui.sel = c ? c.id : null; refreshInfo(); invalidate(); }
      else if (k === 'Enter') { const c = clipAt(ui.track, ui.head); ui.sel = c ? c.id : null; refreshInfo(); invalidate(); }
      else if (k === '+' || k === '=') zoom(1.5);
      else if (k === '-' || k === '_') zoom(1 / 1.5);
      else if (k === 'Home') seek(0);
      else if (k >= '1' && k <= '4') { ui.tool = ['select', 'cut', 'split', 'move'][+k - 1]; refresh(); }
      else if (k === 'n' || k === 'N') act('noise');
      else hit = false;
      if (hit) e.preventDefault();
    }
    doc.addEventListener('keydown', onKey);
    function onResize() { if (!closed) resize(); }
    if (win.ResizeObserver) { ro = new win.ResizeObserver(onResize); ro.observe(el); } else win.addEventListener('resize', onResize);

    // Hilfe (beim ersten Öffnen)
    function help(show) {
      const old = el.querySelector('.pt-ed-help'); if (old) old.remove();
      if (!show) { try { win.localStorage.setItem('pt-ed-help', '1'); } catch (e) { /* ohne Speicher */ } return; }
      const d = doc.createElement('div'); d.className = 'pt-ed-help';
      d.innerHTML = '<div class="pt-ed-card"><h2>🎚️ So funktioniert der Schnittplatz</h2><ul>' +
        '<li><b>Anhören:</b> ▶ oder Leertaste. Leiste oben antippen springt an die Stelle.</li>' +
        '<li><b>„Ähm“ raus:</b> ' + (m.marks ? 'rot markierte' : 'gleichmäßig brummende') + ' Stellen mit ✂️ Schnitt überziehen, danach die Lücke mit ↔️ Verschieben schließen – 🧲 zieht alles Spätere mit.</li>' +
        '<li><b>Clip antippen</b>, dann 🧹 Entrauschen (〰 = Rauschen), 🔉/🔊 Pegel angleichen (▲ laut / ▼ leise), ◢ ◣ Blenden.</li>' +
        '<li><b>Pausen und Überlappungen:</b> Clips ziehen, bis sie sauber aneinander anschließen (rote Fläche = Lücke).</li>' +
        '<li><b>Intro/Outro:</b> Abspielkopf setzen, dann 🎺 oder 🏁. <b>Rubriken</b> tauschen: zwei Blöcke in der Rubrik-Leiste antippen.</li>' +
        '<li>Rechts bzw. unten stehen die Aufgaben mit Punkten. Zu viel Schneiden kostet Punkte. ↶ macht rückgängig.</li>' +
        '<li>Tasten: S teilen, Entf löschen, Strg+Z/Y, ←/→ Kopf, ↑/↓ Spur, +/− Zoom, 1–4 Werkzeug.</li>' +
        '</ul><button class="pt-ed-btn pt-ed-go" data-x="1">Los geht’s</button></div>';
      d.addEventListener('click', e => { if (e.target.closest('[data-x]') || e.target === d) help(false); });
      el.appendChild(d);
    }
    let seen = false; try { seen = !!win.localStorage.getItem('pt-ed-help'); } catch (e) { seen = false; }

    function close() {
      if (closed) return; closed = true; ui.play = false;
      if (raf) { win.cancelAnimationFrame(raf); raf = 0; }
      doc.removeEventListener('keydown', onKey);
      if (ro) ro.disconnect(); else win.removeEventListener('resize', onResize);
      if (el.parentNode) el.parentNode.removeChild(el);
    }
    function finish(res) {
      if (finished) return; finished = true; close();
      if (typeof done === 'function') done(res);
    }

    resize(); refresh();
    if (!seen) help(true);
    return { close, model: m, apply: op => exec(op, true), score: () => M.score(m) };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = { EditorModel: M, Editor: E };
})(typeof window !== 'undefined' ? window : globalThis);
