/* Welten-Gruppe 2: Regenbogenwelt, Freizeitpark, Fußball-Arena (Kap. 4), Märchenland, Schlüsselreich, Wunsch-Insel (Kap. 5). */
import type { WorldDef, WorldCtx } from '../registry.ts';
import type { NpcDef } from '../../gameplay/npc.ts';
import type { QuestDef } from '../../gameplay/quests.ts';
import { at, arcade, chest, isle, lever, npc, pathTo, pickup, sequencePuzzle, spawnFrom, spot } from '../kit.ts';
import { arch, floatLabel, fountain, frame, furniture, house, lamp, stall, statue, tower } from '../props.ts';
import { ISLES } from '../layout.ts';
import { GeoBuilder } from '../../engine/geo.ts';
import { mats } from '../../engine/materials.ts';

const RB = [0xe8453c, 0xff8a1f, 0xffd23f, 0x4cd07d, 0x3f8cff, 0x8a5bff];

/* =====================================================================  REGENBOGENWELT  */
const R = ISLES.regenbogen, ra = (dx: number, dz: number) => at('regenbogen', dx, dz);
const FOTO = [['brunnen', 0, 6, 'Freude-Brunnen', '⛲'], ['boegen', -18, -14, 'Regenbogen-Bögen', '🌈'], ['buehne', -22, 16, 'Regenbogen-Bühne', '🎤'], ['garten', 22, 10, 'Familiengarten', '🌻']] as const;
export const regenbogen: WorldDef = {
  id: 'regenbogen', name: 'Regenbogenwelt', icon: '🌈', chapter: 4, theme: 'regenbogen',
  desc: 'Bunte Familien, eine Bühne, die Parade und das Motto: Jeder ist richtig, wie er ist.',
  shape: isle('regenbogen', { height: 1.1, grass: 0x8fe06a, grass2: 0x7fd65a, beach: 8, bumps: 0.5, flats: [{ x: R.x, z: R.z, r: 24, y: 1.1 }],
    paths: [pathTo('regenbogen', 0, 0, 6, 0xffe6f2), pathTo('regenbogen', -525, 195, 5, 0xffe6f2)],
    paints: RB.map((c, i) => ({ x: R.x, z: R.z, r: 18 - i * 1.6, color: c, ring: 1.6 })) }),
  spawn: spawnFrom('regenbogen', 'hub'),
  pois: { plaza: { ...ra(0, 0), name: 'Regenbogen-Plaza', icon: '🌈' }, buehne: { ...ra(-22, 16), name: 'Regenbogen-Bühne', icon: '🎤' }, boegen: { ...ra(-18, -14), name: 'Regenbogen-Bögen', icon: '🌈' }, garten: { ...ra(22, 10), name: 'Familiengarten', icon: '🌻' } },
  groundCover: { grass: 1, flowers: RB },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    fountain(ctx, R.x, R.z, 4, 0xffffff, 0x9fe8ff);
    spot(ctx, 'freude', R.x, R.z + 5, '🌈', 'Freude teilen', () => { api.burst(R.x, ctx.h(R.x, R.z) + 4, R.z, RB, 50); api.toast(['Familien sind verschieden – und alle sind richtig!', 'Niemand wird ausgelacht. Hier gehört jede und jeder dazu.', 'Liebe ist Liebe! 💛'][Math.floor(Math.random() * 3)], '🌈', 3000); if (api.collectOnce('freude_' + new Date().toDateString())) api.addStars(1); });
    // Regenbogen-Bögen
    const bg = ra(-18, -14);
    for (let k = 0; k < 6; k++) b.torus(bg.x, ctx.h(bg.x, bg.z), bg.z, 7 - k * 0.55, 0.28, RB[k], { ry: 0.6 });
    // Bühne
    const bu = ra(-24, 18), by = ctx.h(bu.x, bu.z);
    b.box(bu.x, by, bu.z, 14, 1.2, 8, 0x5b4bd6, { ry: 0.9 }); ctx.box(bu.x, bu.z, 14, 8, by - 1, by + 1.2, 0.9);
    const f = frame(bu.x, bu.z, 0.9); for (const s of [-6.5, 6.5]) { const p = f.at(s, -3.5); b.cyl(p.x, by + 1.2, p.z, 0.25, 0.25, 6, 0x222222, 8); }
    const top = f.at(0, -3.5); b.box(top.x, by + 7, top.z, 14, 0.6, 0.6, 0x222222, { ry: 0.9 });
    RB.forEach((c, i) => { const p = f.at(-5 + i * 2, -3.5); ctx.glow.sph(p.x, by + 6.5, p.z, 0.4, c); });
    ctx.ramp(f.at(0, 5.5).x, f.at(0, 5.5).z, 4, 3, by, by + 1.2, 0.9 + Math.PI);
    arcade(ctx, 'disco', f.at(5, 7).x, f.at(5, 7).z, 0.9, 'disco', 'Regenbogen-Disco', '💃', 0xff5fb0);
    floatLabel(ctx, bu.x, by + 9, bu.z, 'Regenbogen-Bühne', '🎤', 1);
    // Bunte Häuser
    [[24, -14, -1.2], [30, 2, -1.6], [14, -26, -0.4], [-4, -30, 0], [8, 28, 3.2]].forEach(([dx, dz, r], i) => house(ctx, { ...ra(dx, dz), rot: r, w: 8, d: 7, wall: [0xffd6f0, 0xd6f0ff, 0xfff6c0, 0xd8f5c4, 0xf1e6ff][i], roof: RB[i], enter: true }));
    // Flaggen
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const p = ra(Math.cos(a) * 21, Math.sin(a) * 21), y = ctx.h(p.x, p.z); b.cyl(p.x, y, p.z, 0.06, 0.06, 4, 0xdddddd, 6); RB.forEach((c, k) => b.box(p.x + 0.8, y + 3.6 - k * 0.18, p.z, 1.5, 0.18, 0.04, c, { ry: -a })); }
    for (let i = 0; i < 14; i++) { const a = i * 0.45; const p = ra(Math.cos(a) * 38, Math.sin(a) * 38); ctx.tree('bunt', p.x, p.z, 0.9 + (i % 3) * 0.1); }
    // Foto-Orte
    FOTO.forEach(([id, dx, dz, nm, ic]) => spot(ctx, 'foto:' + id, ra(dx, dz).x, ra(dx, dz).z + (id === 'brunnen' ? -10 : 0), '📸', () => api.flag('foto_' + id) ? nm + ': Foto ✅' : 'Erinnerungsfoto machen: ' + nm, () => {
      if (!api.has('kamera')) { api.toast('Dafür brauchst du einen Fotoapparat – Lehrer Leo hat einen.', '📸'); return; }
      if (api.flag('foto_' + id)) return;
      api.setFlag('foto_' + id); api.sfx('click'); api.burst(api.playerPos().x, api.playerPos().y + 1.5, api.playerPos().z, [0xffffff], 20); api.toast('Klick! ' + nm + ' ist im Album.', ic);
      api.events.emit('photo', { subject: id });
    }, { when: () => api.questStage('w_regenbogen') >= 1 || api.has('kamera') }));
    pickup(ctx, 'rb_splitter', R.x - 3, R.z - 3, 'splitter', { when: () => api.questStage('w_regenbogen') >= 3, label: 'Kompass-Splitter im Brunnen' });
  }
};
export const REGENBOGEN_NPCS: NpcDef[] = [
  npc('regenbogen', 'leo_lehrer', 'Lehrer Leo', '👨‍🏫', 'Schule der Regenbogenwelt', ra(4, -8).x, ra(4, -8).z, ['Hallo! Schön, dass du da bist.', 'Willkommen in der Regenbogenwelt!'], ['Auslachen ist nie okay. Wenn jemand ausgelacht wird: Hilfe holen und dazu stehen!', 'Jede Familie ist anders – das macht die Welt so bunt.'], { look: { hair: 'kurz', hairColor: 4, beard: 'kinn', top: 'jacke', topColor: 3, glasses: 'rund', skin: 5, age: 2 }, likes: ['feder', 'blume'] }),
  npc('regenbogen', 'mama_ana', 'Mama Ana', '👩', 'Familie Sonnenschein', ra(20, 6).x, ra(20, 6).z, ['Hallo! Hm … kennen wir uns?', 'Oh, hallo!'], ['Wir sind zwei Mamas und zwei Kinder. Und ein sehr fauler Kater.', 'Ich hab das Gefühl, ich hab etwas Schönes vergessen …'], { look: { hair: 'locken', hairColor: 4, top: 'kleid', topColor: 4, skin: 6, age: 2 } }),
  npc('regenbogen', 'mama_lou', 'Mama Lou', '👩', 'Familie Sonnenschein', ra(23, 9).x, ra(23, 9).z, ['Huhu!', 'Willkommen in unserem Garten!'], ['Ana und ich haben uns beim Tanzen auf der Bühne kennengelernt. Glaube ich. Komisch, ich weiß es nicht mehr genau.'], { look: { hair: 'bob', hairColor: 11, top: 'hoodie', topColor: 7, age: 2 } }),
  npc('regenbogen', 'papa_tom', 'Papa Tom', '👨', 'Familie Wirbelwind', ra(-14, -10).x, ra(-14, -10).z, ['Hallo!', 'Na, auch hier zum Feiern?'], ['Mein Mann Ben und ich backen jeden Sonntag Waffeln. Waren es Waffeln? Oder Pfannkuchen?'], { look: { hair: 'seite', hairColor: 3, beard: 'voll', top: 'tshirt', topColor: 2, age: 2 } }),
  npc('regenbogen', 'papa_ben', 'Papa Ben', '👨', 'Familie Wirbelwind', ra(-12, -14).x, ra(-12, -14).z, ['Hey!', 'Moin!'], ['Unsere Tochter Sam will mal Astronautin werden. Oder Drachenforscherin. Oder beides!'], { look: { hair: 'kurz', hairColor: 5, top: 'jacke', topColor: 5, skin: 7, glasses: 'rund', age: 2 } }),
  npc('regenbogen', 'kay', 'Popstar Kay', '🎤', 'Regenbogen-Bühne', ra(-20, 14).x, ra(-20, 14).z, ['Hallo, Superstar!', 'Bereit für die Show?'], ['Auf der Bühne darf jeder so sein, wie er ist. Das ist das Schönste!', 'Mein Motto: Glitzer ist immer eine gute Idee.'], { look: { hair: 'strubbel', hairColor: 14, beard: 'kinn', top: 'jacke', topColor: 1, pattern: 'regenbogen', glasses: 'stern' }, emotes: ['dance', 'cheer'] })
];
export const REGENBOGEN_QUESTS: QuestDef[] = [
  { id: 'w_regenbogen', title: 'Das Erinnerungsalbum', icon: '📸', world: 'regenbogen', kind: 'world', giver: 'leo_lehrer',
    summary: 'Die Familien der Regenbogenwelt haben ihre schönsten gemeinsamen Momente vergessen. Ein Erinnerungsalbum könnte helfen.',
    offer: { start: { t: 'Seit dem Sturm erinnern sich die Familien nicht mehr an ihre schönsten Momente. Ich hab eine Idee: Wir machen ein Erinnerungsalbum! Fotos von den Orten, die ihnen wichtig sind.', choices: [{ t: '📸 Super Idee!', do: [{ start: 'w_regenbogen' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Hol dir bei Lehrer Leo den Fotoapparat.', hints: ['Sprich nochmal mit Leo.', 'Er steht nahe der Plaza.', 'Leo ansprechen.'], objectives: [{ id: 'l', type: 'talk', target: 'leo_lehrer', label: 'Sprich mit Leo' }],
        dialog: { leo_lehrer: { start: { t: 'Hier, mein alter Fotoapparat. Mach Fotos am Freude-Brunnen, an den Regenbogen-Bögen, an der Bühne und im Familiengarten!', do: [{ give: ['kamera', 1] }], end: false } } } },
      { text: 'Mach an vier besonderen Orten ein Foto.', hints: ['An jedem Ort erscheint „📸 Erinnerungsfoto“.', 'Brunnen (Plaza), Bögen (Nordwesten), Bühne (Südwesten), Garten (Osten).', 'Stell dich hin und drück die Aktionstaste.'],
        objectives: FOTO.map(([id, , , nm]) => ({ id, type: 'photo' as const, target: id, label: 'Foto: ' + nm })) },
      { text: 'Zeig das Album den Familien Sonnenschein und Wirbelwind.', hints: ['Mama Ana ist im Familiengarten, Papa Tom bei den Bögen.', 'Osten und Nordwesten.', 'Sprich mit Ana und Tom.'],
        objectives: [{ id: 'a', type: 'talk', target: 'mama_ana', label: 'Zeig Mama Ana das Album' }, { id: 't', type: 'talk', target: 'papa_tom', label: 'Zeig Papa Tom das Album' }],
        dialog: {
          mama_ana: { start: { t: 'Oh … der Brunnen! Hier hat Lou mir vor zehn Jahren einen Gänseblümchenkranz geschenkt! Lou, weißt du noch?! Ich erinnere mich wieder an ALLES! Danke!', emote: 'cheer', do: [{ friend: 3 }], end: false } },
          papa_tom: { start: { t: 'Die Bögen! Hier hat Sam ihre ersten Schritte gemacht – genau hier! Und es waren WAFFELN, Ben! Waffeln! Danke, danke!', emote: 'cheer', do: [{ friend: 3 }], end: false } }
        } },
      { text: 'Feiert zusammen! Tanz bei der Regenbogen-Disco an der Bühne – dann zeigt sich etwas im Brunnen.', hints: ['Der Spielautomat steht an der Bühne.', 'Pfeiltasten oder auf die Bahnen tippen.', 'Danach liegt im Brunnen ein Splitter.'],
        objectives: [{ id: 'd', type: 'minigame', target: 'disco', label: 'Tanz bei der Regenbogen-Disco' }, { id: 's', type: 'have', target: 'splitter', label: 'Nimm den Splitter aus dem Brunnen' }] }
    ],
    rewards: { stars: 25, xp: 120, flag: 'done_regenbogen', text: 'Die Familien erinnern sich wieder an ihre schönsten Momente.' } }
];

/* =====================================================================  FREIZEITPARK  */
const P = ISLES.park, pa = (dx: number, dz: number) => at('park', dx, dz);
export const park: WorldDef = {
  id: 'park', name: 'Freizeitpark', icon: '🎡', chapter: 4, theme: 'park',
  desc: 'Riesenrad, Karussell, Achterbahn und Autoscooter – wenn sie denn laufen würden.',
  shape: isle('park', { height: 1.1, grass: 0x7fd65a, grass2: 0x72c94e, beach: 7, bumps: 0.3, flats: [{ x: P.x, z: P.z, r: 52, y: 1.1 }],
    paths: [pathTo('park', 0, 0, 7, 0xe8d3a3), pathTo('park', 565, 125, 6, 0xe8d3a3), { ax: P.x - 30, az: P.z, bx: P.x + 30, bz: P.z, w: 6, color: 0xe8d3a3 }, { ax: P.x, az: P.z - 30, bx: P.x, bz: P.z + 30, w: 6, color: 0xe8d3a3 }],
    paints: [{ x: P.x, z: P.z, r: 10, color: 0xe8d3a3 }] }),
  spawn: spawnFrom('park', 'hub'),
  pois: { eingang: { ...pa(-48, 0), name: 'Parkeingang', icon: '🎟️' }, riesenrad: { ...pa(24, -24), name: 'Riesenrad', icon: '🎡' }, karussell: { ...pa(-20, -24), name: 'Karussell', icon: '🎠' }, achterbahn: { ...pa(22, 26), name: 'Achterbahn', icon: '🎢' }, scooter: { ...pa(-22, 24), name: 'Autoscooter', icon: '🚗' } },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    const ein = pa(-46, 0); arch(ctx, ein.x, ein.z, Math.PI / 2, 9, 6, 0xff5fb0, 0xffd23f); floatLabel(ctx, ein.x, ctx.h(ein.x, ein.z) + 8.5, ein.z, 'Freizeitpark', '🎡', 1.2);
    fountain(ctx, P.x, P.z, 3.5);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; lamp(ctx, P.x + Math.cos(a) * 12, P.z + Math.sin(a) * 12, RB[i % 6]); }
    const running = () => !!api.flag('park_laeuft');
    // Riesenrad
    const rr = pa(24, -24), ry = ctx.h(rr.x, rr.z);
    for (const s of [-1, 1]) { b.box(rr.x - 5, ry, rr.z + s * 1.4, 0.5, 14, 0.5, 0xdddddd, { rz: 0.35 }); b.box(rr.x + 5, ry, rr.z + s * 1.4, 0.5, 14, 0.5, 0xdddddd, { rz: -0.35 }); }
    ctx.box(rr.x, rr.z, 12, 4, ry, ry + 2);
    const wheel = new THREE.Group(); wheel.position.set(rr.x, ry + 13, rr.z); ctx.add(wheel);
    const wb = new GeoBuilder(); wb.torus(0, 0, 0, 10, 0.25, 0xff5fb0); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; wb.box(Math.cos(a) * 5, Math.sin(a) * 5 - 0.2, 0, 10, 0.2, 0.2, 0xdddddd, { rz: a }); }
    const wm = wb.mesh(mats().vc, true); (wm.material as THREE.Material); wheel.add(wm);
    const gond: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) { const g = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), new THREE.MeshStandardMaterial({ color: RB[i % 6] })); (g.material as THREE.Material).userData.disposeWithWorld = true; ctx.add(g); gond.push(g); }
    // Karussell
    const kr = pa(-20, -24), ky = ctx.h(kr.x, kr.z);
    b.cyl(kr.x, ky, kr.z, 7, 7.2, 0.6, 0xfff1d6, 24); ctx.circle(kr.x, kr.z, 7.2, ky - 1, ky + 0.6);
    const karu = new THREE.Group(); karu.position.set(kr.x, ky + 0.6, kr.z); ctx.add(karu);
    const kb = new GeoBuilder(); kb.cyl(0, 0, 0, 0.5, 0.5, 5, 0xffd23f, 10); kb.cone(0, 5, 0, 7.5, 2.5, 0xe8453c, 16); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; kb.cyl(Math.cos(a) * 5, 0, Math.sin(a) * 5, 0.06, 0.06, 5, 0xffd23f, 6); kb.sph(Math.cos(a) * 5, 1.4, Math.sin(a) * 5, 0.55, i % 2 ? 0xffffff : 0x8b5a2b, { sz: 1.6 }); }
    karu.add(kb.mesh(mats().vc, true));
    // Achterbahn (Gerüst)
    const ab = pa(22, 26), aby = ctx.h(ab.x, ab.z);
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, x = ab.x + Math.cos(a) * 12, z = ab.z + Math.sin(a) * 7, h = 3 + Math.sin(a * 2) * 2.5 + 3; b.box(x, aby, z, 0.3, h, 0.3, 0xdddddd); b.box(x, aby + h, z, 1.6, 0.3, 3.3, 0xe8453c, { ry: -a }); }
    const coaster = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1, 2.4), new THREE.MeshStandardMaterial({ color: 0x3f8cff })); (coaster.material as THREE.Material).userData.disposeWithWorld = true; ctx.add(coaster);
    // Autoscooter-Halle
    const sc = pa(-22, 24), sy = ctx.h(sc.x, sc.z);
    b.box(sc.x, sy, sc.z, 16, 0.2, 12, 0x5a5f7d); for (const [x, z] of [[-8, -6], [8, -6], [-8, 6], [8, 6]]) b.cyl(sc.x + x, sy, sc.z + z, 0.25, 0.25, 5, 0xdddddd, 6); b.box(sc.x, sy + 5, sc.z, 17, 0.4, 13, 0xff8a1f);
    ctx.onUpdate((dt, t) => {
      if (!running()) return;
      wheel.rotation.z += dt * 0.15;
      gond.forEach((g, i) => { const a = wheel.rotation.z + (i / 8) * Math.PI * 2; g.position.set(rr.x + Math.cos(a) * 10, ry + 13 + Math.sin(a) * 10 - 1, rr.z); });
      karu.rotation.y += dt * 0.6;
      const a = t * 0.8; coaster.position.set(ab.x + Math.cos(a) * 12, aby + 6.6 + Math.sin(a * 2) * 2.5, ab.z + Math.sin(a) * 7); coaster.rotation.y = -a;
    });
    gond.forEach((g, i) => { const a = (i / 8) * Math.PI * 2; g.position.set(rr.x + Math.cos(a) * 10, ry + 12 + Math.sin(a) * 10, rr.z); });
    coaster.position.set(ab.x + 12, aby + 7, ab.z);
    // Mitfahren (wenn der Park läuft)
    for (const [id, p, nm] of [['riesenrad', rr, 'Riesenrad'], ['karussell', kr, 'Karussell'], ['achterbahn', ab, 'Achterbahn']] as const) spot(ctx, 'fahrt:' + id, p.x - 8, p.z + 6, '🎟️', () => running() ? 'Mitfahren: ' + nm : nm + ' steht still …', () => {
      if (!running()) { api.toast('Das ' + nm + ' bewegt sich nicht. Parkdirektorin Paula braucht Hilfe!', '⚙️'); return; }
      api.focusCamera(p.x, ctx.h(p.x, p.z) + 8, p.z, 3); api.sfx('whoosh'); api.burst(p.x, ctx.h(p.x, p.z) + 6, p.z, RB, 30);
      if (api.collectOnce('fahrt_' + id)) api.addStars(3); api.toast('Juhuuu! Was für eine Fahrt!', '🎢');
    }, { r: 4 });
    // Zahnräder
    pickup(ctx, 'zahnrad1', ab.x - 10, ab.z + 6, 'zahnrad', { when: () => api.questStage('w_park') >= 0, label: 'Zahnrad unter der Achterbahn' });
    chest(ctx, 'scooter', sc.x + 9, sc.z - 7, 0, { item: ['zahnrad', 1] }, () => api.questStage('w_park') >= 0);
    pickup(ctx, 'zahnrad3', pa(30, -44).x, pa(30, -44).z, 'zahnrad', { when: () => api.questStage('w_park') >= 0 && api.flag('park_memory'), label: 'Zahnrad hinter dem Riesenrad' });
    arcade(ctx, 'memory', pa(-10, -36).x, pa(-10, -36).z, 0, 'pixelplan', 'Park-Memory', '🧩', 0xff5fb0);
    lever(ctx, 'park', P.x + 6, P.z - 6, 'Hauptschalter des Parks', () => { api.setFlag('park_laeuft'); api.toast('Brrrrrrumm! Alle Fahrgeschäfte laufen wieder!', '🎡', 3500); api.burst(P.x, ctx.h(P.x, P.z) + 3, P.z, RB, 60); }, () => api.questStage('w_park') >= 2);
    stall(ctx, pa(-34, -8).x, pa(-34, -8).z, Math.PI / 2, 0xff5fb0, [0xffffff, 0xff9ad0, 0xfff07a]); stall(ctx, pa(-34, 8).x, pa(-34, 8).z, Math.PI / 2, 0x3f8cff, [0xffd23f, 0xffd23f, 0xffffff]);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + 0.1; const p = pa(Math.cos(a) * 54, Math.sin(a) * 54); if (Math.abs(a - Math.PI) > 0.3) ctx.tree(i % 3 ? 'laub' : 'kirsch', p.x, p.z, 1); }
    pickup(ctx, 'pk_splitter', P.x, P.z + 6, 'splitter', { when: () => api.flag('park_laeuft') && api.questStage('w_park') >= 3, label: 'Kompass-Splitter am Brunnen' });
  }
};
export const PARK_NPCS: NpcDef[] = [
  npc('park', 'paula', 'Parkdirektorin Paula', '🎩', 'Freizeitpark', pa(8, -4).x, pa(8, -4).z, ['Willkommen im – ach, es fährt ja nichts …', 'Hallo! Bitte nicht traurig sein, der Park ist nur gerade müde.'], ['Ohne goldene Zahnräder bewegt sich hier gar nichts.', 'Früher sind hier jeden Tag hundert Kinder Achterbahn gefahren!'], { look: { hair: 'zopf', hairColor: 6, top: 'jacke', topColor: 0, hat: 'cowboy', hatColor: 11, age: 2 }, likes: ['eis', 'kuchen'] }),
  npc('park', 'clown', 'Clown Pippo', '🤡', 'Spaßmacher', pa(-6, 10).x, pa(-6, 10).z, ['Tröööt! Hallo!', 'Hihi, du hast da was – ach nein, nur ein Lächeln!'], ['Warum fahren Fische nie Achterbahn? Weil sie Angst vor Loopings haben! Hahaha!', 'Ich hab gestern versucht, einen Witz über das Riesenrad zu machen. Er hat sich nur im Kreis gedreht.'], { look: { hair: 'afro', hairColor: 6, top: 'latz', topColor: 2, bottomColor: 5, pattern: 'stern', glasses: 'herz' }, emotes: ['laugh', 'dance'] })
];
export const PARK_QUESTS: QuestDef[] = [
  { id: 'w_park', title: 'Der stille Park', icon: '⚙️', world: 'park', kind: 'world', giver: 'paula',
    summary: 'Der Sturm hat die drei goldenen Zahnräder aus dem Hauptschalter geblasen. Kein Fahrgeschäft bewegt sich.',
    offer: { start: { t: 'Drei goldene Zahnräder sind aus dem Hauptschalter geflogen! Eins hab ich unter der Achterbahn blitzen sehen. Hilfst du mir, sie zu finden?', choices: [{ t: '⚙️ Ich suche!', do: [{ start: 'w_park' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Finde zwei Zahnräder: unter der Achterbahn und in der Truhe beim Autoscooter.', hints: ['Die Achterbahn ist im Südosten, der Autoscooter im Südwesten.', 'Das eine glitzert am Boden, das andere liegt in einer Truhe.', 'Unter der Achterbahn (Westseite) und Truhe an der Ecke der Autoscooter-Halle.'],
        objectives: [{ id: 'z', type: 'have', target: 'zahnrad', n: 2, label: 'Finde zwei Zahnräder' }] },
      { text: 'Clown Pippo hat das dritte Zahnrad versteckt – aber nur für Leute mit gutem Gedächtnis! Gewinne das Park-Memory.', hints: ['Pippo erzählt davon, wenn du ihn ansprichst.', 'Der Spielautomat steht im Norden.', 'Gewinne das Memory – danach glitzert das Zahnrad hinter dem Riesenrad.'],
        objectives: [{ id: 'm', type: 'minigame', target: 'pixelplan', label: 'Gewinne das Park-Memory' }, { id: 'z', type: 'have', target: 'zahnrad', n: 3, label: 'Hol das dritte Zahnrad hinter dem Riesenrad' }] },
      { text: 'Bring die Zahnräder zu Paula und leg den Hauptschalter um.', hints: ['Paula steht am Brunnen.', 'Der Hauptschalter ist neben dem Brunnen.', 'Erst mit Paula sprechen, dann den roten Hebel betätigen.'],
        objectives: [{ id: 'p', type: 'talk', target: 'paula', label: 'Gib Paula die Zahnräder' }, { id: 'h', type: 'interact', target: 'lever:park', label: 'Leg den Hauptschalter um' }],
        dialog: { paula: { start: { t: 'Alle drei! Klick, klack, klick – eingesetzt! Jetzt nur noch den großen roten Hebel neben dem Brunnen!', do: [{ take: ['zahnrad', 3] }, { friend: 3 }], end: false } } } },
      { text: 'Der Park läuft! Fahr mit dem Riesenrad – und schau, was am Brunnen glitzert.', hints: ['Beim Riesenrad „Mitfahren“ drücken.', 'Danach zum Brunnen.', 'Splitter aufheben.'],
        objectives: [{ id: 'f', type: 'interact', target: 'fahrt:riesenrad', label: 'Fahr mit dem Riesenrad' }, { id: 's', type: 'have', target: 'splitter', label: 'Nimm den Splitter am Brunnen' }] }
    ],
    rewards: { stars: 25, xp: 120, flag: 'done_park', text: 'Der Freizeitpark dreht sich wieder!' } }
];
// Das Memory schaltet das dritte Zahnrad frei: Flag „park_memory“ wird beim Sieg gesetzt (systems.ts).

/* =====================================================================  FUSSBALL-ARENA  */
const FB = ISLES.fussball, fba = (dx: number, dz: number) => at('fussball', dx, dz);
export const fussball: WorldDef = {
  id: 'fussball', name: 'Fußball-Arena', icon: '⚽', chapter: 4, theme: 'fussball',
  desc: 'Stadion mit Flutlicht, Tribüne und Pokal-Podest.',
  shape: isle('fussball', { height: 1.1, grass: 0x6fcf5a, grass2: 0x62c052, beach: 7, bumps: 0.2, flats: [{ x: FB.x, z: FB.z, r: 40, y: 1.1 }], paths: [pathTo('fussball', 0, 0, 6, 0xe8d3a3), pathTo('fussball', -305, 425, 6, 0xe8d3a3)],
    colorFn: (x, z) => { const dx = x - FB.x, dz = z - FB.z; if (Math.abs(dx) < 24 && Math.abs(dz) < 15) { if (Math.abs(Math.abs(dx) - 23.8) < 0.25 || Math.abs(Math.abs(dz) - 14.8) < 0.25 || Math.abs(dx) < 0.25 || Math.abs(Math.hypot(dx, dz) - 5) < 0.25) return 0xffffff; return Math.floor(dx / 3) % 2 ? 0x4cbf55 : 0x5fcf62; } return null; } }),
  spawn: spawnFrom('fussball', 'hub'),
  pois: { platz: { ...fba(0, 0), name: 'Spielfeld', icon: '⚽' }, pokal: { ...fba(0, -22), name: 'Pokal-Podest', icon: '🏆' } },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    for (const s of [-1, 1]) { const g = fba(s * 24, 0), y = ctx.h(g.x, g.z); b.box(g.x, y, g.z - 3.6, 0.2, 2.4, 0.2, 0xffffff); b.box(g.x, y, g.z + 3.6, 0.2, 2.4, 0.2, 0xffffff); b.box(g.x, y + 2.4, g.z, 0.2, 0.2, 7.4, 0xffffff); b.box(g.x + s * 1.2, y, g.z, 0.05, 2.4, 7.4, 0xeeeeee); }
    const tr = fba(0, 22), ty = ctx.h(tr.x, tr.z);
    for (let k = 0; k < 4; k++) { b.box(tr.x, ty + k * 0.8, tr.z + k * 1.2, 40, 0.8, 1.2, [0x3f8cff, 0xe8453c][k % 2]); ctx.box(tr.x, tr.z + k * 1.2, 40, 1.2, ty - 1, ty + (k + 1) * 0.8); }
    for (const [x, z] of [[-26, -17], [26, -17], [-26, 17], [26, 17]]) { const p = fba(x, z), y = ctx.h(p.x, p.z); b.cyl(p.x, y, p.z, 0.3, 0.4, 14, 0x9aa0a8, 8); b.box(p.x, y + 14, p.z, 3, 1.5, 0.5, 0x555555); ctx.glow.box(p.x, y + 14, p.z + 0.26, 2.6, 1.2, 0.05, 0xfff6c0); ctx.circle(p.x, p.z, 0.4, y, y + 14); }
    const po = fba(0, -22), py = ctx.h(po.x, po.z); b.cyl(po.x, py, po.z, 1.6, 1.8, 1.2, 0xdddddd, 12); b.cyl(po.x, py + 1.2, po.z, 0.4, 0.6, 1, 0xffc83d, 10); b.cyl(po.x, py + 2.2, po.z, 0.9, 0.4, 1, 0xffc83d, 12); ctx.circle(po.x, po.z, 1.8, py, py + 1.2);
    arcade(ctx, 'elfmeter', fba(-8, -22).x, fba(-8, -22).z, 0, 'elfmeter', 'Elfmeter-Training', '⚽', 0x3f8cff);
    spot(ctx, 'pokal', po.x, po.z + 2.5, '🏆', () => api.questStage('w_fussball') >= 1 ? 'Elfmeter-Turnier starten' : 'Pokal bewundern', () => { if (api.questStage('w_fussball') >= 1 && !api.questDone('w_fussball')) api.startMinigame('elfmeter_turnier'); else api.toast('Der goldene Pokal der Bunten Insel. Wer gewinnt ihn?', '🏆'); }, { r: 3.5 });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const p = fba(Math.cos(a) * 40, Math.sin(a) * 40); ctx.tree('laub', p.x, p.z, 0.9); }
  }
};
export const FUSSBALL_NPCS: NpcDef[] = [
  npc('fussball', 'lena', 'Trainerin Lena', '🧑‍🏫', 'Fußball-Arena', fba(-6, -16).x, fba(-6, -16).z, ['Ball flach halten!', 'Hallo, Sportskanone!'], ['Schieß in die Ecken – da kommt der Torwart schwer hin.', 'Ein gutes Team hält zusammen. Auch wenn man verliert.'], { look: { hair: 'zopf', hairColor: 3, top: 'tshirt', topColor: 3, bottom: 'shorts', bottomColor: 9, skin: 4 }, wander: 4 }),
  npc('fussball', 'kapitaen_j', 'Kapitän Jonas', '⚽', 'Mannschaftskapitän', fba(6, 4).x, fba(6, 4).z, ['Ey, spielst du mit?', 'Hallo!'], ['Der Pokal steht seit dem Sturm auf dem Podest – aber keiner hat ihn gewonnen.'], { look: { hair: 'strubbel', hairColor: 1, top: 'tshirt', topColor: 0, pattern: 'streifen', bottom: 'shorts', bottomColor: 9, age: 1 } })
];
export const FUSSBALL_QUESTS: QuestDef[] = [
  { id: 'w_fussball', title: 'Der goldene Pokal', icon: '🏆', world: 'fussball', kind: 'world', giver: 'lena',
    summary: 'Lena will sehen, ob du das Zeug zum Pokalsieger hast.',
    offer: { start: { t: 'Du willst den Pokal? Dann erst mal Training: Mach im Elfmeter-Training mindestens 3 von 5 Toren!', choices: [{ t: '⚽ Los!', do: [{ start: 'w_fussball' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Gewinne das Elfmeter-Training (3 von 5 Toren).', hints: ['Spielautomat links vom Pokal.', 'Erst Richtung, dann Kraft festlegen.', 'Nicht zu fest – sonst geht’s drüber!'], objectives: [{ id: 'e', type: 'minigame', target: 'elfmeter', label: 'Gewinne das Elfmeter-Training' }] },
      { text: 'Starte am Pokal das Elfmeter-Turnier und gewinne es.', hints: ['Geh zum Pokal-Podest.', 'Der Torwart ist jetzt schneller.', 'Ecken, Ecken, Ecken!'], objectives: [{ id: 't', type: 'minigame', target: 'elfmeter_turnier', label: 'Gewinne das Elfmeter-Turnier' }] }
    ],
    rewards: { stars: 25, xp: 100, flag: 'done_fussball', cosmetic: 'hat:cap', text: 'Pokalsieger der Bunten Insel!' } }
];

/* =====================================================================  MÄRCHENLAND  */
const M = ISLES.maerchen, ma = (dx: number, dz: number) => at('maerchen', dx, dz);
export const maerchen: WorldDef = {
  id: 'maerchen', name: 'Märchenland', icon: '🏰', chapter: 5, theme: 'maerchen',
  desc: 'Schloss Sternenglanz, Frostgipfel, Wunschbrunnen, Nimmerland und viele Märchenfiguren.',
  shape: isle('maerchen', { height: 1.3, grass: 0x8fe06a, grass2: 0x7fd65a, beach: 9, bumps: 0.8,
    hills: [{ ...ma(-30, -30), r: 22, h: 16, tiers: 4 }, { ...ma(34, 26), r: 14, h: 8, tiers: 3 }, { ...ma(-34, 30), r: 12, h: 5 }],
    flats: [{ x: M.x, z: M.z, r: 20, y: 1.3 }, { ...ma(10, -26), r: 18, y: 1.3 }], paths: [pathTo('maerchen', 0, 0, 7, 0xf4e6c8), pathTo('maerchen', -565, -80, 6, 0xf4e6c8)],
    colorFn: (x, z, y) => { const dx = x - (M.x - 30), dz = z - (M.z - 30); return Math.hypot(dx, dz) < 20 && y > 6 ? 0xf4fbff : null; } }),
  spawn: spawnFrom('maerchen', 'hub'),
  pois: { schloss: { ...ma(10, -28), name: 'Schloss Sternenglanz', icon: '🏰' }, brunnen: { ...ma(0, 4), name: 'Wunschbrunnen', icon: '🌠' }, frost: { ...ma(-30, -30), name: 'Frostgipfel', icon: '❄️' }, nimmer: { ...ma(34, 26), name: 'Nimmerland', icon: '🌙' }, basar: { ...ma(-34, 30), name: 'Wüsten-Basar', icon: '🪔' } },
  vehicles: [{ type: 'maerchentaxi', ...ma(14, 14), yaw: 0 }],
  groundCover: { grass: 1, flowers: [0xff9ad0, 0xfff07a, 0xbfe9ff, 0xffffff] },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    const awake = !!api.flag('schloss_wach');
    // Schloss Sternenglanz
    const s = ma(10, -30), y = ctx.h(s.x, s.z);
    house(ctx, { x: s.x, z: s.z, w: 18, d: 12, h: 8, wall: 0xf4e6ff, roof: 0x8a5bff, enter: true, name: 'Schloss Sternenglanz', icon: '🏰', roofType: 'flat', trim: 0xffd23f, floor: 0xe8d6ff });
    for (const [dx, dz, h] of [[-9, -6, 16], [9, -6, 16], [-9, 6, 12], [9, 6, 12], [0, -6, 20]] as const) { b.cyl(s.x + dx, y, s.z + dz, 2, 2.2, h, 0xf4e6ff, 14); b.cone(s.x + dx, y + h, s.z + dz, 2.6, 5, awake ? 0xff5fb0 : 0x9a9aa8, 14); ctx.glow.sph(s.x + dx, y + h + 5.3, s.z + dz, 0.3, 0xffd23f); ctx.circle(s.x + dx, s.z + dz, 2.2, y, y + h); }
    floatLabel(ctx, s.x, y + 28, s.z, awake ? 'Schloss Sternenglanz' : 'Schloss Sternenglanz (schläft)', '🏰', 1.4);
    const hs = { f: frame(s.x, s.z, 0), y, w: 18, d: 12, h: 8, inside: () => false, door: s };
    furniture(ctx, hs as never, 'thron', 0, -4.5); furniture(ctx, hs as never, 'teppich', 0, 0, 0xe8453c);
    // Wunschbrunnen
    const wb = ma(0, 4); fountain(ctx, wb.x, wb.z, 3, 0xdcd0ff, 0x9fe8ff);
    spot(ctx, 'wunschbrunnen', wb.x, wb.z + 4, '🌠', 'Einen Wunsch in den Brunnen flüstern', () => {
      if (api.questStage('w_maerchen') === 2) { api.setFlag('schloss_wach'); api.burst(s.x, y + 18, s.z, [0xff5fb0, 0xffd23f, 0x9fe8ff], 80); api.toast('„Ich wünsche, dass das Schloss erwacht!“ – Glocken läuten, Türme leuchten!', '🏰', 4000); api.openPanel('reloadWorld', 'maerchen'); return; }
      if (api.collectOnce('wunsch_' + new Date().toDateString())) api.addStars(1); api.burst(wb.x, ctx.h(wb.x, wb.z) + 2, wb.z, [0xffd23f, 0x9fe8ff], 20); api.toast('Plopp! Ein Wunsch schwebt davon …', '🌠');
    }, { r: 3.6 });
    // Frostgipfel: Schneemann + Gipfelkristall
    const fg = ma(-30, -30), fy = ctx.h(fg.x, fg.z);
    for (let i = 0; i < 3; i++) b.sph(fg.x + 4, fy + 0.6 + i * 0.9, fg.z + 4, 0.8 - i * 0.2, 0xffffff);
    ctx.glow.cone(fg.x, fy, fg.z, 0.8, 3, 0x9fe8ff, 6);
    for (let i = 0; i < 10; i++) { const a = i * 0.63; ctx.tree('schnee', fg.x + Math.cos(a) * 15, fg.z + Math.sin(a) * 15, 1); }
    spot(ctx, 'frostgipfel', fg.x, fg.z + 2, '❄️', 'Den Frostkristall berühren', () => { api.burst(fg.x, fy + 3, fg.z, [0xffffff, 0x9fe8ff], 30); api.toast('Brrr! Der Frostkristall summt eine eisige Melodie.', '❄️'); }, { r: 3.5 });
    // Nimmerland: Mondhügel mit Baumhaus
    const nm = ma(34, 26), ny = ctx.h(nm.x, nm.z);
    b.cyl(nm.x, ny, nm.z, 0.8, 1.0, 5, 0x8a5a33, 8); b.rbox(nm.x, ny + 5, nm.z, 4, 2.5, 4, 0xb07a45); b.roof(nm.x, ny + 7.5, nm.z, 4.6, 2, 4.6, 0x3f8cff);
    ctx.box(nm.x, nm.z, 4, 4, ny + 4.8, ny + 5.05); ctx.circle(nm.x, nm.z, 1, ny, ny + 5);
    ctx.ramp(nm.x - 4.5, nm.z, 1.4, 7, ny, ny + 5, Math.PI / 2);
    // Wüsten-Basar
    const bz = ma(-34, 30);
    for (let i = 0; i < 4; i++) stall(ctx, bz.x + (i % 2) * 6 - 3, bz.z + Math.floor(i / 2) * 6 - 3, i * 1.57, [0xffa21f, 0x8a5bff, 0x2fb9a8, 0xe8453c][i], [0xffd23f, 0xff6b5b, 0x4cd07d]);
    b.cyl(bz.x + 8, ctx.h(bz.x + 8, bz.z), bz.z - 6, 2, 2, 6, 0xffe3b0, 12); b.sph(bz.x + 8, ctx.h(bz.x + 8, bz.z) + 6.5, bz.z - 6, 2.3, 0xffc83d, { sy: 1.2 });
    for (let i = 0; i < 24; i++) { const a = i * 0.26, r = 46 + (i % 3) * 6; const p = ma(Math.cos(a) * r, Math.sin(a) * r); if (Math.hypot(p.x - spawnFrom('maerchen', 'hub').x, p.z - spawnFrom('maerchen', 'hub').z) > 12) ctx.tree(i % 4 ? 'laub' : 'kirsch', p.x, p.z, 1 + (i % 2) * 0.2); }
    for (let i = 0; i < 6; i++) lamp(ctx, ma(Math.cos(i) * 14, Math.sin(i) * 14 + 4).x, ma(Math.cos(i) * 14, Math.sin(i) * 14 + 4).z, 0xffd6f0);
    pickup(ctx, 'feder_m', bz.x, bz.z + 8, 'feder');
    chest(ctx, 'nimmer', nm.x, nm.z, 0, { stars: 10, item: ['honig', 2] });
    pickup(ctx, 'ma_splitter', s.x, s.z + 9, 'splitter', { when: () => awake && api.questStage('w_maerchen') >= 3, label: 'Kompass-Splitter an der Schlosstür' });
  }
};
export const MAERCHEN_NPCS: NpcDef[] = [
  npc('maerchen', 'lilia', 'Prinzessin Lilia', '👸', 'Schloss Sternenglanz', ma(6, -18).x, ma(6, -18).z, ['Oh! Ein Gast! Willkommen im Märchenland.', 'Hallo, liebe Heldin, lieber Held!'], ['Seit dem Sturm schläft unser Schloss. Die Türme sind grau und die Glocken stumm.', 'Ich trage zwar ein Kleid, aber ich klettere am liebsten auf den Frostgipfel!'], { look: { hair: 'lang', hairColor: 0, top: 'kleid', topColor: 8, pattern: 'stern', hat: 'krone', hatColor: 2 }, likes: ['blume', 'feder'] }),
  npc('maerchen', 'glimmer', 'Fee Glimmer', '🧚', 'Nimmerland', ma(30, 22).x, ma(30, 22).z, ['Glitzer-glitzer! Hallo!', 'Pling! Du siehst aus, als bräuchtest du Feenstaub!'], ['Mit Feenstaub kann man schweben – aber nur, wenn man an schöne Dinge denkt!', 'Das Baumhaus ist das Versteck der verlorenen Kinder. Psst!'], { look: { hair: 'dutt', hairColor: 13, top: 'kleid', topColor: 3, acc: 'fluegel', accColor: 15 }, scale: 0.7, emotes: ['spin'] }),
  npc('maerchen', 'frida', 'Eisfee Frida', '❄️', 'Frostgipfel', ma(-24, -24).x, ma(-24, -24).z, ['Brrr! Schön, dass du da bist.', 'Hallo! Mir ist nie kalt.'], ['Vom Frostgipfel sieht man die ganze Bunte Insel.', 'Meine Schwester Anni baut die besten Schneemänner.'], { look: { hair: 'zopf', hairColor: 8, top: 'kleid', topColor: 15, skin: 9 } }),
  npc('maerchen', 'leo_loewe', 'Löwenkönig Leo', '🦁', 'Königsfels', ma(-8, 26).x, ma(-8, 26).z, ['ROAR! Ach, nur ein Gruß.', 'Willkommen, junge Freundin, junger Freund.'], ['Ein König ist nur so gut wie die Freunde, die zu ihm stehen.'], { creature: { kind: 'loewe' }, wander: 3 }),
  npc('maerchen', 'dschinni', 'Wunschgeist Dschinni', '🧞', 'Wüsten-Basar', ma(-30, 26).x, ma(-30, 26).z, ['Drei Wünsche? Haha, nein – aber ein Lächeln gratis!', 'Salem! Hallo!'], ['Der Wunschbrunnen erfüllt nur Wünsche, die von Herzen kommen.'], { look: { skin: 9, hair: 'glatze', beard: 'kinn', hairColor: 12, top: 'robe', topColor: 6 }, emotes: ['spin'] })
];
export const MAERCHEN_QUESTS: QuestDef[] = [
  { id: 'w_maerchen', title: 'Das schlafende Schloss', icon: '🏰', world: 'maerchen', kind: 'world', giver: 'lilia',
    summary: 'Schloss Sternenglanz ist in einen tiefen Schlaf gefallen. Nur ein Wunsch aus luftiger Höhe kann es wecken.',
    offer: { start: { t: 'Ein altes Märchen sagt: „Wer vom höchsten Gipfel den Frost berührt und dann einen Wunsch in den Brunnen flüstert, weckt das schlafende Schloss.“ Aber der Frostgipfel ist so hoch … Fee Glimmer könnte helfen!', choices: [{ t: '🧚 Ich frag Glimmer!', do: [{ start: 'w_maerchen' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Hol dir bei Fee Glimmer im Nimmerland Feenstaub.', hints: ['Nimmerland ist der Mondhügel im Südosten.', 'Glimmer schwebt beim Baumhaus.', 'Sprich mit Glimmer.'], objectives: [{ id: 'g', type: 'talk', target: 'glimmer', label: 'Sprich mit Fee Glimmer' }],
        dialog: { glimmer: { start: { t: 'Denk an etwas Schönes … an Eis, an Freunde, an Pappnase … PLING! Jetzt kannst du in der Luft schweben – Springen gedrückt halten!', do: [{ ability: 'feenstaub' }], end: false } } } },
      { text: 'Kletter auf den Frostgipfel und berühre den Frostkristall.', hints: ['Der Frostgipfel ist der verschneite Berg im Nordwesten.', 'Spring die Stufen hoch und schwebe mit Feenstaub über Lücken.', 'Ganz oben steht ein leuchtender Kristall.'], objectives: [{ id: 'f', type: 'interact', target: 'frostgipfel', label: 'Berühre den Frostkristall' }] },
      { text: 'Flüstere am Wunschbrunnen deinen Wunsch.', hints: ['Der Wunschbrunnen ist mitten auf dem Platz.', 'Stell dich davor.', 'Aktion drücken.'], objectives: [{ id: 'w', type: 'flag', target: 'schloss_wach', label: 'Wecke das Schloss' }] },
      { text: 'Sprich mit Prinzessin Lilia – an der Schlosstür glitzert etwas.', hints: ['Lilia steht vor dem Schloss.', 'Der Splitter liegt vor der Schlosstür.', 'Splitter aufheben, dann Lilia ansprechen.'],
        objectives: [{ id: 's', type: 'have', target: 'splitter', label: 'Nimm den Splitter' }, { id: 'l', type: 'talk', target: 'lilia', label: 'Sprich mit Lilia' }],
        dialog: { lilia: { start: { t: 'Das Schloss ist wach! Die Glocken, die Türme, alles leuchtet! Du bist ab heute Ehrenritterin, Ehrenritter des Märchenlands. Hier – der Zauberhut!', emote: 'cheer', do: [{ achieve: 'maerchen_held' }, { friend: 4 }], end: false } } } }
    ],
    rewards: { stars: 30, xp: 130, flag: 'done_maerchen', text: 'Schloss Sternenglanz ist erwacht!' } }
];

/* =====================================================================  SCHLÜSSELREICH  */
const K = ISLES.schluessel, ka = (dx: number, dz: number) => at('schluessel', dx, dz);
const LATERNEN = [[-30, -20, 'Strand der Freunde'], [30, -24, 'Dämmerstadt'], [34, 20, 'Kristall-Burg'], [-28, 28, 'Wald der Schatten'], [0, -44, 'Schleier-Turm']] as const;
export const schluessel: WorldDef = {
  id: 'schluessel', name: 'Schlüsselreich', icon: '🗝️', chapter: 5, theme: 'schluessel',
  desc: 'Die Statue des Lichtwanderers Lio, fünf Gebiete mit Laternen und das Tor der Herzen.',
  shape: isle('schluessel', { height: 1.3, grass: 0x6fbfa0, grass2: 0x5aae90, beach: 8, bumps: 1, flats: [{ x: K.x, z: K.z, r: 20, y: 1.3 }], paths: [pathTo('schluessel', -335, -55, 6, 0xd8d0f0), pathTo('schluessel', -735, 20, 5, 0xd8d0f0)],
    paints: [{ x: K.x, z: K.z, r: 18, color: 0xe6dcff }, ...[0, 1, 2, 3, 4, 5].map(i => ({ x: K.x, z: K.z, r: 16 - i * 2, color: [0x9fe8ff, 0xffd6f0, 0xfff6c0][i % 3], ring: 0.6 }))] }),
  spawn: spawnFrom('schluessel', 'maerchen'),
  pois: { platz: { ...ka(0, 0), name: 'Glasmosaik-Platz', icon: '🗝️' }, tor: { ...ka(0, -14), name: 'Tor der Herzen', icon: '💖' }, ...Object.fromEntries(LATERNEN.map(([dx, dz, nm], i) => ['l' + i, { ...ka(dx, dz), name: nm, icon: '🏮' }])) },
  vehicles: [{ type: 'schluesselmobil', ...ka(14, 10), yaw: 0 }],
  groundCover: { grass: 0.8, flowers: [0x9fe8ff, 0xffd6f0, 0xfff6c0] },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    statue(ctx, K.x, K.z + 4, Math.PI, 0xdcd0ff, 2.6, 'held');
    floatLabel(ctx, K.x, ctx.h(K.x, K.z) + 9, K.z + 4, 'Lichtwanderer Lio', '🗝️', 0.8);
    const tor = ka(0, -14); arch(ctx, tor.x, tor.z, 0, 7, 6, 0xb48aff, 0xff9ad0);
    for (const s of [-1, 1]) statue(ctx, tor.x + s * 6, tor.z, 0, 0x6a6f8a, 1.4, 'figur');
    const open = () => !!api.flag('tor_herzen');
    const veil = new THREE.Mesh(new THREE.PlaneGeometry(7, 5.5), new THREE.MeshBasicMaterial({ color: 0xff9ad0, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
    (veil.material as THREE.Material).userData.disposeWithWorld = true; veil.position.set(tor.x, ctx.h(tor.x, tor.z) + 3, tor.z); ctx.add(veil);
    ctx.onUpdate((_d, t) => { veil.visible = !open(); (veil.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 2) * 0.1; });
    spot(ctx, 'tor_herzen', tor.x, tor.z + 2, '💖', () => open() ? 'Das Tor der Herzen ist offen ✅' : 'Lichtschlüssel einsetzen (' + api.count('lichtschluessel') + '/5)', () => {
      if (open()) return;
      if (api.count('lichtschluessel') < 5) { api.toast('Fünf Schlüssellöcher leuchten im Tor. Du hast ' + api.count('lichtschluessel') + ' Lichtschlüssel.', '🗝️'); return; }
      api.take('lichtschluessel', 5); api.setFlag('tor_herzen'); api.burst(tor.x, ctx.h(tor.x, tor.z) + 4, tor.z, [0xff9ad0, 0x9fe8ff, 0xffd23f], 80); api.toast('Die fünf Schlüssel drehen sich – das Tor der Herzen öffnet sich!', '💖', 4000);
    }, { r: 3.5, priority: 2 });
    // Laternen (Lichtzauber) → Lichtschlüssel
    LATERNEN.forEach(([dx, dz, nm], i) => {
      const p = ka(dx, dz), y = ctx.h(p.x, p.z), flag = 'laterne_' + i;
      b.cyl(p.x, y, p.z, 0.2, 0.3, 3.5, 0x3a4250, 8); b.box(p.x, y + 3.5, p.z, 1, 1.2, 1, 0x3a4250);
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8), new THREE.MeshBasicMaterial({ color: 0x555577 })); (l.material as THREE.Material).userData.disposeWithWorld = true;
      l.position.set(p.x, y + 4.1, p.z); ctx.add(l);
      ctx.onUpdate((_d, t) => { const on = api.flag(flag); (l.material as THREE.MeshBasicMaterial).color.setHex(on ? 0xfff2a0 : 0x555577); l.scale.setScalar(on ? 1 + Math.sin(t * 4 + i) * 0.1 : 1); });
      ctx.circle(p.x, p.z, 0.4, y, y + 4);
      floatLabel(ctx, p.x, y + 6, p.z, nm, '🏮', 0.5);
      spot(ctx, 'laterne' + i, p.x, p.z + 1.5, '✨', () => api.flag(flag) ? nm + ': Laterne leuchtet ✅' : api.hasAbility('lichtzauber') ? 'Lichtzauber wirken' : 'Eine dunkle Laterne', () => {
        if (api.flag(flag)) return;
        if (!api.hasAbility('lichtzauber')) { api.toast('Die Laterne ist dunkel. Mit einem Lichtzauber könnte man sie anzünden …', '🏮'); return; }
        api.setFlag(flag); api.sfx('magic'); api.burst(p.x, y + 4, p.z, [0xfff2a0, 0x9fe8ff], 24); api.toast('Die Laterne strahlt – und unter ihr glitzert ein Lichtschlüssel!', '🗝️');
      }, { r: 3 });
      pickup(ctx, 'lichtschl' + i, p.x + 2, p.z + 2, 'lichtschluessel', { when: () => !!api.flag(flag) });
    });
    // Gebiete andeuten
    house(ctx, { ...ka(32, -30), rot: -0.6, w: 8, d: 8, h: 10, wall: 0xd8d0f0, roof: 0x5b4bd6, enter: true, name: 'Uhrturm der Dämmerstadt', icon: '🕰️', roofType: 'cone' });
    house(ctx, { ...ka(38, 24), rot: -2.2, w: 12, d: 10, h: 7, wall: 0xbfe9ff, roof: 0x7fd8ff, enter: true, name: 'Kristall-Burg', icon: '💎', roofType: 'flat' });
    tower(ctx, ka(0, -50).x, ka(0, -50).z, 3, 18, 0xd8d0f0, 0x8a5bff);
    for (let i = 0; i < 18; i++) { const a = 1.9 + i * 0.09, r = 34 + (i % 3) * 5; const p = ka(Math.cos(a) * r, Math.sin(a) * r); ctx.tree('dunkel', p.x, p.z, 1); }
    for (let i = 0; i < 12; i++) { const a = -2.4 + i * 0.12, r = 50; const p = ka(Math.cos(a) * r, Math.sin(a) * r); ctx.tree('palme', p.x, p.z, 1); }
    for (let i = 0; i < 8; i++) { const a = i * 0.8; const p = ka(Math.cos(a) * 22, Math.sin(a) * 22); ctx.tree('kristall', p.x, p.z, 0.8); }
    pickup(ctx, 'ks_splitter', tor.x, tor.z - 4, 'splitter', { when: () => open() && api.questStage('w_schluessel') >= 2, label: 'Kompass-Splitter hinter dem Tor der Herzen' });
  }
};
export const SCHLUESSEL_NPCS: NpcDef[] = [
  npc('schluessel', 'luma', 'Lichtwanderin Luma', '✨', 'Hüterin des Lichts', ka(4, 6).x, ka(4, 6).z, ['Möge dein Weg hell sein.', 'Ah, du hast Licht im Herzen. Ich sehe es.'], ['Lio, der erste Lichtwanderer, hat die fünf Laternen entzündet. Seit dem Sturm sind sie dunkel.', 'Licht ist nicht nur hell – Licht ist Hoffnung.'], { look: { hair: 'lang', hairColor: 8, top: 'robe', topColor: 15, pattern: 'stern', skin: 0 }, likes: ['kristall', 'feder'] }),
  npc('schluessel', 'orrin', 'Meister Orrin', '🧙', 'Weiser', ka(-6, 8).x, ka(-6, 8).z, ['Hmm. Ein neues Gesicht.', 'Willkommen, Wanderer.'], ['Das Tor der Herzen öffnet sich nur, wenn alle fünf Lichter leuchten.', 'Im Wald der Schatten verliert man leicht den Weg. Folge den Glühpilzen.'], { look: { hair: 'glatze', beard: 'voll', hairColor: 8, top: 'robe', topColor: 6, hat: 'zauberhut', hatColor: 6, age: 2 }, wander: 2 }),
  npc('schluessel', 'wuschel', 'Wuschel', '🐾', 'Kleines Fellwesen', ka(10, 2).x, ka(10, 2).z, ['Wuschel-wuschel!', 'Hihi!'], ['Ich hab Angst im Dunkeln. Bitte zünde die Laternen an!'], { creature: { kind: 'taschi', color: 0xd9c9ff, color2: 0xffffff, variant: 1, scale: 0.8 }, wander: 6 })
];
export const SCHLUESSEL_QUESTS: QuestDef[] = [
  { id: 'w_schluessel', title: 'Die fünf Lichtschlüssel', icon: '🗝️', world: 'schluessel', kind: 'world', giver: 'luma',
    summary: 'Die fünf Laternen des Schlüsselreichs sind erloschen – und mit ihnen die Lichtschlüssel für das Tor der Herzen.',
    offer: { start: { t: 'Die Laternen sind dunkel, und das Tor der Herzen ist verschlossen. Ich bringe dir den Lichtzauber bei – damit kannst du sie wieder entzünden. Willst du?', choices: [{ t: '✨ Ja, bitte!', do: [{ start: 'w_schluessel' }, { ability: 'lichtzauber' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Entzünde mit dem Lichtzauber die fünf Laternen und sammle die Lichtschlüssel.', hints: ['Die Laternen stehen in den fünf Gebieten: Strand, Dämmerstadt, Kristall-Burg, Wald der Schatten, Schleier-Turm.', 'Über jeder Laterne schwebt ihr Name.', 'Bei jeder Laterne Aktion drücken, dann den Schlüssel aufheben.'],
        objectives: [{ id: 'k', type: 'have', target: 'lichtschluessel', n: 5, label: 'Sammle die Lichtschlüssel' }] },
      { text: 'Öffne mit den fünf Schlüsseln das Tor der Herzen.', hints: ['Das Tor steht nördlich der Lio-Statue.', 'Stell dich davor.', 'Aktion drücken.'], objectives: [{ id: 't', type: 'flag', target: 'tor_herzen', label: 'Öffne das Tor der Herzen' }] },
      { text: 'Hinter dem Tor leuchtet etwas. Erzähl Luma davon.', hints: ['Direkt hinter dem Tor.', 'Luma ist bei der Statue.', 'Splitter nehmen, dann Luma.'], objectives: [{ id: 's', type: 'have', target: 'splitter', label: 'Nimm den Splitter' }, { id: 'l', type: 'talk', target: 'luma', label: 'Sprich mit Luma' }],
        dialog: { luma: { start: { t: 'Das Tor der Herzen ist offen und das Reich leuchtet wieder. Du bist jetzt eine Lichtwanderin, ein Lichtwanderer – wie Lio!', do: [{ friend: 4 }], end: false } } } }
    ],
    rewards: { stars: 30, xp: 130, flag: 'done_schluessel', text: 'Das Schlüsselreich leuchtet wieder.' } }
];

/* =====================================================================  WUNSCH-INSEL  */
const wa = (dx: number, dz: number) => at('wunsch', dx, dz);
const ZEICHEN = [[-14, -30, 0xffd23f, '☀️', 'Sonne'], [-6, -34, 0x9fe8ff, '🌙', 'Mond'], [2, -34, 0xffffff, '⭐', 'Stern'], [10, -30, 0x4cd07d, '🍃', 'Blatt'], [16, -24, 0x3fa9ff, '🌊', 'Welle']] as const;
export const wunsch: WorldDef = {
  id: 'wunsch', name: 'Wunsch-Insel', icon: '🌠', chapter: 5, theme: 'schluessel',
  desc: 'Palmen, Hängematte, eine geheime Schlucht mit Wandzeichen und Wunschfrüchte.',
  shape: isle('wunsch', { height: 1.2, grass: 0x8fe06a, grass2: 0x7fd65a, beach: 14, bumps: 1.2, hills: [{ ...wa(0, -28), r: 16, h: 6 }], flats: [{ ...wa(0, -30), r: 7, y: 1.2, edge: 3 }], paths: [pathTo('wunsch', -565, -80, 5, 0xe8d3a3)] }),
  spawn: spawnFrom('wunsch', 'schluessel'),
  pois: { strand: { ...wa(0, 18), name: 'Palmenstrand', icon: '🌴' }, schlucht: { ...wa(0, -30), name: 'Geheime Schlucht', icon: '🏞️' }, turm: { ...wa(24, 4), name: 'Aussichtsturm', icon: '🔭' }, floss: { ...wa(-20, 22), name: 'Floß-Bauplatz', icon: '🪵' } },
  vehicles: [{ type: 'floss', ...wa(-26, 42), yaw: 0, id: 'wunsch:floss' }],
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; const p = wa(Math.cos(a) * 32, Math.sin(a) * 32); ctx.tree('palme', p.x, p.z, 1 + (i % 3) * 0.12); }
    house(ctx, { ...wa(-8, 6), rot: 0.4, w: 7, d: 6, wall: 0xc9a26b, roof: 0x8a6a3a, enter: true, name: 'Kiras Hütte', icon: '🛖' });
    tower(ctx, wa(24, 4).x, wa(24, 4).z, 1.6, 12, 0xb07a45, 0x8a5a33);
    sequencePuzzle(ctx, 'zeichen', ZEICHEN.map(([dx, dz, c, ic, nm]) => ({ ...wa(dx, dz), color: c, icon: ic, name: nm })), [0, 1, 2, 4, 3],
      () => api.toast('Die Felswand öffnet sich – dahinter wächst eine goldene Wunschfrucht!', '🍑', 3500),
      { style: 'pillar', clue: 'Kiras Lied: „Am Morgen steht die Sonne auf, am Abend kommt der Mond herauf, dann funkeln Sterne in der Nacht, die Welle rauscht, das Blatt erwacht.“', clueAt: wa(0, -18) });
    pickup(ctx, 'wunschfrucht', wa(2, -38).x, wa(2, -38).z, 'wunschfrucht', { when: () => !!api.flag('puzzle_zeichen') });
    // Floß-Teile und Bauplatz
    [[-30, 20], [28, 24], [-34, -6], [20, -10], [6, 34], [-16, 36]].forEach(([dx, dz], i) => pickup(ctx, 'flossteil' + i, wa(dx, dz).x, wa(dx, dz).z, 'flossteil', { when: () => !api.flag('floss_gebaut') }));
    const bp = wa(-20, 24);
    b.box(bp.x, ctx.h(bp.x, bp.z), bp.z, 3, 0.2, 3, 0x8a6a3a);
    spot(ctx, 'flossbau', bp.x, bp.z, '🪵', () => api.flag('floss_gebaut') ? 'Das Floß liegt am Strand ✅' : 'Floß bauen (' + api.count('flossteil') + '/6 Teile)', () => {
      if (api.flag('floss_gebaut')) return;
      if (api.count('flossteil') < 6) { api.toast('Für ein Floß brauchst du 6 Treibholz-Teile. Sie liegen am Strand verteilt.', '🪵'); return; }
      api.take('flossteil', 6); api.setFlag('floss_gebaut'); api.burst(bp.x, ctx.h(bp.x, bp.z) + 1, bp.z, [0xc9a26b, 0xffffff], 30); api.toast('Hämmer, hämmer – fertig! Das Floß liegt am Strand.', '🪵', 3500); api.openPanel('reloadWorld', 'wunsch');
    }, { r: 3 });
    chest(ctx, 'turm', wa(24, 4).x + 3, wa(24, 4).z, 0, { stars: 8, item: ['kristall', 1] });
  }
};
// Floß nur nach dem Bau
const origWunschBuild = wunsch.build;
wunsch.build = ctx => { if (!ctx.api.flag('floss_gebaut')) wunsch.vehicles = []; else wunsch.vehicles = [{ type: 'floss', ...wa(-26, 42), yaw: 0, id: 'wunsch:floss' }]; origWunschBuild(ctx); };
export const WUNSCH_NPCS: NpcDef[] = [
  npc('wunsch', 'kira', 'Kira', '🌺', 'Inselbewohnerin', wa(-4, 10).x, wa(-4, 10).z, ['Aloha! Willkommen auf der Wunsch-Insel.', 'Hey! Schon die Hängematte ausprobiert?'], ['Hier wachsen Wunschfrüchte – aber nur hinter der geheimen Felswand.', 'Mit einem Floß könnte man um die ganze Insel paddeln!'], { look: { hair: 'locken', hairColor: 4, top: 'kleid', topColor: 4, hat: 'blume', skin: 4 }, likes: ['muschel', 'feder'] }),
  npc('wunsch', 'silvan', 'Silvan', '🧭', 'Abenteurer', wa(18, 8).x, wa(18, 8).z, ['Ahoi!', 'Vom Turm sieht man bis zum Schlüsselreich!'], ['Ich sammle Geschichten. Erzählst du mir mal eine?'], { look: { hair: 'strubbel', hairColor: 3, top: 'jacke', topColor: 12, acc: 'rucksack' } })
];
export const WUNSCH_QUESTS: QuestDef[] = [
  { id: 'w_wunsch', title: 'Ein Wunsch für jemanden', icon: '🌠', world: 'wunsch', kind: 'world', giver: 'kira',
    summary: 'Kira erzählt von der Wunschfrucht hinter der Felswand – und von einem Floß, mit dem man die Insel umrunden kann.',
    offer: { start: { t: 'Die Wunschfrucht erfüllt einen Wunsch – aber nur für jemand anderen, nie für sich selbst. Löst du das Rätsel der Felswand? Und bau doch auch ein Floß!', choices: [{ t: '🌠 Mach ich!', do: [{ start: 'w_wunsch' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Löse das Rätsel der Wandzeichen und pflücke die Wunschfrucht. Bau außerdem ein Floß aus 6 Teilen.', hints: ['Die Hinweis-Tafel steht vor der Schlucht. Die Floß-Teile liegen am Strand.', 'Kiras Lied nennt die Reihenfolge: Sonne, Mond, Stern, Welle, Blatt.', 'Zeichen berühren in dieser Folge. Floß am Bauplatz bauen.'],
        objectives: [{ id: 'f', type: 'have', target: 'wunschfrucht', label: 'Pflücke die Wunschfrucht' }, { id: 'b', type: 'flag', target: 'floss_gebaut', label: 'Bau das Floß' }] },
      { text: 'Wem schenkst du deinen Wunsch? Sprich mit Kira.', hints: ['Kira ist bei ihrer Hütte.', 'Es gibt keine falsche Antwort.', 'Sprich mit Kira.'], objectives: [{ id: 'k', type: 'talk', target: 'kira', label: 'Sprich mit Kira' }],
        dialog: { kira: { start: { t: 'Du hast sie! Für wen wünschst du dir etwas?', choices: [
          { t: '☁️ Für das traurige Wölkchen – dass es Freunde findet.', do: [{ take: ['wunschfrucht', 1] }, { choice: ['wunsch', 'flick'] }, { flag: 'wunsch_flick' }], to: 'a' },
          { t: '🐶 Für Blitz – einen riesigen Knochen!', do: [{ take: ['wunschfrucht', 1] }, { choice: ['wunsch', 'blitz'] }], to: 'b' },
          { t: '👩‍💼 Für Rosi – einen ruhigen Tag ohne Briefe.', do: [{ take: ['wunschfrucht', 1] }, { choice: ['wunsch', 'rosi'] }], to: 'c' }] },
          a: { t: 'Was für ein schöner Wunsch. Ich glaube, irgendwo hoch oben hat jemand gerade gelächelt.', end: false },
          b: { t: 'Haha! Blitz wird sich freuen. Ich glaube, ich höre ihn schon bellen!', end: false },
          c: { t: 'Wie lieb! Rosi hat es sich verdient.', end: false } } } }
    ],
    rewards: { stars: 25, xp: 110, flag: 'done_wunsch', text: 'Ein Wunsch ist auf dem Weg.' } }
];
