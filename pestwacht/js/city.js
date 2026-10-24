/* Pestwacht · Zuflucht: Bauraster, Platzieren/Verbessern/Versetzen/Abreißen/Reparieren, abgeleitete Werte. Ohne DOM. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const C = PW.City = {};
  C.GRID = 30; C.MIN = 3; C.MAX = 26;          // bebaubar innerhalb der Mauer: Zellen 3..26
  C.GATE = { x: 14, y: 27 };                    // Tor in der Südmauer (Zellen 14–15)
  C.HQ = { x: 13, y: 12 };

  // Torstraße (frei zu halten, zählt als Weg)
  C.reserved = (x, y) => (x === 14 || x === 15) && y >= 15 && y <= C.MAX;

  C.limit = function (type, hq) {
    const b = PW.BLD[type]; if (b.unique) return 1;
    const L = {
      haus: 2 + 2 * hq, brunnen: 2 + hq, farm: 1 + Math.ceil(hq / 2), kraeuter: 1 + Math.ceil(hq / 2), apotheke: Math.ceil(hq / 3), heilstube: 1 + Math.floor(hq / 2),
      lazarett: Math.ceil(hq / 4), quarantaene: 1 + Math.floor(hq / 3), saege: 1 + Math.ceil(hq / 2), steinbruch: 1 + Math.ceil(hq / 3), mine: Math.ceil(hq / 2), lager: 1 + Math.floor(hq / 2),
      turm_pfeil: 1 + hq, turm_balliste: Math.floor(hq / 2), turm_feuer: Math.floor(hq / 2), turm_rauch: Math.floor(hq / 2), weg: 250, laterne: 40, garten: 40, statue: 6
    };
    return L[type] != null ? L[type] : 1;
  };
  C.count = (S, type) => S.city.b.reduce((n, x) => n + (x.t === type ? 1 : 0), 0);
  C.get = (S, uid) => S.city.b.find(x => x.id === uid) || null;
  C.first = (S, type) => S.city.b.find(x => x.t === type) || null;
  C.lv = (S, type) => S.city.b.reduce((m, x) => Math.max(m, x.t === type ? x.lv : 0), 0);   // höchste fertige Stufe
  C.hqLv = S => C.lv(S, 'hq') || 1;
  C.dims = (type, rot) => { const b = PW.BLD[type]; return rot ? [b.h, b.w] : [b.w, b.h]; };
  C.at = function (S, x, y) {
    for (const b of S.city.b) { if (!b.w) continue; if (x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h) return b; }
    return null;
  };
  C.isRoad = (S, x, y) => { if (C.reserved(x, y)) return true; const b = C.at(S, x, y); return !!(b && PW.BLD[b.t].road); };
  C.touchesRoad = function (S, b) {
    for (let x = b.x - 1; x <= b.x + b.w; x++) for (let y = b.y - 1; y <= b.y + b.h; y++) {
      const edge = x === b.x - 1 || y === b.y - 1 || x === b.x + b.w || y === b.y + b.h;
      const corner = (x === b.x - 1 || x === b.x + b.w) && (y === b.y - 1 || y === b.y + b.h);
      if (edge && !corner && C.isRoad(S, x, y)) return true;
    }
    return false;
  };

  // Voraussetzungen für Neubau oder nächste Stufe
  C.reqCheck = function (S, type, lv) {
    const d = PW.BLD[type], hq = C.hqLv(S);
    if (type !== 'hq' && lv > hq && d.max > 1) return 'Ratshaus Stufe ' + lv + ' nötig';
    if (d.req && d.req.hq && hq < d.req.hq) return 'Ratshaus Stufe ' + d.req.hq + ' nötig';
    if (d.req && d.req.tech && !S.research.done[d.req.tech]) return 'Forschung „' + PW.TECH[d.req.tech].name + '“ nötig';
    if (S.campaign && S.campaign.lock && S.campaign.lock[type]) return 'Wird in der Kampagne später freigeschaltet';
    if (lv > d.max) return 'Höchststufe erreicht';
    return null;
  };
  C.builders = S => PW.BAL.builders + (S._mods && S._mods.builders ? S._mods.builders : 0);
  C.busy = S => S.city.b.filter(b => b.st === 'bau' || b.st === 'upg' || b.st === 'rep').length;
  C.buildTime = (S, type, lv) => Math.max(1, Math.round(PW.timeOf(type, lv) / (1 + ((S._mods || {})['build.speed'] || 0))));

  C.canPlace = function (S, type, x, y, rot, ignoreUid) {
    const d = PW.BLD[type];
    if (!d || !d.w) return { ok: false, why: 'Kann nicht frei platziert werden' };
    const [w, h] = C.dims(type, rot);
    if (x < C.MIN || y < C.MIN || x + w - 1 > C.MAX || y + h - 1 > C.MAX) return { ok: false, why: 'Außerhalb der Mauer' };
    for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) {
      if (C.reserved(i, j)) return { ok: false, why: 'Die Torstraße muss frei bleiben' };
      const o = C.at(S, i, j); if (o && o.id !== ignoreUid) return { ok: false, why: 'Belegt von ' + PW.BLD[o.t].name };
    }
    return { ok: true };
  };
  C.canBuild = function (S, type) {
    const d = PW.BLD[type], hq = C.hqLv(S);
    if (C.count(S, type) >= C.limit(type, hq)) return d.unique ? 'Nur einmal möglich' : 'Höchstzahl für Ratshaus-Stufe ' + hq + ' erreicht';
    const r = C.reqCheck(S, type, 1); if (r) return r;
    if (C.busy(S) >= C.builders(S) && d.time > 3) return 'Alle Bautrupps beschäftigt';
    if (!PW.canPay(S.res, PW.costOf(type, 1))) return 'Zu wenig Rohstoffe';
    return null;
  };

  function mk(S, type, x, y, rot, lv, st) {
    const [w, h] = C.dims(type, rot), d = PW.BLD[type];
    const b = { id: ++S.city.uid, t: type, x, y, w, h, rot: rot ? 1 : 0, lv: lv || 0, hp: d.hp * Math.max(1, lv || 1), st: st || 'ok', rem: 0, pause: false };
    S.city.b.push(b); return b;
  }
  C.create = mk;

  C.place = function (S, type, x, y, rot) {
    const why = C.canBuild(S, type); if (why) return { ok: false, why };
    const p = C.canPlace(S, type, x, y, rot); if (!p.ok) return p;
    PW.pay(S.res, PW.costOf(type, 1), S.spent);
    const b = mk(S, type, x, y, rot, 0, 'bau');
    b.rem = b.tot = C.buildTime(S, type, 1);
    if (PW.BLD[type].time <= 3) { b.rem = b.tot = PW.BLD[type].time; }
    return { ok: true, b };
  };
  C.upgradeWhy = function (S, b) {
    if (!b || b.st !== 'ok') return 'Gerade beschäftigt';
    const d = PW.BLD[b.t];
    if (b.lv >= d.max) return 'Höchststufe erreicht';
    const r = C.reqCheck(S, b.t, b.lv + 1); if (r) return r;
    if (C.busy(S) >= C.builders(S)) return 'Alle Bautrupps beschäftigt';
    if (S.waves.active && b.t !== 'mauer') return 'Während eines Angriffs nicht möglich';
    if (!PW.canPay(S.res, PW.costOf(b.t, b.lv + 1))) return 'Zu wenig Rohstoffe';
    return null;
  };
  C.upgrade = function (S, uid) {
    const b = C.get(S, uid), why = C.upgradeWhy(S, b); if (why) return { ok: false, why };
    PW.pay(S.res, PW.costOf(b.t, b.lv + 1), S.spent);
    b.st = 'upg'; b.rem = b.tot = C.buildTime(S, b.t, b.lv + 1);
    return { ok: true };
  };
  // Abbrechen: volle Rückerstattung des laufenden Auftrags
  C.cancel = function (S, uid) {
    const b = C.get(S, uid); if (!b) return { ok: false, why: 'Nicht gefunden' };
    if (b.st === 'bau') { PW.addRes(S.res, PW.costOf(b.t, 1), null); S.city.b.splice(S.city.b.indexOf(b), 1); return { ok: true, removed: true }; }
    if (b.st === 'upg') { PW.addRes(S.res, PW.costOf(b.t, b.lv + 1), null); b.st = 'ok'; b.rem = 0; return { ok: true }; }
    if (b.st === 'rep') { if (b.repCost) PW.addRes(S.res, b.repCost, null); b.st = 'ok'; b.rem = 0; return { ok: true }; }
    return { ok: false, why: 'Kein laufender Auftrag' };
  };
  C.demolish = function (S, uid) {
    const b = C.get(S, uid); if (!b) return { ok: false, why: 'Nicht gefunden' };
    if (b.t === 'hq' || b.t === 'mauer') return { ok: false, why: 'Ratshaus und Mauer können nicht abgerissen werden' };
    if (b.st !== 'ok') return { ok: false, why: 'Erst den laufenden Auftrag abbrechen' };
    if (S.waves.active) return { ok: false, why: 'Während eines Angriffs nicht möglich' };
    const refund = PW.scaleCost(PW.costOf(b.t, b.lv), PW.BAL.demolishRefund);
    PW.addRes(S.res, refund, S._caps);
    S.city.b.splice(S.city.b.indexOf(b), 1);
    return { ok: true, refund };
  };
  C.move = function (S, uid, x, y, rot) {
    const b = C.get(S, uid); if (!b) return { ok: false, why: 'Nicht gefunden' };
    if (b.t === 'hq' || !b.w) return { ok: false, why: 'Dieses Gebäude bleibt an seinem Platz' };
    if (b.st !== 'ok') return { ok: false, why: 'Nur fertige Gebäude können versetzt werden' };
    if (S.waves.active) return { ok: false, why: 'Während eines Angriffs nicht möglich' };
    const p = C.canPlace(S, b.t, x, y, rot, b.id); if (!p.ok) return p;
    const [w, h] = C.dims(b.t, rot);
    b.x = x; b.y = y; b.w = w; b.h = h; b.rot = rot ? 1 : 0; b.down = PW.BAL.moveDowntime;
    return { ok: true };
  };
  C.maxHp = b => PW.BLD[b.t].hp * Math.max(1, b.lv) * (b.t === 'mauer' ? 1 : 1);
  C.repairCost = function (S, b) {
    const f = 1 - b.hp / C.maxHp(b); if (f <= 0.001) return null;
    return PW.scaleCost(PW.costOf(b.t, Math.max(1, b.lv)), PW.BAL.repairShare * f);
  };
  C.repair = function (S, uid) {
    const b = C.get(S, uid); if (!b) return { ok: false, why: 'Nicht gefunden' };
    if (b.st !== 'ok') return { ok: false, why: 'Gerade beschäftigt' };
    if (S.waves.active) return { ok: false, why: 'Während eines Angriffs nicht möglich' };
    const cost = C.repairCost(S, b); if (!cost) return { ok: false, why: 'Nicht beschädigt' };
    if (C.busy(S) >= C.builders(S)) return { ok: false, why: 'Alle Bautrupps beschäftigt' };
    if (!PW.pay(S.res, cost, S.spent)) return { ok: false, why: 'Zu wenig Rohstoffe' };
    b.st = 'rep'; b.repCost = cost; b.rem = b.tot = Math.max(4, Math.round(PW.timeOf(b.t, Math.max(1, b.lv)) * 0.3 * (1 - b.hp / C.maxHp(b))));
    return { ok: true };
  };
  C.togglePause = function (S, uid) { const b = C.get(S, uid); if (!b || !PW.workersOf(b.t, b.lv)) return false; b.pause = !b.pause; return true; };

  // Bauaufträge voranbringen
  C.progress = function (S, dt) {
    let done = [];
    S.city.b.forEach(b => {
      if (b.down > 0) b.down = Math.max(0, b.down - dt);
      if (b.st === 'ok') return;
      b.rem -= dt;
      if (b.rem > 0) return;
      b.rem = 0;
      if (b.st === 'bau') { b.lv = 1; b.hp = C.maxHp(b); }
      else if (b.st === 'upg') { b.lv++; b.hp = C.maxHp(b); }
      else if (b.st === 'rep') { b.hp = C.maxHp(b); b.repCost = null; }
      const kind = b.st; b.st = 'ok';
      if (kind !== 'rep') { PW.stat(S, 'built'); done.push(b); }
      PW.log(S, (kind === 'bau' ? 'Fertig gebaut: ' : kind === 'upg' ? 'Verbessert: ' : 'Repariert: ') + PW.BLD[b.t].name + (b.lv > 1 ? ' (Stufe ' + b.lv + ')' : ''), 'bau', { uid: b.id });
    });
    return done;
  };

  // Abgeleitete Werte: Lager, Wohnraum, Betten, Quarantäne, Truppengrenze, Hygiene, Türme …
  C.derive = function (S) {
    const m = S._mods || {}, d = { house: 0, beds: 0, cureW: 0, quar: 0, troopCap: 20, hyg: 0.35, sat: 0, grief: 0, towers: [], store: PW.BAL.baseStore, scout: 0, light: 0 };
    const lvM = lv => 1 + 0.5 * (lv - 1);
    S.city.b.forEach(b => {
      const t = PW.BLD[b.t]; if (b.lv < 1) return;
      const hpF = b.hp / C.maxHp(b), work = PW.workersOf(b.t, b.lv), staff = work ? (b.staff || 0) / work : 1, act = !b.pause && !(b.down > 0);
      if (t.house) d.house += t.house * b.lv * (b.t === 'hq' ? 1 : 1);
      if (t.store) d.store += t.store * b.lv;
      if (b.t === 'hq') d.store += PW.BAL.hqStore * b.lv;
      if (t.beds && act) { const n = t.beds * lvM(b.lv) * staff * Math.max(0.3, hpF); d.beds += n; d.cureW += n * t.cure * (1 + 0.05 * (b.lv - 1)); }
      if (t.quar && act) d.quar += t.quar * lvM(b.lv) * staff;
      if (t.troopCap) d.troopCap += t.troopCap * b.lv;
      if (t.hyg && act) d.hyg += t.hyg * b.lv * staff;
      if (t.sat) d.sat += t.sat * b.lv;
      if (t.grief) d.grief += t.grief * b.lv;
      if (t.scout) d.scout += b.lv;
      if (t.light) d.light++;
      if (t.tower && b.st !== 'bau') d.towers.push(b);
    });
    d.cure = d.beds > 0 ? d.cureW / d.beds : 1;
    d.beds = Math.floor(d.beds * (1 + (m.beds || 0)));
    d.quar = Math.floor(d.quar * (1 + (m.quar || 0)));
    d.store = Math.round(d.store * (1 + (m.store || 0)));
    d.hyg = PW.clamp(d.hyg + (m.hyg || 0), 0, 1);
    const caps = {}; PW.RES.forEach(k => { caps[k] = PW.UNCAPPED[k] ? Infinity : d.store; });
    S._caps = caps; S._d = d;
    return d;
  };
  C.gateMax = function (S) {
    const w = C.first(S, 'mauer'); if (!w || w.lv < 1) return 0;
    return Math.round(PW.BLD.mauer.gate * (1 + 0.6 * (w.lv - 1)) * (1 + ((S._mods || {})['gate.hp'] || 0)));
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
