/* Prisma-Insel (Kap. 7): EINE große Insel mit Prisma-Stadt in der Mitte und drei frei verbundenen Gebieten:
   🥋 Ki-Garten (Norden, Berge): Trainingsmeisterin, Parcours, Flugprüfung, Turnier ohne Kampf, geheime Trainingsorte, Ki-Sprung.
   🃏 Runen-Arena (Osten): eigenes Sammelkartenspiel mit Deck, holografischen Kreaturen, Rivalen und Turnier.
   💠 Datenhain (Südwesten): digitale Biome, eigene Begleiter mit Pflege, Freundschaft und Entwicklung, seltene Datenwesen. */
import type { WorldDef, WorldCtx } from '../registry.ts';
import type { NpcDef } from '../../gameplay/npc.ts';
import type { QuestDef } from '../../gameplay/quests.ts';
import { at, arcade, chest, isle, npc, pathTo, pickup, spawnFrom, spot } from '../kit.ts';
import { arch, floatLabel, fountain, house, lamp, stall, statue, tower } from '../props.ts';
import { ISLES } from '../layout.ts';

const P = ISLES.prisma, pa = (dx: number, dz: number) => at('prisma', dx, dz);
export const KI = { dx: 0, dz: -62 }, RUNE = { dx: 62, dz: 8 }, DATA = { dx: -54, dz: 38 };
const KI_ORTE = [[-30, -80, 'Wasserfall-Plateau'], [28, -86, 'Wolkengipfel'], [-6, -96, 'Sonnenstein']] as const;
export const DATENWESEN = [
  { id: 'byte', name: 'Byte', icon: '🟦', dx: -70, dz: 24, biome: 'Würfelwiese' },
  { id: 'glitzi', name: 'Glitzi', icon: '✨', dx: -40, dz: 60, biome: 'Glitzerbach' },
  { id: 'cursi', name: 'Cursi', icon: '🖱️', dx: -76, dz: 54, biome: 'Kabelwald' },
  { id: 'pixelfee', name: 'Pixelfee', icon: '🧚', dx: -30, dz: 30, biome: 'Neonlichtung' }
];

