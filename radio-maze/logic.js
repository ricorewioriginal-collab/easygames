/* Radio Maze 3D – Spiellogik nach den Arcade-Regeln des klassischen Labyrinth-Originals.
   Ohne DOM: wird im Browser von game.js genutzt und in Node von tools/test-radio-maze.cjs geprüft. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RadioMazeLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // # Wand · _ Leerraum außerhalb · . Frequenzpunkt · o Verstärker · - Tür des Geisterhauses · Leerzeichen Weg ohne Punkt
  const MAZE = [
    '############################',
    '#............##............#',
    '#.####.#####.##.#####.####.#',
    '#o####.#####.##.#####.####o#',
    '#.####.#####.##.#####.####.#',
    '#..........................#',
    '#.####.##.########.##.####.#',
    '#.####.##.########.##.####.#',
    '#......##....##....##......#',
    '######.##### ## #####.######',
    '_____#.##### ## #####.#_____',
    '_____#.##          ##.#_____',
    '_____#.## ###--### ##.#_____',
    '######.## #      # ##.######',
    '      .   #      #   .      ',
    '######.## #      # ##.######',
    '_____#.## ######## ##.#_____',
    '_____#.##          ##.#_____',
    '_____#.## ######## ##.#_____',
    '######.## ######## ##.######',
    '#............##............#',
    '#.####.#####.##.#####.####.#',
    '#.####.#####.##.#####.####.#',
    '#o..##.......  .......##..o#',
    '###.##.##.########.##.##.###',
    '###.##.##.########.##.##.###',
    '#......##....##....##......#',
    '#.##########.##.##########.#',
    '#.##########.##.##########.#',
    '#..........................#',
    '############################'
  ];
  const COLS = 28, ROWS = 31, TUNNEL_ROW = 14;
  const DIRS = [{ x: 0, z: -1 }, { x: 1, z: 0 }, { x: 0, z: 1 }, { x: -1, z: 0 }]; // hoch, rechts, runter, links
  const OPP = [2, 3, 0, 1];
  const PRIORITY = [0, 3, 2, 1]; // Gleichstand wie im Original: hoch, links, runter, rechts
  const BASE_SPEED = 9.47; // Felder pro Sekunde bei 100 %
  const NO_UP = new Set(['12,11', '15,11', '12,23', '15,23']);
  const DOOR_TARGET = { x: 13, z: 11 };
  const BONUS_POINTS = [100, 300, 500, 700, 1000, 2000, 3000, 5000];
  const GHOST_POINTS = [200, 400, 800, 1600];
  const key = (x, z) => x + ',' + z;

  function cell(x, z) {
    if (z === TUNNEL_ROW && (x < 0 || x >= COLS)) return ' ';
    if (z < 0 || z >= ROWS || x < 0 || x >= COLS) return '#';
    return MAZE[z][x];
  }
  function walkable(x, z) { const c = cell(x, z); return c !== '#' && c !== '_' && c !== '-'; }
  function inHouse(x, z) { return z >= 13 && z <= 15 && x >= 11 && x <= 16; }

  // Schwierigkeit pro Level nach der Original-Tabelle; ab Level 21 bleibt sie konstant.
  function levelSpec(level) {
    const n = Math.max(1, Math.floor(Number(level) || 1));
    const fright = [6, 5, 4, 3, 2, 5, 2, 2, 1, 5, 2, 1, 1, 3, 1, 1, 0, 1];
    const flashes = [5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 5, 3, 3, 5, 3, 3, 0, 3];
    const early = n < 5;
    return {
      level: n,
      pac: n === 1 ? .8 : early ? .9 : n < 21 ? 1 : .9,
      pacFright: n === 1 ? .9 : early ? .95 : 1,
      ghost: n === 1 ? .75 : early ? .85 : .95,
      tunnel: n === 1 ? .4 : early ? .45 : .5,
      ghostFright: n === 1 ? .5 : early ? .55 : .6,
      elroyDots: n === 1 ? 20 : n === 2 ? 30 : n <= 5 ? 40 : n <= 8 ? 50 : n <= 11 ? 60 : n <= 14 ? 80 : n <= 18 ? 100 : 120,
      elroy: n === 1 ? .8 : early ? .9 : 1,
      fright: n <= 18 ? fright[n - 1] : 0,
      flashes: n <= 18 ? flashes[n - 1] : 0,
      modes: n === 1 ? [7, 20, 7, 20, 5, 20, 5, Infinity] : early ? [7, 20, 7, 20, 5, 1033, 1 / 60, Infinity] : [5, 20, 5, 20, 5, 1037, 1 / 60, Infinity],
      bonus: Math.min(7, [0, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6][n - 1] ?? 7),
      release: [0, 0, n === 1 ? 30 : 0, n === 1 ? 60 : n === 2 ? 50 : 0],
      idle: early ? 4 : 3
    };
  }

  const ALL_DOTS = [], ALL_POWER = [];
  for (let z = 0; z < ROWS; z++) for (let x = 0; x < COLS; x++) {
    if (MAZE[z][x] === '.') ALL_DOTS.push(key(x, z));
    else if (MAZE[z][x] === 'o') ALL_POWER.push(key(x, z));
  }
  const TOTAL = ALL_DOTS.length + ALL_POWER.length;

  function resetActors(g) {
    g.pac = { px: 13.5, pz: 23, tx: 13, tz: 23, dir: 3, want: 3, moving: true };
    const ghost = (id, px, pz, state, scatter) => ({ id, px, pz, tx: px, tz: pz, dir: id === 0 ? 3 : id === 1 ? 2 : 0,
      state, scatter, fright: false, dots: 0 });
    g.ghosts = [
      ghost(0, 13.5, 11, 'active', { x: 25, z: -3 }),
      ghost(1, 13.5, 14, 'house', { x: 2, z: -3 }),
      ghost(2, 11.5, 14, 'house', { x: 27, z: 34 }),
      ghost(3, 15.5, 14, 'house', { x: 0, z: 34 })
    ];
    g.ghosts[0].tx = 13;
    g.modeIndex = 0; g.modeTime = 0; g.frightTime = 0; g.combo = 0; g.idle = 0; g.stall = 0;
    g.fruit = null;
  }

  function createGame(level, opts) {
    opts = opts || {};
    const spec = levelSpec(level);
    const eaten = new Set(Array.isArray(opts.eaten) ? opts.eaten : []);
    const g = {
      level: spec.level, spec,
      dots: new Set(ALL_DOTS.filter(k => !eaten.has(k))),
      power: new Set(ALL_POWER.filter(k => !eaten.has(k))),
      score: Math.max(0, Math.floor(opts.score || 0)),
      lives: Math.max(1, Math.floor(opts.lives || 3)),
      extraGiven: !!opts.extraGiven || (opts.score || 0) >= 10000,
      phase: 'ready', phaseTime: opts.readyTime ?? 2.2, fruitsSpawned: 0, globalCounter: null, elapsed: 0
    };
    // Bereits ausgelöste Bonus-Logos nach einem Fortsetzen nicht erneut anbieten.
    const done = TOTAL - g.dots.size - g.power.size;
    g.fruitsSpawned = done >= 170 ? 2 : done >= 70 ? 1 : 0;
    resetActors(g);
    return g;
  }
  const remaining = g => g.dots.size + g.power.size;
  const eatenList = g => ALL_DOTS.filter(k => !g.dots.has(k)).concat(ALL_POWER.filter(k => !g.power.has(k)));

  function addScore(g, points, ev) {
    const before = g.score;
    g.score += points;
    if (!g.extraGiven && before < 10000 && g.score >= 10000) { g.extraGiven = true; g.lives++; ev.push({ type: 'extra' }); }
  }

  // Bewegt eine Figur entlang der Feldmitten; onCenter entscheidet an jeder Mitte die nächste Richtung.
  function advance(e, dist, onCenter) {
    for (let guard = 0; dist > 1e-9 && guard < 8; guard++) {
      const rem = Math.abs(e.tx - e.px) + Math.abs(e.tz - e.pz);
      if (rem > dist) { e.px += Math.sign(e.tx - e.px) * dist; e.pz += Math.sign(e.tz - e.pz) * dist; return; }
      e.px = e.tx; e.pz = e.tz; dist -= rem;
      if (e.px <= -1 && e.dir === 3) e.px = e.tx = COLS;
      else if (e.px >= COLS && e.dir === 1) e.px = e.tx = -1;
      onCenter(e);
      if (e.tx === e.px && e.tz === e.pz) return;
    }
  }
  function reverse(e) {
    const d = DIRS[e.dir];
    if (e.tx !== e.px || e.tz !== e.pz) { e.tx -= d.x; e.tz -= d.z; }
    e.dir = OPP[e.dir];
  }
  const tileOf = e => ({ x: Math.floor(e.px + .5), z: Math.floor(e.pz + .5) });

  function ghostTarget(g, gh) {
    if (gh.state === 'eaten') return DOOR_TARGET;
    const p = tileOf(g.pac), d = DIRS[g.pac.dir];
    const elroy = gh.id === 0 && remaining(g) <= g.spec.elroyDots;
    if (g.modeIndex % 2 === 0 && !elroy) return gh.scatter;
    // Original-Eigenheit: beim Blick nach oben liegt das Ziel zusätzlich nach links verschoben.
    const ahead = n => ({ x: p.x + d.x * n - (g.pac.dir === 0 ? n : 0), z: p.z + d.z * n });
    if (gh.id === 0) return p;
    if (gh.id === 1) return ahead(4);
    if (gh.id === 2) {
      const a = ahead(2), b = tileOf(g.ghosts[0]);
      return { x: 2 * a.x - b.x, z: 2 * a.z - b.z };
    }
    const t = tileOf(gh), dx = t.x - p.x, dz = t.z - p.z;
    return dx * dx + dz * dz > 64 ? p : gh.scatter;
  }

  function chooseGhostDir(g, gh, rand) {
    const x = gh.px, z = gh.pz;
    let options = PRIORITY.filter(i => i !== OPP[gh.dir] && walkable(x + DIRS[i].x, z + DIRS[i].z));
    if (gh.state === 'active' && !gh.fright && NO_UP.has(key(x, z))) options = options.filter(i => i !== 0);
    if (!options.length) options = [OPP[gh.dir]];
    if (gh.fright && gh.state === 'active') return options[Math.floor(rand() * options.length)];
    const t = ghostTarget(g, gh);
    let best = options[0], bestD = Infinity;
    for (const i of options) {
      const dx = x + DIRS[i].x - t.x, dz = z + DIRS[i].z - t.z, dd = dx * dx + dz * dz;
      if (dd < bestD) { bestD = dd; best = i; }
    }
    return best;
  }

  function ghostSpeed(g, gh) {
    if (gh.state === 'eaten' || gh.state === 'entering') return 1.6;
    if (gh.state !== 'active') return .5;
    if (gh.fright) return g.spec.ghostFright;
    if (gh.pz === TUNNEL_ROW && (gh.px <= 5 || gh.px >= 22)) return g.spec.tunnel;
    if (gh.id === 0) {
      const left = remaining(g);
      if (left <= g.spec.elroyDots / 2) return g.spec.elroy + .05;
      if (left <= g.spec.elroyDots) return g.spec.elroy;
    }
    return g.spec.ghost;
  }

  // Geradlinige Bewegung im Geisterhaus (zuerst waagerecht, dann senkrecht).
  function moveTo(gh, x, z, dist) {
    const dx = x - gh.px;
    if (Math.abs(dx) > 1e-9) { const s = Math.min(Math.abs(dx), dist); gh.px += Math.sign(dx) * s; dist -= s; gh.dir = dx > 0 ? 1 : 3; }
    const dz = z - gh.pz;
    if (dist > 0 && Math.abs(dz) > 1e-9) { const s = Math.min(Math.abs(dz), dist); gh.pz += Math.sign(dz) * s; gh.dir = dz > 0 ? 2 : 0; }
    return Math.abs(gh.px - x) < 1e-9 && Math.abs(gh.pz - z) < 1e-9;
  }

  function nextInHouse(g) {
    for (const id of [1, 2, 3]) if (g.ghosts[id].state === 'house') return g.ghosts[id];
    return null;
  }
  function release(gh) { gh.state = 'leaving'; }

  function updateHouse(g) {
    const gh = nextInHouse(g);
    if (!gh) return;
    if (g.globalCounter !== null) {
      const need = [0, 7, 17, 32][gh.id];
      if (g.globalCounter >= need) { release(gh); if (gh.id === 3) g.globalCounter = null; }
    } else if (gh.dots >= g.spec.release[gh.id]) release(gh);
  }

  function eatAt(g, ev) {
    const k = key(g.pac.px, g.pac.pz);
    let what = null;
    if (g.dots.has(k)) { g.dots.delete(k); addScore(g, 10, ev); g.stall += 1 / 60; what = 'dot'; }
    else if (g.power.has(k)) { g.power.delete(k); addScore(g, 50, ev); g.stall += 3 / 60; what = 'power'; }
    if (!what) return;
    g.idle = 0;
    if (g.globalCounter !== null) g.globalCounter++;
    else { const gh = nextInHouse(g); if (gh) gh.dots++; }
    ev.push({ type: what, key: k });
    if (what === 'power') {
      g.combo = 0;
      for (const gh of g.ghosts) if (gh.state === 'active') reverse(gh);
      if (g.spec.fright > 0) {
        g.frightTime = g.spec.fright;
        for (const gh of g.ghosts) if (gh.state !== 'eaten' && gh.state !== 'entering') gh.fright = true;
      }
    }
    const done = TOTAL - remaining(g);
    if ((done === 70 || done === 170) && g.fruitsSpawned < (done === 70 ? 1 : 2)) {
      g.fruitsSpawned++;
      g.fruit = { x: 13.5, z: 17, time: 9 + ((done * 7) % 10) / 10, points: BONUS_POINTS[g.spec.bonus], index: g.spec.bonus };
      ev.push({ type: 'fruitShow' });
    }
    if (remaining(g) === 0) { g.phase = 'cleared'; g.phaseTime = 2.2; ev.push({ type: 'cleared' }); }
  }

  function updatePac(g, dt, ev) {
    const p = g.pac;
    if (g.stall > 0) { const s = Math.min(g.stall, dt); g.stall -= s; dt -= s; }
    if (dt <= 0) return;
    if (p.moving && p.want === OPP[p.dir]) reverse(p);
    if (!p.moving) {
      const d = DIRS[p.want];
      if (walkable(p.px + d.x, p.pz + d.z)) { p.dir = p.want; p.tx = p.px + d.x; p.tz = p.pz + d.z; p.moving = true; }
      else return;
    }
    const speed = (g.frightTime > 0 ? g.spec.pacFright : g.spec.pac) * BASE_SPEED;
    advance(p, speed * dt, e => {
      eatAt(g, ev);
      if (g.phase !== 'play') { e.moving = false; return; }
      const w = DIRS[e.want];
      if (walkable(e.px + w.x, e.pz + w.z)) e.dir = e.want;
      const d = DIRS[e.dir];
      if (walkable(e.px + d.x, e.pz + d.z)) { e.tx = e.px + d.x; e.tz = e.pz + d.z; }
      else e.moving = false;
    });
  }

  function updateGhost(g, gh, dt, rand) {
    const dist = ghostSpeed(g, gh) * BASE_SPEED * dt;
    if (gh.state === 'house') {
      // Auf und ab wippen, bis der Geist freigegeben wird.
      const target = gh.dir === 0 ? 13.6 : 14.4;
      if (moveTo(gh, gh.px, target, dist)) gh.dir = gh.dir === 0 ? 2 : 0;
      return;
    }
    if (gh.state === 'leaving') {
      if (moveTo(gh, 13.5, 11, dist)) {
        gh.state = 'active'; gh.dir = 3; gh.tx = 13; gh.tz = 11;
      }
      return;
    }
    if (gh.state === 'entering') {
      if (moveTo(gh, 13.5, 14, dist)) { gh.state = 'leaving'; gh.fright = false; }
      return;
    }
    advance(gh, dist, e => {
      if (e.state === 'eaten' && e.pz === 11 && (e.px === 13 || e.px === 14)) { e.state = 'entering'; e.tx = e.px; e.tz = e.pz; return; }
      e.dir = chooseGhostDir(g, e, rand);
      e.tx = e.px + DIRS[e.dir].x; e.tz = e.pz + DIRS[e.dir].z;
    });
  }

  function collide(g, ev) {
    const p = g.pac, pt = tileOf(p);
    for (const gh of g.ghosts) {
      if (gh.state !== 'active') continue;
      const gt = tileOf(gh);
      const near = Math.abs(gh.px - p.px) + Math.abs(gh.pz - p.pz) < .6 || (gt.x === pt.x && gt.z === pt.z);
      if (!near) continue;
      if (gh.fright) {
        gh.fright = false; gh.state = 'eaten';
        const points = GHOST_POINTS[Math.min(3, g.combo++)];
        addScore(g, points, ev);
        ev.push({ type: 'ghost', id: gh.id, points, x: gh.px, z: gh.pz });
        g.phase = 'eatghost'; g.phaseTime = 1;
        return;
      }
      g.phase = 'dying'; g.phaseTime = 2; ev.push({ type: 'death' });
      return;
    }
    if (g.fruit && Math.abs(p.px - g.fruit.x) < .7 && Math.abs(p.pz - g.fruit.z) < .5) {
      addScore(g, g.fruit.points, ev);
      ev.push({ type: 'fruit', points: g.fruit.points, index: g.fruit.index });
      g.fruit = null;
    }
  }

  // Ein Simulationsschritt. Gibt Ereignisse für Ton, Anzeige und Speicherung zurück.
  function step(g, dt, rand) {
    rand = rand || Math.random;
    const ev = [];
    dt = Math.max(0, Math.min(.05, dt || 0));
    if (g.phase === 'over' || g.phase === 'done') return ev;
    if (g.phase !== 'play') {
      g.phaseTime -= dt;
      if (g.phaseTime > 0) return ev;
      if (g.phase === 'ready' || g.phase === 'eatghost') { g.phase = 'play'; ev.push({ type: 'go' }); }
      else if (g.phase === 'dying') {
        g.lives--;
        if (g.lives <= 0) { g.phase = 'over'; ev.push({ type: 'gameover' }); }
        else { resetActors(g); g.globalCounter = 0; g.phase = 'ready'; g.phaseTime = 2; ev.push({ type: 'respawn' }); }
      } else if (g.phase === 'cleared') { g.phase = 'done'; ev.push({ type: 'levelDone' }); }
      return ev;
    }
    g.elapsed += dt;
    if (g.frightTime > 0) {
      g.frightTime -= dt;
      if (g.frightTime <= 0) { g.frightTime = 0; g.combo = 0; for (const gh of g.ghosts) gh.fright = false; ev.push({ type: 'frightEnd' }); }
    } else if (g.modeIndex < g.spec.modes.length - 1) {
      g.modeTime += dt;
      if (g.modeTime >= g.spec.modes[g.modeIndex]) {
        g.modeTime = 0; g.modeIndex++;
        for (const gh of g.ghosts) if (gh.state === 'active') reverse(gh);
      }
    }
    if (g.fruit) { g.fruit.time -= dt; if (g.fruit.time <= 0) { g.fruit = null; ev.push({ type: 'fruitGone' }); } }
    g.idle += dt;
    if (g.idle >= g.spec.idle) { g.idle = 0; const gh = nextInHouse(g); if (gh) release(gh); }
    updateHouse(g);
    updatePac(g, dt, ev);
    if (g.phase !== 'play') return ev;
    collide(g, ev);
    if (g.phase !== 'play') return ev;
    for (const gh of g.ghosts) updateGhost(g, gh, dt, rand);
    collide(g, ev);
    return ev;
  }

  function steer(g, dir) { if (dir >= 0 && dir <= 3) g.pac.want = dir; }

  return { MAZE, COLS, ROWS, TUNNEL_ROW, DIRS, OPP, BASE_SPEED, TOTAL, ALL_DOTS, ALL_POWER, BONUS_POINTS, GHOST_POINTS,
    key, cell, walkable, inHouse, levelSpec, createGame, step, steer, remaining, eatenList, ghostTarget };
});
