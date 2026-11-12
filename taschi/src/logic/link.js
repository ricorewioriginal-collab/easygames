// Online-Tausch & Online-Kampf: alles, was beide Geräte gleich rechnen müssen.
// Reine Logik (kein DOM, kein Netz), damit es in Node getestet werden kann.
// Ablauf Kampf: Der Gastgeber rechnet den Kampf (wie die KI-Kämpfe), der Gast
// schickt nur seine Wahl und bekommt Ereignisse und Zwischenstand zurück; der
// Gast sieht alles gespiegelt (er ist bei sich immer Seite 0).
import { SPECIES } from '../data/species.js';
import { MOVES } from '../data/moves.js';
import { cleanMonster } from './save.js';
import { towerCopy } from './tower.js';
import { healMonster, newUid } from './monster.js';

export const LINK_VERSION = 1;
export const LINK_PREFIX = 'taschi-';
export const LINK_TEAM = 3;            // Online-Kampf: drei Taschis, alle auf Level 50 wie im Kampfturm
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const normCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
export const isCode = (s) => /^[A-HJ-NP-Z2-9]{5}$/.test(s);
export function newCode(rnd = Math.random) { let c = ''; for (let i = 0; i < 5; i++) c += CODE_CHARS[Math.floor(rnd() * CODE_CHARS.length)]; return c; }
export const nameOf = (m) => m.nick || SPECIES[m.id]?.name || '?';
const str = (v, n) => typeof v === 'string' ? v.replace(/[<>]/g, '').trim().slice(0, n) : '';

// ------------------------------------------------------------------ Tausch
// Was über die Leitung geht: nur Werte, die ein Taschi ausmachen
export function packMon(m) {
  const o = { id: m.id, lv: m.lv, xp: m.xp || 0, iv: { ...m.iv }, nature: m.nature, friendship: m.friendship ?? 70, moves: m.moves.map(x => ({ id: x.id, pp: x.pp })) };
  for (const k of ['nick', 'shiny', 'held', 'ball', 'ot']) if (m[k] !== undefined && m[k] !== null) o[k] = m[k];
  return o;
}
// Empfangenes Taschi prüfen (wie beim Laden eines Spielstands) und neu verbuchen
export function unpackMon(d, { ot = '' } = {}) {
  if (!d || typeof d !== 'object' || !SPECIES[d.id]) return null;
  const m = cleanMonster({ ...d, uid: newUid(), hp: 9999, status: null });
  if (!m) return null;
  healMonster(m);
  m.ot = str(d.ot, 20) || str(ot, 20) || '?';
  m.friendship = Math.min(m.friendship, 70);   // neue Trainerin, neues Vertrauen
  return m;
}
// Darf dieses Taschi weg? Im Team muss mindestens ein Taschi bleiben.
export function canOffer(save, m) {
  if (!m) return { ok: false, text: 'Kein Taschi gewählt.' };
  const inTeam = save.team.includes(m), inBox = save.box.includes(m);
  if (!inTeam && !inBox) return { ok: false, text: 'Dieses Taschi gehört nicht (mehr) dir.' };
  if (inTeam && save.team.length <= 1) return { ok: false, text: 'Dein letztes Taschi im Team kannst du nicht tauschen.' };
  return { ok: true };
}
// Tausch abschließen: eigenes Taschi abgeben, empfangenes aufnehmen
export function applyTrade(save, mine, theirs) {
  const chk = canOffer(save, mine);
  if (!chk.ok || !theirs) return { ok: false, text: chk.text || 'Tausch fehlgeschlagen.' };
  const ti = save.team.indexOf(mine), bi = save.box.indexOf(mine);
  if (ti >= 0) save.team.splice(ti, 1, theirs); else save.box.splice(bi, 1, theirs);
  if (save.companion === mine.uid) save.companion = null;
  if (mine.held) { /* das gehaltene Item reist mit */ }
  save.dex[theirs.id] = 2;
  save.stats = save.stats || {};
  save.stats.trades = (save.stats.trades || 0) + 1;
  return { ok: true, inTeam: ti >= 0, text: nameOf(theirs) + ' ist jetzt bei dir' + (ti >= 0 ? ' im Team.' : ' im Lager.') };
}

// ------------------------------------------------------------------ Kampf
// Kampf-Kopien: Level 50, geheilt, eindeutige Kennung je Seite (h = Gastgeber, g = Gast)
export function battleTeam(mons, tag) {
  return mons.slice(0, LINK_TEAM).map((m, i) => { const c = towerCopy(m); c.uid = tag + i + '_' + m.id; return c; });
}
export function packTeam(team) { return team.map(m => ({ ...packMon(m), uid: m.uid, hp: m.hp })); }
// Team der Gegenseite prüfen und als Level-50-Kopien aufbauen
export function unpackTeam(list, tag) {
  if (!Array.isArray(list) || !list.length) return null;
  const out = [];
  for (const d of list.slice(0, LINK_TEAM)) { const m = cleanMonster({ ...d, hp: 9999, status: null }); if (!m) return null; out.push(m); }
  return battleTeam(out, tag);
}
// Wahl der Gegenseite prüfen (nur erlaubte Attacken, Wechsel und Aufgeben)
export function cleanChoices(b, side, list) {
  const res = [];
  const s = b.sides[side];
  for (const c of Array.isArray(list) ? list : []) {
    const slot = c?.slot | 0, i = s.active[slot];
    const m = i === null || i === undefined ? null : s.team[i];
    if (!m || m.hp <= 0 || res.some(x => x.slot === slot)) continue;
    if (c.type === 'switch') {
      const to = c.to | 0;
      if (s.team[to] && s.team[to].hp > 0 && !s.active.includes(to)) { res.push({ slot, type: 'switch', to }); continue; }
    }
    const usable = m.moves.filter(x => x.pp > 0);
    const mv = c.type === 'move' && usable.find(x => x.id === c.move) ? c.move : (usable.length ? usable[0].id : 'verzweiflung');
    if (!MOVES[mv]) continue;
    res.push({ slot, type: 'move', move: mv, target: c.target | 0, star: !!c.star });
  }
  return res;
}