export const prisma: WorldDef = {
  id: 'prisma', name: 'Prisma-Insel', icon: '🌀', chapter: 7, theme: 'spiel',
  desc: 'Eine große Abenteuerinsel: Prisma-Stadt, Ki-Garten, Runen-Arena und Datenhain.',
  shape: isle('prisma', { height: 1.3, grass: 0x66cfa2, grass2: 0x58c094, beach: 10, bumps: 1,
    hills: [{ ...pa(-24, -82), r: 22, h: 14, tiers: 4 }, { ...pa(26, -84), r: 20, h: 18, tiers: 5 }, { ...pa(-4, -94), r: 14, h: 22, tiers: 6 }],
    flats: [{ x: P.x, z: P.z, r: 24, y: 1.3 }, { ...pa(KI.dx, KI.dz + 6), r: 16, y: 1.3 }, { ...pa(RUNE.dx, RUNE.dz), r: 18, y: 1.3 }, { ...pa(DATA.dx, DATA.dz), r: 24, y: 1.3 }],
    paths: [pathTo('prisma', 272, -232, 7, 0xeee9fa), { ax: P.x, az: P.z, bx: pa(KI.dx, KI.dz + 14).x, bz: pa(KI.dx, KI.dz + 14).z, w: 5, color: 0xffdf8a }, { ax: P.x, az: P.z, bx: pa(RUNE.dx - 14, RUNE.dz).x, bz: pa(RUNE.dx - 14, RUNE.dz).z, w: 5, color: 0xd7b8ff }, { ax: P.x, az: P.z, bx: pa(DATA.dx + 14, DATA.dz - 10).x, bz: pa(DATA.dx + 14, DATA.dz - 10).z, w: 5, color: 0x8dddf2 }],
    paints: [{ x: P.x, z: P.z, r: 22, color: 0xeee9fa }, { x: P.x, z: P.z, r: 18, color: 0xffcf55, ring: 0.8 }, { ...pa(RUNE.dx, RUNE.dz), r: 16, color: 0xc0a6f2 }, { ...pa(RUNE.dx, RUNE.dz), r: 16, color: 0xb48aff, ring: 1 }],
    colorFn: (x, z) => {
      const dx = x - (P.x + DATA.dx), dz = z - (P.z + DATA.dz);
      if (Math.hypot(dx, dz) < 34) return (Math.floor(x / 3) + Math.floor(z / 3)) % 2 ? 0x58d9ff : 0x4fc8ef; // digitale Würfelwiese
      return null;
    } }),
  spawn: spawnFrom('prisma', 'bauland'),
  pois: {
    stadt: { x: P.x, z: P.z, name: 'Prisma-Stadt', icon: '🌀' }, ki: { ...pa(KI.dx, KI.dz), name: 'Ki-Garten', icon: '🥋' }, runen: { ...pa(RUNE.dx, RUNE.dz), name: 'Runen-Arena', icon: '🃏' }, daten: { ...pa(DATA.dx, DATA.dz), name: 'Datenhain', icon: '💠' },
    ...Object.fromEntries(KI_ORTE.map(([dx, dz, nm], i) => ['ki' + i, { ...pa(dx, dz), name: nm, icon: '⛰️' }]))
  },
  zones: [
    { id: 'ki', name: 'Ki-Garten', ...pa(KI.dx, KI.dz - 10), r: 40, theme: 'arena', icon: '🥋' },
    { id: 'runen', name: 'Runen-Arena', ...pa(RUNE.dx, RUNE.dz), r: 30, theme: 'spiel', icon: '🃏' },
    { id: 'daten', name: 'Datenhain', ...pa(DATA.dx, DATA.dz), r: 36, theme: 'bauland', icon: '💠' },
    { id: 'pstadt', name: 'Prisma-Stadt', x: P.x, z: P.z, r: 26, icon: '🌀' }
  ],
  vehicles: [{ type: 'roadster', ...pa(-10, 18), yaw: 0 }, { type: 'coupe', ...pa(36, 14), yaw: 1.57 }, { type: 'buggy', ...pa(-30, 22), yaw: -1 }],
  groundCover: { grass: 0.9, flowers: [0xffcf55, 0xb48aff, 0x58d9ff, 0xff79c9] },
  proxy: (b, h) => { const p = pa(-4, -94); b.cone(p.x, h(p.x, p.z) - 4, p.z, 6, 10, 0xffcf55, 8); },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    /* ---------- Prisma-Stadt ---------- */
    fountain(ctx, P.x, P.z, 4, 0xeee9fa, 0x8fe7ff);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.6), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x8fe7ff, emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.3 }));
    (crystal.material as THREE.Material).userData.disposeWithWorld = true; crystal.position.set(P.x, ctx.h(P.x, P.z) + 6, P.z); ctx.add(crystal);
    ctx.onUpdate((_d, t) => { crystal.rotation.y = t * 0.6; crystal.position.y = ctx.h(P.x, P.z) + 6 + Math.sin(t) * 0.3; (crystal.material as THREE.MeshStandardMaterial).emissive.setHSL((t * 0.05) % 1, 0.7, 0.5); });
    floatLabel(ctx, P.x, ctx.h(P.x, P.z) + 9.5, P.z, 'Prisma-Stadt', '🌀', 1.3);
    const cols = [0xffcf55, 0xb48aff, 0x58d9ff, 0xff79c9, 0x8df47a, 0xff8a6b];
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.5; const p = pa(Math.cos(a) * 28, Math.sin(a) * 28); house(ctx, { ...p, rot: -a - Math.PI / 2, w: 9, d: 8, h: 5 + (i % 2) * 3.4, storeys: 1 + (i % 2), wall: 0xf4f0ff, roof: cols[i], enter: true, roofType: i % 2 ? 'flat' : 'dome' }); }
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; lamp(ctx, P.x + Math.cos(a) * 17, P.z + Math.sin(a) * 17, cols[i % 6]); }
    stall(ctx, pa(10, 14).x, pa(10, 14).z, 0.5, 0xb48aff, [0x58d9ff, 0xffcf55, 0xff79c9]);
    arch(ctx, spawnFrom('prisma', 'bauland').x + 4, spawnFrom('prisma', 'bauland').z + 4, spawnFrom('prisma', 'bauland').yaw + Math.PI / 2, 9, 6, 0x5e6b91, 0xffd55b);
    /* ---------- Ki-Garten ---------- */
    const kg = pa(KI.dx, KI.dz);
    const dojo = house(ctx, { x: kg.x, z: kg.z, w: 14, d: 10, h: 4.5, wall: 0xfff1d6, roof: 0xe8453c, enter: true, name: 'Kampfkunstschule (ohne Kampf!)', icon: '🥋', roofType: 'gable', trim: 0x8a5a33, floor: 0xd9b88a });
    void dojo;
    for (let i = 0; i < 6; i++) { const p = pa(KI.dx - 14 + i * 5.6, KI.dz + 14); b.cyl(p.x, ctx.h(p.x, p.z), p.z, 0.35, 0.4, 2.2 + (i % 3) * 0.8, 0xc9a26b, 8); ctx.circle(p.x, p.z, 0.4, ctx.h(p.x, p.z), ctx.h(p.x, p.z) + 2.2 + (i % 3) * 0.8); }
    for (let i = 0; i < 14; i++) { const a = Math.PI + i * 0.23; const p = pa(KI.dx + Math.cos(a) * 34, KI.dz - 6 + Math.sin(a) * 30); ctx.tree(i % 3 ? 'kirsch' : 'tanne', p.x, p.z, 1 + (i % 2) * 0.2); }
    arcade(ctx, 'ki_parcours', pa(KI.dx - 10, KI.dz + 8).x, pa(KI.dx - 10, KI.dz + 8).z, Math.PI, 'ki_parcours', 'Ki-Parcours', '🥋', 0xffcf55);
    arcade(ctx, 'ki_flug', pa(KI.dx + 10, KI.dz + 8).x, pa(KI.dx + 10, KI.dz + 8).z, Math.PI, 'ki_flug', 'Ki-Flugprüfung', '🌀', 0x48c8ff);
    const gong = pa(KI.dx, KI.dz + 10), gy = ctx.h(gong.x, gong.z);
    b.box(gong.x - 1.4, gy, gong.z, 0.2, 3, 0.2, 0x8a5a33); b.box(gong.x + 1.4, gy, gong.z, 0.2, 3, 0.2, 0x8a5a33); b.box(gong.x, gy + 3, gong.z, 3, 0.2, 0.2, 0x8a5a33); b.cyl(gong.x, gy + 1.8, gong.z, 1, 1, 0.1, 0xffc83d, 18, { rx: Math.PI / 2 });
    spot(ctx, 'gong', gong.x, gong.z + 1.5, '🔔', () => api.questStage('w_ki') >= 2 ? 'Gong schlagen: Ki-Turnier starten' : 'Turnier-Gong', () => { api.sfx('note0'); if (api.questStage('w_ki') >= 2 && !api.questDone('w_ki')) api.startMinigame('ki_turnier'); else if (api.questDone('w_ki')) api.startMinigame('ki_turnier'); else api.toast('Erst Parcours und Flugprüfung – dann das Turnier!', '🥋'); }, { r: 3 });
    KI_ORTE.forEach(([dx, dz, nm], i) => { const p = pa(dx, dz), y = ctx.h(p.x, p.z); ctx.glow.sph(p.x, y + 1.2, p.z, 0.7, 0xffcf55); b.cyl(p.x, y, p.z, 1.2, 1.4, 0.4, 0xfff1d6, 12);
      spot(ctx, 'kiort' + i, p.x, p.z, '🧘', () => api.flag('kiort_' + i) ? nm + ': Ki gesammelt ✅' : 'Meditieren: ' + nm, () => { if (api.flag('kiort_' + i)) return; api.setFlag('kiort_' + i); api.burst(p.x, y + 1.5, p.z, [0xffcf55, 0xffffff], 30); api.toast('Du spürst die Ruhe von ' + nm + '. Ki-Energie gesammelt!', '🧘', 3000); api.events.emit('interact', { id: 'kiort', kind: 'ki' }); }, { r: 3, when: () => !api.flag('kiort_' + i) }); });
    /* ---------- Runen-Arena ---------- */
    const ra = pa(RUNE.dx, RUNE.dz), ry = ctx.h(ra.x, ra.z);
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; if (i === 12) continue; for (let k = 0; k < 3; k++) { b.box(ra.x + Math.cos(a) * (13 + k * 1.3), ry + k * 0.8, ra.z + Math.sin(a) * (13 + k * 1.3), 3.6, 0.8, 1.3, k % 2 ? 0x8a5bff : 0xb48aff, { ry: -a + Math.PI / 2 }); } ctx.box(ra.x + Math.cos(a) * 14.3, ra.z + Math.sin(a) * 14.3, 3.6, 4, ry - 1, ry + 2.4, -a + Math.PI / 2); }
    b.cyl(ra.x, ry, ra.z, 6, 6, 0.3, 0x2c2058, 24); ctx.glow.ring(ra.x, ry + 0.32, ra.z, 5.4, 5.8, 0xffc65c, 32);
    const holos: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), new THREE.MeshBasicMaterial({ color: [0xff8a3d, 0x4fc3ff, 0x6fdc6a][i], transparent: true, opacity: 0.6, wireframe: true })); (m.material as THREE.Material).userData.disposeWithWorld = true; ctx.add(m); holos.push(m); }
    ctx.onUpdate((_d, t) => holos.forEach((m, i) => { const a = t * 0.7 + (i / 3) * Math.PI * 2; m.position.set(ra.x + Math.cos(a) * 3.5, ry + 2.2 + Math.sin(t * 2 + i) * 0.4, ra.z + Math.sin(a) * 3.5); m.rotation.set(t, t * 1.3, 0); }));
    floatLabel(ctx, ra.x, ry + 7, ra.z, 'Runen-Arena', '🃏', 1.2);
    spot(ctx, 'runen_pult', ra.x, ra.z, '🃏', 'Runen-Arena: Duelle & Deck', () => api.openPanel('runenArena'), { r: 4, priority: 2 });
    /* ---------- Datenhain ---------- */
    const dh = pa(DATA.dx, DATA.dz), dy = ctx.h(dh.x, dh.z);
    for (let i = 0; i < 20; i++) { const a = i * 0.31, r = 12 + (i % 4) * 5; const p = pa(DATA.dx + Math.cos(a) * r, DATA.dz + Math.sin(a) * r); ctx.tree(i % 2 ? 'pixel' : 'kristall', p.x, p.z, 0.9 + (i % 3) * 0.15); }
    for (let i = 0; i < 12; i++) { const a = i * 0.52; ctx.glow.box(dh.x + Math.cos(a) * 20, dy + 0.05, dh.z + Math.sin(a) * 20, 6, 0.04, 0.3, [0x58d9ff, 0xff79c9, 0x8df47a][i % 3], { ry: -a }); }
    tower(ctx, dh.x + 6, dh.z - 8, 2.4, 10, 0x2c2058, 0x58d9ff);
    const nest = pa(DATA.dx, DATA.dz + 4); b.cyl(nest.x, ctx.h(nest.x, nest.z), nest.z, 2.2, 2.4, 0.5, 0x58d9ff, 16); ctx.glow.ring(nest.x, ctx.h(nest.x, nest.z) + 0.52, nest.z, 1.7, 2.1, 0xff79c9, 24);
    spot(ctx, 'datennest', nest.x, nest.z, '💠', () => api.flag('pixel_adoptiert') ? 'Pixel pflegen' : 'Datennest untersuchen', () => api.openPanel('datenhain'), { r: 3.5, priority: 2 });
    DATENWESEN.forEach(w => { const p = pa(w.dx, w.dz); spot(ctx, 'scan:' + w.id, p.x, p.z, '📡', () => api.flag('scan_' + w.id) ? w.name + ' entdeckt ✅' : 'Etwas flackert im ' + w.biome + ' … scannen', () => {
      if (api.flag('scan_' + w.id)) { api.toast(w.icon + ' ' + w.name + ' winkt dir zu.', '💠'); return; }
      api.setFlag('scan_' + w.id); api.sfx('magic'); api.burst(p.x, ctx.h(p.x, p.z) + 1.2, p.z, [0x58d9ff, 0xff79c9, 0x8df47a], 30); api.toast('Seltenes Datenwesen entdeckt: ' + w.icon + ' ' + w.name + ' (' + w.biome + ')', '📡', 3500); api.discover('daten:' + w.id, w.name); api.events.emit('interact', { id: 'scan', kind: 'scan' });
    }, { r: 3 }); });
    arcade(ctx, 'daten_memory', pa(DATA.dx + 12, DATA.dz - 6).x, pa(DATA.dx + 12, DATA.dz - 6).z, -0.6, 'pixelplan', 'Pixel-Plan', '🧩', 0x58d9ff);
    pickup(ctx, 'datenkekse', pa(DATA.dx - 6, DATA.dz - 10).x, pa(DATA.dx - 6, DATA.dz - 10).z, 'datenkeks', { n: 3 });
    /* ---------- Rand ---------- */
    for (let i = 0; i < 26; i++) { const a = i * 0.24 + 0.1; const p = pa(Math.cos(a) * 98, Math.sin(a) * 98); ctx.tree(i % 4 === 0 ? 'bunt' : 'laub', p.x, p.z, 1 + (i % 3) * 0.1); }
    statue(ctx, P.x, P.z + 8, 0, 0xdcd0ff, 1.4, 'figur');
    chest(ctx, 'prisma_gipfel', pa(-4, -94).x + 2, pa(-4, -94).z + 2, 0, { stars: 20, item: ['kristall', 2] });
    pickup(ctx, 'pr_splitter', P.x, P.z - 6, 'splitter', { when: () => !!(api.flag('done_ki') && api.flag('done_runen') && api.flag('done_daten')), label: 'Der letzte Kompass-Splitter!' });
  }
};

