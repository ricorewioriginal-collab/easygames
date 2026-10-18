/* AnMaCha UNDERCOVER 3D – 24 Mini-Aufgaben, reine Logik (ohne DOM, läuft auch in Node).
   AMU.Tasks.create(id, seed, diff) → JSON-Zustand; act(id, st, action) prüft jede Eingabe; done(); solve() → Aktionsliste.
   Jeder Zustand hat st.err (Fehlversuche). Aktion {t:'reset'} startet die Aufgabe neu (Fehler bleiben gezählt). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  // ---------- kleine Helfer ----------
  const isInt = x => typeof x === 'number' && Number.isInteger(x);
  const inR = (x, a, b) => isInt(x) && x >= a && x <= b;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const mod = (v, n) => ((v % n) + n) % n;
  const cdist = (a, b) => { const d = mod(a - b, 360); return d > 180 ? 360 - d : d; };   // Kreisabstand in Grad
  const sdiff = (from, to) => { let d = mod(to - from, 360); if (d > 180) d -= 360; return d; }; // vorzeichenbehaftet
  const range = n => Array.from({ length: n }, (_, i) => i);
  const fill = (n, v) => Array.from({ length: n }, () => v);
  const sum = a => a.reduce((s, x) => s + x, 0);

  const TITLES = ['Nachtfrequenz', 'Sendeschluss', 'Antennenwalzer', 'Rauschen im Regen', 'Studio Blau', 'Kurzwellen-Kuss',
    'Mitternachtsmix', 'Taktgeber', 'Funkstille', 'Pegelrausch', 'Ätherwellen', 'Tonarm-Tango', 'Überspielt', 'Senderliebe',
    'Mono-Mondschein', 'Stereo-Sterne'];
  const GENRES = ['Pop', 'Rock', 'Jazz', 'Elektro', 'Schlager'];

  const DEFS = [
    { id: 'pegel', name: 'Pegel mischen', icon: '🎚️', en: 'Mix the levels', hint: 'Bringe alle Regler in die grüne Zone.' },
    { id: 'kabel', name: 'Studiokabel zuordnen', icon: '🔌', en: 'Patch the studio cables', hint: 'Verbinde jeden Stecker links mit der passenden Buchse rechts (gleiche Farbe und Form).' },
    { id: 'playlist_sort', name: 'Musikreihenfolge sortieren', icon: '🎼', en: 'Sort the playlist', hint: 'Wähle einen Titel und dann seinen Zielplatz, bis die Liste richtig sortiert ist.' },
    { id: 'fokus', name: 'Senderfokus justieren', icon: '🎯', en: 'Focus the transmitter', hint: 'Drehe den Regler, bis das Bild scharf ist, und fixiere dann den Fokus.' },
    { id: 'frequenz', name: 'Frequenz abstimmen', icon: '📻', en: 'Tune the frequency', hint: 'Stelle die Frequenzen der Liste nacheinander exakt ein und speichere jede.' },
    { id: 'mikro', name: 'Mikrofon prüfen', icon: '🎙️', en: 'Check the microphones', hint: 'Prüfe die Kanäle genau in der Reihenfolge der Liste. Ein Fehler startet die Prüfung neu.' },
    { id: 'signal', name: 'Signalverluste lokalisieren', icon: '📡', en: 'Locate signal loss', hint: 'Miss Felder: Die Zahl nennt die Schritte zum nächsten Defekt. Finde alle Defekte.' },
    { id: 'strom', name: 'Stromkreise reparieren', icon: '⚡', en: 'Repair the circuits', hint: 'Drehe die Leitungsstücke, bis Strom von ⚡ zur Lampe 💡 fließt.' },
    { id: 'schalter', name: 'Schalterfolge merken', icon: '🔀', en: 'Remember the switch order', hint: 'Merke dir die Folge und wiederhole sie. Jede Runde wird sie länger.' },
    { id: 'platte', name: 'Plattenspieler ausrichten', icon: '💿', en: 'Align the turntable', hint: 'Nadel auf die orange Einlaufrille, Drehzahl vom Etikett wählen, dann starten.' },
    { id: 'kanaele', name: 'Mischpultkanäle verbinden', icon: '🎛️', en: 'Route the mixer channels', hint: 'Lege jeden Eingang laut Patch-Plan auf den richtigen Bus und prüfe dann.' },
    { id: 'paket', name: 'Paket verteilen', icon: '📦', en: 'Deliver the packages', hint: 'Schau im Hausverzeichnis nach und schicke jedes Paket in den richtigen Raum.' },
    { id: 'kuehlung', name: 'Tower-Kühlung', icon: '❄️', en: 'Tower cooling', hint: 'Schalte Lüfter und Ventil und gib Takte, bis die Temperatur mehrere Takte im Zielbereich bleibt.' },
    { id: 'antenne', name: 'Antennen ausrichten', icon: '🗼', en: 'Align the antennas', hint: 'Richte jede Antenne in Richtung (Azimut) und Neigung (Elevation) auf ihr Ziel aus.' },
    { id: 'code', name: 'Codefolge', icon: '🔢', en: 'Code sequence', hint: 'Setze den Code aus den Hinweis-Schnipseln zusammen und gib ihn ein.' },
    { id: 'filter', name: 'Audiospur filtern', icon: '🎧', en: 'Filter the audio track', hint: 'Wähle Filter, die alle Störspitzen ✖ abdecken, aber keine Stimme ♪ beschneiden.' },
    { id: 'bruecke', name: 'Kabelbrücke', icon: '🌉', en: 'Cable bridge', hint: 'Lege Kabelstücke von links nach rechts. Steine umgehen, Stückzahl ist begrenzt.' },
    { id: 'wellen', name: 'Radiowellen leiten', icon: '〰️', en: 'Guide the radio waves', hint: 'Kippe die Reflektoren, bis die Welle den Empfänger 📡 erreicht.' },
    { id: 'sicherung', name: 'Sicherungen wechseln', icon: '🔧', en: 'Replace the fuses', hint: 'Hauptschalter aus, defekte Sicherungen mit passendem Ampere-Wert ersetzen, Hauptschalter wieder ein.' },
    { id: 'licht_memory', name: 'Studio-Licht-Memory', icon: '💡', en: 'Studio light memory', hint: 'Decke je zwei Lichter auf und finde alle Paare.' },
    { id: 'akkus', name: 'Akkus laden', icon: '🔋', en: 'Charge the batteries', hint: 'Verteile die Ladepakete so, dass alle Akkus genau voll sind – ohne Überladung.' },
    { id: 'notfunk', name: 'Notfunk schalten', icon: '🚨', en: 'Emergency radio', hint: 'Arbeite die Notfall-Karte exakt der Reihe nach ab und halte zum Schluss die Sendetaste.' },
    { id: 'playlist_clean', name: 'Playlist räumen', icon: '🧹', en: 'Clean the playlist', hint: 'Markiere alle Titel, die gegen eine Regel verstoßen, und übernimm die Playlist.' },
    { id: 'buehne', name: 'Bühnenpanels einstellen', icon: '🎭', en: 'Set the stage panels', hint: 'Ein Panel schaltet sich und seine direkten Nachbarn um. Stelle das Zielmuster her.' }
  ];

  // Gitter-Richtungen: 0=N 1=O 2=S 3=W (y wächst nach unten); Bitmasken N=1 O=2 S=4 W=8
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], BIT = [1, 2, 4, 8];
  const rotMask = m => ((m << 1) | (m >> 3)) & 15;   // 90° im Uhrzeigersinn

  function bfsPath(W, H, free, sx, sy, tx, ty) {        // kürzester 4er-Weg über freie Felder, sonst null
    if (!free(sx, sy) || !free(tx, ty)) return null;
    const prev = fill(W * H, -2), q = [sy * W + sx]; prev[q[0]] = -1;
    for (let h = 0; h < q.length; h++) {
      const c = q[h], x = c % W, y = (c / W) | 0;
      if (x === tx && y === ty) { const p = []; for (let k = c; k !== -1; k = prev[k]) p.unshift(k); return p; }
      for (let d = 0; d < 4; d++) {
        const nx = x + DX[d], ny = y + DY[d];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || !free(nx, ny)) continue;
        const n = ny * W + nx; if (prev[n] !== -2) continue; prev[n] = c; q.push(n);
      }
    }
    return null;
  }

  const LOGIC = {};

  // 1 ---------- Pegel mischen: Regler in Zielbänder ----------
  LOGIC.pegel = {
    create(r, d) {
      const n = [3, 4, 5][d], w = [24, 16, 10][d], st = { n, lo: [], hi: [], v: [] };
      for (let i = 0; i < n; i++) {
        const lo = 5 + r.int(90 - w); let v;
        do v = r.int(101); while (v >= lo - 8 && v <= lo + w + 8);
        st.lo.push(lo); st.hi.push(lo + w); st.v.push(v);
      }
      return st;
    },
    act(st, a) {
      if (!inR(a.i, 0, st.n - 1)) return;
      if (a.t === 'set' && inR(a.v, 0, 100)) st.v[a.i] = a.v;
      else if (a.t === 'nudge' && inR(a.d, -20, 20)) st.v[a.i] = clamp(st.v[a.i] + a.d, 0, 100);
    },
    ok: (st, i) => st.v[i] >= st.lo[i] && st.v[i] <= st.hi[i],
    done(st) { return range(st.n).every(i => LOGIC.pegel.ok(st, i)); },
    prog(st) { return range(st.n).filter(i => LOGIC.pegel.ok(st, i)).length / st.n; },
    solve(st) { return range(st.n).map(i => ({ t: 'set', i, v: Math.round((st.lo[i] + st.hi[i]) / 2) })); }
  };

  // 2 ---------- Studiokabel: Stecker ↔ gleiche Buchse ----------
  LOGIC.kabel = {
    create(r, d) {
      const n = [4, 5, 6][d], left = r.shuffle(range(8)).slice(0, n);
      return { n, left, right: r.shuffle(left), conn: fill(n, -1) };
    },
    act(st, a) {
      if (a.t !== 'link' || !inR(a.l, 0, st.n - 1) || !inR(a.r, 0, st.n - 1)) return;
      if (st.conn[a.l] !== -1 || st.conn.includes(a.r)) return;
      if (st.left[a.l] === st.right[a.r]) st.conn[a.l] = a.r; else st.err++;
    },
    done(st) { return st.conn.every(c => c !== -1); },
    prog(st) { return st.conn.filter(c => c !== -1).length / st.n; },
    solve(st) { return range(st.n).filter(l => st.conn[l] === -1).map(l => ({ t: 'link', l, r: st.right.indexOf(st.left[l]) })); }
  };

  // 3 ---------- Musikreihenfolge sortieren (BPM oder Länge) ----------
  LOGIC.playlist_sort = {
    create(r, d) {
      const n = [4, 5, 7][d], titles = r.shuffle(TITLES).slice(0, n), key = r.chance(0.5) ? 'bpm' : 'sec';
      const bpms = r.shuffle(range(101).map(x => x + 70)).slice(0, n), secs = r.shuffle(range(211).map(x => x + 120)).slice(0, n);
      const items = titles.map((title, i) => ({ title, bpm: bpms[i], sec: secs[i] }));
      const st = { n, items, key, dir: d === 2 && r.chance(0.5) ? -1 : 1, order: range(n) };
      do st.order = r.shuffle(range(n)); while (LOGIC.playlist_sort.done(st));
      return st;
    },
    target(st) { return range(st.n).sort((a, b) => (st.items[a][st.key] - st.items[b][st.key]) * st.dir); },
    act(st, a) {
      if (a.t !== 'swap' || !inR(a.i, 0, st.n - 1) || !inR(a.j, 0, st.n - 1) || a.i === a.j) return;
      const o = st.order, t = o[a.i]; o[a.i] = o[a.j]; o[a.j] = t;
    },
    done(st) { const t = LOGIC.playlist_sort.target(st); return st.order.every((x, i) => x === t[i]); },
    prog(st) { const t = LOGIC.playlist_sort.target(st); return st.order.filter((x, i) => x === t[i]).length / st.n; },
    solve(st) {
      const t = LOGIC.playlist_sort.target(st), o = st.order.slice(), out = [];
      for (let i = 0; i < st.n; i++) {
        if (o[i] === t[i]) continue;
        const j = o.indexOf(t[i]); out.push({ t: 'swap', i, j }); o[j] = o[i]; o[i] = t[i];
      }
      return out;
    }
  };

  // 4 ---------- Senderfokus: verdecktes Ziel, Schärfe als Rückmeldung ----------
  LOGIC.fokus = {
    create(r, d) {
      const target = r.int(360);
      return { target, a: mod(target + 60 + r.int(241), 360), tol: [10, 6, 3][d], locked: false };
    },
    sharp(st) { return Math.max(0, Math.round(100 - cdist(st.a, st.target) * 100 / 120)); },
    act(st, a) {
      if (a.t === 'turn' && inR(a.d, -180, 180)) st.a = mod(st.a + a.d, 360);
      else if (a.t === 'lock') { if (cdist(st.a, st.target) <= st.tol) st.locked = true; else st.err++; }
    },
    done(st) { return st.locked; },
    prog(st) { return st.locked ? 1 : LOGIC.fokus.sharp(st) / 100 * 0.95; },
    solve(st) { return [{ t: 'turn', d: sdiff(st.a, st.target) }, { t: 'lock' }]; }
  };

  // 5 ---------- Frequenz abstimmen: mehrere Sender exakt (Zehntel-MHz) ----------
  const STATIONS = ['Welle Nord', 'Radio Kiesel', 'Funkhaus 7', 'Ätherkanal', 'Studio Süd', 'Kurzwelle Kai', 'Nachtsender', 'Turmfunk'];
  LOGIC.frequenz = {
    create(r, d) {
      const k = d + 1, targets = [];
      while (targets.length < k) { const f = 875 + r.int(206); if (targets.every(t => Math.abs(t - f) >= 20)) targets.push(f); }
      let f; do f = 875 + r.int(206); while (Math.abs(f - targets[0]) < 15);
      return { k, targets, names: r.shuffle(STATIONS).slice(0, k), f, idx: 0 };
    },
    act(st, a) {
      if (a.t === 'step' && inR(a.d, -205, 205)) st.f = clamp(st.f + a.d, 875, 1080);
      else if (a.t === 'lock') { if (st.f === st.targets[st.idx]) st.idx++; else st.err++; }
    },
    done(st) { return st.idx >= st.k; },
    prog(st) { return st.idx / st.k; },
    solve(st) {
      const out = []; let f = st.f;
      for (let i = st.idx; i < st.k; i++) { out.push({ t: 'step', d: st.targets[i] - f }, { t: 'lock' }); f = st.targets[i]; }
      return out;
    }
  };

  // 6 ---------- Mikrofon prüfen: Kanäle laut Liste suchen und in Reihenfolge prüfen ----------
  LOGIC.mikro = {
    create(r, d) { const n = [4, 6, 8][d]; return { n, layout: r.shuffle(range(n)), order: r.shuffle(range(n)), pos: 0 }; },
    act(st, a) {
      if (a.t !== 'press' || !inR(a.c, 0, st.n - 1)) return;
      if (a.c === st.order[st.pos]) st.pos++; else { st.err++; st.pos = 0; }
    },
    done(st) { return st.pos >= st.n; },
    prog(st) { return st.pos / st.n; },
    solve(st) { return st.order.slice(st.pos).map(c => ({ t: 'press', c })); }
  };

  // 7 ---------- Signalverluste: Minesweeper-artiges Peilen ----------
  LOGIC.signal = {
    create(r, d) {
      const [W, H, K] = [[5, 5, 2], [6, 6, 3], [7, 7, 4]][d];
      return { W, H, K, faults: r.shuffle(range(W * H)).slice(0, K), g: fill(W * H, -1), probes: 0 };
    },
    act(st, a) {
      if (a.t !== 'probe' || !inR(a.x, 0, st.W - 1) || !inR(a.y, 0, st.H - 1)) return;
      const i = a.y * st.W + a.x; if (st.g[i] !== -1) return;
      st.probes++;
      st.g[i] = Math.min(...st.faults.map(f => Math.abs(f % st.W - a.x) + Math.abs(((f / st.W) | 0) - a.y)));
    },
    found(st) { return st.faults.filter(f => st.g[f] === 0).length; },
    done(st) { return LOGIC.signal.found(st) === st.K; },
    prog(st) { return LOGIC.signal.found(st) / st.K; },
    solve(st) { return st.faults.filter(f => st.g[f] !== 0).map(f => ({ t: 'probe', x: f % st.W, y: (f / st.W) | 0 })); }
  };

  // 8 ---------- Stromkreise: Leitungskacheln drehen ----------
  LOGIC.strom = {
    create(r, d) {
      const N = [3, 4, 5][d];
      for (let att = 0; att < 40; att++) {
        const sr = r.int(N), seen = fill(N * N, false), path = [];
        const dfs = (x, y) => {      // zufällige Tiefensuche bis zur rechten Spalte
          seen[y * N + x] = true; path.push(y * N + x);
          if (x === N - 1 && (path.length >= N + d || r.chance(0.35))) return true;
          for (const dd of r.shuffle([0, 1, 2, 3])) {
            const nx = x + DX[dd], ny = y + DY[dd];
            if (nx >= 0 && ny >= 0 && nx < N && ny < N && !seen[ny * N + nx] && dfs(nx, ny)) return true;
          }
          if (x === N - 1) return true;
          path.pop(); return false;
        };
        if (!dfs(0, sr)) continue;
        const last = path[path.length - 1], lr = (last / N) | 0;
        const sol = fill(N * N, null), t = fill(N * N, 0);
        const dirTo = (a, b) => { const ax = a % N, ay = (a / N) | 0, bx = b % N, by = (b / N) | 0; return range(4).find(k => ax + DX[k] === bx && ay + DY[k] === by); };
        path.forEach((c, k) => {
          const inD = k === 0 ? 3 : dirTo(c, path[k - 1]), outD = k === path.length - 1 ? 1 : dirTo(c, path[k + 1]);
          sol[c] = BIT[inD] | BIT[outD];
        });
        const TILES = [5, 10, 3, 6, 12, 9, 7, 11, 13, 14];
        for (let i = 0; i < N * N; i++) {
          let m = sol[i] !== null ? sol[i] : r.pick(TILES);
          for (let k = r.int(4); k > 0; k--) m = rotMask(m);
          t[i] = m;
        }
        const st = { N, sr, lr, t, sol, moves: 0 };
        for (let k = 0; k < 30 && LOGIC.strom.done(st); k++) { const c = r.pick(path); st.t[c] = rotMask(st.t[c]); }
        if (!LOGIC.strom.done(st)) return st;
      }
      throw new Error('strom: Generierung fehlgeschlagen');
    },
    flow(st) {   // erreichte Felder; lit=true wenn Lampe Strom hat
      const N = st.N, on = fill(N * N, false), s = st.sr * N;
      if (!(st.t[s] & 8)) return { on, lit: false };
      const q = [s]; on[s] = true;
      for (let h = 0; h < q.length; h++) {
        const c = q[h], x = c % N, y = (c / N) | 0;
        for (let d = 0; d < 4; d++) {
          if (!(st.t[c] & BIT[d])) continue;
          const nx = x + DX[d], ny = y + DY[d];
          if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
          const n = ny * N + nx;
          if (!on[n] && (st.t[n] & BIT[(d + 2) % 4])) { on[n] = true; q.push(n); }
        }
      }
      const e = st.lr * N + N - 1;
      return { on, lit: on[e] && !!(st.t[e] & 2) };
    },
    act(st, a) { if (a.t === 'rot' && inR(a.i, 0, st.N * st.N - 1)) { st.t[a.i] = rotMask(st.t[a.i]); st.moves++; } },
    done(st) { return LOGIC.strom.flow(st).lit; },
    solve(st) {
      const out = [];
      st.sol.forEach((s, i) => {
        if (s === null) return;
        let m = st.t[i];
        for (let k = 0; k < 4 && m !== s; k++) { out.push({ t: 'rot', i }); m = rotMask(m); }
      });
      return out;
    }
  };

  // 9 ---------- Schalterfolge merken (Simon) ----------
  LOGIC.schalter = {
    create(r, d) {
      const n = [4, 5, 6][d], L = [4, 5, 7][d], seq = [];
      while (seq.length < L) { const x = r.int(n); if (seq.length < 2 || x !== seq[seq.length - 1] || x !== seq[seq.length - 2]) seq.push(x); }
      return { n, L, seq, round: 1, pos: 0, phase: 'show' };
    },
    act(st, a) {
      if (a.t === 'ready') { if (st.phase === 'show') { st.phase = 'input'; st.pos = 0; } return; }
      if (a.t !== 'press' || st.phase !== 'input' || !inR(a.i, 0, st.n - 1)) return;
      if (a.i === st.seq[st.pos]) {
        if (++st.pos >= st.round) { st.round++; st.pos = 0; st.phase = 'show'; }
      } else { st.err++; st.pos = 0; st.phase = 'show'; }
    },
    done(st) { return st.round > st.L; },
    prog(st) { return (st.round - 1) / st.L; },
    solve(st) {
      const out = []; let pos = st.pos;
      for (let r = st.round; r <= st.L; r++) {
        if (r > st.round || st.phase === 'show') { out.push({ t: 'ready' }); pos = 0; }
        for (let k = pos; k < r; k++) out.push({ t: 'press', i: st.seq[k] });
        pos = 0;
      }
      return out;
    }
  };

  // 10 ---------- Plattenspieler: Tonarm, Drehzahl, (Auflagekraft) ----------
  LOGIC.platte = {
    create(r, d) {
      const st = { arm: 0, ta: 28 + r.int(15), tol: [3, 2, 1][d], sp: r.pick([33, 45]), ts: r.pick([33, 45]), hasW: d === 2, w: 20, tw: 20, on: false };
      if (st.hasW) { st.tw = 10 + r.int(21); do st.w = 10 + r.int(21); while (Math.abs(st.w - st.tw) < 4); }
      return st;
    },
    parts(st) { return [Math.abs(st.arm - st.ta) <= st.tol, st.sp === st.ts, !st.hasW || st.w === st.tw]; },
    act(st, a) {
      if (a.t === 'arm' && inR(a.d, -45, 45)) st.arm = clamp(st.arm + a.d, 0, 45);
      else if (a.t === 'speed' && (a.v === 33 || a.v === 45)) st.sp = a.v;
      else if (a.t === 'weight' && st.hasW && inR(a.d, -30, 30)) st.w = clamp(st.w + a.d, 5, 35);
      else if (a.t === 'start') { if (LOGIC.platte.parts(st).every(Boolean)) st.on = true; else st.err++; }
    },
    done(st) { return st.on; },
    prog(st) { return st.on ? 1 : 0; },
    solve(st) {
      const out = [{ t: 'arm', d: st.ta - st.arm }, { t: 'speed', v: st.ts }];
      if (st.hasW) out.push({ t: 'weight', d: st.tw - st.w });
      out.push({ t: 'start' }); return out;
    }
  };

  // 11 ---------- Mischpultkanäle: Eingänge nach Patch-Plan auf Busse ----------
  const CAT_NAMES = {
    mic: ['Mikro Moderation', 'Mikro Gast', 'Mikro Studio 2', 'Mikro Reporter', 'Mikro Sprecher'],
    music: ['Zuspieler', 'Plattenspieler', 'Musik-PC', 'CD-Player', 'Sampler'],
    phone: ['Telefon-Hybrid', 'Hörertelefon', 'Reporterleitung', 'Funkstrecke', 'Studio-Link'],
    fx: ['Jingle-Player', 'Effektgerät', 'Sample-Pad', 'Hall-Gerät', 'Trenner-Box']
  };
  LOGIC.kanaele = {
    create(r, d) {
      const nb = [2, 3, 4][d], n = [4, 5, 6][d], cats = r.shuffle(['mic', 'music', 'phone', 'fx']).slice(0, nb);
      const patch = r.shuffle(range(nb)), cs = r.shuffle(range(n).map(i => i < nb ? i : r.int(nb))), used = {};
      const inputs = cs.map(c => { const k = cats[c]; used[k] = (used[k] || 0) + 1; return { name: CAT_NAMES[k][used[k] - 1], c }; });
      return { nb, n, cats, patch, inputs, route: fill(n, -1), wrong: [], ok: false };
    },
    act(st, a) {
      if (a.t === 'set' && inR(a.i, 0, st.n - 1) && inR(a.b, 0, st.nb - 1)) { st.route[a.i] = a.b; st.wrong = []; }
      else if (a.t === 'check') {
        st.wrong = range(st.n).filter(i => st.route[i] !== st.patch[st.inputs[i].c]);
        if (st.wrong.length) st.err++; else st.ok = true;
      }
    },
    done(st) { return st.ok; },
    prog(st) { return st.ok ? 1 : st.route.filter(b => b !== -1).length / st.n * 0.9; },
    solve(st) { return st.inputs.map((inp, i) => ({ t: 'set', i, b: st.patch[inp.c] })).concat([{ t: 'check' }]); }
  };

  // 12 ---------- Paket verteilen: Empfänger → Hausverzeichnis → Raum ----------
  const ROOMS = ['Studio A', 'Studio B', 'Technik', 'Archiv', 'Redaktion', 'Sendeturm', 'Kantine', 'Lager'];
  const ROLES = ['Moderation', 'Nachrichten', 'Technikleitung', 'Musikarchiv', 'Mastwartung', 'Catering', 'Hausmeisterei', 'Gastsendung'];
  LOGIC.paket = {
    create(r, d) {
      const nr = [4, 5, 6][d], np = [5, 7, 9][d];
      const q = range(np).map(() => r.int(nr));
      return { nr, rooms: r.shuffle(ROOMS).slice(0, nr), roles: r.shuffle(ROLES).slice(0, nr), dir: r.shuffle(range(nr)), q, nums: q.map(() => 100 + r.int(900)), pos: 0 };
    },
    act(st, a) {
      if (a.t !== 'send' || !inR(a.r, 0, st.nr - 1) || st.pos >= st.q.length) return;
      if (st.dir[st.q[st.pos]] === a.r) st.pos++; else st.err++;
    },
    done(st) { return st.pos >= st.q.length; },
    prog(st) { return st.pos / st.q.length; },
    solve(st) { return st.q.slice(st.pos).map(role => ({ t: 'send', r: st.dir[role] })); }
  };

  // 13 ---------- Tower-Kühlung: rundenbasiert stabil halten ----------
  LOGIC.kuehlung = {
    create(r, d) {
      const w = [10, 8, 6][d], lo = 38 + r.int(9), hi = lo + w, start = hi + 8 + r.int(7);
      return { T: start, start, lo, hi, need: [3, 4, 5][d], stable: 0, step: 0, heat: range(12).map(() => 1 + r.int(6)), fans: [0, 0, 0], valve: 0 };
    },
    cool(st) { return 3 * sum(st.fans) + st.valve; },
    act(st, a) {
      if (a.t === 'fan' && inR(a.i, 0, 2)) st.fans[a.i] ^= 1;
      else if (a.t === 'valve') st.valve ^= 1;
      else if (a.t === 'tick') {
        st.T = clamp(st.T + st.heat[st.step % st.heat.length] - LOGIC.kuehlung.cool(st), 10, 99); st.step++;
        if (st.T >= 90) { st.err++; st.T = st.start; st.stable = 0; }
        else if (st.T >= st.lo && st.T <= st.hi) st.stable++;
        else { if (st.stable > 0) st.err++; st.stable = 0; }
      }
    },
    done(st) { return st.stable >= st.need; },
    prog(st) { return st.stable / st.need; },
    solve(st) {
      const s = JSON.parse(JSON.stringify(st)), out = [], mid = (s.lo + s.hi) / 2, A = a => { out.push(a); LOGIC.kuehlung.act(s, a); };
      for (let g = 0; g < 300 && !LOGIC.kuehlung.done(s); g++) {
        const h = s.heat[s.step % s.heat.length]; let best = null;
        for (let f = 0; f <= 3; f++) for (let v = 0; v <= 1; v++) {
          const e = Math.abs(s.T + h - 3 * f - v - mid);
          if (!best || e < best.e) best = { e, f, v };
        }
        for (let i = 0; i < 3; i++) if (s.fans[i] !== (i < best.f ? 1 : 0)) A({ t: 'fan', i });
        if (s.valve !== best.v) A({ t: 'valve' });
        A({ t: 'tick' });
      }
      return out;
    }
  };

  // 14 ---------- Antennen: Azimut + Elevation ----------
  LOGIC.antenne = {
    create(r, d) {
      const k = [2, 2, 3][d], ants = range(k).map(() => {
        const taz = r.int(360), tel = 10 + r.int(71);
        return { taz, tel, az: mod(taz + 40 + r.int(281), 360), el: r.int(91) };
      });
      return { k, tol: [10, 6, 4][d], ants };
    },
    okAz: (st, i) => cdist(st.ants[i].az, st.ants[i].taz) <= st.tol,
    okEl: (st, i) => Math.abs(st.ants[i].el - st.ants[i].tel) <= st.tol,
    act(st, a) {
      if (a.t !== 'adj' || !inR(a.i, 0, st.k - 1) || !inR(a.d, -180, 180)) return;
      const an = st.ants[a.i];
      if (a.k === 'az') an.az = mod(an.az + a.d, 360); else if (a.k === 'el') an.el = clamp(an.el + a.d, 0, 90);
    },
    done(st) { return range(st.k).every(i => LOGIC.antenne.okAz(st, i) && LOGIC.antenne.okEl(st, i)); },
    prog(st) { return range(st.k).reduce((s, i) => s + LOGIC.antenne.okAz(st, i) + LOGIC.antenne.okEl(st, i), 0) / (2 * st.k); },
    solve(st) {
      return st.ants.flatMap((an, i) => [{ t: 'adj', i, k: 'az', d: sdiff(an.az, an.taz) }, { t: 'adj', i, k: 'el', d: an.tel - an.el }]);
    }
  };

  // 15 ---------- Codefolge aus Hinweis-Schnipseln ----------
  LOGIC.code = {
    create(r, d) {
      const len = [3, 4, 5][d], code = range(len).map(() => r.int(10)), known = [], clues = [];
      for (const p of r.shuffle(range(len))) {
        if (known.length && r.chance([0, 0.5, 0.8][d])) {
          const j = r.pick(known);
          if (d === 2 && r.chance(0.5)) clues.push({ k: 'sum', i: p, j, v: code[p] + code[j] });
          else clues.push({ k: 'rel', i: p, j, v: code[p] - code[j] });
        } else clues.push({ k: 'eq', i: p, v: code[p] });
        known.push(p);
      }
      return { len, code, clues: r.shuffle(clues), entry: [], ok: false };
    },
    act(st, a) {
      if (a.t === 'digit' && inR(a.d, 0, 9)) { if (st.entry.length < st.len) st.entry.push(a.d); }
      else if (a.t === 'del') st.entry.pop();
      else if (a.t === 'enter' && st.entry.length === st.len) {
        if (st.entry.every((x, i) => x === st.code[i])) st.ok = true; else { st.err++; st.entry = []; }
      }
    },
    done(st) { return st.ok; },
    solve(st) { return st.entry.map(() => ({ t: 'del' })).concat(st.code.map(x => ({ t: 'digit', d: x })), [{ t: 'enter' }]); }
  };

  // 16 ---------- Audiospur filtern: Filter-Auswahl als Abdeckungsrätsel ----------
  LOGIC.filter = {
    create(r, d) {
      const B = [6, 8, 10][d], K = [4, 5, 6][d];
      for (;;) {
        const f = range(K).map(() => { const len = 1 + r.int(3), s = r.int(B - len + 1); return [s, s + len - 1]; });
        const sol = r.shuffle(range(K).map(i => i < Math.max(1, K >> 1) ? 1 : 0));
        const U = fill(B, false); f.forEach(([s, e], i) => { if (sol[i]) for (let b = s; b <= e; b++) U[b] = true; });
        const noise = fill(B, 0), voice = fill(B, 0);
        f.forEach(([s, e], i) => { if (sol[i]) noise[s + r.int(e - s + 1)] = 1; });
        for (let b = 0; b < B; b++) { if (U[b] && r.chance(0.4)) noise[b] = 1; if (!U[b] && r.chance(0.3)) voice[b] = 1; }
        f.forEach(([s, e], i) => {   // jeder nicht benötigte Filter, der über U hinausragt, schneidet eine Stimme
          if (sol[i]) return;
          const out = range(e - s + 1).map(k => s + k).filter(b => !U[b]);
          if (out.length) voice[r.pick(out)] = 1;
        });
        if (noise.some(Boolean)) return { B, K, f, sol, noise, voice, on: fill(K, 0), ok: false, fb: null };
      }
    },
    act(st, a) {
      if (a.t === 'toggle' && inR(a.i, 0, st.K - 1)) { st.on[a.i] ^= 1; st.fb = null; }
      else if (a.t === 'apply') {
        const cov = fill(st.B, false); st.f.forEach(([s, e], i) => { if (st.on[i]) for (let b = s; b <= e; b++) cov[b] = true; });
        const miss = range(st.B).filter(b => st.noise[b] && !cov[b]).length, hit = range(st.B).filter(b => st.voice[b] && cov[b]).length;
        if (!miss && !hit) st.ok = true; else { st.err++; st.fb = { miss, hit }; }
      }
    },
    done(st) { return st.ok; },
    solve(st) { return range(st.K).filter(i => st.on[i] !== st.sol[i]).map(i => ({ t: 'toggle', i })).concat([{ t: 'apply' }]); }
  };

  // 17 ---------- Kabelbrücke: Weg legen mit begrenzter Stückzahl ----------
  LOGIC.bruecke = {
    create(r, d) {
      const [W, H] = [[5, 4], [6, 5], [7, 5]][d], nObs = [4, 7, 10][d];
      for (let att = 0; ; att++) {
        const ra = r.int(H), rb = r.int(H), c = fill(W * H, 0), A = ra * W, Bc = rb * W + W - 1;
        if (att < 60) for (const i of r.shuffle(range(W * H)).filter(i => i !== A && i !== Bc).slice(0, nObs)) c[i] = 2;
        const p = bfsPath(W, H, (x, y) => c[y * W + x] !== 2, 0, ra, W - 1, rb);
        if (p) return { W, H, ra, rb, c, budget: p.length + [3, 2, 1][d], cnt: 0 };
      }
    },
    reach(st) {
      const on = fill(st.W * st.H, false); if (st.c[st.ra * st.W] !== 1) return on;
      const q = [st.ra * st.W]; on[q[0]] = true;
      for (let h = 0; h < q.length; h++) {
        const x = q[h] % st.W, y = (q[h] / st.W) | 0;
        for (let k = 0; k < 4; k++) {
          const nx = x + DX[k], ny = y + DY[k], n = ny * st.W + nx;
          if (nx >= 0 && ny >= 0 && nx < st.W && ny < st.H && !on[n] && st.c[n] === 1) { on[n] = true; q.push(n); }
        }
      }
      return on;
    },
    act(st, a) {
      if (a.t !== 'cell' || !inR(a.x, 0, st.W - 1) || !inR(a.y, 0, st.H - 1)) return;
      const i = a.y * st.W + a.x;
      if (st.c[i] === 2) st.err++;
      else if (st.c[i] === 1) { st.c[i] = 0; st.cnt--; }
      else if (st.cnt >= st.budget) st.err++;
      else { st.c[i] = 1; st.cnt++; }
    },
    done(st) { return !!bfsPath(st.W, st.H, (x, y) => st.c[y * st.W + x] === 1, 0, st.ra, st.W - 1, st.rb); },
    prog(st) { return st.cnt / st.budget * 0.9; },
    solve(st) {
      const p = bfsPath(st.W, st.H, (x, y) => st.c[y * st.W + x] !== 2, 0, st.ra, st.W - 1, st.rb), out = [];
      st.c.forEach((v, i) => { if (v === 1 && !p.includes(i)) out.push({ t: 'cell', x: i % st.W, y: (i / st.W) | 0 }); });
      p.forEach(i => { if (st.c[i] !== 1) out.push({ t: 'cell', x: i % st.W, y: (i / st.W) | 0 }); });
      return out;
    }
  };

  // 18 ---------- Radiowellen: Reflektoren kippen ----------
  const REFL = [[1, 0, 3, 2], [3, 2, 1, 0]];   // REFL[o][dir] → neue Richtung; o=0 '/', o=1 '\'
  LOGIC.wellen = {
    create(r, d) {
      const N = [5, 6, 7][d], turns = [2, 3, 4][d], dec = [1, 2, 3][d];
      for (let att = 0; ; att++) {
        const tn = att < 400 ? turns : 1;
        const er = r.int(N), used = new Set([er * N]), mir = []; let x = 0, y = er, dir = 1, ok = true;
        for (let t = 0; t <= tn && ok; t++) {
          const L = 1 + r.int(3);
          for (let s = 0; s < L; s++) {
            x += DX[dir]; y += DY[dir];
            if (x < 0 || y < 0 || x >= N || y >= N || used.has(y * N + x)) { ok = false; break; }
            used.add(y * N + x);
          }
          if (ok && t < tn) { const nd = r.chance(0.5) ? (dir + 1) % 4 : (dir + 3) % 4; mir.push({ x, y, o: REFL[0][dir] === nd ? 0 : 1, s: 1 }); dir = nd; }
        }
        if (!ok) continue;
        const rx = x, ry = y, free = range(N * N).filter(i => !used.has(i));
        for (const i of r.shuffle(free).slice(0, dec)) mir.push({ x: i % N, y: (i / N) | 0, o: r.int(2), s: 0 });
        const st = { N, er, rx, ry, m: r.shuffle(mir).map(m => ({ x: m.x, y: m.y, o: r.int(2) })), sol: null, flips: 0 };
        st.sol = st.m.map(m => { const o = mir.find(q => q.x === m.x && q.y === m.y); return o.s ? o.o : -1; });
        const pathIdx = st.sol.map((s, i) => s >= 0 ? i : -1).filter(i => i >= 0);
        for (let k = 0; k < 30 && LOGIC.wellen.done(st); k++) st.m[r.pick(pathIdx)].o ^= 1;
        if (!LOGIC.wellen.done(st)) return st;
      }
    },
    trace(st) {
      const N = st.N, mi = fill(N * N, -1); st.m.forEach((m, i) => { mi[m.y * N + m.x] = i; });
      let x = 0, y = st.er, dir = 1; const cells = [];
      for (let k = 0; k < 4 * N * N; k++) {
        cells.push(y * N + x);
        if (x === st.rx && y === st.ry) return { cells, hit: true };
        const j = mi[y * N + x]; if (j >= 0) dir = REFL[st.m[j].o][dir];
        x += DX[dir]; y += DY[dir];
        if (x < 0 || y < 0 || x >= N || y >= N) break;
      }
      return { cells, hit: false };
    },
    act(st, a) { if (a.t === 'flip' && inR(a.i, 0, st.m.length - 1)) { st.m[a.i].o ^= 1; st.flips++; } },
    done(st) { return LOGIC.wellen.trace(st).hit; },
    solve(st) { return st.m.map((m, i) => i).filter(i => st.sol[i] >= 0 && st.m[i].o !== st.sol[i]).map(i => ({ t: 'flip', i })); }
  };

  // 19 ---------- Sicherungen wechseln (mit Hauptschalter-Sicherheitsregel) ----------
  const DEVICES = ['Sender', 'Mischpult', 'Studiolicht', 'Kühlung', 'Server', 'Telefonanlage', 'Kaffeemaschine', 'Notlicht'];
  const AMPS = [6, 10, 16, 20, 25, 32];
  LOGIC.sicherung = {
    create(r, d) {
      const S = [6, 8, 8][d], nb = [2, 3, 4][d], names = r.shuffle(DEVICES).slice(0, S), blown = r.shuffle(range(S)).slice(0, nb);
      const slots = names.map((name, i) => ({ name, a: r.pick(AMPS), ok: !blown.includes(i) }));
      const spares = r.shuffle(blown.map(i => slots[i].a).concat(range([1, 2, 3][d]).map(() => r.pick(AMPS))));
      return { slots, spares, main: 1, sel: -1, nb, fb: '' };
    },
    act(st, a) {
      st.fb = '';
      if (a.t === 'main') st.main ^= 1;
      else if (a.t === 'pick' && inR(a.k, 0, st.spares.length - 1) && st.spares[a.k] !== null) st.sel = a.k;
      else if (a.t === 'put' && inR(a.s, 0, st.slots.length - 1) && st.sel >= 0 && !st.slots[a.s].ok) {
        if (st.main) { st.err++; st.fb = 'main'; }
        else if (st.spares[st.sel] === st.slots[a.s].a) { st.slots[a.s].ok = true; st.spares[st.sel] = null; st.sel = -1; }
        else { st.err++; st.fb = 'amp'; }
      }
    },
    done(st) { return st.main === 1 && st.slots.every(s => s.ok); },
    prog(st) { const f = st.nb - st.slots.filter(s => !s.ok).length; return (f + (LOGIC.sicherung.done(st) ? 1 : 0)) / (st.nb + 1); },
    solve(st) {
      const out = [], sp = st.spares.slice();
      if (st.main) out.push({ t: 'main' });
      st.slots.forEach((s, i) => { if (s.ok) return; const k = sp.indexOf(s.a); sp[k] = null; out.push({ t: 'pick', k }, { t: 'put', s: i }); });
      out.push({ t: 'main' }); return out;
    }
  };

  // 20 ---------- Studio-Licht-Memory (Paare) ----------
  LOGIC.licht_memory = {
    create(r, d) {
      const p = [4, 6, 8][d], kinds = r.shuffle(range(8)).slice(0, p);
      return { p, cards: r.shuffle(kinds.concat(kinds)), m: fill(2 * p, 0), up: [], miss: null };
    },
    act(st, a) {
      if (a.t === 'hide') { st.miss = null; return; }
      if (a.t !== 'flip' || !inR(a.i, 0, st.cards.length - 1)) return;
      st.miss = null;
      if (st.m[a.i] || st.up.includes(a.i)) return;
      st.up.push(a.i);
      if (st.up.length === 2) {
        const [x, y] = st.up; st.up = [];
        if (st.cards[x] === st.cards[y]) st.m[x] = st.m[y] = 1; else { st.miss = [x, y]; st.err++; }
      }
    },
    done(st) { return st.m.every(Boolean); },
    prog(st) { return sum(st.m) / st.m.length; },
    solve(st) {
      const out = [], open = st.up.slice(), done = st.m.slice();
      const partner = i => st.cards.findIndex((c, j) => j !== i && c === st.cards[i]);
      if (open.length === 1) { const j = partner(open[0]); out.push({ t: 'flip', i: j }); done[j] = done[open[0]] = 1; }
      st.cards.forEach((c, i) => { if (done[i]) return; const j = partner(i); done[i] = done[j] = 1; out.push({ t: 'flip', i }, { t: 'flip', i: j }); });
      return out;
    }
  };

  // 21 ---------- Akkus laden: Ladepakete exakt verteilen ----------
  LOGIC.akkus = {
    create(r, d) {
      const B = [3, 4, 5][d], cap = [], base = [], packs = [], owner = [];
      for (let b = 0; b < B; b++) {
        const c = 6 + r.int(5); cap.push(c); base.push(r.int(c - 2));
        for (let rem = c - base[b]; rem > 0;) { const p = 1 + r.int(Math.min(4, rem)); packs.push(p); owner.push(b); rem -= p; }
      }
      const ord = r.shuffle(range(packs.length));
      return { B, cap, base, packs: ord.map(i => packs[i]), sol: ord.map(i => owner[i]), used: fill(packs.length, -1) };
    },
    charge(st, b) { return st.base[b] + sum(st.packs.filter((p, i) => st.used[i] === b)); },
    act(st, a) {
      if (a.t === 'give' && inR(a.p, 0, st.packs.length - 1) && inR(a.b, 0, st.B - 1) && st.used[a.p] === -1) {
        if (LOGIC.akkus.charge(st, a.b) + st.packs[a.p] > st.cap[a.b]) st.err++; else st.used[a.p] = a.b;
      } else if (a.t === 'take' && inR(a.p, 0, st.packs.length - 1)) st.used[a.p] = -1;
    },
    done(st) { return range(st.B).every(b => LOGIC.akkus.charge(st, b) === st.cap[b]); },
    prog(st) { return range(st.B).filter(b => LOGIC.akkus.charge(st, b) === st.cap[b]).length / st.B; },
    solve(st) {
      const out = [];
      st.used.forEach((u, p) => { if (u !== -1 && u !== st.sol[p]) out.push({ t: 'take', p }); });
      st.sol.forEach((b, p) => { if (st.used[p] !== b) out.push({ t: 'give', p, b }); });
      return out;
    }
  };

  // 22 ---------- Notfunk: Sicherheitsreihenfolge, zum Schluss Taste halten ----------
  const CALLS = ['ANTON-7', 'BERTA-3', 'DORA-9', 'EMIL-2', 'FRIDA-5', 'GUSTAV-4', 'HEINZ-8'];
  LOGIC.notfunk = {
    create(r, d) {
      const steps = [['cover', 'arm', 'chan', 'hold'], ['cover', 'arm', 'chan', 'power', 'hold'], ['cover', 'ident', 'arm', 'chan', 'power', 'hold']][d];
      return { steps, pos: 0, chan: 1 + r.int(9), power: r.int(3), calls: r.shuffle(CALLS).slice(0, 3), ident: r.int(3), held: 0, holdN: [5, 7, 9][d] };
    },
    act(st, a) {
      const cur = st.steps[st.pos], fail = () => { st.err++; st.pos = 0; st.held = 0; };
      switch (a.t) {
        case 'cover': case 'arm': if (cur === a.t) st.pos++; else fail(); break;
        case 'chan': if (inR(a.v, 1, 9)) { if (cur === 'chan' && a.v === st.chan) st.pos++; else fail(); } break;
        case 'power': if (inR(a.v, 0, 2)) { if (cur === 'power' && a.v === st.power) st.pos++; else fail(); } break;
        case 'ident': if (inR(a.v, 0, 2)) { if (cur === 'ident' && a.v === st.ident) st.pos++; else fail(); } break;
        case 'hold': if (cur === 'hold') { if (++st.held >= st.holdN) st.pos++; } else fail(); break;
        case 'release': if (cur === 'hold' && st.held > 0) { st.held = 0; st.err++; } break;
      }
    },
    done(st) { return st.pos >= st.steps.length; },
    prog(st) { return (st.pos + (st.steps[st.pos] === 'hold' ? st.held / st.holdN : 0)) / st.steps.length; },
    solve(st) {
      const out = [];
      for (let p = st.pos; p < st.steps.length; p++) {
        const s = st.steps[p];
        if (s === 'hold') for (let k = p === st.pos ? st.held : 0; k < st.holdN; k++) out.push({ t: 'hold' });
        else out.push(s === 'chan' ? { t: s, v: st.chan } : s === 'power' ? { t: s, v: st.power } : s === 'ident' ? { t: s, v: st.ident } : { t: s });
      }
      return out;
    }
  };

  // 23 ---------- Playlist räumen: Regelverstöße markieren ----------
  LOGIC.playlist_clean = {
    create(r, d) {
      const N = [6, 8, 10][d], nR = [2, 3, 4][d];
      for (;;) {
        const rules = r.shuffle(['dup', 'long', 'genre', 'explicit', 'short']).slice(0, nR).map(k =>
          k === 'long' ? { k, v: r.pick([210, 240, 270]) } : k === 'short' ? { k, v: 90 } : k === 'genre' ? { k, v: r.shuffle(GENRES).slice(0, 3) } : { k });
        const names = r.shuffle(TITLES), hasDup = rules.some(x => x.k === 'dup');
        const tr = range(N).map(i => ({ title: names[i], genre: r.pick(GENRES), sec: 60 + r.int(300), ex: r.chance(0.2) ? 1 : 0 }));
        if (hasDup) for (let k = 1 + r.int(2); k > 0; k--) { const i = 1 + r.int(N - 1); tr[i].title = tr[r.int(i)].title; }
        const st = { N, rules, tr, rm: fill(N, 0), ok: false, fb: -1 };
        const bad = LOGIC.playlist_clean.bad(st).filter(Boolean).length;
        if (bad >= 1 && N - bad >= 2) return st;
      }
    },
    bad(st) {
      return st.tr.map((t, i) => st.rules.some(ru =>
        ru.k === 'dup' ? st.tr.slice(0, i).some(o => o.title === t.title) :
          ru.k === 'long' ? t.sec > ru.v : ru.k === 'short' ? t.sec < ru.v : ru.k === 'genre' ? !ru.v.includes(t.genre) : ru.k === 'explicit' ? !!t.ex : false));
    },
    act(st, a) {
      if (a.t === 'toggle' && inR(a.i, 0, st.N - 1)) { st.rm[a.i] ^= 1; st.fb = -1; }
      else if (a.t === 'apply') {
        const b = LOGIC.playlist_clean.bad(st), wrong = range(st.N).filter(i => !!st.rm[i] !== b[i]).length;
        if (wrong) { st.err++; st.fb = wrong; } else st.ok = true;
      }
    },
    done(st) { return st.ok; },
    solve(st) { const b = LOGIC.playlist_clean.bad(st); return range(st.N).filter(i => !!st.rm[i] !== b[i]).map(i => ({ t: 'toggle', i })).concat([{ t: 'apply' }]); }
  };

  // 24 ---------- Bühnenpanels (Lights-Out mit Zielmuster, garantiert lösbar) ----------
  LOGIC.buehne = {
    create(r, d) {
      const N = [3, 4, 5][d];
      for (;;) {
        const target = range(N * N).map(() => r.chance(0.4) ? 1 : 0), gen = fill(N * N, 0);
        for (const i of r.shuffle(range(N * N)).slice(0, [3, 5, 7][d])) gen[i] = 1;
        const st = { N, target, cur: target.slice(), gen, pressed: fill(N * N, 0) };
        gen.forEach((g, i) => { if (g) LOGIC.buehne.flipAt(st, i); });
        if (!LOGIC.buehne.done(st)) return st;
      }
    },
    flipAt(st, i) {
      const N = st.N, x = i % N, y = (i / N) | 0; st.cur[i] ^= 1;
      for (let k = 0; k < 4; k++) { const nx = x + DX[k], ny = y + DY[k]; if (nx >= 0 && ny >= 0 && nx < N && ny < N) st.cur[ny * N + nx] ^= 1; }
    },
    act(st, a) { if (a.t === 'press' && inR(a.i, 0, st.N * st.N - 1)) { LOGIC.buehne.flipAt(st, a.i); st.pressed[a.i] ^= 1; } },
    done(st) { return st.cur.every((v, i) => v === st.target[i]); },
    prog(st) { return st.cur.filter((v, i) => v === st.target[i]).length / st.cur.length; },
    solve(st) { return st.gen.map((g, i) => i).filter(i => st.gen[i] ^ st.pressed[i]).map(i => ({ t: 'press', i })); }
  };

  // ---------- öffentliche Schnittstelle ----------
  const byIdMap = {}; DEFS.forEach(d => { byIdMap[d.id] = d; });

  function fnv(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }

  const Tasks = {
    DEFS, LOGIC,
    ids: DEFS.map(d => d.id),
    byId: id => byIdMap[id] || null,
    create(id, seed, diff) {
      const L = LOGIC[id]; if (!L) throw new Error('Unbekannte Aufgabe: ' + id);
      diff = inR(diff, 0, 2) ? diff : 1;
      seed = (typeof seed === 'number' && isFinite(seed)) || typeof seed === 'string' ? seed : 0;
      const st = L.create(AMU.RNG(fnv(id + ':' + seed + ':' + diff)), diff);
      st.id = id; st.seed = seed; st.diff = diff; st.err = 0;
      return st;
    },
    act(id, st, a) {
      const L = LOGIC[id];
      if (!L || !isObj(st) || !isObj(a) || typeof a.t !== 'string') return st;
      try {
        if (a.t === 'reset') {
          const err = st.err | 0, fresh = Tasks.create(id, st.seed, st.diff);
          Object.keys(st).forEach(k => { delete st[k]; }); Object.assign(st, fresh); st.err = err;
          return st;
        }
        if (Tasks.done(id, st)) return st;
        L.act(st, a);
      } catch (e) { /* ungültige Eingabe ignorieren */ }
      return st;
    },
    done(id, st) { try { return !!(LOGIC[id] && isObj(st) && LOGIC[id].done(st)); } catch (e) { return false; } },
    prog(id, st) {
      const L = LOGIC[id]; if (!L || !L.prog) return null;
      try { const p = L.prog(st); return isFinite(p) ? clamp(p, 0, 1) : null; } catch (e) { return null; }
    },
    solve(id, st) { return LOGIC[id].solve(st); }
  };

  AMU.Tasks = Tasks;
  if (typeof module !== 'undefined' && module.exports) module.exports = Tasks;
})(typeof window !== 'undefined' ? window : globalThis);