// Zwischenstand, den der Gast nach jedem Zug übernimmt
export function snapshot(b) {
  const mons = {};
  for (const s of b.sides) for (const m of s.team) mons[m.uid] = { hp: m.hp, status: m.status || null, statusTurns: m.statusTurns || 0, pp: m.moves.map(x => x.pp), held: m.held || null };
  return { mons, active: b.sides.map(s => s.active.slice()), vol: JSON.parse(JSON.stringify(b.vol)), star: b.star.slice(), phase: b.phase,
    need: [b.needReplace.slice(), b.foeReplace.slice()], result: b.result ? { outcome: b.result.outcome } : null, turnNo: b.turnNo, weather: b.weather || null };
}
// Stand übernehmen; flip = die Seiten tauschen (Gast-Sicht)
export function applySnapshot(b, snap, flip) {
  const S = (i) => flip ? 1 - i : i;
  for (const s of b.sides) for (const m of s.team) {
    const v = snap.mons[m.uid]; if (!v) continue;
    m.hp = v.hp; m.status = v.status; m.statusTurns = v.statusTurns;
    v.pp.forEach((pp, k) => { if (m.moves[k]) m.moves[k].pp = pp; });
    if (v.held) m.held = v.held; else delete m.held;
  }
  for (let i = 0; i < 2; i++) b.sides[i].active = snap.active[S(i)].slice();
  b.vol = snap.vol; b.star = [snap.star[S(0)], snap.star[S(1)]];
  b.needReplace = snap.need[S(0)].slice(); b.foeReplace = snap.need[S(1)].slice();
  b.phase = snap.phase; b.turnNo = snap.turnNo; b.weather = snap.weather;
  if (snap.result) {
    const o = snap.result.outcome;
    b.result = { outcome: flip ? (o === 'win' ? 'lose' : o === 'lose' ? 'win' : o) : o };
  } else b.result = null;
}

// Ereignisse für den Gast spiegeln: Seiten tauschen, Texte aus seiner Sicht
export function mirrorEvents(ev, b, { hostName = '' } = {}) {
  const find = (uid) => { for (const s of b.sides) { const m = s.team.find(x => x.uid === uid); if (m) return m; } return null; };
  const flip = (v) => v === 0 ? 1 : v === 1 ? 0 : v;
  return ev.map(e0 => {
    const e = { ...e0 };
    if ('side' in e) e.side = flip(e.side);
    if ('targetSide' in e) e.targetSide = flip(e.targetSide);
    const m = e.uid ? find(e.uid) : null, n = m ? nameOf(m) : '';
    if (e.t === 'switchIn') e.text = e.side === 0 ? 'Los, ' + n + '!' : hostName + ' schickt ' + n + ' in den Kampf!';
    if (e.t === 'switchOut') e.text = e.side === 0 ? n + ', komm zurück!' : hostName + ' ruft ' + n + ' zurück.';
    if (e.t === 'star') e.text = (e.side === 1 ? 'Das gegnerische ' : '') + n + ' erreicht die Sternstufe! Alle Werte steigen!';
    if (e.t === 'end') {
      e.outcome = e.outcome === 'win' ? 'lose' : e.outcome === 'lose' ? 'win' : e.outcome;
      e.text = e.outcome === 'win' ? 'Du hast ' + hostName + ' besiegt!' : e.outcome === 'lose' ? 'Du hast keine kampffähigen Taschis mehr …' : '';
    }
    if (e.t === 'needReplace') e.slots = (e0.foe || []).slice(), e.foe = (e0.slots || []).slice();
    return e;
  });
}

// Begrüßung beim Verbinden: Name, Aussehen, Dex-Stand (nur Anzeige)
export function hello(save) {
  return { t: 'hello', v: LINK_VERSION, name: save.player.name, look: save.player.look || null, badges: save.badges || 0, caught: Object.values(save.dex).filter(v => v === 2).length };
}
export function cleanHello(d) {
  if (!d || d.t !== 'hello') return null;
  return { v: d.v | 0, name: str(d.name, 16) || 'Trainer', look: d.look && typeof d.look === 'object' ? d.look : null, badges: Math.max(0, Math.min(16, d.badges | 0)), caught: Math.max(0, d.caught | 0) };
}
// Aussehen der Gegenseite nur mit bekannten Feldern und passenden Typen übernehmen
export function cleanLook(look, base) {
  const out = { ...base };
  if (look && typeof look === 'object') for (const k of Object.keys(look)) {
    const v = look[k];
    if (['string', 'number', 'boolean'].includes(typeof v) && (!(k in base) || typeof base[k] === typeof v)) out[k] = typeof v === 'string' ? v.slice(0, 24) : v;
  }
  return out;
}