export const PRISMA_NPCS: NpcDef[] = [
  npc('prisma', 'ama', 'Meisterin Ama', '🥋', 'Trainingsmeisterin des Ki-Gartens', pa(KI.dx - 4, KI.dz + 12).x, pa(KI.dx - 4, KI.dz + 12).z, ['Atme ein … atme aus. Willkommen.', 'Ah, eine neue Schülerin, ein neuer Schüler.'], ['Im Ki-Garten kämpfen wir nicht gegeneinander. Wir messen uns mit uns selbst.', 'Ki ist die Ruhe in der Bewegung.', 'An drei geheimen Orten in den Bergen ist das Ki besonders stark.'], { look: { hair: 'dutt', hairColor: 8, top: 'jacke', topColor: 9, hat: 'stirnband', hatColor: 0, skin: 3, age: 2 }, wander: 3, emotes: ['bow'] }),
  npc('prisma', 'gokin', 'Schüler Gokin', '🧒', 'Ki-Schüler', pa(KI.dx + 6, KI.dz + 14).x, pa(KI.dx + 6, KI.dz + 14).z, ['Hah! Hiya! Oh, hallo!', 'Ich trainiere jeden Tag!'], ['Mit dem Ki-Sprung kommt man auf die höchsten Felsen! Aber erst nach dem Turnier.', 'Meisterin Ama ist streng, aber lieb.'], { look: { hair: 'stachel', hairColor: 5, top: 'jacke', topColor: 1, bottomColor: 5, age: 0 }, emotes: ['cheer', 'spin'] }),
  npc('prisma', 'rune', 'Runenmeister Rune', '🧙', 'Hüter der Runen-Arena', pa(RUNE.dx - 8, RUNE.dz - 6).x, pa(RUNE.dx - 8, RUNE.dz - 6).z, ['Die Karten flüstern … sie flüstern deinen Namen.', 'Willkommen in der Runen-Arena.'], ['Ein gutes Deck ist wie ein gutes Team: Jede Karte hat ihre Aufgabe.', 'Feuer schlägt Pflanze, Pflanze schlägt Wasser, Wasser schlägt Feuer. Licht und Schatten streiten ewig.'], { look: { hair: 'lang', hairColor: 8, beard: 'voll', top: 'robe', topColor: 7, hat: 'zauberhut', hatColor: 7, age: 2 }, wander: 2 }),
  npc('prisma', 'lina', 'Lehrling Lina', '🃏', 'Kartenspielerin', pa(RUNE.dx + 4, RUNE.dz + 8).x, pa(RUNE.dx + 4, RUNE.dz + 8).z, ['Spielst du gegen mich? Bitte, bitte!', 'Hi!'], ['Mein Lieblingskarte ist der Funkenfuchs!'], { look: { hair: 'zoepfe', hairColor: 6, top: 'hoodie', topColor: 7, age: 0 } }),
  npc('prisma', 'karl', 'Kartenkönig Karl', '👑', 'Kartenspieler', pa(RUNE.dx + 8, RUNE.dz - 4).x, pa(RUNE.dx + 8, RUNE.dz - 4).z, ['Ha! Noch eine Herausforderin, ein Herausforderer?', 'Mein Deck ist unschlagbar!'], ['Der Glutdrache ist die beste Karte. Keine Widerrede!'], { look: { hair: 'seite', hairColor: 2, top: 'jacke', topColor: 6, hat: 'krone', age: 2 } }),
  npc('prisma', 'bit', 'Forscherin Bit', '👩‍💻', 'Datenhain', pa(DATA.dx + 4, DATA.dz - 2).x, pa(DATA.dx + 4, DATA.dz - 2).z, ['Beep-boop! Ich meine: Hallo!', 'Willkommen im Datenhain!'], ['Datenwesen sind wie Haustiere aus Licht. Sie brauchen Futter, Spiel und Zuneigung.', 'In den vier Biomen leben seltene Datenwesen. Hast du schon welche gescannt?'], { look: { hair: 'bob', hairColor: 12, top: 'hoodie', topColor: 15, glasses: 'rund', skin: 1 }, shop: 'datenshop' })
];

