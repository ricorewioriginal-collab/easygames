/* Krawallvögel 3D – Spiellogik mit Planck.js (Box2D): Physik, Schaden, Fähigkeiten, Punkte. Ohne DOM, in Node testbar. */
(function (root) {
'use strict';
const P = root.planck || require('../vendor/planck-1.4.2.min.js');
const K = root.KVLevels || require('./levels.js');
const DT = 1 / 60, GRAVITY = 10;
const DMG = 0.1, PIG_DMG = 0.3, MIN_V = 1.0;   // Schaden = Aufprallenergie über MIN_V × Faktor
const V = (x, y) => P.Vec2(x, y);

function pullToShot(dx, dy, vmax) {
  const len = Math.hypot(dx, dy), max = K.SLING.maxPull;
  const k = len > max ? max / len : 1, px = dx * k, py = dy * k, f = Math.min(len, max) / max;
  const ang = Math.atan2(-py, -px);
  return { px:K.SLING.x + px, py:K.SLING.y + py, vx:Math.cos(ang) * vmax * f, vy:Math.sin(ang) * vmax * f, power:f };
}
function trajectory(px, py, vx, vy, count, step, out) {
  out = out || [];
  for (let i = 0; i < count; i++) { const t = i * step; out[i] = [px + vx * t, py + vy * t - 0.5 * GRAVITY * t * t]; }
  out.length = count; return out;
}

function createSim(level, opts) {
  opts = opts || {};
  const world = new P.World({ gravity:V(0, -GRAVITY) });
  const S = { level, world, ents:[], events:[], score:0, time:0, state:'ready', queue:level.birds.slice(), active:[], pigsLeft:0,
    readyAt:0, vmax:K.SLING.vmax, seed:false, scope:false, quakeUntil:0, waitStart:0, winAt:0, nextId:1, bonusBirds:0, gold:false, logos:[],
    shots:0, destroyed:{ glass:0, wood:0, stone:0 } };
  const ev = e => { S.events.push(e); };
  const add = e => { e.id = S.nextId++; S.ents.push(e); ev({ type:'spawn', ent:e }); return e; };

  // Boden und Gelände
  const ground = world.createBody({ type:'static' });
  ground.createFixture(new P.Box((level.width + 140) / 2, 4, V((level.width + 140) / 2 - 60, -4), 0), { friction:0.9, userData:{ kind:'terrain' } });
  level.terrain.forEach(tr => {
    const b = world.createBody({ type:'static' });
    b.createFixture(new P.Polygon(tr.pts.map(p => V(p[0], p[1]))), { friction:0.9, userData:{ kind:'terrain', ledge:!!tr.ledge } });
  });

  level.blocks.forEach(d => {
    const M = K.MATERIALS[d.m];
    const body = world.createBody({ type:'dynamic', position:V(d.x, d.y), angle:d.a || 0, awake:false, angularDamping:d.t === 'circle' ? 0.6 : 0.05 });
    let shape, area, rad;
    if (d.t === 'circle') { shape = new P.Circle(d.r); area = Math.PI * d.r * d.r; rad = d.r; }
    else if (d.t === 'tri') {
      shape = new P.Polygon(d.pts.map(p => V(p[0], p[1])));
      const p = d.pts; area = Math.abs((p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) - (p[2][0] - p[0][0]) * (p[1][1] - p[0][1])) / 2; rad = 0.6;
    } else { shape = new P.Box(d.w / 2, d.h / 2); area = d.w * d.h; rad = Math.min(d.w, d.h) / 2; }
    const hp = Math.max(M.minHp, M.hp * area);
    const e = add({ kind:'block', def:d, m:d.m, body, hp, maxHp:hp, rad });
    body.createFixture(shape, { density:M.density, friction:M.friction, restitution:M.restitution, userData:e });
    body.setUserData(e);
  });
  level.pigs.forEach(d => {
    const T = K.PIGS[d.k], hp = T.hp * (d.hpScale || 1);
    const body = world.createBody({ type:'dynamic', position:V(d.x, d.y), awake:false, angularDamping:1.2 });
    const e = add({ kind:'pig', def:d, k:d.k, body, hp, maxHp:hp, rad:T.r });
    body.createFixture(new P.Circle(T.r), { density:0.9, friction:0.7, restitution:0.15, userData:e });
    body.setUserData(e); S.pigsLeft++;
  });

  // ---------- Schaden ----------
  const wm = new P.WorldManifold();
  function damage(e, E, other, x, y) {
    if (!e || e.dead || e.kind === 'terrain' || e.kind === 'eagle') return;
    if (e.kind === 'bird' || e.kind === 'egg') return;   // Treffer markiert der pre-solve-Handler
    let f = e.kind === 'pig' ? PIG_DMG : DMG;
    if (other) {
      if (other.kind === 'bird') f *= (e.kind === 'block' && K.BIRDS[other.type].mult[e.m]) || 1.2, f *= other.power || 1;
      else if (other.kind === 'eagle') f *= 4;
      else if (other.kind === 'terrain' && e.kind === 'pig') f *= 0.6;
    }
    const dmg = E * f;
    if (dmg < 0.02) return;
    e.hp -= dmg;
    if (dmg > 0.12 * e.maxHp || dmg > 1.5) ev({ type:'hit', ent:e, x, y, m:e.kind === 'pig' ? 'pig' : e.m, power:Math.min(1, dmg / e.maxHp) });
  }
  world.on('pre-solve', contact => {
    const fa = contact.getFixtureA(), fb = contact.getFixtureB();
    const ea = fa.getUserData(), eb = fb.getUserData();
    const ba = fa.getBody(), bb = fb.getBody();
    if (!ba.isAwake() && !bb.isAwake()) return;
    contact.getWorldManifold(wm);
    if (!wm.pointCount) return;
    let approach = 0, cx = 0, cy = 0;
    for (let i = 0; i < wm.pointCount; i++) {
      const p = wm.points[i], va = ba.getLinearVelocityFromWorldPoint(p), vb = bb.getLinearVelocityFromWorldPoint(p);
      const rel = (vb.x - va.x) * wm.normal.x + (vb.y - va.y) * wm.normal.y;
      if (-rel > approach) approach = -rel;
      cx += p.x / wm.pointCount; cy += p.y / wm.pointCount;
    }
    const mark = e => { if (e && (e.kind === 'bird' || e.kind === 'egg')) { if (!e.hit) { e.hit = true; e.hitAt = S.time; } if (e.kind === 'egg' && (e === ea ? eb : ea) !== e.owner) e.boom = true; } };
    mark(ea); mark(eb);
    const vn = approach - MIN_V;
    if (vn <= 0) return;
    const ma = ba.isDynamic() ? ba.getMass() : Infinity, mb = bb.isDynamic() ? bb.getMass() : Infinity;
    const mred = ma === Infinity ? mb : mb === Infinity ? ma : ma * mb / (ma + mb);
    if (!isFinite(mred)) return;
    const E = 0.5 * mred * vn * vn;
    damage(ea, E, eb, cx, cy); damage(eb, E, ea, cx, cy);
  });

  // ---------- Explosionen ----------
  function explode(x, y, R, power, dmg, src) {
    const bodies = new Set();
    world.queryAABB(P.AABB(V(x - R, y - R), V(x + R, y + R)), fx => { const b = fx.getBody(); if (b.isDynamic()) bodies.add(b); return true; });
    bodies.forEach(b => {
      const e = b.getUserData(); if (!e || e.dead || e === src) return;
      const c = b.getWorldCenter(), dx = c.x - x, dy = c.y - y, dist = Math.hypot(dx, dy), d = Math.max(0, dist - (e.rad || 0.5));
      const f = 1 - d / R; if (f <= 0) return;
      const nx = dist > 1e-3 ? dx / dist : 0, ny = dist > 1e-3 ? dy / dist : 1;
      const imp = power * f * Math.sqrt(b.getMass());
      b.setAwake(true);
      b.applyLinearImpulse(V(nx * imp, ny * imp + imp * 0.25), c, true);
      if (dmg && (e.kind === 'pig' || e.kind === 'block')) e.hp -= dmg * f * (e.kind === 'block' && e.m === 'stone' ? 1.4 : 1) * (e.kind === 'pig' ? 1.2 : 1);
    });
    ev({ type:'boom', x, y, r:R, damage:!!dmg });
  }

  // ---------- Entfernen ----------
  function kill(e, reason) {
    if (e.dead) return;
    e.dead = true;
    const p = e.body.getPosition(), x = p.x, y = p.y;
    world.destroyBody(e.body);
    if (e.kind === 'pig') {
      S.pigsLeft--; const sc = K.PIGS[e.k].score; S.score += sc;
      ev({ type:'pig', ent:e, x, y, score:sc, reason });
    } else if (e.kind === 'block') {
      const M = K.MATERIALS[e.m], sc = reason === 'out' ? 0 : M.score; S.score += sc;
      if (S.destroyed[e.m] !== undefined) S.destroyed[e.m]++;
      ev({ type:'destroy', ent:e, x, y, m:e.m, score:sc });
      if (e.m === 'tnt' && reason !== 'out') explode(x, y, 4.2, 9, 14, e);
      if (e.m === 'logo') { S.logos.push(e.def.logo); ev({ type:'logo', logo:e.def.logo, x, y }); }
      if (e.m === 'gold') { S.gold = true; ev({ type:'gold', logo:e.def.logo, x, y }); }
    } else ev({ type:'gone', ent:e, x, y });
    ev({ type:'remove', ent:e });
  }
  function processDeaths() {
    for (let guard = 0; guard < 25; guard++) {
      let any = false;
      for (const e of S.ents) if (!e.dead && (e.kind === 'pig' || e.kind === 'block') && e.hp <= 0) { kill(e, 'hp'); any = true; }
      for (const e of S.ents) if (!e.dead && e.kind === 'egg' && e.boom) { const p = e.body.getPosition(); kill(e); explode(p.x, p.y, 3.4, 10, 16, e); any = true; }
      if (!any) break;
    }
  }
  function checkBounds() {
    for (const e of S.ents) {
      if (e.dead || e.kind === 'eagle') continue;
      const p = e.body.getPosition();
      if (p.y < -8 || p.x < -55 || p.x > level.width + 75) {
        if (e.kind === 'bird') { e.done = true; kill(e); } else kill(e, 'out');
      }
    }
  }

  // ---------- Vögel ----------
  function makeBird(type, x, y, vx, vy, power) {
    const T = K.BIRDS[type], scale = power > 1 ? 1.8 : 1, r = T.r * scale;
    const body = world.createBody({ type:'dynamic', position:V(x, y), bullet:true, angularDamping:0.9, linearVelocity:V(vx, vy) });
    const e = add({ kind:'bird', type, body, r, rad:r, power:power || 1, launchAt:S.time, hit:false, used:false, done:false, slowSince:0 });
    body.createFixture(new P.Circle(r), { density:T.density, friction:0.6, restitution:0.25, userData:e });
    body.setUserData(e);
    S.active.push(e);
    return e;
  }
  S.birdOnSling = () => (S.state === 'ready' && S.queue.length ? S.queue[0] : null);
  S.canShoot = () => S.state === 'ready' && S.time >= S.readyAt && S.queue.length > 0;
  S.shot = (dx, dy) => pullToShot(dx, dy, S.vmax);
  S.launch = (dx, dy) => {
    if (!S.canShoot()) return false;
    const s = pullToShot(dx, dy, S.vmax);
    if (s.power < 0.12) return false;
    const type = S.queue.shift();
    const e = makeBird(type, s.px, s.py, s.vx, s.vy, S.seed ? 1.6 : 1);
    S.seed = false; S.state = 'flying'; S.shots++;
    ev({ type:'launch', ent:e, power:s.power });
    return true;
  };
  S.flyingBird = () => S.active.find(b => !b.done && !b.dead) || null;
  S.canAbility = () => { const b = S.flyingBird(); return !!(b && !b.used && (!b.hit || ['bomb', 'inflate', 'none'].includes(K.BIRDS[b.type].ability))); };
  S.ability = () => {
    const b = S.flyingBird(); if (!b || b.used) return false;
    const T = K.BIRDS[b.type], ab = T.ability;
    if (b.hit && !['bomb', 'inflate', 'none'].includes(ab)) return false;
    const body = b.body, p = body.getPosition(), v = body.getLinearVelocity(), sp = Math.hypot(v.x, v.y);
    S.active.forEach(o => { o.used = true; });
    if (ab === 'split') {
      const ang = Math.atan2(v.y, v.x), nx = -Math.sin(ang), ny = Math.cos(ang);
      [-1, 1].forEach(s => {
        const a = ang + s * 0.2, o = makeBird(b.type, p.x + nx * s * 0.7, p.y + ny * s * 0.7, Math.cos(a) * sp, Math.sin(a) * sp, b.power);
        o.used = true; o.launchAt = b.launchAt;
      });
    } else if (ab === 'boost') {
      const n = Math.min(36, Math.max(sp * 2.1, 28)); body.setLinearVelocity(V(v.x / (sp || 1) * n, v.y / (sp || 1) * n));
    } else if (ab === 'bomb') {
      b.done = true; kill(b); explode(p.x, p.y, 4.8, 13, 24, b);
    } else if (ab === 'egg') {
      const egg = add({ kind:'egg', owner:b, rad:0.32 });
      egg.body = world.createBody({ type:'dynamic', position:V(p.x, p.y - b.r - 0.4), bullet:true, linearVelocity:V(0, -24) });
      egg.body.createFixture(new P.Circle(0.32), { density:5, friction:0.5, userData:egg }); egg.body.setUserData(egg);
      body.setLinearVelocity(V(Math.max(v.x, 6) + 8, 17)); b.hit = false;
    } else if (ab === 'boomerang') {
      body.setLinearVelocity(V(-Math.max(16, Math.abs(v.x) * 1.25), Math.max(v.y, 0) * 0.5 + 4)); body.setGravityScale(0.65);
    } else if (ab === 'inflate') {
      const R = 2.1, fx = body.getFixtureList();
      body.destroyFixture(fx);
      body.createFixture(new P.Circle(R), { density:T.density * Math.pow(b.r / R, 2), friction:0.6, restitution:0.3, userData:b });
      b.inflated = S.time; b.r = R; b.rad = R;
      explode(p.x, p.y, R + 1.6, 7, 3, b);
    }
    ev({ type:'ability', ent:b, ability:ab, x:p.x, y:p.y });
    return true;
  };

  // ---------- Power-ups ----------
  S.usePower = kind => {
    if (S.state === 'won' || S.state === 'lost') return false;
    if (kind === 'seed') { if (S.seed || !S.queue.length) return false; S.seed = true; }
    else if (kind === 'sling') { if (S.vmax > K.SLING.vmax) return false; S.vmax = K.SLING.vmax * 1.3; }
    else if (kind === 'scope') { if (S.scope) return false; S.scope = true; }
    else if (kind === 'quake') { if (S.quakeUntil > S.time) return false; S.quakeUntil = S.time + 2.6; S.ents.forEach(e => { if (!e.dead && e.body && e.kind !== 'eagle') e.body.setAwake(true); }); }
    else if (kind === 'eagle') {
      if (S.ents.some(e => e.kind === 'eagle' && !e.dead)) return false;
      const hill = level.terrain.reduce((m, t) => (t.ledge ? m : Math.max(m, t.pts[2][1])), 0);
      const body = world.createBody({ type:'kinematic', position:V(level.width + 14, 3.6 + hill), linearVelocity:V(-38, 0) });
      const e = add({ kind:'eagle', body, rad:3.3 });
      body.createFixture(new P.Circle(3.3), { userData:e }); body.setUserData(e);
      S.ents.forEach(o => { if (!o.dead && o.body && o.kind !== 'eagle') o.body.setAwake(true); });
    } else return false;
    ev({ type:'power', kind });
    return true;
  };

  function settled() {
    for (let b = world.getBodyList(); b; b = b.getNext()) {
      if (!b.isDynamic() || !b.isAwake()) continue;
      const v = b.getLinearVelocity();
      if (v.x * v.x + v.y * v.y > 0.09 || Math.abs(b.getAngularVelocity()) > 0.4) return false;
    }
    return true;
  }
  S.settled = settled;

  function updateBirds() {
    for (const b of S.active) {
      if (b.done || b.dead) continue;
      const v = b.body.getLinearVelocity(), sp = Math.hypot(v.x, v.y), age = S.time - b.launchAt;
      if (b.type === 'black' && !b.used && b.hit && S.time - b.hitAt >= 1.6) {
        const p = b.body.getPosition(); b.used = true; b.done = true; kill(b); explode(p.x, p.y, 4.8, 13, 24, b);
        ev({ type:'ability', ent:b, ability:'bomb', x:p.x, y:p.y }); continue;
      }
      if (b.inflated && S.time - b.inflated > 1.3) {
        const fx = b.body.getFixtureList(), T = K.BIRDS[b.type]; b.inflated = 0; b.r = T.r; b.rad = T.r;
        b.body.destroyFixture(fx); b.body.createFixture(new P.Circle(T.r), { density:T.density, friction:0.6, restitution:0.25, userData:b });
        ev({ type:'deflate', ent:b });
      }
      if (b.hit && sp < 0.5) { if (!b.slowSince) b.slowSince = S.time; } else b.slowSince = 0;
      if ((b.slowSince && S.time - b.slowSince > 0.9) || age > 11 || (!b.hit && age > 1.5 && sp < 0.3)) { b.done = true; kill(b); }
    }
    if (S.state === 'flying' && S.active.every(b => b.done || b.dead)) {
      S.active = [];
      if (S.queue.length) { S.state = 'ready'; S.readyAt = S.time + 0.35; }
      else { S.state = 'lastwait'; S.waitStart = S.time; }
      ev({ type:'birdDone' });
    }
  }
  function updateState() {
    if (S.pigsLeft <= 0 && S.state !== 'winwait' && S.state !== 'won') { S.state = 'winwait'; S.winAt = S.time; ev({ type:'cleared' }); }
    if (S.state === 'winwait' && ((S.time - S.winAt > 1.4 && settled()) || S.time - S.winAt > 4.5)) {
      S.active.forEach(b => { if (!b.dead) { b.done = true; kill(b); } });
      S.bonusBirds = S.queue.length; S.score += S.bonusBirds * 10000; S.state = 'won';
      ev({ type:'won', bonus:S.bonusBirds });
    }
    if (S.state === 'lastwait' && (settled() || S.time - S.waitStart > 6)) { S.state = 'lost'; ev({ type:'lost' }); }
  }

  S.step = () => {
    if (S.state === 'won' || S.state === 'lost') return;
    if (S.quakeUntil > S.time) {
      const s = Math.sin(S.time * 2 * Math.PI * 6) * 0.32;
      for (const e of S.ents) if (!e.dead && e.body && (e.kind === 'block' || e.kind === 'pig')) { const m = e.body.getMass(); e.body.applyLinearImpulse(V(m * s, 0), e.body.getWorldCenter(), true); }
    }
    world.step(DT, 8, 3);
    S.time += DT;
    for (const e of S.ents) if (e.kind === 'eagle' && !e.dead && e.body.getPosition().x < -18) { e.dead = true; world.destroyBody(e.body); ev({ type:'remove', ent:e }); }
    processDeaths(); checkBounds(); updateBirds(); updateState();
    if (S.ents.length > 40 && S.ents.some(e => e.dead)) S.ents = S.ents.filter(e => !e.dead);
  };
  S.stars = () => (S.state !== 'won' ? 0 : S.score >= level.stars[2] ? 3 : S.score >= level.stars[1] ? 2 : 1);
  // Für Tests/Bots: rechnen, bis wieder geschossen werden kann oder das Level vorbei ist.
  S.runUntilReady = maxSeconds => {
    const end = S.time + (maxSeconds || 30);
    while (S.time < end && !(S.state === 'won' || S.state === 'lost' || S.canShoot())) { S.step(); S.events.length = 0; }
  };
  return S;
}

const api = { createSim, pullToShot, trajectory, DT, GRAVITY };
root.KVSim = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
