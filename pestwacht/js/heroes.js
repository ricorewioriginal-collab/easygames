/* Pestwacht · Helden: Werte, Erfahrung, Talente, Ausrüstung, Aufwertung, Anwerbung. Ohne DOM. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const H = PW.Heroes = {};

  H.cap = h => 10 + 10 * (h.star || 0);
  H.make = () => ({ lv: 1, xp: 0, sp: 0, tal: { kraft: 0, zaeh: 0, fuehrung: 0 }, eq: { waffe: null, ruestung: null, talisman: null }, star: 0, inj: 0, where: 'stadt' });
  H.unlock = function (S, id, why) {
    if (!PW.HERO[id] || S.heroes[id]) return false;
    S.heroes[id] = H.make();
    PW.stat(S, 'heroes');
    PW.log(S, '⭐ Neuer Held: ' + PW.HERO[id].name + (why ? ' (' + why + ')' : ''), 'held');
    return true;
  };
  H.stats = function (S, id) {
    const d = PW.HERO[id], h = S.heroes[id]; if (!d || !h) return null;
    const m = PW.RARITY[d.rar].m * (1 + 0.06 * (h.lv - 1)) * (1 + 0.15 * h.star);
    let hp = d.hp * m * (1 + 0.08 * h.tal.zaeh), atk = d.atk * m * (1 + 0.06 * h.tal.kraft), def = d.def * m;
    Object.keys(h.eq).forEach(slot => { const it = h.eq[slot] && S.items.find(x => x.uid === h.eq[slot]); const D = it && PW.ITEM[it.id]; if (D) { hp += D.hp || 0; atk += D.atk || 0; def += D.def || 0; } });
    const lead = 0.03 * h.tal.fuehrung + (d.cls === 'taktiker' ? 0.05 : 0);
    return { id, name: d.name, cls: d.cls, hp: Math.round(hp), atk: Math.round(atk), def: Math.round(def), lead, skill: d.skill.id, cd: d.skill.cd, ranged: d.cls === 'fern' || d.cls === 'alchemist' };
  };
  H.addXp = function (S, id, xp) {
    const h = S.heroes[id]; if (!h || xp <= 0) return 0;
    let ups = 0; h.xp += xp;
    while (h.lv < H.cap(h) && h.xp >= PW.xpFor(h.lv)) { h.xp -= PW.xpFor(h.lv); h.lv++; h.sp++; ups++; }
    if (h.lv >= H.cap(h)) h.xp = Math.min(h.xp, PW.xpFor(h.lv));
    if (ups) PW.log(S, '⬆️ ' + PW.HERO[id].name + ' erreicht Stufe ' + h.lv, 'held');
    return ups;
  };
  H.talent = function (S, id, key) {
    const h = S.heroes[id]; if (!h || !PW.TALENTS[key]) return { ok: false, why: 'Unbekannt' };
    if (h.sp < 1) return { ok: false, why: 'Keine Fähigkeitspunkte' };
    if (h.tal[key] >= PW.TALENTS[key].max) return { ok: false, why: 'Talent ausgeschöpft' };
    h.sp--; h.tal[key]++; return { ok: true };
  };
  H.promoteCost = h => ({ coin: 300 * (h.star + 1), know: 120 * (h.star + 1), med: 20 * (h.star + 1) });
  H.promote = function (S, id) {
    const h = S.heroes[id]; if (!h) return { ok: false, why: 'Unbekannt' };
    if (h.star >= 2) return { ok: false, why: 'Höchste Aufwertung erreicht' };
    if (h.lv < H.cap(h)) return { ok: false, why: 'Erst Stufe ' + H.cap(h) + ' erreichen' };
    const g = PW.City.lv(S, 'heldengilde'); if (g < 2 + h.star * 2) return { ok: false, why: 'Heldengilde Stufe ' + (2 + h.star * 2) + ' nötig' };
    if (!PW.pay(S.res, H.promoteCost(h), S.spent)) return { ok: false, why: 'Zu wenig Rohstoffe' };
    h.star++; PW.log(S, '🌟 ' + PW.HERO[id].name + ' wurde aufgewertet (' + '★'.repeat(h.star) + ')', 'held');
    return { ok: true };
  };
  H.recruitWhy = function (S, id) {
    const d = PW.HERO[id]; if (!d || S.heroes[id]) return 'Bereits in der Zuflucht';
    if (d.unlock !== 'gilde') return 'Wird in der Kampagne oder auf Expeditionen gefunden';
    const g = PW.City.lv(S, 'heldengilde'); if (g < d.guild) return 'Heldengilde Stufe ' + d.guild + ' nötig';
    if (!PW.canPay(S.res, d.price)) return 'Zu wenig Rohstoffe';
    return null;
  };
  H.recruit = function (S, id) {
    const why = H.recruitWhy(S, id); if (why) return { ok: false, why };
    PW.pay(S.res, PW.HERO[id].price, S.spent); H.unlock(S, id, 'Heldengilde'); return { ok: true };
  };
  // Ausrüstung schmieden und anlegen
  H.craftWhy = function (S, itemId) {
    const it = PW.ITEM[itemId], sm = PW.City.lv(S, 'schmiede');
    if (!it) return 'Unbekannt';
    if (sm < it.smith) return 'Schmiede Stufe ' + it.smith + ' nötig';
    if (!PW.canPay(S.res, it.cost)) return 'Zu wenig Rohstoffe';
    return null;
  };
  H.craft = function (S, itemId) {
    const why = H.craftWhy(S, itemId); if (why) return { ok: false, why };
    PW.pay(S.res, PW.ITEM[itemId].cost, S.spent);
    const uid = ++S.city.uid; S.items.push({ uid, id: itemId });
    PW.log(S, '🔨 Geschmiedet: ' + PW.ITEM[itemId].name, 'bau');
    return { ok: true, uid };
  };
  H.equip = function (S, id, uid) {
    const h = S.heroes[id], it = S.items.find(x => x.uid === uid); if (!h || !it) return { ok: false, why: 'Unbekannt' };
    const slot = PW.ITEM[it.id].slot;
    Object.keys(S.heroes).forEach(k => { const o = S.heroes[k]; Object.keys(o.eq).forEach(s => { if (o.eq[s] === uid) o.eq[s] = null; }); });
    h.eq[slot] = uid; return { ok: true };
  };
  H.unequip = function (S, id, slot) { const h = S.heroes[id]; if (h) h.eq[slot] = null; };
  H.available = (S, id) => { const h = S.heroes[id]; return !!h && h.where === 'stadt' && !(h.inj > 0); };
  H.list = S => Object.keys(S.heroes);

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
