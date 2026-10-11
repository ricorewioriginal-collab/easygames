import { canReach, edgeActive, reachable } from './graph';
import { EDGE_STYLES, Layout, NODE_KINDS, WORLD_IDS } from './types';

/** Strukturprüfung eines Layouts. Gibt eine Liste von Fehlern zurück (leer = gültig). */
export function validateLayout(l: Layout): string[] {
  const err: string[] = [];
  const e = (m: string) => err.push(`${l.id}: ${m}`);
  if (!l.id || !/^[a-z-]+-\d{2}$/.test(l.id)) e('ID muss wie "prismara-01" aussehen');
  if (!WORLD_IDS.includes(l.world)) e('unbekannte Welt');
  if (!Number.isInteger(l.index) || l.index < 1 || l.index > 10) e('Index 1…10');
  if (l.id !== `${l.world}-${String(l.index).padStart(2, '0')}`) e('ID passt nicht zu Welt/Index');
  if (!l.name || l.name.length < 3) e('Name fehlt');
  if (!l.blurb || l.blurb.length < 20) e('Beschreibung fehlt oder zu kurz');
  if (!l.template) e('Bauplan fehlt');
  if (![1, 2, 3].includes(l.difficulty)) e('Schwierigkeit 1…3');
  if (!Number.isInteger(l.recommendedRounds) || l.recommendedRounds < 8 || l.recommendedRounds > 25)
    e('Rundenempfehlung 8…25');
  if (!Number.isInteger(l.foldPhases) || l.foldPhases < 1 || l.foldPhases > 3) e('foldPhases 1…3');
  const n = l.nodes.length;
  if (n < 24 || n > 72) e(`Feldanzahl ${n} außerhalb 24…72`);
  if (!Array.isArray(l.features) || l.features.length === 0) e('Besonderheiten fehlen');
  l.nodes.forEach((node, i) => {
    if (node.id !== i) e(`Feld ${i} hat ID ${node.id} (IDs müssen 0…n-1 lückenlos sein)`);
    if (!NODE_KINDS.includes(node.kind)) e(`Feld ${i}: unbekannte Art`);
    if (!Array.isArray(node.pos) || node.pos.length !== 3 || node.pos.some((v) => !Number.isFinite(v)))
      e(`Feld ${i}: ungültige Position`);
    if (node.kind === 'portal') {
      const p = node.portal;
      const partner = p === undefined ? undefined : l.nodes[p];
      if (!partner || partner.kind !== 'portal' || partner.portal !== i || p === i)
        e(`Portal ${i}: Partner fehlt oder nicht gegenseitig`);
    } else if (node.portal !== undefined) e(`Feld ${i}: portal nur bei Portalen`);
  });
  const starts = l.nodes.filter((x) => x.kind === 'start');
  if (starts.length !== 1) e(`genau ein Startfeld nötig (gefunden: ${starts.length})`);
  if (l.nodes[l.start]?.kind !== 'start') e('start verweist nicht auf das Startfeld');
  // Abstände
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const a = l.nodes[i]?.pos,
        b = l.nodes[j]?.pos;
      if (!a || !b) continue;
      if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 1.2) e(`Felder ${i} und ${j} überlappen`);
    }
  const seenEdges = new Set<string>();
  l.edges.forEach((edge, i) => {
    if (!l.nodes[edge.from] || !l.nodes[edge.to]) return e(`Kante ${i}: ungültige Felder`);
    if (edge.from === edge.to) e(`Kante ${i}: Schleife auf sich selbst`);
    if (!EDGE_STYLES.includes(edge.style)) e(`Kante ${i}: unbekannter Stil`);
    const key = `${edge.from}>${edge.to}`;
    if (seenEdges.has(key)) e(`Kante ${key} doppelt`);
    seenEdges.add(key);
    if (edge.folds) {
      if (
        edge.folds.length === 0 ||
        edge.folds.some((f) => !Number.isInteger(f) || f < 0 || f >= l.foldPhases)
      )
        e(`Kante ${key}: ungültige Faltungsphasen`);
      if (l.foldPhases === 1) e(`Kante ${key}: Faltung ohne foldPhases > 1`);
    }
    const a = l.nodes[edge.from]?.pos,
      b = l.nodes[edge.to]?.pos;
    if (a && b) {
      const len = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      if (len > 16) e(`Kante ${key}: zu lang (${len.toFixed(1)})`);
    }
  });
  if (n === 0 || err.length) return err;
  // Dauerhaft begehbarer Kern: stark zusammenhängend
  const base = (x: { folds?: number[] }) => !x.folds;
  const fwd = reachable(l, l.start, base);
  const back = canReach(l, l.start, base);
  if (fwd.size !== n) e(`vom Start aus ohne Faltung nicht alles erreichbar (${fwd.size}/${n})`);
  if (back.size !== n) e(`nicht von allen Feldern ohne Faltung zurück zum Start (${back.size}/${n})`);
  // Jede Phase: jedes Feld hat einen Weg weiter
  for (let ph = 0; ph < l.foldPhases; ph++) {
    for (const node of l.nodes)
      if (!l.edges.some((x) => x.from === node.id && edgeActive(x, ph)))
        e(`Feld ${node.id} ist in Phase ${ph} eine Sackgasse`);
  }
  if (l.foldPhases > 1) {
    const foldEdges = l.edges.filter((x) => x.folds);
    if (foldEdges.length < 2) e('Faltung aktiv, aber weniger als 2 faltbare Wege');
    for (let ph = 0; ph < l.foldPhases; ph++)
      if (!foldEdges.some((x) => x.folds?.includes(ph))) e(`Phase ${ph} hat keinen faltbaren Weg`);
  }
  // Altar-Orte
  const sites = new Set(l.altarSites);
  if (sites.size !== l.altarSites.length || sites.size < 4) e('mindestens 4 verschiedene Altar-Orte nötig');
  for (const s of l.altarSites) {
    const k = l.nodes[s]?.kind;
    if (k === undefined) e(`Altar-Ort ${s} existiert nicht`);
    else if (k === 'start' || k === 'portal' || k === 'gate') e(`Altar-Ort ${s} ist Start/Portal/Mautbrücke`);
  }
  // Ausgewogenheit der Feldarten
  const count = (k: string) => l.nodes.filter((x) => x.kind === k).length;
  if (count('glimmer') < n * 0.25) e('zu wenige Glimmer-Felder (mind. 25 %)');
  if (count('thorn') > n * 0.3) e('zu viele Dornenfelder (max. 30 %)');
  for (const k of ['shop', 'item', 'event'] as const) if (count(k) < 1) e(`mindestens ein ${k}-Feld nötig`);
  if (count('shop') > Math.ceil(n / 8)) e('zu viele Läden');
  if (l.islands.length === 0) e('mindestens eine Insel/Plattform nötig');
  l.nodes.forEach((node) => {
    if (node.island !== undefined && (node.island < 0 || node.island >= l.islands.length))
      e(`Feld ${node.id}: ungültige Insel`);
  });
  return err;
}

/** Strukturelle Kennzahlen – zwei Layouts mit identischer Signatur gelten als Kopien. */
export function layoutSignature(l: Layout): string {
  const count = (k: string) => l.nodes.filter((x) => x.kind === k).length;
  const branches =
    new Set(l.edges.map((e) => e.from)).size &&
    l.nodes.filter((nd) => l.edges.filter((e) => e.from === nd.id).length > 1).length;
  return [
    l.nodes.length,
    l.edges.length,
    branches,
    l.foldPhases,
    l.edges.filter((e) => e.folds).length,
    count('portal'),
    count('gate'),
    count('shop'),
    count('chaos'),
    l.islands.length,
  ].join('/');
}
