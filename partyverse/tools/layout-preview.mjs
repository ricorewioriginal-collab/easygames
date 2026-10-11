// SVG-Draufsicht eines Layouts.  Aufruf:  npx tsx tools/layout-preview.mjs <layout-id> [out.svg]
// Felder sind nach Art eingefärbt, Kanten haben Pfeile, faltbare Kanten sind gestrichelt (Farbe je Phase).
import { writeFileSync } from 'node:fs';
import { LAYOUTS, getLayout } from '../shared/src/levels/index.ts';

const COLORS = {
  start: '#ffffff',
  glimmer: '#ffd23f',
  thorn: '#d1344f',
  event: '#9b5de5',
  item: '#2ec4b6',
  shop: '#f77f00',
  portal: '#3a86ff',
  gate: '#8d5a2b',
  chaos: '#ff4fa3',
};
const EDGE = {
  path: '#8896a8',
  bridge: '#b08968',
  light: '#7fd8ff',
  vine: '#4caf50',
  stairs: '#c9a227',
  rail: '#e63946',
  rainbow: '#d94cff',
  beam: '#30e0c0',
};
const PHASE = ['#ff6b00', '#00a6a6', '#8a2be2'];

export function layoutToSvg(l, scale = 11) {
  const xs = l.nodes.map((n) => n.pos[0]);
  const zs = l.nodes.map((n) => n.pos[2]);
  const pad = 6;
  const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const halfW = Math.max((Math.max(...xs) - Math.min(...xs)) / 2 + pad, 330 / scale);
  const minX = midX - halfW,
    maxX = midX + halfW,
    minZ = Math.min(...zs) - pad,
    maxZ = Math.max(...zs) + pad + 3;
  const W = (maxX - minX) * scale,
    H = (maxZ - minZ) * scale;
  const X = (x) => ((x - minX) * scale).toFixed(1);
  const Z = (z) => ((z - minZ) * scale).toFixed(1);
  const ys = l.nodes.map((n) => n.pos[1]);
  const y0 = Math.min(...ys),
    y1 = Math.max(...ys);
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(0)}" height="${H.toFixed(0)}" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" font-family="sans-serif">`);
  o.push(`<rect width="100%" height="100%" fill="#10131c"/>`);
  o.push(`<defs>`);
  for (const [k, c] of Object.entries(EDGE)) o.push(`<marker id="a-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`);
  for (let i = 0; i < 3; i++) o.push(`<marker id="f-${i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${PHASE[i]}"/></marker>`);
  o.push(`</defs>`);
  l.islands.forEach((isl, i) => {
    o.push(`<circle cx="${X(isl.center[0])}" cy="${Z(isl.center[2])}" r="${(isl.radius * scale).toFixed(1)}" fill="${isl.spin ? '#27324d' : '#1b2233'}" stroke="${isl.spin ? '#4a6fd8' : '#2c3650'}" stroke-width="1.5" ${isl.spin ? 'stroke-dasharray="2 4"' : ''}/>`);
    o.push(`<text x="${X(isl.center[0])}" y="${Z(isl.center[2])}" fill="#3a4666" font-size="11" text-anchor="middle">${i}</text>`);
  });
  const P = (n) => l.nodes[n].pos;
  for (const e of l.edges) {
    const a = P(e.from),
      b = P(e.to);
    const dx = b[0] - a[0],
      dz = b[2] - a[2];
    const len = Math.hypot(dx, dz) || 1;
    // Kürzen, damit Pfeil nicht unter dem Feld liegt
    const r = 0.95;
    const ax = a[0] + (dx / len) * r,
      az = a[2] + (dz / len) * r,
      bx = b[0] - (dx / len) * (r + 0.2),
      bz = b[2] - (dz / len) * (r + 0.2);
    // leichte Krümmung bei Gegenkanten, damit beide sichtbar sind
    const rev = l.edges.some((f) => f.from === e.to && f.to === e.from);
    const off = rev ? 0.45 : 0;
    const nx = (-dz / len) * off,
      nz = (dx / len) * off;
    const fold = e.folds;
    const color = fold ? PHASE[e.folds[0]] : EDGE[e.style];
    const marker = fold ? `f-${e.folds[0]}` : `a-${e.style}`;
    const dash = fold ? 'stroke-dasharray="7 5"' : '';
    const w = fold ? 2.4 : e.style === 'path' ? 2.2 : 3;
    const mx = (ax + bx) / 2 + nx * 2,
      mz = (az + bz) / 2 + nz * 2;
    o.push(`<path d="M${X(ax + nx)} ${Z(az + nz)} Q${X(mx)} ${Z(mz)} ${X(bx + nx)} ${Z(bz + nz)}" fill="none" stroke="${color}" stroke-width="${w}" ${dash} opacity="${fold ? 0.95 : 0.8}" marker-end="url(#${marker})"/>`);
    if (fold && fold.length > 0) o.push(`<text x="${X(mx)}" y="${Z(mz) - 3}" fill="${color}" font-size="10" text-anchor="middle">${fold.join(',')}</text>`);
  }
  for (const n of l.nodes) {
    const t = (n.pos[1] - y0) / Math.max(1, y1 - y0);
    const rr = 0.9 * scale;
    o.push(`<circle cx="${X(n.pos[0])}" cy="${Z(n.pos[2])}" r="${rr.toFixed(1)}" fill="${COLORS[n.kind]}" stroke="${l.altarSites.includes(n.id) ? '#00ff9c' : '#000'}" stroke-width="${l.altarSites.includes(n.id) ? 3 : 1}"/>`);
    o.push(`<text x="${X(n.pos[0])}" y="${(Number(Z(n.pos[2])) + 3.5).toFixed(1)}" font-size="9" text-anchor="middle" fill="#000">${n.portal !== undefined ? n.id + '→' + n.portal : n.id}</text>`);
    if (y1 - y0 > 0.5) o.push(`<rect x="${(Number(X(n.pos[0])) - 6).toFixed(1)}" y="${(Number(Z(n.pos[2])) + rr + 1).toFixed(1)}" width="12" height="2.5" fill="hsl(${200 - t * 160} 80% 55%)"/>`);
  }
  // Legende
  let lx = 8;
  for (const [k, c] of Object.entries(COLORS)) {
    o.push(`<circle cx="${lx + 5}" cy="${H - 12}" r="5" fill="${c}"/><text x="${lx + 13}" y="${H - 8}" font-size="10" fill="#cfd6e6">${k}</text>`);
    lx += 64;
  }
  o.push(`<text x="8" y="16" font-size="14" fill="#fff">${l.id} – ${l.name} (${l.template}, ${l.nodes.length} Felder, ${l.edges.length} Kanten, Phasen ${l.foldPhases}, Schwierigkeit ${l.difficulty})</text>`);
  o.push(`</svg>`);
  return o.join('\n');
}

const arg = process.argv[2];
if (process.argv[1] && process.argv[1].endsWith('layout-preview.mjs')) {
  if (!arg) {
    console.error('Aufruf: npx tsx tools/layout-preview.mjs <layout-id> [out.svg]\nVerfügbar: ' + LAYOUTS.map((l) => l.id).join(', '));
    process.exit(1);
  }
  const ids = arg === 'all' ? LAYOUTS.map((l) => l.id) : [arg];
  for (const id of ids) {
    const l = getLayout(id);
    const out = arg === 'all' ? `${process.argv[3] ?? '.'}/${id}.svg` : (process.argv[3] ?? `${id}.svg`);
    writeFileSync(out, layoutToSvg(l));
    console.log('geschrieben:', out);
  }
}