export const PRISMA_QUESTS: QuestDef[] = [
  { id: 'w_ki', title: 'Der Weg des Ki', icon: '🥋', world: 'prisma', kind: 'world', giver: 'ama',
    summary: 'Meisterin Ama lädt dich ein, den Weg des Ki zu gehen – Bewegung, Ruhe und das große Turnier ohne Kampf.',
    offer: { start: { t: 'Der Sturm hat das Ki dieser Berge aufgewühlt. Geh den Weg des Ki: Parcours, Flug und Turnier. Und sammle die Ruhe der drei Bergorte. Bist du bereit?', choices: [{ t: '🥋 Ich bin bereit.', do: [{ start: 'w_ki' }] }, { t: 'Noch nicht.' }] } },
    stages: [
      { text: 'Schaff den Ki-Parcours und meditiere an den drei geheimen Bergorten.', hints: ['Der Parcours-Automat steht links vor der Schule. Die Orte leuchten golden in den Bergen.', 'Wasserfall-Plateau (Westen), Wolkengipfel (Osten), Sonnenstein (ganz oben).', 'Mit Doppelsprung und Gleiten kommst du hoch.'],
        objectives: [{ id: 'p', type: 'minigame', target: 'ki_parcours', label: 'Schaff den Ki-Parcours' }, { id: 'o', type: 'interact', target: 'kiort', n: 3, label: 'Meditiere an den Bergorten' }] },
      { text: 'Besteh die Ki-Flugprüfung.', hints: ['Der Automat rechts vor der Schule.', 'Halten = steigen.', 'Mindestens 60 % der Ringe.'], objectives: [{ id: 'f', type: 'minigame', target: 'ki_flug', label: 'Besteh die Ki-Flugprüfung' }] },
      { text: 'Schlag den Gong und gewinne das Ki-Turnier.', hints: ['Der Gong steht vor der Schule.', 'Das Turnier ist ein schneller, langer Parcours.', 'Höchstens 3 Mal anstoßen.'], objectives: [{ id: 't', type: 'minigame', target: 'ki_turnier', via: 'gong', label: 'Gewinne das Ki-Turnier' }] },
      { text: 'Verbeug dich vor Meisterin Ama.', hints: ['Ama steht vor der Schule.', 'Ki-Garten.', 'Sprich mit Ama.'], objectives: [{ id: 'a', type: 'talk', target: 'ama', label: 'Sprich mit Meisterin Ama' }],
        dialog: { ama: { start: { t: 'Du hast Ruhe und Bewegung vereint. Nimm den Ki-Sprung: Halte Ducken (⤓ / X) gedrückt, lass los – und flieg! Und nimm dieses Stirnband.', emote: 'bow', do: [{ ability: 'kisprung' }, { achieve: 'ki_meister' }, { friend: 4 }], end: false } } } }
    ],
    rewards: { stars: 30, xp: 150, flag: 'done_ki', text: 'Du bist eine Meisterin, ein Meister des Ki.' } },
  { id: 'w_runen', title: 'Das Runen-Turnier', icon: '🃏', world: 'prisma', kind: 'world', giver: 'rune',
    summary: 'Runenmeister Rune hütet ein Turnier der Sammelkarten. Wer alle drei Gegner schlägt, wird Runenmeisterin oder Runenmeister.',
    offer: { start: { t: 'Die Karten haben dich erwartet. Hier ist dein Startdeck. Besiege Lehrling Lina, Kartenkönig Karl – und am Ende mich. Am Pult in der Arena kannst du dein Deck bauen und Duelle starten.', choices: [{ t: '🃏 Das Turnier beginnt!', do: [{ start: 'w_runen' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Besiege Lehrling Lina am Runen-Pult.', hints: ['Das Pult steht in der Mitte der Arena.', 'Element-Vorteil gibt +2 gegen die gegnerische Karte auf derselben Bahn.', 'Halte zwei von drei Bahnen!'], objectives: [{ id: 'l', type: 'flag', target: 'runen_lina', via: 'runen_pult', label: 'Besiege Lina' }] },
      { text: 'Besiege Kartenkönig Karl. Tipp: Bau dein Deck mit neuen Karten um!', hints: ['Karl spielt viel Feuer – Wasser hilft!', 'Neue Karten bekommst du für jeden Sieg.', 'Deck bearbeiten am Pult.'], objectives: [{ id: 'k', type: 'flag', target: 'runen_karl', via: 'runen_pult', label: 'Besiege Karl' }] },
      { text: 'Fordere Runenmeister Rune zum Finale heraus.', hints: ['Rune nutzt Effekte wie Sturm und Spiegel.', 'Spare starke Karten für die knappe Bahn.', 'Am Pult „Finale“ wählen.'], objectives: [{ id: 'r', type: 'flag', target: 'runen_rune', via: 'runen_pult', label: 'Gewinne das Finale' }] }
    ],
    rewards: { stars: 30, xp: 150, flag: 'done_runen', items: [], text: 'Du bist Runenmeisterin, Runenmeister der Prisma-Insel!' } },
  { id: 'w_daten', title: 'Ein Freund aus Licht', icon: '💠', world: 'prisma', kind: 'world', giver: 'bit',
    summary: 'Im Datennest ist ein kleines Datenwesen geschlüpft. Es braucht jemanden, der sich kümmert.',
    offer: { start: { t: 'Beep! Im Datennest ist ein Datenwesen geschlüpft – ganz allein. Kümmerst du dich darum? Futter, Spielen, Training – dann entwickelt es sich!', choices: [{ t: '💠 Ja, ich kümmere mich!', do: [{ start: 'w_daten' }, { give: ['datenkeks', 3] }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Geh zum Datennest und nimm das Datenwesen auf.', hints: ['Das Nest leuchtet mitten im Datenhain.', 'Aktion drücken.', 'Im Fenster „Aufnehmen“.'], objectives: [{ id: 'a', type: 'flag', target: 'pixel_adoptiert', via: 'datennest', label: 'Nimm das Datenwesen auf' }] },
      { text: 'Pflege Pixel, bis es sich entwickelt (Futter, Spielen, Training). Scanne außerdem zwei seltene Datenwesen.', hints: ['Pflege am Datennest. Datenkekse gibt es bei Bit.', 'Freundschaft wächst mit jeder Pflege. Bei voller Freundschaft entwickelt sich Pixel.', 'Die seltenen Wesen flackern in den Biomen rund um das Nest – scanne sie.'],
        objectives: [{ id: 'e', type: 'flag', target: 'pixel_entwickelt', via: 'datennest', label: 'Pixel entwickelt sich' }, { id: 's', type: 'interact', target: 'scan', n: 2, label: 'Scanne seltene Datenwesen' }] },
      { text: 'Zeig Bit deinen entwickelten Freund.', hints: ['Bit ist im Datenhain.', 'Neben dem Nest.', 'Sprich mit Bit.'], objectives: [{ id: 'b', type: 'talk', target: 'bit', label: 'Sprich mit Bit' }],
        dialog: { bit: { start: { t: 'Wow – Pixel hat sich entwickelt! Seht euch an, wie es leuchtet! Ihr zwei seid ein echtes Team.', do: [{ achieve: 'datenfreund' }, { friend: 4 }], end: false } } } }
    ],
    rewards: { stars: 30, xp: 150, flag: 'done_daten', text: 'Pixel ist dein Freund aus Licht.' } }
];
