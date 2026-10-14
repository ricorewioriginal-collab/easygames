/* Weltkarte: alle Inseln, Brücken, Orte, Ziel der Aufgabe, eigene Position. Verschieben/Zoomen, Schnellreise über Weltensteine. */
import type { Game } from '../game.ts';
import type { WorldDef } from '../world/registry.ts';
import { btn, clear, h, modal } from './dom.ts';
import { MAP, type MapImage } from './minimap.ts';

export interface MapOpts {
  image: MapImage;
  target: { x: number; z: number } | null;
  markers: { x: number; z: number; icon: string; label: string }[];
  canTravel: (w: WorldDef) => { ok: boolean; why?: string };
  travel: (w: WorldDef) => void;
}

export function openWorldMap(g: Game, o: MapOpts): void {
  const m = modal({ title: 'Weltkarte', icon: '🗺️', wide: true });
  const wrap = h('div', { class: 'mapwrap' });
  const cv = h('canvas') as HTMLCanvasElement;
  wrap.append(cv);
  const info = h('div', { class: 'maplegend' });
  const travelBox = h('div', { style: 'margin-top:12px' });
  m.body.append(wrap, info, travelBox);
  let scale = 0, cx = g.player.pos.x, cz = g.player.pos.z;
  const ctx = cv.getContext('2d')!;
  const draw = () => {
    const r = wrap.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(10, r.width * dpr); cv.height = Math.max(10, r.height * dpr);
    if (!scale) scale = Math.min(cv.width / (MAP.x1 - MAP.x0), cv.height / (MAP.z1 - MAP.z0)) * 1.6;
    const W = cv.width, H = cv.height;
    ctx.fillStyle = '#2aa3e0'; ctx.fillRect(0, 0, W, H);
    const sx = (x: number) => W / 2 + (x - cx) * scale, sz = (z: number) => H / 2 + (z - cz) * scale;
    if (o.image.done) ctx.drawImage(o.image.canvas, sx(MAP.x0), sz(MAP.z0), (MAP.x1 - MAP.x0) * scale, (MAP.z1 - MAP.z0) * scale);
    else { ctx.fillStyle = '#fff'; ctx.font = (16 * dpr) + 'px Fredoka'; ctx.fillText('Karte wird gezeichnet …', 20, 30); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const w of g.worlds.defs) {
      if (w.underground) continue;
      const seen = g.save.visited.includes(w.id) || g.mode === 'free';
      ctx.font = 'bold ' + Math.round(13 * dpr) + 'px Fredoka, sans-serif';
      const x = sx(w.shape.x), y = sz(w.shape.z - w.shape.r * 0.2);
      ctx.lineWidth = 4 * dpr; ctx.strokeStyle = 'rgba(42,31,74,.8)'; ctx.fillStyle = '#fff';
      const label = (seen ? w.icon + ' ' : '❔ ') + (seen ? w.name : 'Unbekannt');
      ctx.strokeText(label, x, y); ctx.fillText(label, x, y);
      if (scale > 1.2) for (const [k, p] of Object.entries(w.pois)) {
        if (!g.save.discovered.includes(w.id + ':' + k) && !seen) continue;
        ctx.font = Math.round(14 * dpr) + 'px sans-serif'; ctx.fillText(p.icon, sx(p.x), sz(p.z));
        if (scale > 2.5) { ctx.font = Math.round(10 * dpr) + 'px Fredoka'; ctx.strokeText(p.name, sx(p.x), sz(p.z) + 14 * dpr); ctx.fillText(p.name, sx(p.x), sz(p.z) + 14 * dpr); }
      }
    }
    // Atlantis-Hinweis an der Treppe
    for (const mk of o.markers) { ctx.font = Math.round(18 * dpr) + 'px sans-serif'; ctx.fillText(mk.icon, sx(mk.x), sz(mk.z)); }
    if (o.target) {
      ctx.beginPath(); ctx.arc(sx(o.target.x), sz(o.target.z), 10 * dpr, 0, Math.PI * 2); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 3 * dpr; ctx.strokeStyle = '#2a1f4a'; ctx.stroke();
    }
    // Spieler
    const px = sx(g.player.pos.x), pz = sz(g.player.pos.z);
    ctx.save(); ctx.translate(px, pz); ctx.rotate(-g.player.yaw + Math.PI);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#e8453c'; ctx.lineWidth = 3 * dpr;
    ctx.beginPath(); ctx.moveTo(0, -12 * dpr); ctx.lineTo(9 * dpr, 10 * dpr); ctx.lineTo(0, 5 * dpr); ctx.lineTo(-9 * dpr, 10 * dpr); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  };
  // Verschieben & Zoomen (Maus, Touch, Rad)
  const pts = new Map<number, { x: number; y: number }>();
  let pinch0 = 0, scale0 = 0;
  wrap.addEventListener('pointerdown', e => { wrap.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); scale0 = scale; } });
  wrap.addEventListener('pointermove', e => {
    const p = pts.get(e.pointerId); if (!p) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (pts.size === 1) { cx -= (e.clientX - p.x) * dpr / scale; cz -= (e.clientY - p.y) * dpr / scale; }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { const [a, b] = [...pts.values()]; scale = Math.max(0.2, Math.min(8, scale0 * Math.hypot(a.x - b.x, a.y - b.y) / pinch0)); }
    draw();
  });
  const up = (e: PointerEvent) => pts.delete(e.pointerId);
  wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
  wrap.addEventListener('wheel', e => { e.preventDefault(); scale = Math.max(0.2, Math.min(8, scale * (e.deltaY > 0 ? 0.87 : 1.15))); draw(); }, { passive: false });
  info.append(btn('➕', () => { scale = Math.min(8, scale * 1.3); draw(); }, 'ghost small'), btn('➖', () => { scale = Math.max(0.2, scale / 1.3); draw(); }, 'ghost small'), btn('📍 Ich', () => { cx = g.player.pos.x; cz = g.player.pos.z; draw(); }, 'ghost small'),
    ...(o.target ? [btn('🎯 Ziel', () => { cx = o.target!.x; cz = o.target!.z; draw(); }, 'ghost small')] : []),
    btn('🌍 Alles', () => { cx = (MAP.x0 + MAP.x1) / 2; cz = (MAP.z0 + MAP.z1) / 2; scale = 0; draw(); }, 'ghost small'));
  // Schnellreise
  travelBox.append(h('h3', null, '✨ Schnellreise zu einem Weltenstein'));
  const grid = h('div', { class: 'grid' });
  for (const w of g.worlds.defs) {
    const c = o.canTravel(w);
    grid.append(h('div', { class: 'card' + (c.ok ? '' : ' locked') }, h('b', null, w.icon + ' ' + w.name), h('div', { class: 'muted', style: 'font-size:.82rem;min-height:2.2em' }, c.ok ? w.desc.slice(0, 70) + (w.desc.length > 70 ? '…' : '') : c.why ?? ''),
      c.ok ? btn('Hinreisen', () => { m.close(); o.travel(w); }, 'grape small') : null));
  }
  travelBox.append(grid);
  requestAnimationFrame(draw);
  const iv = setInterval(() => { if (!document.body.contains(cv)) { clearInterval(iv); return; } if (!o.image.done) { o.image.step(30); draw(); } }, 120);
  void clear;
}
