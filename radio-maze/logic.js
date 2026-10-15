/* Radio Maze 3D – reproduzierbare Labyrinthe und Wegsuche, ohne DOM-Abhängigkeit. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RadioMazeLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DIRS = [{ x: 0, z: -1 }, { x: 1, z: 0 }, { x: 0, z: 1 }, { x: -1, z: 0 }];
  const key = (x, z) => x + ',' + z;
  function rng(seed) {
    let s = (seed | 0) || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
  }
  function inside(grid, x, z) { return z >= 0 && z < grid.length && x >= 0 && x < grid[0].length; }
  function walkable(grid, x, z) { return inside(grid, x, z) && grid[z][x] === 0; }
  function neighbors(grid, x, z) { return DIRS.map((d, i) => ({ x: x + d.x, z: z + d.z, dir: i })).filter(p => walkable(grid, p.x, p.z)); }
  function distanceMap(grid, sx, sz) {
    const dist = grid.map(r => r.map(() => Infinity));
    if (!walkable(grid, sx, sz)) return dist;
    const queue = [{ x: sx, z: sz }]; let head = 0;
    dist[sz][sx] = 0;
    while (head < queue.length) {
      const p = queue[head++];
      for (const n of neighbors(grid, p.x, p.z)) {
        if (dist[n.z][n.x] !== Infinity) continue;
        dist[n.z][n.x] = dist[p.z][p.x] + 1; queue.push(n);
      }
    }
    return dist;
  }
  function shortestDirection(grid, sx, sz, tx, tz) {
    if (!walkable(grid, sx, sz) || !walkable(grid, tx, tz)) return -1;
    const dist = distanceMap(grid, tx, tz);
    const ns = neighbors(grid, sx, sz);
    ns.sort((a, b) => dist[a.z][a.x] - dist[b.z][b.x]);
    return ns.length && Number.isFinite(dist[ns[0].z][ns[0].x]) ? ns[0].dir : -1;
  }
  function createLevel(level) {
    level = Math.max(1, Math.min(60, Math.floor(Number(level) || 1)));
    const size = 19 + 2 * Math.floor((level - 1) / 12);
    const random = rng(0x7ab3c17 ^ Math.imul(level, 2654435761));
    const grid = Array.from({ length: size }, () => Array(size).fill(1));
    const stack = [{ x: 1, z: 1 }]; grid[1][1] = 0;
    while (stack.length) {
      const p = stack[stack.length - 1], choices = [];
      for (const d of DIRS) {
        const x = p.x + 2 * d.x, z = p.z + 2 * d.z;
        if (x > 0 && z > 0 && x < size - 1 && z < size - 1 && grid[z][x] === 1) choices.push(d);
      }
      if (!choices.length) { stack.pop(); continue; }
      const d = choices[Math.floor(random() * choices.length)];
      grid[p.z + d.z][p.x + d.x] = 0;
      const next = { x: p.x + 2 * d.x, z: p.z + 2 * d.z };
      grid[next.z][next.x] = 0; stack.push(next);
    }
    // Zusätzliche Schleifen verhindern endlose Sackgassenjagden.
    for (let z = 2; z < size - 2; z++)
      for (let x = 2; x < size - 2; x++) {
        if (!grid[z][x]) continue;
        const horizontal = !grid[z][x - 1] && !grid[z][x + 1];
        const vertical = !grid[z - 1][x] && !grid[z + 1][x];
        if ((horizontal || vertical) && random() < 0.10 + Math.min(level / 600, .07)) grid[z][x] = 0;
      }
    const dist = distanceMap(grid, 1, 1), reachable = [];
    for (let z = 1; z < size - 1; z++)
      for (let x = 1; x < size - 1; x++)
        if (!grid[z][x] && Number.isFinite(dist[z][x])) reachable.push({ x, z, d: dist[z][x] });
    const remote = reachable.filter(p => p.d > size / 2).sort((a, b) => b.d - a.d);
    const occupied = new Set([key(1, 1)]);
    const ghosts = [];
    for (const p of remote) {
      if (ghosts.length >= Math.min(4, 2 + Math.floor((level - 1) / 10))) break;
      if (ghosts.every(g => Math.abs(g.x - p.x) + Math.abs(g.z - p.z) >= 5)) {
        ghosts.push({ x: p.x, z: p.z }); occupied.add(key(p.x, p.z));
      }
    }
    if (!ghosts.length && remote.length) { ghosts.push({ x: remote[0].x, z: remote[0].z }); occupied.add(key(remote[0].x, remote[0].z)); }
    const pool = reachable.filter(p => !occupied.has(key(p.x, p.z)) && p.d > 3);
    // Aus weit entfernten Wegpunkten entstehen die Verstärker und Radio-Logos.
    const far = pool.slice().sort((a, b) => b.d - a.d), specials = new Set();
    function choose(count) {
      const chosen = [];
      for (let i = 0; i < far.length && chosen.length < count; i++) {
        const p = far[i];
        if (specials.has(key(p.x, p.z))) continue;
        if (chosen.every(q => Math.abs(q.x - p.x) + Math.abs(q.z - p.z) > size / 3)) {
          chosen.push(p); specials.add(key(p.x, p.z));
        }
      }
      return chosen;
    }
    const power = choose(4).map(p => ({ x: p.x, z: p.z }));
    const logos = choose(3).map((p, i) => ({ x: p.x, z: p.z, id: ((level + i * 4 - 1) % 13) + 1 }));
    const pellets = reachable.filter(p => !occupied.has(key(p.x, p.z)) && !specials.has(key(p.x, p.z)))
      .map(p => ({ x: p.x, z: p.z }));
    return { level, size, grid, start: { x: 1, z: 1 }, ghosts, pellets, power, logos, theme: Math.floor((level - 1) / 10), reachable: reachable.length };
  }
  return { DIRS, key, rng, inside, walkable, neighbors, distanceMap, shortestDirection, createLevel };
});