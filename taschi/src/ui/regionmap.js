// Gebietskarte und Minimap teilen sich das Zeichnen der Region (Wasser,
// Wege, Gras, Gebäude) und der Abenteuer-Markierungen.
import { REGIONS } from '../data/regions.js';
import { regionMarks, MARK_STYLE } from '../logic/marks.js';
import * as P from '../logic/progress.js';
import { HALF } from '../logic/layout.js';
import { h } from './ui.js';

const BCOL = { heal: '#e0566e', shop: '#3f7fc4', arena: '#f5cd77', lab: '#ffffff', pavilion: '#f5cd77', station: '#7d4fa3', league: '#ffd27a' };

// pt(wx, wz) → [px, pz] in der aktuellen Zeichenebene, sc = Pixel je Einheit
export function paintLayout(x, L, pt, sc, bsize = 6) {
  x.fillStyle = '#4a8ad0';
  for (const wt of L.water) {
    if (wt.kind === 'lake' || wt.kind === 'ice') { const [cx, cz] = pt(wt.cx, wt.cz); x.beginPath(); x.ellipse(cx, cz, wt.rx * sc, wt.rz * sc, 0, 0, Math.PI * 2); x.fill(); }
    if (wt.kind === 'river' || wt.kind === 'lava') { x.strokeStyle = wt.kind === 'lava' ? '#ff6a2a' : '#4a8ad0'; x.lineWidth = wt.width * sc; x.beginPath(); wt.pts.forEach(([a, b], i) => { const [px, pz] = pt(a, b); i ? x.lineTo(px, pz) : x.moveTo(px, pz); }); x.stroke(); }
    if (wt.kind === 'bay') { const [cx, cz] = pt(wt.cx, wt.cz); x.beginPath(); x.arc(cx, cz, wt.r * sc, 0, Math.PI * 2); x.fill(); }
    if (wt.kind === 'sea') { const [lx] = pt(wt.side > 0 ? wt.line : -wt.line - 300, 0); x.fillRect(lx, -2000, 300 * sc, 4000); }
  }
  x.strokeStyle = '#e8d8a8'; x.lineCap = 'round';
  for (const rd of L.roads) { x.lineWidth = rd.width * sc * 0.8; x.beginPath(); rd.pts.forEach(([a, b], i) => { const [px, pz] = pt(a, b); i ? x.lineTo(px, pz) : x.moveTo(px, pz); }); x.stroke(); }
  x.fillStyle = '#2f6a3a';
  for (const gr of L.grass) { const [gx, gz] = pt(gr.x, gr.z); x.beginPath(); x.ellipse(gx, gz, gr.rx * sc, gr.rz * sc, 0, 0, Math.PI * 2); x.fill(); }
  for (const b of L.buildings) { const [bx, bz] = pt(b.x, b.z); x.fillStyle = BCOL[b.kind] || '#c89a6a'; x.fillRect(bx - bsize / 2, bz - bsize / 2, bsize, bsize); }
}

// Markierungen der Region plus Auftraggeber mit neuer/abgabebereiter Aufgabe
export function adventureMarks(game) {
  const w = game.world, c = w.current, s = game.save;
  if (c?.type !== 'region') return [];
  const out = regionMarks(s, c.layout, c.region);
  for (const n of w.npcs) {
    const qid = n.talk === 'giver' ? n.quest : n.talk === 'resident' ? (REGIONS[c.region]?.quests || []).find(q => q.giver === n.data?.name)?.id : null;
    const q = qid && P.questById(qid); if (!q) continue;
    const st = P.questState(s, q).status;
    if (st === 'new' || st === 'ready') out.push({ kind: st === 'new' ? 'questNew' : 'questReady', x: n.ch.root.position.x, z: n.ch.root.position.z, label: q.giver + ': ' + q.title });
  }
  return out;
}

export function drawMark(x, px, pz, kind, r = 6.5, upright = 0) {
  const st = MARK_STYLE[kind]; if (!st) return;
  x.save(); x.translate(px, pz); x.rotate(upright);
  x.fillStyle = st.color; x.strokeStyle = '#1b2030'; x.lineWidth = 2;
  x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.fill(); x.stroke();
  x.fillStyle = '#1b2030'; x.font = 'bold ' + Math.round(r * 1.45) + 'px Fredoka, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(st.glyph, 0, r * 0.08);
  x.restore();
}

// Ganze Region als Karte (Reiter „Karte“): Nord oben, Spieler und Ziele
export function regionMapPanel(game) {
  const c = game.world.current;
  if (c?.type !== 'region' || c.region >= 16) return null;
  const S = 300, sc = S / (HALF * 2), L = c.layout;
  const cv = h('canvas.regionmap', { width: S * 2, height: S * 2 });
  const x = cv.getContext('2d'); x.scale(2, 2);
  x.fillStyle = '#5a9a5a'; x.fillRect(0, 0, S, S);
  const pt = (wx, wz) => [(wx + HALF) * sc, (wz + HALF) * sc];
  paintLayout(x, L, pt, sc, 5);
  const marks = adventureMarks(game);
  const obj = game.objectiveTarget();
  if (obj) { const [ox, oz] = pt(obj.x, obj.z); x.strokeStyle = '#ffd35a'; x.lineWidth = 3; x.beginPath(); x.arc(ox, oz, 11, 0, Math.PI * 2); x.stroke(); }
  for (const m of marks) { const [mx, mz] = pt(m.x, m.z); drawMark(x, mx, mz, m.kind, 6); }
  const p = game.world.player.root.position, [px, pz] = pt(p.x, p.z);
  x.save(); x.translate(px, pz); x.rotate(Math.PI - game.world.player.root.rotation.y);
  x.fillStyle = '#ff5a4a'; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -8); x.lineTo(5.5, 6); x.lineTo(0, 3); x.lineTo(-5.5, 6); x.closePath(); x.fill(); x.stroke(); x.restore();
  const seen = new Set();
  const legend = marks.filter(m => !seen.has(m.kind + m.label) && seen.add(m.kind + m.label)).map(m => h('div.row', {}, h('span.mk', { style: { background: MARK_STYLE[m.kind].color } }, MARK_STYLE[m.kind].glyph), h('div.grow', {}, h('b', {}, MARK_STYLE[m.kind].name), ' ', h('span.muted', {}, m.label))));
  return h('div.regionpanel', {}, h('h3', {}, '🗺 ' + REGIONS[c.region].name + ' – Gebietskarte'), h('div.regionbody', {}, h('button.regionwrap.focusable', { 'aria-label': 'Gebietskarte' }, cv), h('div.list.legend', {}, legend.length ? legend : h('p.muted', {}, 'Alles erkundet! Keine offenen Ziele in dieser Region.'))));
}
