// Performance probe: walks the player through region 0 on a phone-sized
// viewport and reports CPU time per frame section (world update, HUD,
// sky, render) plus draw calls. Usage: node tests/e2e/perf.mjs [frames]
import { startSeeded, G } from './helpers.mjs';

const frames = Number(process.argv[2] || 240);
const t = await startSeeded({ width: 412, height: 860, touch: true });
const { page, errors } = t;
try {
  await G(page, () => {
    const g = window.__taschi, P = (window.__perf = { sections: {}, frames: [] });
    const wrap = (obj, name, key) => {
      const fn = obj[name].bind(obj);
      obj[name] = (...a) => { const t0 = performance.now(); const r = fn(...a); const s = (P.sections[key] ||= { sum: 0, max: 0, n: 0 }); const d = performance.now() - t0; s.sum += d; s.n++; if (d > s.max) s.max = d; return r; };
    };
    wrap(g.world, 'update', 'world.update');
    wrap(g.world, 'findNear', 'world.findNear');
    wrap(g.world, 'updateNPCs', 'world.npcs');
    wrap(g.world, 'updateWild', 'world.wild');
    wrap(g.world, 'movePlayer', 'world.movePlayer');
    wrap(g.hud, 'update', 'hud.update');
    wrap(g.sky, 'update', 'sky.update');
    wrap(g.renderer, 'render', 'render');
    P.spikes = []; P.resizes = 0;
    const rs = g.renderer.resize.bind(g.renderer); g.renderer.resize = () => { P.resizes++; rs(); };
    const rr = g.renderer.render.bind(g.renderer);
    g.renderer.render = (sc, cam) => { const p0 = g.renderer.renderer.info.programs.length, t0 = performance.now(); rr(sc, cam); const d = performance.now() - t0, p1 = g.renderer.renderer.info.programs.length; if (d > 60) P.spikes.push({ ms: Math.round(d), newPrograms: p1 - p0 }); };
    g.world.current.map.update = ((f) => function (...a) { const t0 = performance.now(); const r = f.apply(this, a); const s = (P.sections['map.update'] ||= { sum: 0, max: 0, n: 0 }); const d = performance.now() - t0; s.sum += d; s.n++; if (d > s.max) s.max = d; return r; })(g.world.current.map.update);
    let last = performance.now();
    const tick = () => { const n = performance.now(); P.frames.push(n - last); last = n; if (P.frames.length < 100000) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    // walk in a slow circle
    let a = 0;
    P.walk = setInterval(() => { a += 0.05; g.input.touch.joyVec = { x: Math.sin(a), y: -Math.abs(Math.cos(a)) }; }, 50);
  });
  await page.waitForFunction((n) => window.__perf.frames.length >= n, frames, { timeout: 600000 });
  const r = await G(page, () => {
    const g = window.__taschi, P = window.__perf; clearInterval(P.walk);
    const f = P.frames.slice(5), avg = f.reduce((a, b) => a + b, 0) / f.length;
    const out = {}; for (const [k, s] of Object.entries(P.sections)) out[k] = { avg: +(s.sum / s.n).toFixed(3), max: +s.max.toFixed(2) };
    return { frameAvg: +avg.toFixed(1), frameMax: +Math.max(...f).toFixed(1), calls: g.renderer.stats.calls, tris: g.renderer.stats.tris, sections: out, profile: g.renderer.profileName, spikes: P.spikes, resizes: P.resizes, programs: g.renderer.renderer.info.programs.length, pos: g.world.player.root.position.toArray().map(v => +v.toFixed(1)) };
  });
  console.log(JSON.stringify(r, null, 1));
  if (errors.length) console.log('Fehler:', errors);
} finally { await t.close(); }
