/* Gemeinsame Regeln für Angriff und Raub: Ziele, Anfängerschutz, Limits je Ziel, Verlauf, Rache-Token */
'use strict';
const { fail, PID_RE, HOUR, DAY } = require('./util');

const PROTECT_MS = 24 * HOUR, TARGETS_MAX = 6, HITS_PER_TARGET = 3, REVENGE_MS = DAY;

module.exports = function pvp(ctx) {
  const sum = a => a.reduce((x, y) => x + y, 0);

  // Anfängerschutz: Konten jünger als 24 h oder Insel 1 mit weniger als 5 Ausbaustufen
  function isProtected(acc, now) {
    return now - acc.created < PROTECT_MS || (acc.islandsDone === 0 && sum(acc.stages) < 5);
  }
  const recentHits = (acc, now) => (acc.hits || []).filter(h => now - h.t < HOUR);
  // Limit: max. 3 Angriffe/Raubzüge pro Stunde auf ein Ziel (von allen), max. 1 pro Stunde vom selben Angreifer
  function hitState(target, attackerUid, now) {
    const r = recentHits(target, now);
    return { busy: r.length >= HITS_PER_TARGET, cooldown: r.some(h => h.by === attackerUid) };
  }
  function attackable(target, kind) { return kind === 'raid' ? target.coins > 0 : sum(target.stages) > 0; }

  function publicTarget(acc) {
    return { target: ctx.pid(acc.uid), name: acc.name, island: acc.island, islandsDone: acc.islandsDone,
      stages: acc.stages.slice(), damaged: acc.damaged.slice(), shield: acc.shields > 0 };
  }

  function targets({ me, now }) {
    const p = me.pending;
    if (!p) fail(409, 'no_pending');
    if (p.target) {
      const t = ctx.store.data.accounts[p.target];
      return { kind: p.kind, mult: p.mult, revenge: true, targets: t ? [publicTarget(t)] : [] };
    }
    const list = [];
    for (const acc of Object.values(ctx.store.data.accounts)) {
      if (acc.uid === me.uid || isProtected(acc, now) || !attackable(acc, p.kind)) continue;
      const h = hitState(acc, me.uid, now);
      if (h.busy || h.cooldown) continue;
      list.push(acc);
    }
    ctx.SW.rng.secure().shuffle(list);
    return { kind: p.kind, mult: p.mult, revenge: false, targets: list.slice(0, TARGETS_MAX).map(publicTarget) };
  }

  // Ziel aus der Anfrage auflösen und alle Regeln prüfen; liefert Entwurf des Ziel-Kontos
  function resolveTarget(t, me, input, kind, now) {
    const p = me.pending;
    if (!p || p.kind !== kind) fail(409, 'no_pending');
    if (typeof input.target !== 'string' || !PID_RE.test(input.target)) fail(400, 'bad_target');
    const tuid = ctx.uidOfPid(input.target);
    if (!tuid) fail(404, 'target_not_found');
    if (tuid === me.uid) fail(400, 'bad_target');
    if (p.target && p.target !== tuid) fail(409, 'wrong_target');
    const tg = t.get('accounts', tuid);
    if (!tg) fail(404, 'target_not_found');
    ctx.econ.normalize(tg, now);
    const h = hitState(tg, me.uid, now);
    if (!p.target && isProtected(tg, now)) fail(403, 'target_protected');
    if (h.busy) fail(429, 'target_busy');
    if (!p.target && h.cooldown) fail(429, 'target_cooldown');
    if (!attackable(tg, kind)) fail(409, kind === 'raid' ? 'target_empty' : 'no_building');
    return tg;
  }

  function record(t, me, tg, entryOut, entryIn, now) {
    const id = ctx.SW.rng.uid(10), token = ctx.SW.rng.uid(24);
    tg.hits.push({ t: now, by: me.uid });
    t.put('revenge', token, { v: tg.uid, a: me.uid, exp: now + REVENGE_MS });
    ctx.econ.pushHistory(me, Object.assign({ id, t: now, role: 'out', pid: ctx.pid(tg.uid), name: tg.name }, entryOut));
    ctx.econ.pushHistory(tg, Object.assign({ id, t: now, role: 'in', pid: ctx.pid(me.uid), name: me.name, revengeToken: token, revengeExp: now + REVENGE_MS }, entryIn));
  }

  function revenge({ t, me, input, now }) {
    if (typeof input.token !== 'string' || !/^[a-z0-9]{24}$/.test(input.token)) fail(400, 'bad_token');
    const r = t.get('revenge', input.token);
    if (!r || r.v !== me.uid) fail(404, 'token_not_found');
    if (r.exp <= now) { t.del('revenge', input.token); fail(410, 'token_expired'); }
    if (me.pending) fail(409, 'pending_exists');
    const att = ctx.store.data.accounts[r.a];
    if (!att) { t.del('revenge', input.token); fail(404, 'target_not_found'); }
    me.pending = { kind: 'attack', mult: 1, exp: now + ctx.econ.PENDING_MS, target: r.a };
    t.del('revenge', input.token);   // einmal pro Token
    for (const e of me.history) if (e.revengeToken === input.token) { e.revengeToken = null; e.revenged = true; }
    return { pending: 'attack', target: ctx.pid(att.uid), name: att.name };
  }

  function history({ me }) {
    return { history: me.history.map(e => Object.assign({}, e, e.revengeExp && e.revengeExp <= ctx.now() ? { revengeToken: null } : {})) };
  }

  return { isProtected, hitState, attackable, publicTarget, targets, resolveTarget, record, revenge, history, PROTECT_MS };
};
