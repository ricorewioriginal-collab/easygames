/* Welten-Gruppe 1: Stadtinsel (Kap. 1), Fellretter-Bucht (Kap. 2), Drachenhöhen (Kap. 3), Dampfer-Hafen (Kap. 3). */
import type { WorldDef, WorldCtx } from '../registry.ts';
import type { NpcDef } from '../../gameplay/npc.ts';
import type { QuestDef } from '../../gameplay/quests.ts';
import { at, arcade, chest, isle, npc, pathTo, pickup, sequencePuzzle, spawnFrom, spot, emojiTex } from '../kit.ts';
import { arch, bench, floatLabel, fountain, frame, furniture, house, lamp, rock, stall, statue, tower } from '../props.ts';
import { ISLES } from '../layout.ts';

/* =====================================================================  STADTINSEL  */
const S = ISLES.stadt, sa = (dx: number, dz: number) => at('stadt', dx, dz);
export const stadt: WorldDef = {
  id: 'stadt', name: 'Stadtinsel', icon: '🏙️', chapter: 1, theme: 'stadt',
  desc: 'Uhrturm, Brunnen, Einkaufsstraße und Hochhäuser – hier ist immer was los.',
  shape: isle('stadt', { height: 1.2, grass: 0x6fcf5a, grass2: 0x62c052, beach: 7, bumps: 0.3,
    flats: [{ x: S.x, z: S.z, r: 50, y: 1.2 }],
    paths: [{ ax: S.x - 48, az: S.z, bx: S.x + 48, bz: S.z, w: 9, color: 0x8f949c }, { ax: S.x, az: S.z - 48, bx: S.x, bz: S.z + 60, w: 9, color: 0x8f949c }, pathTo('stadt', -215, -305, 6, 0xd9d2c3), pathTo('stadt', 60, -560, 6, 0xd9d2c3)],
    paints: [{ x: S.x, z: S.z, r: 18, color: 0xd9d2c3 }, { x: S.x, z: S.z, r: 18, color: 0xb7a89a, ring: 1.5 }],
    colorFn: (x, z) => { const dx = Math.abs(x - S.x), dz = Math.abs(z - S.z); return (dx < 45 && dz < 7.5) || (dz < 45 && dx < 7.5) ? null : (dx < 48 && dz < 48 && ((Math.abs(dx) > 7 && Math.abs(dx) < 11) || (Math.abs(dz) > 7 && Math.abs(dz) < 11)) ? 0xe3ddd0 : null); } }),
  spawn: spawnFrom('stadt', 'hub'),
  pois: { brunnen: { ...sa(0, 0), name: 'Brunnenplatz', icon: '⛲' }, uhrturm: { ...sa(0, -26), name: 'Uhrturm', icon: '🕰️' }, laeden: { ...sa(24, 14), name: 'Einkaufsstraße', icon: '🛍️' }, hochhaus: { ...sa(-28, -28), name: 'Hochhäuser', icon: '🏢' }, park: { ...sa(-26, 26), name: 'Stadtpark', icon: '🌳' } },
  zones: [{ id: 'stadtmitte', name: 'Brunnenplatz', ...sa(0, 0), r: 20, icon: '⛲' }],
  vehicles: [{ type: 'bus', ...sa(14, 40), yaw: Math.PI }, { type: 'auto', ...sa(-14, 38), yaw: 0, color: 0xffd23f }, { type: 'fahrrad', ...sa(6, 46), yaw: 0 }],
  proxy: b => { const p = sa(0, -26); b.box(p.x, 1, p.z, 5, 18, 5, 0xe8dcc8); for (const [x, z, h] of [[-28, -28, 26], [-38, -14, 18], [30, -32, 22]]) { const q = sa(x, z); b.box(q.x, 1, q.z, 9, h, 9, 0xbfd4e6); } },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    fountain(ctx, S.x, S.z, 4.5, 0xe3ddd0, 0x57c4ff);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.39; lamp(ctx, S.x + Math.cos(a) * 16, S.z + Math.sin(a) * 16); }
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.78; bench(ctx, S.x + Math.cos(a) * 12, S.z + Math.sin(a) * 12, -a + Math.PI / 2 + Math.PI); }
    // Uhrturm
    const u = sa(0, -26), y = ctx.h(u.x, u.z);
    b.box(u.x, y, u.z, 6, 20, 6, 0xe8dcc8); b.box(u.x, y + 20, u.z, 6.6, 1, 6.6, 0xb7a89a); b.roof(u.x, y + 21, u.z, 6.6, 4, 6.6, 0x2f5fc0);
    for (const [dx, dz, r] of [[0, 3.02, 0], [0, -3.02, Math.PI], [3.02, 0, Math.PI / 2], [-3.02, 0, -Math.PI / 2]] as const) { b.cyl(u.x + dx, y + 16, u.z + dz, 2.2, 2.2, 0.15, 0xfff6e0, 24, { rx: Math.PI / 2, ry: r }); }
    ctx.box(u.x, u.z, 6, 6, y - 1, y + 21);
    const hands = new THREE.Group(); hands.position.set(u.x, y + 16, u.z + 3.15); ctx.add(hands);
    const hm = new THREE.MeshBasicMaterial({ color: 0x2a1f4a }); hm.userData.disposeWithWorld = true;
    const hh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.2, 0.08), hm); hh.geometry.translate(0, 0.6, 0);
    const mh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.8, 0.08), hm); mh.geometry.translate(0, 0.9, 0);
    hands.add(hh, mh);
    ctx.onUpdate((_d, t) => { if (api.flag('uhr_gestellt')) { mh.rotation.z = -t * 0.5; hh.rotation.z = -t * 0.04; } else { mh.rotation.z = 0; hh.rotation.z = -Math.PI * 1.5; } });
    floatLabel(ctx, u.x, y + 27, u.z, 'Uhrturm', '🕰️', 1);
    spot(ctx, 'uhr', u.x, u.z + 4.5, '🕰️', () => api.flag('uhr_gestellt') ? 'Die Uhr tickt wieder ✅' : 'Uhrwerk einstellen', () => {
      if (api.flag('uhr_gestellt')) return;
      if (api.questStage('w_stadt') < 1) { api.toast('Das Uhrwerk ist stehen geblieben. Frag Uhrmacher Otto, was los ist.', '🕰️'); return; }
      api.openPanel('dialog', { tree: {
        start: { t: 'Auf welche Uhrzeit stellst du die Zeiger? (Denk an das, was die Leute erzählt haben!)', choices: [
          { t: '🕛 12 Uhr', to: 'no' }, { t: '🕒 3 Uhr', to: 'ok' }, { t: '🕕 6 Uhr', to: 'no' }, { t: '🕘 9 Uhr', to: 'no' }] },
        ok: { t: 'Tick … tack … TICK TACK! Die Zeiger drehen sich, die Glocke läutet – und hinter dem Zifferblatt fällt ein blau leuchtender Splitter heraus!', do: [{ flag: 'uhr_gestellt' }, { burst: true }, { sfx: 'success' }], end: false },
        no: { t: 'Die Zeiger zittern … und bleiben stehen. Das war wohl nicht die richtige Zeit.', end: false }
      } });
    }, { r: 3.5, priority: 2 });
    // Einkaufsstraße
    const shops: [number, number, number, string, string, number, number, string][] = [
      [20, 14, Math.PI, 'Bäckerei', '🥐', 0xffe3b0, 0xc0613a, 'baecker'], [32, 14, Math.PI, 'Blumenladen', '💐', 0xffd6f0, 0x4cbf55, 'blumen'], [20, -14, 0, 'Apotheke', '💊', 0xe3ffe9, 0x2fd17b, 'apotheker'], [32, -14, 0, 'Kleiderladen', '👗', 0xf1e6ff, 0x8a5bff, 'kleider'],
      [-20, 14, Math.PI, 'Bücherei', '📚', 0xfff1d6, 0x8a5a33, 'bruno'], [-32, 14, Math.PI, 'Café', '☕', 0xffe3d6, 0xe8453c, 'cafe']];
    for (const [dx, dz, r, nm, ic, w, rf] of shops) { const p = sa(dx, dz); const hs = house(ctx, { x: p.x, z: p.z, rot: r, w: 9, d: 8, wall: w, roof: rf, enter: true, name: nm, icon: ic }); furniture(ctx, hs, 'theke', 0, -1.5); furniture(ctx, hs, 'regal', 0, -3.4); }
    // Hochhäuser
    for (const [dx, dz, hgt, c] of [[-28, -28, 26, 0xbfd4e6], [-40, -12, 18, 0xd6e6f5], [30, -32, 22, 0xc8dcef], [42, -20, 14, 0xe6ecf5]] as const) { const p = sa(dx, dz); house(ctx, { x: p.x, z: p.z, w: 10, d: 10, h: hgt, wall: c, roof: 0x5a6a7a, roofType: 'flat', storeys: Math.floor(hgt / 3.4) }); }
    // Stadtpark
    for (let i = 0; i < 14; i++) { const a = i * 0.45, r = 6 + (i % 3) * 3; const p = sa(-30 + Math.cos(a) * r, 30 + Math.sin(a) * r); ctx.tree(i % 4 ? 'laub' : 'kirsch', p.x, p.z, 0.9 + (i % 3) * 0.1); }
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const p = sa(Math.cos(a) * 58, Math.sin(a) * 58); if (Math.abs(p.z - S.z - 58) > 12) ctx.tree('laub', p.x, p.z, 1); }
    stall(ctx, sa(10, 30).x, sa(10, 30).z, 0, 0xff8a1f, [0xffd23f, 0xe8453c, 0x4cd07d]);
    arcade(ctx, 'taxi', sa(-12, -14).x, sa(-12, -14).z, 0, 'heli_rettung', 'Heli-Rettung', '🚁', 0x3f8cff);
    pickup(ctx, 'stadt_splitter', u.x, u.z + 6, 'splitter', { when: () => api.flag('uhr_gestellt') && api.questStage('w_stadt') >= 1, label: 'Kompass-Splitter aufheben' });
  }
};
export const STADT_NPCS: NpcDef[] = [
  npc('stadt', 'otto', 'Uhrmacher Otto', '🕰️', 'Hüter des Uhrturms', sa(4, -20).x, sa(4, -20).z, ['Tick … tack … Ach, wenn sie nur wieder ticken würde!', 'Hallo! Hast du Zeit? Haha – ich leider nicht mehr.'], ['Der Uhrturm hat noch nie stillgestanden. Seit 100 Jahren!', 'Wenn die Uhr steht, vergessen alle, was sie vorhatten. So ist das hier.'], { look: { hair: 'glatze', beard: 'voll', hairColor: 8, top: 'jacke', topColor: 12, glasses: 'rund', age: 2 }, wander: 2, likes: ['kuchen'] }),
  npc('stadt', 'berta', 'Bäckerin Berta', '🥐', 'Bäckerei', sa(20, 10).x, sa(20, 10).z, ['Frische Brötchen! Hm … oder waren die von gestern?', 'Hallo, Liebes!'], ['Mein Erdbeerkuchen ist der beste der Stadt.'], { look: { hair: 'dutt', hairColor: 9, top: 'kleid', topColor: 9, age: 2 }, wander: 0, shop: 'baeckerei', night: 'stay' }),
  npc('stadt', 'bruno', 'Bibliothekar Bruno', '📚', 'Bücherei', sa(-20, 10).x, sa(-20, 10).z, ['Psst! Hier wird gelesen.', 'Willkommen in der Bücherei.'], ['In einem alten Buch steht: „Der Kompass verbindet, was zusammengehört.“', 'Blumen lieben Bücher. Und ich liebe Blumen.'], { look: { hair: 'seite', hairColor: 4, top: 'jacke', topColor: 3, glasses: 'rund', age: 2 }, wander: 2, likes: ['blume', 'feder'] }),
  npc('stadt', 'moritz', 'Straßenmusiker Moritz', '🎸', 'Musiker', sa(8, 8).x, sa(8, 8).z, ['La-la-la … Hallo!', 'Ein Lied gefällig?'], ['Musik macht alles bunter.', 'Ich spiele jeden Tag am Brunnen. Na ja – fast jeden Tag.'], { look: { hair: 'locken', hairColor: 5, top: 'hoodie', topColor: 7, hat: 'cap', hatColor: 11, skin: 6 }, wander: 4, emotes: ['dance'] }),
  npc('stadt', 'apotheker', 'Apothekerin Ada', '💊', 'Apotheke', sa(20, -10).x, sa(20, -10).z, ['Gesundheit!', 'Brauchst du etwas für den Wald?'], ['Heiltränke sind im Verbotenen Wald Gold wert.'], { look: { hair: 'bob', hairColor: 0, top: 'jacke', topColor: 9, glasses: 'rund' }, wander: 0, shop: 'apotheke', night: 'stay' }),
  npc('stadt', 'florian', 'Florist Florian', '💐', 'Blumenladen', sa(32, 10).x, sa(32, 10).z, ['Blumen für jemanden Besonderen?', 'Hallo!'], ['Ein Strauß macht jede Freundschaft stärker.'], { look: { hair: 'strubbel', hairColor: 2, top: 'latz', topColor: 9, bottomColor: 3 }, wander: 0, shop: 'blumen', night: 'stay' }),
  npc('stadt', 'kleo', 'Modedesignerin Kleo', '👗', 'Kleiderladen', sa(32, -10).x, sa(32, -10).z, ['Darling, du siehst fabelhaft aus!', 'Hallo!'], ['Ein Hut verändert alles.'], { look: { hair: 'lang', hairColor: 10, top: 'kleid', topColor: 7, glasses: 'sonne' }, wander: 0, shop: 'kleider', night: 'stay' })
];
export const STADT_QUESTS: QuestDef[] = [
  { id: 'w_stadt', title: 'Die stehende Uhr', icon: '🕰️', world: 'stadt', kind: 'world', giver: 'otto',
    summary: 'Der Uhrturm ist stehen geblieben – und die Stadt hat vergessen, wann das große Brunnenfest beginnt.',
    offer: { start: { t: 'Die Uhr steht! Und ohne sie weiß niemand mehr, wann das Brunnenfest beginnt. Ich kann sie stellen – aber ich hab die Uhrzeit vergessen! Fragst du die Leute?', choices: [{ t: '🕰️ Ich finde es heraus!', do: [{ start: 'w_stadt' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Frag Bäckerin Berta, Bibliothekar Bruno und Musiker Moritz, wann das Brunnenfest beginnt.', hints: ['Berta ist in der Bäckerei, Bruno in der Bücherei, Moritz spielt am Brunnen.', 'Jeder erinnert sich an einen Teil: Kuchen, Buch, Lied.', 'Sprich alle drei an.'],
        objectives: [{ id: 'b', type: 'talk', target: 'berta', label: 'Frag Berta' }, { id: 'r', type: 'talk', target: 'bruno', label: 'Frag Bruno' }, { id: 'm', type: 'talk', target: 'moritz', label: 'Frag Moritz' }],
        dialog: {
          berta: { start: { t: 'Das Brunnenfest? Ich weiß nur noch: Der Kuchen kam nach dem Mittagessen aus dem Ofen. Nicht direkt danach – ein bisschen später.', end: false } },
          bruno: { start: { t: 'Im Festbuch steht: „Wenn der kleine Zeiger auf das Ohr der Uhr zeigt …“ Das rechte Ohr! Also ganz nach rechts.', end: false } },
          moritz: { start: { t: 'Mein Fest-Lied hat drei Strophen – eine für jede Stunde nach dem Mittag! Dann geht’s los!', emote: 'dance', end: false } }
        } },
      { text: 'Stell das Uhrwerk am Fuß des Uhrturms auf die richtige Zeit.', hints: ['Nach dem Mittag, kleiner Zeiger ganz rechts, drei Strophen.', 'Mittag ist 12 Uhr. Drei Stunden später …', 'Wähle 3 Uhr am Uhrwerk.'],
        objectives: [{ id: 'u', type: 'flag', target: 'uhr_gestellt', label: 'Stell die Uhr richtig' }, { id: 's', type: 'have', target: 'splitter', label: 'Heb den Kompass-Splitter auf' }] },
      { text: 'Erzähl Otto, dass die Uhr wieder läuft.', hints: ['Otto steht neben dem Uhrturm.', 'Am Brunnenplatz.', 'Sprich mit Otto.'],
        objectives: [{ id: 'o', type: 'talk', target: 'otto', label: 'Sprich mit Otto' }],
        dialog: { otto: { start: { t: 'Sie tickt! Sie TICKT! Und schau – alle erinnern sich wieder an ihre Pläne. Danke! Und diesen leuchtenden Splitter … den bringst du am besten Lasse, ja?', do: [{ friend: 3 }], end: false } } } }
    ],
    rewards: { stars: 20, xp: 80, flag: 'done_stadt', text: 'Die Stadt tickt wieder – Zeit für das Brunnenfest!' } },
  { id: 's_stadt_brief', title: 'Ein Strauß für Bruno', icon: '💐', world: 'stadt', kind: 'side', giver: 'moritz',
    summary: 'Moritz traut sich nicht, Bruno zu sagen, dass er ihn mag. Ein Blumenstrauß könnte helfen.',
    offer: { start: { t: 'Psst … Bruno aus der Bücherei ist mein bester Freund, aber er ist seit dem Sturm so still. Bringst du ihm einen Blumenstrauß von mir? Florian verkauft welche.', choices: [{ t: '💐 Klar!', do: [{ start: 's_stadt_brief' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Kauf im Blumenladen einen Blumenstrauß.', hints: ['Der Blumenladen ist in der Einkaufsstraße.', 'Florian verkauft Sträuße für 6 ⭐.', 'Sprich mit Florian und kauf einen Strauß.'], objectives: [{ id: 'b', type: 'have', target: 'blume', label: 'Besorge einen Blumenstrauß' }] },
      { text: 'Bring den Strauß zu Bruno.', hints: ['Bruno ist in der Bücherei.', 'Gegenüber vom Blumenladen.', 'Sprich mit Bruno.'], objectives: [{ id: 't', type: 'talk', target: 'bruno', label: 'Gib Bruno den Strauß' }],
        dialog: { bruno: { start: { t: 'Von Moritz? Für mich? … Oh. Das ist das Schönste, was mir seit dem Sturm passiert ist. Sag ihm, ich komme heute Abend zum Brunnen!', do: [{ take: ['blume', 1] }, { friend: 3 }], end: false } } } }
    ],
    rewards: { stars: 10, xp: 40, text: 'Zwei Freunde haben sich wieder.' } }
];

/* =====================================================================  FELLRETTER-BUCHT  */
const F = ISLES.fellretter, fa = (dx: number, dz: number) => at('fellretter', dx, dz);
const WELPEN = [[30, 18, 'Wuschel', 'unter den Palmen'], [-28, 24, 'Kringel', 'am Leuchtturm'], [12, -30, 'Tapsi', 'hinter der Bellwarte'], [-34, -14, 'Fleckchen', 'im Café-Garten']] as const;
export const fellretter: WorldDef = {
  id: 'fellretter', name: 'Fellretter-Bucht', icon: '🐶', chapter: 2, theme: 'fellretter',
  desc: 'Die Bellwarte der Rettungshunde, die goldene Statue von Jannis & Blitz und die sonnige Bucht.',
  shape: isle('fellretter', { height: 1.1, grass: 0x7fd65a, grass2: 0x6cc84e, beach: 12, bumps: 0.6, flats: [{ x: F.x, z: F.z, r: 22, y: 1.1 }],
    paths: [pathTo('fellretter', 0, 0, 6, 0xe8d3a3), pathTo('fellretter', 62, 478, 5, 0xe8d3a3)], paints: [{ x: F.x, z: F.z, r: 20, color: 0xf2e6c8 }, { x: F.x, z: F.z, r: 20, color: 0x3f8cff, ring: 1 }] }),
  spawn: spawnFrom('fellretter', 'hub'),
  pois: { plaza: { ...fa(0, 0), name: 'Fellretter-Platz', icon: '🐾' }, bellwarte: { ...fa(4, -22), name: 'Bellwarte', icon: '🗼' }, statue: { ...fa(0, 6), name: 'Statue Jannis & Blitz', icon: '🏆' }, bucht: { ...fa(-24, 24), name: 'Sonnenbucht', icon: '🏖️' } },
  vehicles: [{ type: 'fellnasenmobil', ...fa(-8, -12), yaw: 0 }, { type: 'krankenwagen', ...fa(12, -12), yaw: 0 }],
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    statue(ctx, F.x - 1.5, F.z + 6, 0, 0xffc83d, 1.8, 'held'); statue(ctx, F.x + 1.8, F.z + 6.5, 0, 0xffc83d, 1.4, 'hund');
    floatLabel(ctx, F.x, ctx.h(F.x, F.z) + 7, F.z + 6, 'Jannis & Blitz – die ersten Fellretter', '🏆', 0.6);
    // Bellwarte mit sieben Toren
    const bw = fa(4, -26), y = ctx.h(bw.x, bw.z);
    b.box(bw.x, y, bw.z, 30, 6, 10, 0xffffff); b.box(bw.x, y + 6, bw.z, 31, 0.6, 11, 0x3f8cff);
    ctx.box(bw.x, bw.z, 30, 10, y - 1, y + 6.6);
    [0xe8453c, 0xff8a1f, 0xffd23f, 0x3f8cff, 0x4cd07d, 0xb36bff, 0xff6fb5].forEach((c, i) => b.box(bw.x - 12.8 + i * 4.27, y, bw.z + 5.05, 3.4, 4, 0.1, c));
    tower(ctx, bw.x + 18, bw.z, 2.6, 14, 0xffffff, 0x3f8cff);
    floatLabel(ctx, bw.x, y + 9, bw.z, 'Bellwarte', '🐾', 1.1);
    // Sonnenbucht
    house(ctx, { ...fa(-34, -14), rot: 1.2, w: 9, d: 8, wall: 0xffe3d6, roof: 0xe8453c, enter: true, name: 'Café Pfote', icon: '☕' });
    house(ctx, { ...fa(-30, 8), rot: 1.6, w: 10, d: 8, wall: 0xfff1d6, roof: 0x2fb9a8, enter: true, name: 'Rathaus', icon: '🏛️' });
    tower(ctx, fa(-30, 30).x, fa(-30, 30).z, 2.2, 12, 0xffffff, 0xe8453c, 0xe8453c);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; const p = fa(Math.cos(a) * 42, Math.sin(a) * 42); if (Math.hypot(p.x - spawnFrom('fellretter', 'hub').x, p.z - spawnFrom('fellretter', 'hub').z) > 12) ctx.tree('palme', p.x, p.z, 1 + (i % 3) * 0.1); }
    for (let i = 0; i < 5; i++) { const p = fa(18 + i * 4, 30 - i * 2), yy = ctx.h(p.x, p.z); b.cyl(p.x, yy, p.z, 0.05, 0.05, 2.3, 0xffffff, 6); b.cone(p.x, yy + 2.1, p.z, 1.5, 0.6, [0xff6fb5, 0xffd23f, 0x3f8cff][i % 3], 8); }
    arcade(ctx, 'sprint', fa(14, 0).x, fa(14, 0).z, -Math.PI / 2, 'fellretter_sprint', 'Fellretter-Sprint', '🐕', 0x3f8cff);
    // Welpen (nur sichtbar, solange die Suche läuft) + Spürnase-Ziel
    WELPEN.forEach(([dx, dz, nm], i) => {
      const p = fa(dx, dz), yy = ctx.h(p.x, p.z), flag = 'welpe_' + i;
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex('🐶'), transparent: true })); (spr.material as THREE.Material).userData.disposeWithWorld = true;
      spr.scale.setScalar(1.1); spr.position.set(p.x, yy + 0.6, p.z); ctx.add(spr);
      const show = () => api.questStage('w_fellretter') === 1 && !api.flag(flag);
      ctx.onUpdate((_d, t) => { spr.visible = show(); spr.position.y = yy + 0.6 + Math.abs(Math.sin(t * 5 + i)) * 0.25; });
      spot(ctx, 'welpe' + i, p.x, p.z, '🐶', 'Welpe ' + nm + ' auf den Arm nehmen', () => { api.setFlag(flag); api.sfx('bark'); api.burst(p.x, yy + 1, p.z, [0xffd23f, 0xffffff], 16); api.toast(nm + ' ist gerettet! Er hat graue Wolkenwatte im Fell …', '🐶', 3200); }, { when: show, priority: 2 });
    });
    ctx.onUpdate(() => {
      const g = api as unknown as { system<T>(id: string): T | undefined };
      const c = g.system<{ scentTarget: { x: number; z: number } | null }>('companions');
      if (!c) return;
      if (api.questStage('w_fellretter') === 1 && api.flag('spuernase_an')) {
        const pp = api.playerPos();
        let best: { x: number; z: number } | null = null, bd = Infinity;
        WELPEN.forEach(([dx, dz], i) => { if (api.flag('welpe_' + i)) return; const p = fa(dx, dz); const d = Math.hypot(p.x - pp.x, p.z - pp.z); if (d < bd) { bd = d; best = p; } });
        c.scentTarget = best;
      } else if (c.scentTarget && api.questStage('w_fellretter') !== 1) c.scentTarget = null;
    });
    pickup(ctx, 'fr_splitter', bw.x, bw.z + 8, 'splitter', { when: () => api.questStage('w_fellretter') >= 2, label: 'Kompass-Splitter aus dem Welpenkorb nehmen' });
    chest(ctx, 'fr_bucht', fa(-40, 20).x, fa(-40, 20).z, 1, { stars: 8, item: ['muschel', 2] });
  }
};
export const FELLRETTER_NPCS: NpcDef[] = [
  npc('fellretter', 'pia_hund', 'Kapitänin Pia', '🐕‍🦺', 'Pilotin der Fellretter', fa(0, -16).x, fa(0, -16).z, ['Wuff! Ich meine: Hallo!', 'Fellretter sind immer bereit!'], ['Wir sind sieben Hunde mit sieben Fahrzeugen. Und Blitz ist unser Vorbild!', 'Kein Einsatz ist zu klein, keine Pfote zu müde!'], { creature: { kind: 'hund', color: 0xe8b04a, color2: 0xffffff, hat: 0xe8453c }, wander: 3, likes: ['apfel'], sound: 'bark' }),
  npc('fellretter', 'brumm', 'Brumm', '🐕', 'Bau-Hund', fa(-12, -16).x, fa(-12, -16).z, ['Wuff! Baustelle!', 'Hallo!'], ['Ich kann alles reparieren. Außer Langeweile.'], { creature: { kind: 'hund', color: 0x9a7a5a, color2: 0xe8dcc8, hat: 0xffd23f }, wander: 3, sound: 'bark' }),
  npc('fellretter', 'welle', 'Welle', '🐕', 'Wasser-Retterin', fa(-20, 20).x, fa(-20, 20).z, ['Spritz! Hallo!', 'Schon schwimmen gewesen?'], ['Im Meer helfe ich allen, die nicht mehr schwimmen können.'], { creature: { kind: 'hund', color: 0x8a5a2a, color2: 0xffffff, hat: 0x2fb9a8 }, wander: 6, sound: 'bark' }),
  npc('fellretter', 'bommel', 'Bürgermeister Bommel', '🎩', 'Sonnenbucht', fa(-26, 6).x, fa(-26, 6).z, ['Willkommen in der Sonnenbucht!', 'Hallo, hallo!'], ['Die Statue hat Jannis und Blitz zu Ehren gebaut. Damals haben sie das ganze Dorf vor einem Sturm gewarnt.'], { look: { hair: 'glatze', beard: 'schnurr', top: 'jacke', topColor: 11, hat: 'cowboy', hatColor: 11, age: 2 } })
];
export const FELLRETTER_QUESTS: QuestDef[] = [
  { id: 'w_fellretter', title: 'Wo sind die Welpen?', icon: '🐶', world: 'fellretter', kind: 'world', giver: 'pia_hund',
    summary: 'Vier Welpen sind in der Sturmnacht einem grauen Wölkchen hinterhergelaufen.',
    offer: { start: { t: 'Wuff – Notfall! Vier unserer Welpen sind weg! Sie sind einem grauen Wölkchen nachgerannt. Blitz kann helfen – ich zeige ihm, wie man eine Duftspur liest!', choices: [{ t: '🐾 Wir finden sie!', do: [{ start: 'w_fellretter' }] }, { t: 'Gleich!' }] } },
    stages: [
      { text: 'Lass Pia Blitz die Spürnase beibringen.', hints: ['Sprich nochmal mit Pia.', 'Sie steht vor der Bellwarte.', 'Pia ansprechen.'], objectives: [{ id: 'p', type: 'talk', target: 'pia_hund', label: 'Sprich mit Pia' }],
        dialog: { pia_hund: { start: { t: 'So, Blitz: Nase runter, schnüffel-schnüffel … Siehst du die goldene Spur? Folge Blitz – er führt dich zum nächsten Welpen!', do: [{ ability: 'spuernase' }, { flag: 'spuernase_an' }], end: false } } } },
      { text: 'Folge Blitz’ goldener Duftspur und finde alle vier Welpen.', hints: ['Blitz läuft voraus und hinterlässt goldenen Glitzer.', 'Ein Welpe ist unter Palmen, einer am Leuchtturm, einer hinter der Bellwarte, einer im Café-Garten.', 'Drück bei jedem Welpen die Aktionstaste.'],
        objectives: [0, 1, 2, 3].map(i => ({ id: 'w' + i, type: 'interact' as const, target: 'welpe' + i, label: 'Welpe ' + WELPEN[i][2] + ' (' + WELPEN[i][3] + ')' })) },
      { text: 'Bring die Welpen zur Bellwarte – im Welpenkorb liegt etwas Leuchtendes.', hints: ['Die Bellwarte ist das große weiße Gebäude mit den bunten Toren.', 'Vor den Toren steht der Korb.', 'Heb den Splitter auf und sprich mit Pia.'],
        objectives: [{ id: 's', type: 'have', target: 'splitter', label: 'Nimm den Splitter aus dem Korb' }, { id: 'p', type: 'talk', target: 'pia_hund', label: 'Sprich mit Pia' }],
        dialog: { pia_hund: { start: { t: 'Alle vier! Du bist eine echte Fellretterin, ein echter Fellretter! Und die Welpen sagen, das Wölkchen wollte nur spielen. Es war ganz traurig, als sie weggelaufen sind.', do: [{ friend: 4 }, { achieve: 'fellretter' }], end: false } } } }
    ],
    rewards: { stars: 25, xp: 100, flag: 'done_fellretter', text: 'Alle Welpen sind zurück in der Bellwarte!' } }
];

/* =====================================================================  DRACHENHÖHEN  */
const D = ISLES.drachen, da = (dx: number, dz: number) => at('drachen', dx, dz);
const FACKELN = [[-14, -10, 0xff6b5b, '🔥', 'Rote Fackel'], [-6, -20, 0xffa21f, '🔥', 'Orange Fackel'], [6, -20, 0xffd23f, '🔥', 'Gelbe Fackel'], [14, -10, 0x4cd07d, '🔥', 'Grüne Fackel'], [8, 4, 0x3fa9ff, '🔥', 'Blaue Fackel'], [-8, 4, 0xb36bff, '🔥', 'Violette Fackel']] as const;
export const drachen: WorldDef = {
  id: 'drachen', name: 'Drachenhöhen', icon: '🐉', chapter: 3, theme: 'drachen',
  desc: 'Kristallberge, ein Nest mit Drachen-Eiern und der kleine Drache Zündel.',
  shape: isle('drachen', { height: 1.6, grass: 0x8fcf6a, grass2: 0x7ab85a, rock: 0x8a7f9a, beach: 8, bumps: 2.2,
    hills: [{ ...da(-26, -26), r: 20, h: 14 }, { ...da(28, -18), r: 16, h: 10 }, { ...da(-30, 22), r: 12, h: 6 }],
    flats: [{ x: D.x, z: D.z, r: 18, y: 1.6 }, { ...da(0, -14), r: 14, y: 1.6 }], paths: [pathTo('drachen', 0, 0, 6, 0xc9b48a)], paints: [{ x: D.x, z: D.z, r: 16, color: 0xd9c9a8 }] }),
  spawn: spawnFrom('drachen', 'hub'),
  pois: { plaza: { ...da(0, 0), name: 'Drachenplatz', icon: '🐉' }, tor: { ...da(0, -26), name: 'Himmelstor', icon: '⛩️' }, hoehle: { ...da(28, 14), name: 'Drachenhöhle', icon: '🕳️' }, gipfel: { ...da(-26, -26), name: 'Kristallgipfel', icon: '💎' } },
  vehicles: [{ type: 'drache', ...da(-24, 8), yaw: 1 }],
  groundCover: { grass: 0.8, flowers: [0xb36bff, 0x7fd8ff, 0xffd23f] },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    statue(ctx, D.x, D.z, Math.PI, 0x4cbf55, 2.2, 'drache');
    for (let i = 0; i < 22; i++) { const a = i * 0.29, r = 30 + (i % 4) * 6; const p = da(Math.cos(a) * r, Math.sin(a) * r); ctx.tree(i % 3 ? 'kristall' : 'tanne', p.x, p.z, 0.9 + (i % 3) * 0.2); }
    for (let i = 0; i < 10; i++) rock(ctx, da(Math.cos(i) * 40, Math.sin(i * 1.7) * 40).x, da(Math.cos(i) * 40, Math.sin(i * 1.7) * 40).z, 1 + (i % 3) * 0.5, 0x8a7f9a);
    // Himmelstor
    const tor = da(0, -28); arch(ctx, tor.x, tor.z, 0, 8, 7, 0xb36bff, 0xffd23f);
    const veil = new THREE.Mesh(new THREE.PlaneGeometry(8, 6.5), new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    (veil.material as THREE.Material).userData.disposeWithWorld = true; veil.position.set(tor.x, ctx.h(tor.x, tor.z) + 3.5, tor.z); ctx.add(veil);
    ctx.onUpdate((_d, t) => { veil.visible = !!api.flag('puzzle_fackeln'); (veil.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(t * 3) * 0.15; });
    spot(ctx, 'himmelstor', tor.x, tor.z + 1.5, '⛩️', () => api.flag('puzzle_fackeln') ? 'Durch das Himmelstor fliegen (Drachenflug)' : 'Das Himmelstor ist geschlossen', () => {
      if (!api.flag('puzzle_fackeln')) { api.toast('Das Tor schläft. Vielleicht wecken es die sechs Fackeln?', '⛩️'); return; }
      api.startMinigame('drachenflug');
    }, { r: 3.5, priority: 2 });
    // Wandbilder als Hinweis: Regenbogen-Reihenfolge
    sequencePuzzle(ctx, 'fackeln', FACKELN.map(([dx, dz, c, ic, nm]) => ({ ...da(dx, dz - 12), color: c, icon: ic, name: nm })), [0, 1, 2, 3, 4, 5],
      () => { api.toast('Alle sechs Fackeln brennen in den Farben des Regenbogens – das Himmelstor öffnet sich!', '⛩️', 4000); api.burst(tor.x, ctx.h(tor.x, tor.z) + 4, tor.z, [0xff6b5b, 0xffd23f, 0x4cd07d, 0x3fa9ff, 0xb36bff], 50); },
      { style: 'torch', clue: 'Die alten Wandbilder zeigen einen Drachen, der durch einen Regenbogen fliegt: zuerst Rot wie Glut, dann Orange, Gelb wie die Sonne, Grün wie die Wiese, Blau wie der Himmel und zuletzt Violett wie die Nacht.', clueAt: da(-4, 10) });
    // Drachenhöhle mit Nest
    const hh = house(ctx, { ...da(28, 16), rot: -1.9, w: 12, d: 10, h: 5, wall: 0x8a7f9a, roof: 0x6a5f7a, enter: true, name: 'Drachenhöhle', icon: '🕳️', roofType: 'dome', windows: false, floor: 0x9a8a7a });
    const nest = hh.f.at(0, -2); b.cyl(nest.x, hh.y, nest.z, 1.8, 2.0, 0.6, 0x8a6a3a, 14);
    for (let i = 0; i < 3; i++) b.sph(nest.x + (i - 1) * 0.8, hh.y + 0.85, nest.z, 0.45, [0x7fd8ff, 0xff9ad0, 0xfff07a][i], { sy: 1.3 });
    for (let i = 0; i < 6; i++) ctx.glow.cone(nest.x + Math.cos(i) * 4, hh.y, nest.z + Math.sin(i) * 3.5, 0.3, 1.2, 0x9fe8ff, 5);
    spot(ctx, 'dracheneier', nest.x, nest.z + 2, '🥚', 'Dracheneier streicheln', () => { if (api.collectOnce('eier_gestreichelt')) api.addStars(2); api.toast('Die Eier wackeln vergnügt!', '🥚'); });
    // Funkelsteine
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; pickup(ctx, 'funkel' + i, da(Math.cos(a) * 26, Math.sin(a) * 26).x, da(Math.cos(a) * 26, Math.sin(a) * 26).z, 'funkelstein'); }
    pickup(ctx, 'gipfel_splitter', da(-26, -26).x, da(-26, -26).z, 'kristall', { label: 'Kristall vom Gipfel nehmen' });
    pickup(ctx, 'dr_splitter', tor.x, tor.z - 3, 'splitter', { when: () => api.questStage('w_drachen') >= 2, label: 'Kompass-Splitter hinter dem Himmelstor' });
  }
};
export const DRACHEN_NPCS: NpcDef[] = [
  npc('drachen', 'zuendel', 'Zündel', '🐲', 'Kleiner Drache', da(4, 6).x, da(4, 6).z, ['Rawr! Ups – hallo!', 'Huch, du hast mich erschreckt! Hihi.'], ['Ich kann schon ein kleines bisschen Feuer spucken. Puff!', 'Nachts hab ich ein Wölkchen weinen hören. Ganz leise.', 'Die großen Drachen sagen, ich bin zu klein für das Himmelstor. Pfff!'], { creature: { kind: 'babydrache', color: 0x4cbf55, color2: 0xfff1c0, scale: 1.3 }, wander: 4, likes: ['apfel', 'kuchen'] }),
  npc('drachen', 'flora', 'Höhlenforscherin Flora', '🔦', 'Drachenhöhle', da(24, 10).x, da(24, 10).z, ['Hallo! Vorsicht, Kristalle sind spitz.', 'Willkommen in den Drachenhöhen!'], ['Funkelsteine sind die Lieblingsschätze der Drachen.', 'Ich erforsche die Höhlen seit 20 Jahren und finde jeden Tag Neues.'], { look: { hair: 'zopf', hairColor: 2, top: 'jacke', topColor: 13, hat: 'helm', hatColor: 2, skin: 3 }, wander: 3, likes: ['funkelstein', 'kristall'] })
];
export const DRACHEN_QUESTS: QuestDef[] = [
  { id: 'w_drachen', title: 'Das Feuer der Drachen', icon: '🐉', world: 'drachen', kind: 'world', giver: 'zuendel',
    summary: 'Seit dem Sturm sind die Fackeln aus und das Himmelstor schläft. Zündel will beweisen, dass er nicht zu klein ist.',
    offer: { start: { t: 'Alle Fackeln sind aus und das Himmelstor ist zu! Die Großen sagen, ich bin zu klein, um sie anzuzünden. Hilfst du mir? Gemeinsam schaffen wir das!', choices: [{ t: '🔥 Gemeinsam!', do: [{ start: 'w_drachen' }, { companion: 'zuendel' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Lies das Wandbild und entzünde die sechs Fackeln in der richtigen Reihenfolge.', hints: ['Die Hinweis-Tafel steht südlich vom Drachenplatz.', 'Die Reihenfolge sind die Farben des Regenbogens.', 'Rot, Orange, Gelb, Grün, Blau, Violett.'], objectives: [{ id: 'f', type: 'flag', target: 'puzzle_fackeln', label: 'Entzünde die sechs Fackeln' }] },
      { text: 'Flieg durch das Himmelstor (Drachenflug gewinnen).', hints: ['Das Tor steht nördlich vom Platz.', 'Halten = steigen. Durch die goldenen Ringe!', 'Weiche den Gewitterwolken aus.'], objectives: [{ id: 'm', type: 'minigame', target: 'drachenflug', label: 'Gewinne den Drachenflug' }] },
      { text: 'Hinter dem Himmelstor glitzert etwas. Heb es auf und erzähl Flora davon.', hints: ['Direkt hinter dem Tor.', 'Flora ist bei der Drachenhöhle.', 'Splitter nehmen, dann mit Flora sprechen.'],
        objectives: [{ id: 's', type: 'have', target: 'splitter', label: 'Nimm den Splitter' }, { id: 'f', type: 'talk', target: 'flora', label: 'Sprich mit Flora' }],
        dialog: { flora: { start: { t: 'Das Himmelstor ist wieder offen! Weißt du was? Wer durch das Tor geflogen ist, bekommt die Drachenflügel. In der Luft Springen gedrückt halten – und gleiten!', do: [{ ability: 'gleiten' }, { cosmetic: 'acc:drachenfluegel' }, { achieve: 'drachen_freund' }, { friend: 3 }], end: false } } } }
    ],
    rewards: { stars: 25, xp: 110, flag: 'done_drachen', cosmetic: 'hat:drachenhelm', text: 'Die Fackeln brennen, das Himmelstor ist offen – und du kannst gleiten!' } }
];

/* =====================================================================  DAMPFER-HAFEN  */
const DM = ISLES.dampfer, dma = (dx: number, dz: number) => at('dampfer', dx, dz);
const gray = (c: number) => { const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255, l = Math.round(r * 0.3 + g * 0.59 + b * 0.11); return (l << 16) | (l << 8) | l; };
export const dampfer: WorldDef = {
  id: 'dampfer', name: 'Dampfer-Hafen', icon: '🎬', chapter: 3, theme: 'dampfer',
  desc: 'Eine Welt wie ein Zeichentrickfilm der 1920er – in Schwarz-Weiß. Bis die Farbe zurückkehrt …',
  shape: isle('dampfer', { height: 1.2, grass: 0x9a9a9a, grass2: 0x8a8a8a, sand: 0xc8c8c8, beach: 6, bumps: 0.3, flats: [{ x: DM.x, z: DM.z, r: 40, y: 1.2 }],
    paths: [pathTo('dampfer', 0, -330, 6, 0xb0b0b0)],
    colorFn: (x, z, y) => { if (y < 0.7) return null; const dx = x - DM.x, dz = z - DM.z; if (Math.hypot(dx, dz) < 22) return (Math.floor(dx / 3) + Math.floor(dz / 3)) % 2 ? 0x222222 : 0xeeeeee; return null; } }),
  spawn: spawnFrom('dampfer', 'stadt'),
  pois: { plaza: { ...dma(0, 0), name: 'Schachbrett-Plaza', icon: '♟️' }, dampfer: { ...dma(30, 20), name: 'Dampfer Brummel', icon: '🚢' }, pavillon: { ...dma(-22, -8), name: 'Orchester-Pavillon', icon: '🎺' }, kran: { ...dma(20, -24), name: 'Hafen-Kran', icon: '🏗️' } },
  build: (ctx: WorldCtx) => {
    const { api } = ctx;
    const color = !!api.flag('dampfer_farbe');
    const C = (c: number) => color ? c : gray(c);
    const b = ctx.b;
    statue(ctx, DM.x, DM.z, 0, C(0x333333), 2, 'maus');
    floatLabel(ctx, DM.x, ctx.h(DM.x, DM.z) + 7, DM.z, color ? 'Dampfer-Hafen – jetzt in Farbe!' : 'Dampfer-Hafen', '🎬', 0.9);
    arch(ctx, dma(-6, 36).x, dma(-6, 36).z, 0.3, 7, 5, C(0x222222), C(0xeeeeee));
    // Dampfer Brummel
    const ds = dma(36, 22), y0 = 0.2, rot = 0.4, f = frame(ds.x, ds.z, rot);
    b.rbox(ds.x, y0 - 1, ds.z, 7, 3.2, 18, C(0xe8453c), { ry: rot }); b.box(ds.x, y0 + 2.2, ds.z, 6.4, 0.2, 17, C(0xc9a26b), { ry: rot });
    b.box(f.at(0, -2).x, y0 + 2.4, f.at(0, -2).z, 4.5, 3, 7, C(0xffffff), { ry: rot });
    for (const k of [-1, 1]) { const p = f.at(0, -2 + k * 2); b.cyl(p.x, y0 + 5.4, p.z, 0.7, 0.8, 4, C(0x222222), 12); b.cyl(p.x, y0 + 9.2, p.z, 0.85, 0.85, 0.4, C(0xe8453c), 12); }
    const wheel = f.at(3.8, 2); b.cyl(wheel.x, y0, wheel.z, 2.6, 2.6, 0.6, C(0x8a5a33), 16, { rz: Math.PI / 2, ry: rot });
    ctx.box(ds.x, ds.z, 7, 18, -2, y0 + 2.4, rot);
    ctx.ramp(f.at(-5, 0).x, f.at(-5, 0).z, 2, 5, 1.2, y0 + 2.4, rot + Math.PI / 2);
    // Pavillon
    const pv = dma(-22, -8), py = ctx.h(pv.x, pv.z); b.cyl(pv.x, py, pv.z, 6, 6.3, 0.5, C(0xeeeeee), 16); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.cyl(pv.x + Math.cos(a) * 5.5, py + 0.5, pv.z + Math.sin(a) * 5.5, 0.2, 0.2, 3.5, C(0xffffff), 6); } b.cone(pv.x, py + 4, pv.z, 6.8, 2.8, C(0x3f8cff), 16);
    ctx.circle(pv.x, pv.z, 6.3, py - 1, py + 0.5);
    arcade(ctx, 'orchester', pv.x, pv.z + 8, Math.PI, 'orchester', 'Dampfer-Orchester', '🎺', C(0xffd23f));
    // Kran
    const kr = dma(20, -24), ky = ctx.h(kr.x, kr.z); b.box(kr.x, ky, kr.z, 1.6, 14, 1.6, C(0xffd23f)); b.box(kr.x + 5, ky + 14, kr.z, 12, 1, 1, C(0xffd23f)); for (let i = 0; i < 4; i++) b.rbox(kr.x + 6 + (i % 2) * 2.2, ky, kr.z + 3 + Math.floor(i / 2) * 2.2, 2, 2, 2, C([0xe8453c, 0x3f8cff, 0x4cd07d, 0xff8a1f][i]));
    ctx.box(kr.x, kr.z, 1.6, 1.6, ky, ky + 14);
    arcade(ctx, 'kran', kr.x - 4, kr.z + 3, Math.PI / 2, 'hafenkran', 'Hafen-Kran', '🏗️', C(0x8a5bff));
    // Häuser
    for (const [dx, dz, r] of [[-30, 14, 1.6], [-26, 28, 2.2], [10, -34, 0], [-6, -36, 0]] as const) house(ctx, { ...dma(dx, dz), rot: r, w: 8, d: 7, wall: C(0xfff1d6), roof: C(0x8a5a33), enter: true });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.2; const p = dma(Math.cos(a) * 42, Math.sin(a) * 42); if (Math.hypot(p.x - ds.x, p.z - ds.z) > 14) ctx.tree('laub', p.x, p.z, 0.9); }
    for (let i = 0; i < 6; i++) lamp(ctx, dma(Math.cos(i) * 16, Math.sin(i) * 16).x, dma(Math.cos(i) * 16, Math.sin(i) * 16).z, color ? 0xfff2b0 : 0xffffff, 0x222222);
    // Farbeimer
    const EIMER = [[-36, 0], [24, 36], [-14, -30], [34, -8], [0, 40], [-40, -24]];
    EIMER.forEach(([dx, dz], i) => pickup(ctx, 'eimer' + i, dma(dx, dz).x, dma(dx, dz).z, 'farbeimer', { when: () => api.questStage('w_dampfer') >= 0 && !color }));
    pickup(ctx, 'dm_splitter', pv.x + 3, pv.z, 'splitter', { when: () => api.questStage('w_dampfer') >= 2, label: 'Kompass-Splitter im Notenständer' });
  }
};
export const DAMPFER_NPCS: NpcDef[] = [
  npc('dampfer', 'willi', 'Dampfer-Willi', '🐭', 'Hafenmaus', dma(4, 4).x, dma(4, 4).z, ['(Willi pfeift ein fröhliches Liedchen.)', '(Willi lüftet seinen Hut.) Hallo!'], ['(Ein Zwischentitel erscheint:) „Früher war hier alles bunt!“', '„Ohne Farbe ist mein Ragtime nur halb so lustig.“'], { look: { skin: 13, hair: 'glatze', top: 'tshirt', topColor: 11, bottom: 'shorts', bottomColor: 11, shoes: 'stiefel', shoeColor: 11, glasses: 'rund' }, wander: 3, emotes: ['dance'] }),
  npc('dampfer', 'klaus', 'Kapellmeister Klaus', '🎺', 'Orchester', dma(-20, -2).x, dma(-20, -2).z, ['Takt! Takt! Ah, ein Zuhörer!', 'Willkommen im Pavillon.'], ['Ein Orchester ohne Farbe ist wie Musik ohne Melodie.', 'Meine Musiker spielen auf Waschbrett, Tuba und Quietsch-Ente!'], { look: { hair: 'seite', hairColor: 5, beard: 'schnurr', top: 'jacke', topColor: 11, age: 2 }, wander: 2 })
];
export const DAMPFER_QUESTS: QuestDef[] = [
  { id: 'w_dampfer', title: 'Farbe für den Hafen', icon: '🎨', world: 'dampfer', kind: 'world', giver: 'willi',
    summary: 'Der Sturm hat die Farbe aus dem Dampfer-Hafen gewaschen. Sechs Farbeimer liegen verstreut herum.',
    offer: { start: { t: '(Zwischentitel:) „Der Sturm hat alle Farben weggespült! Sechs Eimer liegen irgendwo im Hafen. Bringst du sie mir?“', choices: [{ t: '🎨 Ich sammle sie!', do: [{ start: 'w_dampfer' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Sammle die sechs Farbeimer im Hafen.', hints: ['Die Eimer stehen am Rand des Hafens verteilt.', 'Einer beim Tor, einer beim Dampfer, einer beim Kran …', 'Lauf einmal rund um die Insel.'], objectives: [{ id: 'e', type: 'have', target: 'farbeimer', n: 6, label: 'Sammle Farbeimer' }] },
      { text: 'Bring die Eimer zu Willi.', hints: ['Willi steht neben seiner Statue.', 'Auf der Schachbrett-Plaza.', 'Sprich mit Willi.'], objectives: [{ id: 'w', type: 'talk', target: 'willi', label: 'Gib Willi die Farbeimer' }],
        dialog: { willi: { start: { t: '(Willi schwingt einen riesigen Pinsel – SPLASH! Rot, Gelb, Blau … der ganze Hafen leuchtet!) „DANKE!!!“', do: [{ take: ['farbeimer', 6] }, { flag: 'dampfer_farbe' }, { panel: 'reloadWorld', panelArg: 'dampfer' }, { burst: true }], end: false } } } },
      { text: 'Jetzt kann das Orchester wieder spielen! Spiel beim Dampfer-Orchester mit.', hints: ['Der Pavillon ist im Westen der Plaza.', 'Der Spielautomat steht vor dem Pavillon.', 'Triff mindestens 60 % der Noten.'],
        objectives: [{ id: 'o', type: 'minigame', target: 'orchester', label: 'Spiel beim Orchester mit' }, { id: 's', type: 'have', target: 'splitter', label: 'Nimm den Splitter aus dem Notenständer' }] }
    ],
    rewards: { stars: 25, xp: 110, flag: 'done_dampfer', text: 'Der Hafen ist wieder kunterbunt – und das Orchester spielt!' } }
];
