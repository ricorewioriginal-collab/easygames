// Raumrätsel für Werkzeug-Ruinen und die Uralte Höhle (angelehnt an klassische Dungeon-Rätsel, eigene Umsetzung):
//  tones   – Klangplatten: Melodie am Lauschstein anhören, dann die Platten in dieser Reihenfolge betreten
//  lights  – Lichtplatten: jedes Betreten schaltet die Platte und ihre Nachbarn um; alle müssen leuchten
//  statues – Wächterstatuen: Drehen (Aktion) dreht auch die Nachbarstatue; alle sollen zum Schatz blicken
//  pairs   – Symbolsteine: zwei aufdecken, Paare bleiben offen
//  orbs    – Glutkristalle: alle entzünden, bevor der erste wieder erlischt
// Alle Rätsel werden mit der Aktionstaste oder durch Betreten gelöst – gleich auf Handy, PC, TV und Controller.
export function createRooms({ T, mk, G, M, glow, scene, hgt, INT, anim, pl, toast, sfx, tone, emit }) {
  const NOTES = [392, 466, 523, 622, 698, 784];   // Tonleiter der Klangsteine
  const COLS = [0xff6a8a, 0xffc04a, 0x6aff9a, 0x4ac8ff, 0xb48aff, 0xffffff];
  const SYM = ['🌙', '🔥', '💧', '🍃', '⭐', '❄️', '⚡', '🌀'];
  const near = (x, z, r) => Math.hypot(pl.x - x, pl.z - z) < r;
  const rnd = (R, n) => (R() * n) | 0;
  // Trittfelder: meldet das Betreten (einmal je Betreten)
  function pad(x, z, r, col, onStep) {
    const y = hgt(x, z), m = mk(G.cyl, M(col, { e: col, ei: .25, m: .3, r: .4 }), x, y + .06, z, r, .12, r, false); scene.add(m);
    const o = { x, z, m, in: false, set(on, c) { m.material = M(c ?? col, { e: c ?? col, ei: on ? 1.6 : .25, m: .3, r: .4 }); } };
    anim(() => { const i = near(x, z, r * .9); if (i && !o.in) onStep(o); o.in = i; });
    return o;
  }
  function crystal(x, z, col, s = 1) {
    const g = new T.Group(), y = hgt(x, z); g.position.set(x, y, z);
    g.add(mk(G.cyl, M(0x5a5a6a, { r: .8 }), 0, .3, 0, .5 * s, .6, .5 * s));
    const c = mk(G.oct, M(col, { e: col, ei: .2, r: .2 }), 0, 1.3 * s, 0, .35 * s, .6 * s, .35 * s, false); g.add(c);
    const gl = glow(col, 3 * s, 0, 1.3 * s, 0, 0); g.add(gl); scene.add(g);
    return { g, c, gl, lit(on) { c.material = M(col, { e: col, ei: on ? 2 : .2, r: .2 }); gl.material.opacity = on ? .8 : 0; } };
  }
  const tag = (txt, x, y, z) => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'); g.font = '44px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 32, 36);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(cv), transparent: true })); sp.position.set(x, y, z); sp.scale.set(.9, .9, 1); scene.add(sp); return sp; };

  // area: {x0,x1,z0,z1} frei begehbare Fläche; opt.R Zufall; opt.lv Schwierigkeit (1…); done() wenn gelöst
  function build(kind, area, opt, done) {
    const R = opt.R || Math.random, lv = opt.lv || 1, W = area.x1 - area.x0, D = area.z1 - area.z0, cx = (area.x0 + area.x1) / 2, cz = (area.z0 + area.z1) / 2;
    let solved = !!opt.solved; const win = () => { if (solved) return; solved = true; sfx('level'); toast('✨ Rätsel gelöst!'); done(); };
    const say = t => toast(t);
    if (kind === 'tones') {
      const n = Math.min(6, 3 + (lv > 3) + (lv > 6)), len = Math.min(7, 3 + Math.floor(lv / 2)), mel = []; for (let i = 0; i < len; i++) mel.push(rnd(R, n));
      const ps = [], cs = []; let pos = 0;
      for (let i = 0; i < n; i++) { const x = area.x0 + (i + .5) * W / n; cs.push(crystal(x, area.z0 + .8, COLS[i], .6)); ps.push(pad(x, cz + D * .15, Math.min(1.1, W / n * .38), 0x8a8aa0, o => {
        if (solved) return; tone(NOTES[i], .5, 'sine', .25); cs[i].lit(true); setTimeout(() => !solved && cs[i].lit(false), 400);
        if (mel[pos] === i) { pos++; o.set(true, COLS[i]); setTimeout(() => o.set(false, 0x8a8aa0), 350); if (pos >= mel.length) { cs.forEach(c => c.lit(true)); win(); } }
        else { pos = 0; sfx('hurt'); say('Falscher Ton – die Melodie beginnt von vorn.'); } })); }
      const lx = area.x1 - .8, lz = area.z1 - .8, st = crystal(lx, lz, 0xe0e8ff, .7);
      INT.push({ x: lx, z: lz, name: 'Lauschstein', pr: 'Melodie anhören', rad: 2.4, vis: () => !solved, talk() { pos = 0; mel.forEach((k, j) => setTimeout(() => { tone(NOTES[k], .45, 'sine', .25); cs[k].lit(true); setTimeout(() => cs[k].lit(false), 380); }, j * 560)); st.lit(true); setTimeout(() => st.lit(false), mel.length * 560); say('🎵 Merk dir die Töne – dann betritt die Platten in dieser Reihenfolge.'); } });
      if (solved) cs.forEach(c => c.lit(true));
    } else if (kind === 'lights') {
      const N = lv > 5 ? 4 : 3, s = Math.min(W, D) / N, on = [], ps = [];
      const idx = (i, j) => i * N + j, flip = (i, j) => { for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = i + a, v = j + b; if (u >= 0 && v >= 0 && u < N && v < N) on[idx(u, v)] = !on[idx(u, v)]; } };
      for (let k = 0; k < N * N; k++) on.push(true);
      const presses = 3 + Math.min(5, lv); for (let k = 0; k < presses; k++) flip(rnd(R, N), rnd(R, N));
      if (on.every(Boolean)) flip(1, 1);
      const show = () => ps.forEach((p, k) => p.set(on[k], on[k] ? 0xffe27a : 0x3a3a5a));
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) ps.push(pad(cx + (i - (N - 1) / 2) * s, cz + (j - (N - 1) / 2) * s, s * .42, 0x3a3a5a, () => { if (solved) return; flip(i, j); tone(on[idx(i, j)] ? 660 : 440, .15, 'triangle', .15); show(); if (on.every(Boolean)) win(); }));
      if (solved) on.fill(true); show();
      say('💡 Lichtplatten: Jeder Schritt schaltet die Platte und ihre Nachbarn um. Bring alle zum Leuchten.');
    } else if (kind === 'statues') {
      const n = Math.min(5, 3 + (lv > 4)), face = [], st = [], tx = opt.tx ?? cx, tz = opt.tz ?? area.z0 - 3;
      const want = i => { const x = area.x0 + (i + .5) * W / n; return Math.atan2(tx - x, tz - cz); };
      for (let i = 0; i < n; i++) { const x = area.x0 + (i + .5) * W / n, g = new T.Group(); g.position.set(x, hgt(x, cz), cz);
        g.add(mk(G.box, M(0x7a7a8a, { r: .9 }), 0, .4, 0, .9, .8, .9)); g.add(mk(G.box, M(0x9a9aaa, { r: .8 }), 0, 1.3, 0, .5, 1, .4)); g.add(mk(G.sph, M(0x9a9aaa), 0, 2, 0, .32, .32, .32));
        g.add(mk(G.box, M(0xffd45a, { e: 0xffa020, ei: 1 }), 0, 2, .3, .2, .08, .08, false)); scene.add(g); st.push(g); face.push(solved ? 0 : 1 + rnd(R, 3)); }
      const show = () => st.forEach((g, i) => { g.rotation.y = want(i) + face[i] * Math.PI / 2; });
      st.forEach((g, i) => INT.push({ x: g.position.x, z: g.position.z, name: 'Wächterstatue', pr: 'Statue drehen', rad: 1.9, vis: () => !solved, talk() {
        for (const k of [i, i + 1]) if (k < n) face[k] = (face[k] + 1) % 4; sfx('pick'); show(); if (face.every(f => f === 0)) win(); } }));
      show(); say('🗿 Wächterstatuen: Jede Drehung bewegt auch die Statue rechts daneben. Alle sollen zum Schatz blicken.');
    } else if (kind === 'pairs') {
      const pairs = Math.min(5, 3 + Math.floor(lv / 3)), deck = []; for (let i = 0; i < pairs; i++) deck.push(i, i);
      for (let i = deck.length - 1; i > 0; i--) { const j = rnd(R, i + 1); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      const cols = Math.ceil(deck.length / 2), open = new Array(deck.length).fill(solved), stones = []; let first = -1, busy = false;
      deck.forEach((s, k) => { const i = k % cols, j = (k / cols) | 0, x = area.x0 + (i + .5) * W / cols, z = cz + (j ? 1 : -1) * Math.min(1.8, D / 4), g = mk(G.box, M(0x6a6a7a, { r: .9 }), x, hgt(x, z) + .7, z, .9, 1.4, .3); scene.add(g);
        const sp = tag(SYM[s], x, hgt(x, z) + 1.9, z); sp.visible = open[k]; stones.push(sp);
        INT.push({ x, z, name: 'Symbolstein', pr: 'Symbol aufdecken', rad: 1.6, vis: () => !open[k] && !solved, talk() {
          if (busy || open[k] || k === first) return; sp.visible = true; tone(520 + s * 60, .2, 'triangle', .15);
          if (first < 0) { first = k; return; }
          const a = first; first = -1;
          if (deck[a] === deck[k]) { open[a] = open[k] = true; sfx('pick'); if (open.every(Boolean)) win(); }
          else { busy = true; setTimeout(() => { stones[a].visible = stones[k].visible = false; busy = false; }, 900); } } }); });
      say('🔣 Symbolsteine: Deck zwei Steine auf. Gleiche Paare bleiben offen.');
    } else if (kind === 'orbs') {
      const n = opt.pos ? opt.pos.length : Math.min(5, 3 + Math.floor(lv / 4)), hold = opt.hold || Math.max(7, 16 - lv), lit = new Array(n).fill(0), cr = [];
      const P = opt.pos || Array.from({ length: n }, (_, i) => [cx + (i % 2 ? 1 : -1) * (W * .2 + (i >> 1) * W * .13), area.z0 + ((i * 2) % 3 + .5) * D / 3]);
      for (let i = 0; i < n; i++) { const [x, z] = P[i]; cr.push(crystal(x, z, 0xff8a3a, .8));
        INT.push({ x, z, name: 'Glutkristall', pr: 'Kristall entzünden', rad: 1.9, vis: () => !solved && lit[i] <= 0, talk() { lit[i] = hold; cr[i].lit(true); sfx('pick'); if (lit.every(v => v > 0)) win(); } }); }
      let last = 0;
      anim((t, dt) => { if (solved) return; const d = Math.min(.1, dt || (t - last)); last = t; for (let i = 0; i < n; i++) if (lit[i] > 0) { lit[i] -= d; if (lit[i] <= 0) cr[i].lit(false); } });
      if (solved) cr.forEach(c => c.lit(true));
      say(`🔥 Glutkristalle: Entzünde alle ${n}, bevor der erste nach ${hold} Sekunden erlischt.`);
    }
    return { get solved() { return solved; } };
  }
  return { build, KINDS: ['tones', 'lights', 'statues', 'pairs', 'orbs'] };
}
