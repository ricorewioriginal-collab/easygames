/* Welten-Gruppe 3: Schwammi-Bucht, Atlantis, Funkwelle (Kap. 6), Lunaris, Taschi-Land, Hüpfland, Bauland, Rätsel-Insel (Kap. 7). */
import type { WorldDef, WorldCtx } from '../registry.ts';
import type { NpcDef } from '../../gameplay/npc.ts';
import type { QuestDef } from '../../gameplay/quests.ts';
import { at, arcade, chest, isle, lever, npc, pathTo, pickup, sequencePuzzle, spawnFrom, spot, emojiTex } from '../kit.ts';
import { arch, floatLabel, fountain, furniture, house, rock, stall, statue, tower } from '../props.ts';
import { ISLES } from '../layout.ts';

/* =====================================================================  SCHWAMMI-BUCHT  */
const swa = (dx: number, dz: number) => at('schwamm', dx, dz);
export const schwamm: WorldDef = {
  id: 'schwamm', name: 'Schwammi-Bucht', icon: '🧽', chapter: 6, theme: 'seegrund',
  desc: 'Eine Unterwasser-Stadt-Insel mit der Knusper-Krabbe, Quallenfeldern und Schwammis Fruchthaus.',
  shape: isle('schwamm', { height: 1.0, grass: 0xf2dca0, grass2: 0xe8cf90, sand: 0xf2dca0, beach: 8, bumps: 0.8, paths: [pathTo('schwamm', 0, -330, 6, 0xc9b48a)],
    colorFn: (x, z, y) => (y > 0.7 ? ((Math.floor(x * 0.15) + Math.floor(z * 0.15)) % 5 === 0 ? 0xe8b8d0 : null) : null) }),
  spawn: spawnFrom('schwamm', 'stadt'),
  pois: { krabbe: { ...swa(0, -8), name: 'Knusper-Krabbe', icon: '🦀' }, fruchthaus: { ...swa(-24, 14), name: 'Schwammis Fruchthaus', icon: '🍍' }, quallen: { ...swa(24, 18), name: 'Quallenfeld', icon: '🪼' }, stein: { ...swa(-30, -14), name: 'Sternchens Stein', icon: '🪨' } },
  vehicles: [{ type: 'wannenmobil', ...swa(10, 40), yaw: 0 }],
  groundCover: { grass: 0.3, flowers: [0xff6f91, 0xffa94d] },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    const k = swa(0, -10), ky = ctx.h(k.x, k.z);
    const hs = house(ctx, { x: k.x, z: k.z, w: 14, d: 10, h: 4.5, wall: 0x8a5a33, roof: 0xe8453c, enter: true, name: 'Knusper-Krabbe', icon: '🦀', roofType: 'dome', trim: 0xffd23f });
    furniture(ctx, hs, 'theke', 0, -2.5); furniture(ctx, hs, 'herd', 4, -3.6); for (let i = 0; i < 3; i++) furniture(ctx, hs, 'tisch', -4 + i * 4, 2);
    const open = () => !!api.flag('krabbe_offen');
    floatLabel(ctx, k.x, ky + 9, k.z, 'Knusper-Krabbe', '🦀', 1);
    spot(ctx, 'grill', hs.f.at(4, -2).x, hs.f.at(4, -2).z, '🍔', () => open() ? 'Burger braten' : 'Der Grill ist kalt …', () => { if (api.questStage('w_schwamm') >= 1 || open()) api.startMinigame('burger'); else api.toast('Käpt’n Zangenfuß hat das Rezept vergessen. Frag ihn!', '🦀'); }, { r: 2.6 });
    spot(ctx, 'theke_krabbe', hs.f.at(0, -1).x, hs.f.at(0, -1).z, '🛎️', () => open() ? 'Bestellen' : 'Geschlossen', () => { if (open()) api.openShop('krabbe'); else api.toast('Leider geschlossen – „Wegen Rezept-Vergesslichkeit“.', '🚪'); }, { r: 2.4 });
    // Fruchthaus
    const fh = swa(-24, 14), fy = ctx.h(fh.x, fh.z);
    b.sph(fh.x, fy + 3, fh.z, 3.2, 0xffa21f, { sy: 1.3 }); for (let i = 0; i < 7; i++) b.cone(fh.x + Math.cos(i) * 0.8, fy + 6.5, fh.z + Math.sin(i) * 0.8, 0.5, 2.5, 0x3fae46, 5, { rx: Math.sin(i) * 0.5, rz: Math.cos(i) * 0.5 });
    b.cyl(fh.x, fy + 1, fh.z + 3, 0.7, 0.7, 0.15, 0x3f8cff, 14, { rx: Math.PI / 2 }); ctx.circle(fh.x, fh.z, 3.2, fy - 1, fy + 6);
    // Sternchens Stein, Tadeus' Haus
    const st = swa(-30, -14); b.sph(st.x, ctx.h(st.x, st.z), st.z, 2.5, 0x8a7a6a, { sy: 0.6 }); ctx.circle(st.x, st.z, 2.4, ctx.h(st.x, st.z) - 1, ctx.h(st.x, st.z) + 1.5);
    const td = swa(-10, 24); b.box(td.x, ctx.h(td.x, td.z), td.z, 3.5, 6, 3.5, 0x6a8aa8); b.sph(td.x, ctx.h(td.x, td.z) + 4.5, td.z + 1.8, 0.5, 0x222222); ctx.box(td.x, td.z, 3.5, 3.5, ctx.h(td.x, td.z) - 1, ctx.h(td.x, td.z) + 6);
    for (let i = 0; i < 20; i++) { const a = i * 0.31; const p = swa(Math.cos(a) * (34 + (i % 3) * 5), Math.sin(a) * (34 + (i % 3) * 5)); ctx.tree('koralle', p.x, p.z, 1 + (i % 3) * 0.3, false); }
    // Quallen
    for (let i = 0; i < 3; i++) {
      const p = swa(20 + i * 5, 14 + (i % 2) * 7), y = ctx.h(p.x, p.z), flag = 'qualle_' + i;
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex('🪼'), transparent: true })); (spr.material as THREE.Material).userData.disposeWithWorld = true;
      spr.scale.setScalar(1.2); ctx.add(spr);
      ctx.onUpdate((_d, t) => { spr.visible = !api.flag(flag) || api.questStage('w_schwamm') < 0; spr.position.set(p.x + Math.sin(t + i) * 1.5, y + 1.5 + Math.sin(t * 2 + i) * 0.5, p.z + Math.cos(t * 0.7 + i)); });
      spot(ctx, 'qualle' + i, p.x, p.z, '🪼', () => api.has('kescher') ? 'Qualle fangen (sanft!)' : 'Eine Qualle (Kescher nötig)', () => {
        if (api.flag(flag)) return;
        if (!api.has('kescher')) { api.toast('Mit einem Kescher könntest du die Qualle sanft einfangen.', '🥅'); return; }
        api.setFlag(flag); api.give('qualle', 1); api.sfx('splash');
      }, { r: 3, when: () => !api.flag(flag) });
    }
    arcade(ctx, 'burger', swa(10, 2).x, swa(10, 2).z, Math.PI, 'burger', 'Burger-Bestellung', '🍔', 0xe8453c);
    pickup(ctx, 'sw_splitter', k.x, k.z + 7, 'splitter', { when: () => open() && api.questStage('w_schwamm') >= 3, label: 'Kompass-Splitter im Burgerbrötchen (!)' });
    chest(ctx, 'fruchthaus', fh.x + 4, fh.z + 2, 0, { stars: 8, item: ['muschel', 2] });
  }
};
export const SCHWAMM_NPCS: NpcDef[] = [
  npc('schwamm', 'schwammi', 'Schwammi', '🧽', 'Fröhlicher Schwamm', swa(-18, 10).x, swa(-18, 10).z, ['Ich bin bereit! Ich bin bereit!', 'Hallo, Freundin, hallo, Freund!'], ['Die Knusper-Krabbe ist zu – das ist der traurigste Tag meines Lebens!', 'Quallenfischen ist das Allerschönste. Aber immer sanft, versprochen!'], { look: { skin: 2, hair: 'glatze', top: 'jacke', topColor: 9, bottom: 'shorts', bottomColor: 12, build: 2 }, emotes: ['cheer', 'laugh'] }),
  npc('schwamm', 'zangenfuss', 'Käpt’n Zangenfuß', '🦀', 'Besitzer der Knusper-Krabbe', swa(2, -2).x, swa(2, -2).z, ['Arr, Kundschaft! Aber … ich kann nichts verkaufen.', 'Hallo!'], ['Mein Geheimrezept! Seit dem Sturm ist es wie weggeblasen!', 'Eine Krabbe ohne Burger ist wie ein Meer ohne Wasser.'], { look: { skin: 12, hair: 'glatze', top: 'jacke', topColor: 0, hat: 'piratenhut', hatColor: 11, age: 2, beard: 'schnurr', hairColor: 5 } }),
  npc('schwamm', 'tadeus', 'Tadeus Tintenfuß', '🐙', 'Klarinettist', swa(-8, 20).x, swa(-8, 20).z, ['Hmpf. Was willst du?', 'Oh. Ein Besucher. Wie … nett.'], ['Für meine Klarinette brauche ich Quallen-Gelee. Es macht die Töne weich.', 'Ich spiele großartig. Niemand weiß es zu schätzen.'], { look: { skin: 9, hair: 'glatze', top: 'tshirt', topColor: 14, age: 2 }, wander: 2 }),
  npc('schwamm', 'sternchen', 'Sternchen', '⭐', 'Bester Freund', swa(-28, -8).x, swa(-28, -8).z, ['Hä? Oh! Hallo!', 'Ich hab nachgedacht. Über … hab’s vergessen.'], ['Unter meinem Stein ist es gemütlich.'], { look: { skin: 11, hair: 'glatze', top: 'tshirt', topColor: 4, bottom: 'shorts', bottomColor: 3 }, wander: 2 })
];
export const SCHWAMM_QUESTS: QuestDef[] = [
  { id: 'w_schwamm', title: 'Die geschlossene Krabbe', icon: '🦀', world: 'schwamm', kind: 'world', giver: 'zangenfuss',
    summary: 'Käpt’n Zangenfuß hat sein Geheimrezept vergessen. Die Knusper-Krabbe bleibt zu.',
    offer: { start: { t: 'Arr! Ich weiß nur noch: Das Rezept steckt in den Bestellungen meiner Stammgäste! Schwammi kennt sie alle auswendig. Hilfst du mir?', choices: [{ t: '🍔 Ich helfe!', do: [{ start: 'w_schwamm' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Frag Schwammi nach den Bestellungen.', hints: ['Schwammi ist bei seinem Fruchthaus.', 'Das orange Ananas-Haus im Westen.', 'Sprich mit Schwammi.'], objectives: [{ id: 's', type: 'talk', target: 'schwammi', label: 'Sprich mit Schwammi' }],
        dialog: { schwammi: { start: { t: 'Die Bestellungen? Natürlich! Brötchen, Patty, Käse, Salat, Tomate – in genau der Reihenfolge, die der Gast sagt! Ich zeig’s dir am Grill!', emote: 'cheer', end: false } } } },
      { text: 'Brate Burger nach Bestellung (am Grill in der Krabbe oder am Automaten).', hints: ['Der Grill steht hinten in der Knusper-Krabbe.', 'Merke dir die Reihenfolge der Zutaten und tippe sie nach.', 'Schaffe 6 Zutaten am Stück.'], objectives: [{ id: 'b', type: 'minigame', target: 'burger', label: 'Brate eine perfekte Bestellung' }] },
      { text: 'Tadeus möchte für die Eröffnung Klarinette spielen – bring ihm 3 Quallen-Gelee (sanft mit dem Kescher fangen).', hints: ['Die Quallen schweben im Quallenfeld im Osten.', 'Du brauchst einen Kescher (Spielzeugladen oder Maja).', 'Qualle anstupsen, Gelee einsammeln, zu Tadeus bringen.'],
        objectives: [{ id: 'q', type: 'have', target: 'qualle', via: 'qualle', n: 3, label: 'Sammle Quallen-Gelee' }, { id: 't', type: 'talk', target: 'tadeus', label: 'Gib Tadeus das Gelee' }],
        dialog: { tadeus: { start: { t: 'Hmpf. Danke. … Wirklich, danke. Ich spiele heute Abend zur Eröffnung. Du darfst zuhören. Wenn du willst.', do: [{ take: ['qualle', 3] }, { friend: 3 }, { flag: 'krabbe_offen' }], end: false } } } },
      { text: 'Die Knusper-Krabbe ist offen! Im ersten Burger steckt … etwas Leuchtendes.', hints: ['Vor der Knusper-Krabbe.', 'Heb den Splitter auf.', 'Sprich danach mit Zangenfuß.'], objectives: [{ id: 's', type: 'interact', target: 'pick:sw_splitter', label: 'Nimm den Splitter' }, { id: 'z', type: 'talk', target: 'zangenfuss', label: 'Sprich mit Zangenfuß' }],
        dialog: { zangenfuss: { start: { t: 'ARR! Die Krabbe ist offen, die Gäste sind da! Ab heute ist jeder fünfte Burger für dich gratis!', do: [{ give: ['burger', 2] }, { friend: 3 }], end: false } } } }
    ],
    rewards: { stars: 25, xp: 130, flag: 'done_schwamm', text: 'Die Knusper-Krabbe brutzelt wieder!' } }
];

/* =====================================================================  ATLANTIS (unterirdisch)  */
const AT = ISLES.atlantis, ata = (dx: number, dz: number) => at('atlantis', dx, dz);
export const atlantis: WorldDef = {
  id: 'atlantis', name: 'Atlantis', icon: '🔱', chapter: 6, theme: 'atlantis', underground: true,
  desc: 'Die Stadt unter der Erde: Ringe aus Land und Wasser, Kristall-Harfe, Hologramm-Archiv.',
  shape: isle('atlantis', { height: 1.2, grass: 0x4fbfa0, grass2: 0x3fae90, beach: 4, bumps: 0.4, noSea: true,
    hills: [{ x: AT.x, z: AT.z, r: 16, h: 6, tiers: 3 }],
    colorFn: (x, z) => { const d = Math.hypot(x - AT.x, z - AT.z); if (d > 26 && d < 34) return 0x2a8ab0; if (d > 56 && d < 62) return 0x2a8ab0; return null; } }),
  spawn: { x: AT.x, z: AT.z + 76, yaw: Math.PI },
  pois: { tempel: { ...ata(0, 0), name: 'Tempel des Herzens', icon: '🏛️' }, harfe: { ...ata(-40, -10), name: 'Kristall-Harfe', icon: '🎵' }, archiv: { ...ata(40, 10), name: 'Hologramm-Archiv', icon: '📜' }, treppe: { ...ata(0, 80), name: 'Treppe nach oben', icon: '⬆️' } },
  vehicles: [{ type: 'gleiter', ...ata(12, 66), yaw: Math.PI }],
  groundCover: { grass: 0.3, flowers: [0x9fe8ff, 0xb36bff] },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    // Kuppel
    const dome = new THREE.Mesh(new THREE.SphereGeometry(110, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x0b3550, side: THREE.BackSide }));
    (dome.material as THREE.Material).userData.disposeWithWorld = true; dome.position.set(AT.x, -2, AT.z); ctx.add(dome);
    for (let i = 0; i < 80; i++) { const a = Math.random() * Math.PI * 2, e = Math.random() * 1.2 + 0.2; ctx.glow.sph(AT.x + Math.cos(a) * Math.cos(e) * 105, Math.sin(e) * 105, AT.z + Math.sin(a) * Math.cos(e) * 105, 0.8, [0x9fe8ff, 0xb36bff, 0xffffff][i % 3]); }
    // Wasserringe
    for (const [r0, r1] of [[26, 34], [56, 62]]) { const wm = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3fd3e0, transparent: true, opacity: 0.75, roughness: 0.2 })); (wm.material as THREE.Material).userData.disposeWithWorld = true; wm.position.set(AT.x, 0.9, AT.z); ctx.add(wm);
      for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2; if (i % 8 === 0) continue; ctx.box(AT.x + Math.cos(a) * (r0 + r1) / 2, AT.z + Math.sin(a) * (r0 + r1) / 2, (r1 - r0) + 0.5, 2 * Math.PI * (r0 + r1) / 2 / 32 + 0.3, -2, 3, -a, { noWalk: true }); } }
    // Brücken über die Ringe (bei den Lücken)
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2; for (const r of [30, 59]) { const x = AT.x + Math.cos(a) * r, z = AT.z + Math.sin(a) * r; b.box(x, 1.0, z, 4, 0.3, 10, 0xdcd0ff, { ry: -a + Math.PI / 2 }); ctx.box(x, z, 4, 10, -2, 1.3, -a + Math.PI / 2); } }
    // Tempel
    const ty = ctx.h(AT.x, AT.z);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.cyl(AT.x + Math.cos(a) * 6, ty, AT.z + Math.sin(a) * 6, 0.5, 0.6, 6, 0xf4f0ff, 10); }
    b.cyl(AT.x, ty + 6, AT.z, 7.5, 7.5, 0.6, 0xf4f0ff, 20); b.cone(AT.x, ty + 6.6, AT.z, 7.5, 3, 0xffc83d, 20);
    const heart = new THREE.Mesh(new THREE.OctahedronGeometry(1.4), new THREE.MeshBasicMaterial({ color: 0x555577 })); (heart.material as THREE.Material).userData.disposeWithWorld = true;
    heart.position.set(AT.x, ty + 2.5, AT.z); ctx.add(heart);
    ctx.onUpdate((_d, t) => { heart.rotation.y = t; const on = api.flag('herz_atlantis'); (heart.material as THREE.MeshBasicMaterial).color.setHex(on ? 0x7fffe8 : 0x555577); heart.scale.setScalar(on ? 1 + Math.sin(t * 3) * 0.12 : 1); });
    spot(ctx, 'herz', AT.x, AT.z + 3, '💠', () => api.flag('herz_atlantis') ? 'Das Herz von Atlantis leuchtet ✅' : 'Orichalcum ins Herz legen (' + api.count('orichalcum') + '/5)', () => {
      if (api.flag('herz_atlantis')) return;
      if (!api.flag('harfe_gespielt')) { api.toast('Das Herz ist stumm. Erst muss die Kristall-Harfe erklingen …', '🎵'); return; }
      if (api.count('orichalcum') < 5) { api.toast('Das Herz braucht 5 Orichalcum-Splitter.', '🔶'); return; }
      api.take('orichalcum', 5); api.setFlag('herz_atlantis'); api.burst(AT.x, ty + 3, AT.z, [0x7fffe8, 0xffffff, 0xb36bff], 80); api.toast('Bumm … bumm … Das Herz von Atlantis schlägt wieder!', '💠', 4000);
    }, { r: 3.5, priority: 2 });
    // Harfe
    const hp = ata(-40, -10); for (let i = 0; i < 5; i++) ctx.glow.cone(hp.x + (i - 2) * 1.4, ctx.h(hp.x, hp.z), hp.z, 0.4, 2 + i * 0.4, [0x9fe8ff, 0x7fd8ff, 0x4cd07d, 0xffd23f, 0xb36bff][i], 5);
    spot(ctx, 'harfe', hp.x, hp.z + 3, '🎵', 'Die Kristall-Harfe spielen', () => api.startMinigame('harfe'), { r: 3.5 });
    // Archiv
    const ar = ata(40, 10); house(ctx, { x: ar.x, z: ar.z, rot: -1.57, w: 12, d: 10, h: 5, wall: 0xdcd0ff, roof: 0x7fd8ff, enter: true, name: 'Hologramm-Archiv', icon: '📜', roofType: 'dome' });
    spot(ctx, 'archiv', ar.x - 2, ar.z, '📜', 'Hologramm der Sage ansehen', () => api.openPanel('note', 'Die alte Sage erzählt von einer Stadt aus Ringen, mit einem Herzen aus leuchtendem Metall. Ob es Atlantis wirklich gab, weiß niemand – aber hier, unter der Bunten Insel, gibt es eines!'));
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.4; const p = ata(Math.cos(a) * 46, Math.sin(a) * 46); house(ctx, { ...p, rot: -a, w: 7, d: 6, wall: 0xe6f0ff, roof: 0x2fb9a8, roofType: 'dome', enter: i % 2 === 0 }); }
    for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.2; pickup(ctx, 'orich' + i, ata(Math.cos(a) * 70, Math.sin(a) * 70).x, ata(Math.cos(a) * 70, Math.sin(a) * 70).z, 'orichalcum', { glow: 0xffa21f }); }
    for (let i = 0; i < 16; i++) { const a = i * 0.39; const p = ata(Math.cos(a) * 80, Math.sin(a) * 80); ctx.tree(i % 2 ? 'koralle' : 'kristall', p.x, p.z, 1.2, false); }
    // Treppe nach oben
    const tr = ata(0, 82); arch(ctx, tr.x, tr.z, 0, 5, 4.2, 0x7fd8ff, 0x2fb9a8);
    spot(ctx, 'atlantis_out', tr.x, tr.z, '⬆️', 'Die Treppe zur Hauptinsel hinaufsteigen', () => api.teleport(96, 96, Math.PI), { r: 3.5, priority: 2 });
    pickup(ctx, 'at_splitter', AT.x, AT.z - 3, 'splitter', { when: () => !!api.flag('herz_atlantis'), label: 'Kompass-Splitter im Licht des Herzens', y: ty + 0.2 });
    const light = new THREE.PointLight(0x7fffe8, 1.2, 60); light.position.set(AT.x, ty + 8, AT.z); ctx.add(light);
  }
};
export const ATLANTIS_NPCS: NpcDef[] = [
  npc('atlantis', 'thalassa', 'Archivarin Thalassa', '🧜‍♀️', 'Hüterin des Archivs', ata(6, 14).x, ata(6, 14).z, ['Willkommen in Atlantis, Oberflächenkind.', 'Sei gegrüßt.'], ['Das Herz von Atlantis schlägt im Takt der Kristall-Harfe.', 'Orichalcum ist das Metall, aus dem das Herz gemacht ist.'], { look: { hair: 'lang', hairColor: 13, top: 'kleid', topColor: 4, skin: 9 } }),
  npc('atlantis', 'nerio', 'Delfinwächter Nerio', '🐬', 'Wächter', ata(-8, 68).x, ata(-8, 68).z, ['Plätscher! Hallo!', 'Willkommen!'], ['Mit dem Aqua-Gleiter kommst du schnell über die Wasserringe.'], { look: { hair: 'kurz', hairColor: 13, top: 'jacke', topColor: 4, skin: 9 } })
];
export const ATLANTIS_QUESTS: QuestDef[] = [
  { id: 'w_atlantis', title: 'Das stille Herz', icon: '💠', world: 'atlantis', kind: 'world', giver: 'thalassa',
    summary: 'Das Herz von Atlantis ist verstummt. Ohne seinen Schlag erlischt das Licht der Stadt.',
    offer: { start: { t: 'Das Herz unserer Stadt schweigt. Erst muss die Kristall-Harfe es wecken, dann braucht es fünf Orichalcum-Splitter. Bitte hilf uns!', choices: [{ t: '💠 Ich helfe!', do: [{ start: 'w_atlantis' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Spiel die Melodie an der Kristall-Harfe nach und sammle 5 Orichalcum-Splitter am äußeren Ring.', hints: ['Die Harfe steht im Westen, das Orichalcum am äußersten Ring.', 'Die Harfe: Hör zu und tippe die Kristalle in derselben Reihenfolge.', 'Merke dir 7 Töne – und lauf einmal den äußeren Ring ab.'],
        objectives: [{ id: 'h', type: 'minigame', target: 'harfe', label: 'Spiel die Kristall-Harfe' }, { id: 'o', type: 'have', target: 'orichalcum', n: 5, label: 'Sammle Orichalcum' }], onDone: [{ flag: 'harfe_gespielt' }] },
      { text: 'Leg das Orichalcum ins Herz im Tempel.', hints: ['Der Tempel steht in der Mitte auf dem Stufenberg.', 'Das Herz schwebt zwischen den Säulen.', 'Aktion drücken.'], objectives: [{ id: 'h', type: 'flag', target: 'herz_atlantis', via: 'herz', label: 'Wecke das Herz von Atlantis' }] },
      { text: 'Im Licht des Herzens schwebt ein Splitter. Danach zu Thalassa.', hints: ['Direkt neben dem Herzen.', 'Thalassa ist am Tempel.', 'Splitter nehmen, Thalassa ansprechen.'], objectives: [{ id: 's', type: 'interact', target: 'pick:at_splitter', label: 'Nimm den Splitter' }, { id: 't', type: 'talk', target: 'thalassa', label: 'Sprich mit Thalassa' }],
        dialog: { thalassa: { start: { t: 'Atlantis leuchtet wieder! Nimm diese Taucherblase – damit schwimmst du schneller als jeder Fisch.', do: [{ ability: 'taucherblase' }, { friend: 4 }], end: false } } } }
    ],
    rewards: { stars: 30, xp: 140, flag: 'done_atlantis', text: 'Das Herz von Atlantis schlägt wieder.' } }
];

/* =====================================================================  FUNKWELLE  */
const FW = ISLES.funkwelle, fwa = (dx: number, dz: number) => at('funkwelle', dx, dz);
export const funkwelle: WorldDef = {
  id: 'funkwelle', name: 'Funkwelle', icon: '📻', chapter: 6, theme: 'radio',
  desc: 'Die Radio-Welt mit Funkturm, Sender-Plätzen und schwebenden Noten.',
  shape: isle('funkwelle', { height: 1.1, grass: 0x8fd6c0, grass2: 0x7fc8b0, beach: 7, bumps: 0.4, flats: [{ x: FW.x, z: FW.z, r: 30, y: 1.1 }], paths: [pathTo('funkwelle', 0, 0, 6, 0xd8d0f0)],
    paints: [{ x: FW.x, z: FW.z, r: 24, color: 0x2a1f4a }, { x: FW.x, z: FW.z, r: 24, color: 0xff5fb0, ring: 0.8 }, { x: FW.x, z: FW.z, r: 16, color: 0x3fa9ff, ring: 0.8 }] }),
  spawn: spawnFrom('funkwelle', 'hub'),
  pois: { turm: { ...fwa(0, 0), name: 'Funkturm', icon: '📡' }, buehne: { ...fwa(-20, 20), name: 'DJ-Pult', icon: '🎧' } },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    const y = ctx.h(FW.x, FW.z);
    for (let i = 0; i < 6; i++) { const s = 3 - i * 0.4; b.box(FW.x, y + i * 5, FW.z, s, 5, s, i % 2 ? 0xffffff : 0xe8453c); }
    ctx.glow.sph(FW.x, y + 31, FW.z, 0.8, 0xff5fb0); ctx.box(FW.x, FW.z, 3, 3, y - 1, y + 30);
    floatLabel(ctx, FW.x, y + 34, FW.z, 'Funkturm', '📡', 1.2);
    const senders = ['Sonnenfunk', 'Inselwelle', 'Regenbogen-Radio', 'Sternenkanal', 'Drachen-FM', 'Hafenklang'];
    senders.forEach((nm, i) => {
      const a = (i / senders.length) * Math.PI * 2, p = fwa(Math.cos(a) * 20, Math.sin(a) * 20), yy = ctx.h(p.x, p.z);
      b.box(p.x, yy, p.z, 2.4, 1.6, 1.4, 0x5b4bd6, { ry: -a }); ctx.glow.box(p.x, yy + 1.62, p.z, 2, 0.05, 1, [0xff5fb0, 0x3fa9ff, 0xffd23f][i % 3], { ry: -a });
      ctx.box(p.x, p.z, 2.4, 1.4, yy, yy + 1.6, -a);
      floatLabel(ctx, p.x, yy + 3, p.z, nm, '📻', 0.45);
      spot(ctx, 'sender' + i, p.x, p.z, '📻', 'Sender einschalten: ' + nm, () => { const on = api.flag('sender_' + i); api.setFlag('sender_' + i, on ? 0 : 1); for (let k = 0; k < 4; k++) api.sfx('note' + ((i + k * 2) % 8), 0.4); api.toast(on ? nm + ' aus.' : '♪ ' + nm + ' spielt fröhliche Inselmusik!', '📻'); }, { r: 2.6 });
    });
    arcade(ctx, 'frequenz', fwa(0, 8).x, fwa(0, 8).z, 0, 'frequenz', 'Frequenz-Dreher', '📻', 0xff5fb0);
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.5; pickup(ctx, 'note' + i, fwa(Math.cos(a) * 38, Math.sin(a) * 38).x, fwa(Math.cos(a) * 38, Math.sin(a) * 38).z, 'note', { y: ctx.h(fwa(Math.cos(a) * 38, Math.sin(a) * 38).x, fwa(Math.cos(a) * 38, Math.sin(a) * 38).z) + 0.8, when: () => api.questStage('w_funkwelle') >= 0 }); }
    for (let i = 0; i < 14; i++) { const a = i * 0.45; const p = fwa(Math.cos(a) * 46, Math.sin(a) * 46); ctx.tree(i % 2 ? 'bunt' : 'laub', p.x, p.z, 0.9); }
    pickup(ctx, 'fw_splitter', FW.x + 3, FW.z + 3, 'splitter', { when: () => api.questStage('w_funkwelle') >= 2, label: 'Kompass-Splitter am Fuß des Funkturms' });
  }
};
export const FUNKWELLE_NPCS: NpcDef[] = [
  npc('funkwelle', 'lumi', 'DJ Lumi', '🎧', 'Radiomacherin', fwa(-6, 10).x, fwa(-6, 10).z, ['Yo! Willkommen auf der Funkwelle!', 'Hey! Schon reingehört?'], ['Seit dem Sturm rauscht es auf allen Kanälen. Kkkhhhrrr!', 'Musik verbindet alle Inseln – wenn die Sender funktionieren.'], { look: { hair: 'irokese', hairColor: 10, top: 'hoodie', topColor: 7, glasses: 'sonne', skin: 5 }, emotes: ['dance'] })
];
export const FUNKWELLE_QUESTS: QuestDef[] = [
  { id: 'w_funkwelle', title: 'Rauschen auf allen Kanälen', icon: '📻', world: 'funkwelle', kind: 'world', giver: 'lumi',
    summary: 'Der Sturm hat die Frequenzen durcheinandergewirbelt und die Noten der Sender über die Insel verstreut.',
    offer: { start: { t: 'Kkkhhrrr – hörst du das? Nur Rauschen! Die Noten unserer Sender sind weggeweht, und die Frequenzen stimmen nicht mehr. Hilfst du mir?', choices: [{ t: '🎵 Na klar!', do: [{ start: 'w_funkwelle' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Sammle die 6 weggewehten Noten am Inselrand.', hints: ['Die Noten schweben am Rand der Insel.', 'Lauf einmal außen herum.', 'Sechs leuchtende 🎵.'], objectives: [{ id: 'n', type: 'have', target: 'note', n: 6, label: 'Sammle Noten' }] },
      { text: 'Stell am Frequenz-Dreher die Sender wieder ein und bring Lumi die Noten.', hints: ['Der Automat steht vor dem Funkturm.', 'Stoppe die Nadel im grünen Bereich – 5 von 8.', 'Danach mit Lumi sprechen.'],
        objectives: [{ id: 'f', type: 'minigame', target: 'frequenz', label: 'Gewinne den Frequenz-Dreher' }, { id: 'l', type: 'talk', target: 'lumi', label: 'Gib Lumi die Noten' }],
        dialog: { lumi: { start: { t: 'Wahnsinn, alle Sender klingen wieder glasklar! Hörst du? Auf dem Sternenkanal läuft gerade das Lied vom traurigen Wölkchen …', do: [{ take: ['note', 6] }, { friend: 3 }], end: false } } } },
      { text: 'Am Fuß des Funkturms leuchtet ein Splitter.', hints: ['Direkt am Turm.', 'Mitte der Insel.', 'Aufheben.'], objectives: [{ id: 's', type: 'interact', target: 'pick:fw_splitter', label: 'Nimm den Splitter' }] }
    ],
    rewards: { stars: 25, xp: 120, flag: 'done_funkwelle', cosmetic: 'hat:katzenohren', text: 'Die Funkwelle sendet wieder auf allen Kanälen.' } }
];

/* =====================================================================  LUNARIS  */
const LU = ISLES.lunaris, lua = (dx: number, dz: number) => at('lunaris', dx, dz);
export const lunaris: WorldDef = {
  id: 'lunaris', name: 'Lunaris', icon: '🦊', chapter: 7, theme: 'zotik',
  desc: 'Die Hauptstadt der Splitter aus dem Zotik-Universum: Mondkristall-Brunnen, Burghügel, Luftschiff.',
  shape: isle('lunaris', { height: 1.3, grass: 0x8a9fe0, grass2: 0x7a8fd0, beach: 8, bumps: 0.6, hills: [{ ...lua(28, -22), r: 22, h: 12, tiers: 6 }], flats: [{ x: LU.x, z: LU.z, r: 20, y: 1.3 }],
    paths: [pathTo('lunaris', -20, 302, 6, 0xd8d0f0)], paints: [{ x: LU.x, z: LU.z, r: 18, color: 0xd8d0f0 }, { x: LU.x, z: LU.z, r: 18, color: 0x9f8fff, ring: 1 }] }),
  spawn: spawnFrom('lunaris', 'fellretter'),
  pois: { brunnen: { ...lua(0, 0), name: 'Mondkristall-Brunnen', icon: '🌙' }, burg: { ...lua(28, -22), name: 'Burg Lunaris', icon: '🏰' }, markt: { ...lua(-22, -8), name: 'Markt Wanderhand', icon: '🦊' }, hafen: { ...lua(-12, 34), name: 'Luftschiff-Hafen', icon: '🎈' } },
  vehicles: [{ type: 'nautilux', ...lua(-14, 40), yaw: 0 }],
  groundCover: { grass: 0.8, flowers: [0x9fe8ff, 0xd8d0f0, 0xffd23f] },
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    fountain(ctx, LU.x, LU.z, 4, 0xd8d0f0, 0x9f8fff);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 80, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfd0ff, transparent: true, opacity: 0.35, depthWrite: false }));
    (beam.material as THREE.Material).userData.disposeWithWorld = true; beam.position.set(LU.x, 42, LU.z); ctx.add(beam);
    spot(ctx, 'mondkristall', LU.x, LU.z + 5, '🌙', 'Die Mondkristall-Melodie spielen', () => api.startMinigame('mondkristall'), { r: 3.5 });
    const bg = lua(28, -22), by = ctx.h(bg.x, bg.z);
    house(ctx, { x: bg.x, z: bg.z, w: 14, d: 10, h: 7, wall: 0xd8d0f0, roof: 0x5b4bd6, enter: true, name: 'Burg Lunaris', icon: '🏰', roofType: 'flat' });
    for (const [dx, dz] of [[-7, -5], [7, -5], [-7, 5], [7, 5]]) { b.cyl(bg.x + dx, by, bg.z + dz, 1.6, 1.8, 12, 0xd8d0f0, 12); b.cone(bg.x + dx, by + 12, bg.z + dz, 2.2, 4, 0x5b4bd6, 12); ctx.circle(bg.x + dx, bg.z + dz, 1.8, by, by + 12); }
    const mk = lua(-22, -8); for (let i = 0; i < 4; i++) stall(ctx, mk.x + (i % 2) * 6, mk.z + Math.floor(i / 2) * 6, 0.5 + i, [0x9f8fff, 0xffa21f, 0x2fb9a8, 0xff5fb0][i], [0x9fe8ff, 0xffd23f, 0xffffff]);
    house(ctx, { ...lua(-26, 14), rot: 1.4, w: 9, d: 8, wall: 0xc8b8a8, roof: 0x8a5a33, enter: true, name: 'Taverne', icon: '🍺' });
    tower(ctx, lua(16, 22).x, lua(16, 22).z, 2.6, 16, 0xd8d0f0, 0x9f8fff);
    for (let i = 0; i < 20; i++) { const a = i * 0.31; const p = lua(Math.cos(a) * (44 + (i % 3) * 4), Math.sin(a) * (44 + (i % 3) * 4)); ctx.tree('mond', p.x, p.z, 1 + (i % 3) * 0.15); }
    for (let i = 0; i < 8; i++) { const a = i * 0.8 + 0.2; pickup(ctx, 'mondspl' + i, lua(Math.cos(a) * 32, Math.sin(a) * 32).x, lua(Math.cos(a) * 32, Math.sin(a) * 32).z, 'mondsplitter', { glow: 0x9f8fff }); }
    // Tor ins eigene Zotik-Spiel
    const gate = lua(-38, -24); arch(ctx, gate.x, gate.z, 0.8, 5, 5, 0x19f0ff, 0x7a3cff);
    spot(ctx, 'zotik_tor', gate.x, gate.z, '🌀', 'Tor ins Zotik-Spiel (andere Spiel-Seite)', () => api.openPanel('dialog', { tree: { start: { t: 'Dieses Tor führt ins eigenständige Spiel „ZOTIK – Die Splitter der Welten“. Möchtest du hinüberreisen? (Dein Spielstand wird vorher gespeichert.)', choices: [{ t: '🌀 Hinüberreisen', do: [{ panel: 'zotikTor' }] }, { t: 'Noch nicht' }] } } }), { r: 3 });
  }
};
export const LUNARIS_NPCS: NpcDef[] = [
  npc('lunaris', 'mira', 'Mira', '🦊', 'Hüterin von Lunaris', lua(4, 6).x, lua(4, 6).z, ['Willkommen in Lunaris, Reisende, Reisender.', 'Der Mondkristall grüßt dich.'], ['Lunaris ist die Hauptstadt der Splitter. Hier treffen sich Reisende aus vielen Welten.', 'Zotik, der Weltenhörer, war auch schon hier. Er hört die Lieder aller Welten.'], { look: { hair: 'lang', hairColor: 7, top: 'robe', topColor: 6, acc: 'fuchs', skin: 12 } }),
  npc('lunaris', 'rurik', 'Händler Rurik', '🧺', 'Markt Wanderhand', lua(-20, -4).x, lua(-20, -4).z, ['Frische Waren aus allen Welten!', 'Ahh, Kundschaft!'], ['Für 10 Mondsplitter gebe ich dir 5 Sterne. Fairer Handel!'], { look: { hair: 'kurz', hairColor: 2, beard: 'voll', top: 'jacke', topColor: 13, acc: 'fuchs', skin: 12, age: 2 }, wander: 2, shop: 'wanderhand', topics: [{ label: 'Mondsplitter tauschen', to: 'tausch' }],
    dialog: { tausch: { t: 'Zeig her! Für je 5 Mondsplitter gibt es 3 Sterne.', choices: [{ t: '🔄 5 Mondsplitter tauschen', if: { has: 'mondsplitter', n: 5 }, do: [{ take: ['mondsplitter', 5] }, { stars: 3 }], to: 'tausch' }, { t: 'Danke, das war’s.' }] } } }),
  npc('lunaris', 'felli_npc', 'Moosling Felli', '🌿', 'Kleiner Moosling', lua(-6, -10).x, lua(-6, -10).z, ['Mmmoos!', 'Piep!'], ['(Felli lässt ein Gänseblümchen wachsen.)'], { creature: { kind: 'moosling', scale: 0.6 }, wander: 6 })
];
export const LUNARIS_QUESTS: QuestDef[] = [
  { id: 'w_lunaris', title: 'Der Ruf des Kristalls', icon: '🌙', world: 'lunaris', kind: 'world', giver: 'mira',
    summary: 'Der Mondkristall singt nur noch leise. Seine Melodie muss wieder erklingen.',
    offer: { start: { t: 'Der Mondkristall hat seine Melodie verloren. Wenn du sie nachspielst und Felli hilfst, wieder fröhlich zu werden, erstrahlt Lunaris wieder.', choices: [{ t: '🌙 Ich versuche es!', do: [{ start: 'w_lunaris' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Spiel am Mondkristall-Brunnen die Melodie der Mondphasen nach.', hints: ['Der Brunnen ist mitten auf dem Platz.', 'Hör zu und tippe die Monde nach.', '6 Töne schaffen.'], objectives: [{ id: 'm', type: 'minigame', target: 'mondkristall', label: 'Spiel die Mondkristall-Melodie' }] },
      { text: 'Felli ist traurig, weil der Sturm sein Moos zerzaust hat. Schenk ihm etwas Leckeres (Apfel oder Karotte).', hints: ['Felli hüpft auf dem Platz herum.', 'Sprich ihn an und wähle „Etwas schenken“.', 'Ein Apfel oder eine Karotte reicht.'], objectives: [{ id: 'f', type: 'flag', target: 'felli_froh', via: 'felli_npc', label: 'Mach Felli froh' }],
        dialog: { felli_npc: { start: { t: '(Felli schaut dich mit großen Augen an.)', choices: [{ t: '🍎 Apfel schenken', if: { has: 'apfel' }, do: [{ take: ['apfel', 1] }, { flag: 'felli_froh' }, { companion: 'felli' }], to: 'ok' }, { t: '🥕 Karotte schenken', if: { has: 'karotte' }, do: [{ take: ['karotte', 1] }, { flag: 'felli_froh' }, { companion: 'felli' }], to: 'ok' }, { t: 'Ich hab gerade nichts …' }] }, ok: { t: '(Felli hüpft vor Freude – überall wachsen Blümchen! Er möchte dich begleiten.)', end: false } } } },
      { text: 'Erzähl Mira davon.', hints: ['Mira steht am Brunnen.', 'Mitte.', 'Sprich mit Mira.'], objectives: [{ id: 'm', type: 'talk', target: 'mira', label: 'Sprich mit Mira' }],
        dialog: { mira: { start: { t: 'Hörst du? Der Kristall singt! Und Felli hat eine neue Freundin, einen neuen Freund gefunden. Lunaris dankt dir. Hier – der Fuchsschwanz der Wanderer!', do: [{ achieve: 'lunaris' }, { friend: 4 }], end: false } } } }
    ],
    rewards: { stars: 25, xp: 120, flag: 'done_lunaris', text: 'Der Mondkristall singt wieder.' } }
];

/* =====================================================================  TASCHI-LAND  */
const TA = ISLES.taschi, taa = (dx: number, dz: number) => at('taschi', dx, dz);
export const WILD_TASCHIS = [
  { id: 'glutzahn', name: 'Glutzahn', color: 0xff8a3d, color2: 0xfff1c0, variant: 0, dx: 24, dz: 18 },
  { id: 'wellino', name: 'Wellino', color: 0x4fc3ff, color2: 0xffffff, variant: 2, dx: -26, dz: 22 },
  { id: 'laubino', name: 'Laubino', color: 0x6fdc6a, color2: 0xfff6c0, variant: 3, dx: 30, dz: -20 },
  { id: 'blitzi', name: 'Blitzi', color: 0xffe14a, color2: 0xffffff, variant: 0, dx: -30, dz: -18 },
  { id: 'samenling', name: 'Samenling', color: 0xb5e86a, color2: 0xffd6f0, variant: 1, dx: 4, dz: 36 },
  { id: 'fellino', name: 'Fellino', color: 0xc8a07a, color2: 0xffffff, variant: 1, dx: -6, dz: -36 }
];
export const taschi: WorldDef = {
  id: 'taschi', name: 'Taschi-Land', icon: '🔴', chapter: 7, theme: 'spiel',
  desc: 'Die Insel der freundlichen Taschenwesen: Professor Ulme, hohes Gras und die runde Arena.',
  shape: isle('taschi', { height: 1.2, grass: 0x7fd65a, grass2: 0x5fbf44, beach: 8, bumps: 0.6, flats: [{ x: TA.x, z: TA.z, r: 16, y: 1.2 }], paths: [pathTo('taschi', 332, 0, 6, 0xe8d3a3)], paints: [{ x: TA.x, z: TA.z, r: 14, color: 0xe8d3a3 }],
    colorFn: (x, z) => { for (const t of WILD_TASCHIS) if (Math.hypot(x - TA.x - t.dx, z - TA.z - t.dz) < 8) return 0x3f9a3a; return null; } }),
  spawn: spawnFrom('taschi', 'park'),
  pois: { labor: { ...taa(-8, -14), name: 'Labor von Professor Ulme', icon: '🔬' }, arena: { ...taa(14, -2), name: 'Taschi-Arena', icon: '🏟️' }, gras: { ...taa(24, 18), name: 'Hohes Gras', icon: '🌾' } },
  vehicles: [{ type: 'ballon', ...taa(-40, 10), yaw: 0 }],
  build: (ctx: WorldCtx) => {
    const { api } = ctx;
    statue(ctx, TA.x, TA.z, Math.PI, 0xdcd0c0, 2, 'figur');
    const lab = house(ctx, { ...taa(-10, -16), w: 12, d: 9, wall: 0xffffff, roof: 0xe8453c, enter: true, name: 'Labor', icon: '🔬' });
    furniture(ctx, lab, 'tisch', 0, -1); furniture(ctx, lab, 'regal', -3, -3.6); furniture(ctx, lab, 'tv', 3, -3.6);
    house(ctx, { ...taa(-22, 4), rot: 1.57, w: 9, d: 8, wall: 0xffe3e3, roof: 0xff6fb5, enter: true, name: 'Heilhaus', icon: '💗' });
    house(ctx, { ...taa(-20, -4), rot: 1.57, w: 7, d: 6, wall: 0xdff0ff, roof: 0x3f8cff, enter: true, name: 'Fangladen', icon: '🔴' });
    const ar = taa(18, -2), ay = ctx.h(ar.x, ar.z);
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; if (i === 10) continue; ctx.b.box(ar.x + Math.cos(a) * 9, ay, ar.z + Math.sin(a) * 9, 3, 2 + (i % 2), 1, 0xe8453c, { ry: -a + Math.PI / 2 }); ctx.box(ar.x + Math.cos(a) * 9, ar.z + Math.sin(a) * 9, 3, 1, ay - 1, ay + 3, -a + Math.PI / 2); }
    arcade(ctx, 'taschimemory', ar.x, ar.z, 0, 'taschi_memory', 'Taschi-Memory', '🔴', 0xe8453c);
    for (let i = 0; i < 16; i++) { const a = i * 0.39; const p = taa(Math.cos(a) * 52, Math.sin(a) * 52); ctx.tree('laub', p.x, p.z, 1); }
    // Wilde Taschis: Vertrauen gewinnen mit Leckerli
    for (const t of WILD_TASCHIS) {
      const p = taa(t.dx, t.dz), flag = 'taschi_' + t.id;
      spot(ctx, 'taschi:' + t.id, p.x, p.z, '🔴', () => api.flag(flag) ? t.name + ' ist dein Freund ✅' : api.has('taschileckerli') ? 'Leckerli anbieten: ' + t.name : t.name + ' versteckt sich im Gras …', () => {
        if (api.flag(flag)) { api.toast(t.name + ' hüpft fröhlich!', '🔴'); return; }
        if (!api.has('taschileckerli')) { api.toast('Wilde Taschis sind scheu. Mit einem Taschi-Leckerli (Fangladen) gewinnst du ihr Vertrauen.', '🍬'); return; }
        api.take('taschileckerli', 1);
        const trust = (api.flag('vertrauen_' + t.id) || 0) + 1;
        api.setFlag('vertrauen_' + t.id, trust);
        if (trust >= 2) { api.setFlag(flag); api.burst(p.x, ctx.h(p.x, p.z) + 1, p.z, [t.color, 0xffffff], 24); api.toast(t.name + ' vertraut dir jetzt! Es zieht in deinen Taschiball ein.', '💗', 3500); api.events.emit('interact', { id: 'taschi_freund', kind: 'taschi' }); }
        else api.toast(t.name + ' schnuppert neugierig … noch ein Leckerli, dann traut es sich!', '🍬', 3000);
      }, { r: 3.2, when: () => !api.flag(flag) });
    }
  }
};
export const TASCHI_NPCS: NpcDef[] = [
  npc('taschi', 'ulme', 'Professor Ulme', '👨‍🔬', 'Taschi-Forscher', taa(-6, -8).x, taa(-6, -8).z, ['Ah, eine junge Forscherin, ein junger Forscher!', 'Willkommen im Taschi-Land!'], ['Taschis kämpft man nicht – man gewinnt ihr Vertrauen. Mit Geduld und Leckerli!', 'Jedes Taschi hat seinen eigenen Charakter.'], { look: { hair: 'strubbel', hairColor: 8, beard: 'kinn', top: 'jacke', topColor: 9, glasses: 'rund', age: 2 } }),
  npc('taschi', 'hanna', 'Schwester Hanna', '💗', 'Heilhaus', taa(-18, 4).x, taa(-18, 4).z, ['Hallo! Alles gesund bei dir und deinen Taschis?', 'Willkommen!'], ['Taschis lieben es, gestreichelt zu werden.'], { look: { hair: 'zopf', hairColor: 10, top: 'kleid', topColor: 9 }, wander: 2, shop: 'fangladen' }),
  ...WILD_TASCHIS.map(t => npc('taschi', 'wild_' + t.id, t.name, '🔴', 'Wildes Taschi', taa(t.dx, t.dz).x, taa(t.dx, t.dz).z, ['(' + t.name + ' piepst.)'], ['(' + t.name + ' wackelt mit den Ohren.)'], { creature: { kind: 'taschi', color: t.color, color2: t.color2, variant: t.variant }, wander: 5 }))
];
export const TASCHI_QUESTS: QuestDef[] = [
  { id: 'w_taschi', title: 'Der Weg des Vertrauens', icon: '🔴', world: 'taschi', kind: 'world', giver: 'ulme',
    summary: 'Seit dem Sturm sind die wilden Taschis scheu geworden. Professor Ulme zeigt dir, wie man ihr Vertrauen gewinnt.',
    offer: { start: { t: 'Die Taschis haben Angst vor dem grauen Wetter. Wir kämpfen nicht mit ihnen – wir gewinnen ihr Vertrauen! Hier, drei Leckerli für den Anfang. Freunde dich mit drei Taschis an!', choices: [{ t: '🔴 Wird gemacht!', do: [{ start: 'w_taschi' }, { give: ['taschileckerli', 3] }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Gewinne das Vertrauen von drei wilden Taschis (je zwei Leckerli).', hints: ['Taschis leben im dunklen hohen Gras.', 'Mehr Leckerli gibt es im Fangladen bei Schwester Hanna.', 'Bei jedem Taschi zweimal ein Leckerli anbieten.'], objectives: [{ id: 't', type: 'interact', target: 'taschi_freund', via: 'taschi:', n: 3, label: 'Freunde dich mit Taschis an' }] },
      { text: 'Erzähl Professor Ulme davon.', hints: ['Ulme ist am Labor.', 'Nordwestlich der Statue.', 'Sprich mit ihm.'], objectives: [{ id: 'u', type: 'talk', target: 'ulme', label: 'Sprich mit Professor Ulme' }],
        dialog: { ulme: { start: { t: 'Drei Freunde! Großartig. Glutzahn möchte dich übrigens begleiten – wenn du magst. Du kannst es in der Begleiter-Liste wählen.', do: [{ companion: 'taschi' }, { friend: 3 }, { achieve: 'taschi_freund' }], end: false } } } }
    ],
    rewards: { stars: 25, xp: 120, flag: 'done_taschi', text: 'Die Taschis vertrauen dir.' } }
];

/* =====================================================================  HÜPFLAND  */
const HU = ISLES.huepf, hua = (dx: number, dz: number) => at('huepf', dx, dz);
export const huepf: WorldDef = {
  id: 'huepf', name: 'Hüpfland', icon: '🍄', chapter: 7, theme: 'huepf',
  desc: 'Röhren, Sternblöcke, Dino Tupfi, das Flitzer-Kart und die Burg von Felsenkönig Brocko.',
  shape: isle('huepf', { height: 1.2, grass: 0x6fdc5a, grass2: 0x5fcf4e, beach: 8, bumps: 0.5, hills: [{ ...hua(-30, -30), r: 14, h: 4, flat: 6 }, { ...hua(30, 26), r: 12, h: 3, flat: 5 }], flats: [{ x: HU.x, z: HU.z, r: 18, y: 1.2 }],
    paths: [pathTo('huepf', -300, 135, 6, 0xe8d3a3)], paints: [{ ...hua(0, 30), r: 0, color: 0 }] }),
  spawn: spawnFrom('huepf', 'regenbogen'),
  pois: { platz: { ...hua(0, 0), name: 'Pilzplatz', icon: '🍄' }, burg: { ...hua(-30, -30), name: 'Brockos Burg', icon: '🪨' }, rennen: { ...hua(30, 26), name: 'Kartbahn', icon: '🏎️' } },
  vehicles: [{ type: 'dino', ...hua(10, -14), yaw: 0 }, { type: 'kart', ...hua(24, 18), yaw: 0, color: 0xe8453c }, { type: 'kart', ...hua(28, 18), yaw: 0, color: 0x3f8cff }],
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    for (let i = 0; i < 10; i++) { const a = i * 0.63; const p = hua(Math.cos(a) * 22, Math.sin(a) * 22); ctx.tree('pilz', p.x, p.z, 0.9 + (i % 3) * 0.2); }
    for (let i = 0; i < 14; i++) { const a = i * 0.45; const p = hua(Math.cos(a) * 52, Math.sin(a) * 52); ctx.tree('laub', p.x, p.z, 1); }
    // Röhren (Paare teleportieren)
    const pipes: [number, number, number][] = [[14, 6, 0x4cbf55], [-40, 10, 0x4cbf55], [-8, 30, 0xe8453c], [36, -30, 0xe8453c]];
    pipes.forEach(([dx, dz, c], i) => { const p = hua(dx, dz), y = ctx.h(p.x, p.z); b.cyl(p.x, y, p.z, 1.3, 1.3, 2.2, c, 14); b.cyl(p.x, y + 2.2, p.z, 1.6, 1.6, 0.6, c, 14); ctx.circle(p.x, p.z, 1.6, y - 1, y + 2.8);
      const other = pipes[i ^ 1]; const o = hua(other[0], other[1]);
      spot(ctx, 'roehre' + i, p.x, p.z, '🟢', 'In die Röhre springen', () => { api.sfx('whoosh'); api.teleport(o.x + 2.5, o.z, 0); api.events.emit('interact', { id: 'roehre', kind: 'pipe' }); }, { r: 2.8, y: y + 2.8 }); });
    // Sternblöcke (schweben über dem Boden – hochspringen!)
    for (let i = 0; i < 6; i++) { const a = i * 1.05; const p = hua(Math.cos(a) * 12, Math.sin(a) * 12), y = ctx.h(p.x, p.z); b.box(p.x, y + 2.6, p.z, 1.2, 1.2, 1.2, 0xffc83d); ctx.box(p.x, p.z, 1.2, 1.2, y + 2.6, y + 3.8); pickup(ctx, 'sternblock' + i, p.x, p.z, 'note', { y: y + 3.6, label: 'Stern aus dem Block' }); }
    // Brockos Burg
    const bg = hua(-30, -30), by = ctx.h(bg.x, bg.z);
    house(ctx, { x: bg.x, z: bg.z, w: 14, d: 12, h: 6, wall: 0x9aa3ad, roof: 0x6a6f8a, enter: true, name: 'Brockos Burg', icon: '🪨', roofType: 'flat' });
    for (const [dx, dz] of [[-7, -6], [7, -6], [-7, 6], [7, 6]]) { b.cyl(bg.x + dx, by, bg.z + dz, 1.6, 1.8, 9, 0x9aa3ad, 10); ctx.circle(bg.x + dx, bg.z + dz, 1.8, by, by + 9); }
    arcade(ctx, 'huepf', hua(4, -6).x, hua(4, -6).z, Math.PI, 'huepf_abenteuer', 'Hüpf-Abenteuer', '🦕', 0x4cbf55);
    // Kartbahn-Ringe
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const p = hua(30 + Math.cos(a) * 14, 26 + Math.sin(a) * 8); b.torus(p.x, ctx.h(p.x, p.z) + 2.5, p.z, 2.4, 0.2, 0xffd23f, { ry: -a }); }
  }
};
export const HUEPF_NPCS: NpcDef[] = [
  npc('huepf', 'gerti', 'Dino-Oma Gerti', '🦕', 'Hüterin von Tupfi', hua(6, -10).x, hua(6, -10).z, ['Na, mein Kind? Schon mit Tupfi gehüpft?', 'Hallo, Liebes!'], ['Tupfi kann sooo hoch springen – drück die Hupe!', 'Brocko ist gar nicht böse. Er ist nur grummelig, weil keiner mit ihm spielt.'], { creature: { kind: 'reitdrache', color: 0x9a7aff, color2: 0xfff1c0, scale: 0.45 }, wander: 3 }),
  npc('huepf', 'brocko', 'Felsenkönig Brocko', '🪨', 'Herrscher der Burg', hua(-24, -24).x, hua(-24, -24).z, ['GRRRR! … Oh. Hallo.', 'Was willst du in meiner Burg? … Bleib ruhig.'], ['Keiner kommt mich besuchen. Alle denken, ich bin böse, nur weil ich aus Stein bin.', 'Ich hab den Sonnenstern versteckt. Aus Langeweile. Grummel.'], { look: { skin: 13, hair: 'glatze', beard: 'voll', hairColor: 9, top: 'ruestung', build: 2, hat: 'krone', age: 2 }, scale: 1.4, wander: 2 }),
  npc('huepf', 'ferdi', 'Flitzefuchs Ferdi', '🦊', 'Kart-Rivale', hua(26, 22).x, hua(26, 22).z, ['Na, du lahme Schnecke? Haha, Spaß!', 'Hey!'], ['Niemand ist schneller als ich! Na gut – vielleicht Tupfi.'], { creature: { kind: 'fuchs', scale: 1.4 }, wander: 4 })
];
export const HUEPF_QUESTS: QuestDef[] = [
  { id: 'w_huepf', title: 'Der Sonnenstern', icon: '⭐', world: 'huepf', kind: 'world', giver: 'gerti',
    summary: 'Felsenkönig Brocko hat den Sonnenstern versteckt. Ohne ihn hüpft im Hüpfland niemand mehr fröhlich.',
    offer: { start: { t: 'Brocko hat den Sonnenstern versteckt! Aber ich glaube, er ist nur einsam. Schaff das Hüpf-Abenteuer – dann hat er Respekt – und besuch ihn!', choices: [{ t: '⭐ Los geht’s!', do: [{ start: 'w_huepf' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Schaff das Hüpf-Abenteuer am Automaten.', hints: ['Der Automat steht am Pilzplatz.', 'Doppelsprung! Lange drücken = höher.', 'Höchstens 3 Mal anstoßen.'], objectives: [{ id: 'h', type: 'minigame', target: 'huepf_abenteuer', label: 'Schaff das Hüpf-Abenteuer' }] },
      { text: 'Besuch Brocko in seiner Burg und spiel mit ihm.', hints: ['Die Burg ist auf dem Hügel im Nordwesten.', 'Er ist grummelig – sei freundlich!', 'Sprich mit Brocko.'], objectives: [{ id: 'b', type: 'talk', target: 'brocko', label: 'Sprich mit Brocko' }],
        dialog: { brocko: { start: { t: 'Du … besuchst mich? Wirklich? Keiner besucht mich je!', choices: [{ t: '🤝 Spielen wir zusammen Fangen?', to: 'a' }, { t: '🎁 Ich hab dir einen Witz mitgebracht!', to: 'b' }] },
          a: { t: 'HAHAHA! Fangen! Ich bin zwar langsam, aber … HAHA! Das macht Spaß! Hier, der Sonnenstern. Ich brauche ihn nicht mehr – ich hab jetzt dich!', do: [{ give: ['kristall', 1] }, { stars: 10 }, { friend: 5 }, { burst: true }], end: false },
          b: { t: 'Ein Witz? … Was ist grau und hüpft? Ein Felsen auf dem Trampolin! … HAHAHA! Hier, nimm den Sonnenstern. Komm bald wieder!', do: [{ give: ['kristall', 1] }, { stars: 10 }, { friend: 5 }, { burst: true }], end: false } } } }
    ],
    rewards: { stars: 25, xp: 110, flag: 'done_huepf', text: 'Brocko hat einen Freund – und das Hüpfland strahlt.' } }
];

/* =====================================================================  BAULAND  */
const BL = ISLES.bauland, bla = (dx: number, dz: number) => at('bauland', dx, dz);
const BAUPLAETZE = [[-24, -18, 'Brücke', 0x8a5a33], [24, -20, 'Leuchtturm', 0xffffff], [0, 28, 'Spielplatz', 0xff5fb0]] as const;
export const bauland: WorldDef = {
  id: 'bauland', name: 'Bauland', icon: '🧱', chapter: 7, theme: 'bauland',
  desc: 'Die große Bau-Insel: Werkbank, Bauplätze und bunte Klötze.',
  shape: isle('bauland', { height: 1.1, grass: 0x7fd65a, grass2: 0x72c94e, beach: 7, bumps: 0.2, flats: [{ x: BL.x, z: BL.z, r: 60, y: 1.1 }], paths: [pathTo('bauland', 0, 0, 6, 0xc9b48a), pathTo('bauland', 525, -405, 6, 0xc9b48a)],
    colorFn: (x, z) => (Math.abs(x - BL.x) < 50 && Math.abs(z - BL.z) < 50 && (Math.floor(x / 4) + Math.floor(z / 4)) % 2 === 0 ? 0x86dc62 : null) }),
  spawn: spawnFrom('bauland', 'hub'),
  pois: { werkbank: { ...bla(0, 0), name: 'Werkbank', icon: '🔨' }, ...Object.fromEntries(BAUPLAETZE.map(([dx, dz, nm], i) => ['b' + i, { ...bla(dx, dz), name: 'Bauplatz: ' + nm, icon: '🏗️' }])) },
  vehicles: [{ type: 'traktor', ...bla(10, 10), yaw: 0 }],
  build: (ctx: WorldCtx) => {
    const { b, api } = ctx;
    const wb = bla(0, 0), y = ctx.h(wb.x, wb.z);
    b.box(wb.x, y, wb.z, 3, 1, 1.5, 0x8a5a33); ctx.box(wb.x, wb.z, 3, 1.5, y, y + 1);
    for (let i = 0; i < 30; i++) b.box(wb.x - 8 + (i % 6) * 1.05, y + Math.floor(i / 6) * 1.05, wb.z - 6, 1, 1, 1, [0xe8453c, 0x3f8cff, 0xffd23f, 0x4cd07d, 0xb36bff][i % 5]);
    ctx.box(wb.x - 5.4, wb.z - 6, 6.3, 1, y, y + 5.2);
    // Eigene Bauwiese neben den Bauplan-Plätzen: kein vorgegebenes Fertighaus.
    const frei = bla(62, 30), fy = ctx.h(frei.x, frei.z);
    b.box(frei.x, fy - 0.08, frei.z, 22, 0.08, 22, 0xe8d3a3);
    for (let i = 0; i < 11; i++) { b.box(frei.x - 10 + i * 2, fy + 0.01, frei.z, 0.04, 0.025, 20, 0xc5aa7e); b.box(frei.x, fy + 0.01, frei.z - 10 + i * 2, 20, 0.025, 0.04, 0xc5aa7e); }
    b.box(frei.x, fy, frei.z + 13, 2.6, 1, 1.2, 0xffc85a);
    floatLabel(ctx, frei.x, fy + 4, frei.z + 13, 'Deine Bauwiese', '🧱', 0.7);
    arcade(ctx, 'bauturm', bla(6, -4).x, bla(6, -4).z, Math.PI, 'bauturm', 'Bauland-Turm', '🧱', 0xffd23f);
    arcade(ctx, 'pixel', bla(-6, -4).x, bla(-6, -4).z, Math.PI, 'pixelplan', 'Pixel-Plan', '🧩', 0x3f8cff);
    BAUPLAETZE.forEach(([dx, dz, nm, c], i) => {
      const p = bla(dx, dz), yy = ctx.h(p.x, p.z), flag = 'gebaut_' + i, built = !!api.flag(flag);
      b.box(p.x, yy, p.z, 8, 0.15, 8, 0xc9b48a);
      if (built) {
        if (i === 0) { for (let k = 0; k < 8; k++) b.box(p.x - 3.5 + k, yy + 1.5 + Math.sin(k / 7 * Math.PI) * 1.2, p.z, 1, 0.3, 3, c); }
        if (i === 1) { tower(ctx, p.x, p.z, 1.6, 9, c, 0xe8453c, 0xe8453c); }
        if (i === 2) { b.box(p.x - 2, yy, p.z, 0.2, 3, 0.2, 0xff5fb0); b.box(p.x + 2, yy, p.z, 0.2, 3, 0.2, 0xff5fb0); b.box(p.x, yy + 3, p.z, 4.2, 0.2, 0.2, 0xff5fb0); b.box(p.x + 3, yy, p.z + 2, 1.2, 2, 3, 0x3fa9ff, { rx: 0.5 }); }
      } else for (let k = 0; k < 4; k++) b.cone(p.x + (k % 2 ? 3.5 : -3.5), yy, p.z + (k < 2 ? 3.5 : -3.5), 0.3, 0.9, 0xff8a1f, 6);
      floatLabel(ctx, p.x, yy + 4, p.z, (built ? '✅ ' : '') + nm, '🏗️', 0.6);
      spot(ctx, 'bauplatz' + i, p.x, p.z, '🔨', () => api.flag(flag) ? nm + ' steht ✅' : nm + ' bauen (10 Bauklötze, hast ' + api.count('block') + ')', () => {
        if (api.flag(flag)) return;
        if (api.count('block') < 10) { api.toast('Du brauchst 10 Bauklötze. Bea verkauft sie im Bauland-Lager (je 1 ⭐).', '🧱'); return; }
        api.take('block', 10); api.setFlag(flag); api.sfx('success'); api.burst(p.x, yy + 2, p.z, [c, 0xffd23f, 0xffffff], 40); api.openPanel('reloadWorld', 'bauland');
      }, { r: 4.5 });
    });
    for (let i = 0; i < 16; i++) { const a = i * 0.39; const p = bla(Math.cos(a) * 64, Math.sin(a) * 64); ctx.tree(i % 3 ? 'pixel' : 'laub', p.x, p.z, 1); }
  }
};
export const BAULAND_NPCS: NpcDef[] = [
  npc('bauland', 'bea', 'Baumeisterin Bea', '👷‍♀️', 'Bauland', bla(3, 4).x, bla(3, 4).z, ['Helm auf! Hallo!', 'Na, Lust zu bauen?'], ['Ein guter Plan ist die halbe Miete.', 'Im Lager gibt es Bauklötze und Knallbeeren.'], { look: { hair: 'zopf', hairColor: 3, top: 'latz', topColor: 1, bottomColor: 14, hat: 'helm', hatColor: 2, skin: 5 }, shop: 'baumarkt' })
];
export const BAULAND_QUESTS: QuestDef[] = [
  { id: 'w_bauland', title: 'Drei Bauplätze', icon: '🏗️', world: 'bauland', kind: 'world', giver: 'bea',
    summary: 'Der Sturm hat Beas Baupläne durcheinandergeweht. Drei Bauplätze warten.',
    offer: { start: { t: 'Meine Pläne sind weggeweht! Wenn du den Bauland-Turm schaffst, weiß ich, dass du ein ruhiges Händchen hast. Dann bauen wir zusammen eine Brücke, einen Leuchtturm und einen Spielplatz!', choices: [{ t: '🔨 Bauen wir!', do: [{ start: 'w_bauland' }, { give: ['block', 10] }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Beweis dein Geschick am Bauland-Turm (mindestens 8 Kisten hoch).', hints: ['Der Automat steht an der Werkbank.', 'Im richtigen Moment loslassen.', 'Genau auf den Stapel – Perfekt-Treffer bringen Kombos.'], objectives: [{ id: 't', type: 'minigame', target: 'bauturm', label: 'Schaff den Bauland-Turm' }] },
      { text: 'Bau auf allen drei Bauplätzen (je 10 Bauklötze).', hints: ['Bauklötze gibt es bei Bea (Lager).', 'Die Bauplätze sind mit orangen Hütchen markiert.', 'Mit 10 Klötzen auf einen Bauplatz stellen und Aktion drücken.'],
        objectives: BAUPLAETZE.map(([, , nm], i) => ({ id: 'b' + i, type: 'flag' as const, target: 'gebaut_' + i, via: 'bauplatz' + i, label: 'Baue: ' + nm })) }
    ],
    rewards: { stars: 30, xp: 120, flag: 'done_bauland', text: 'Brücke, Leuchtturm und Spielplatz stehen!' } }
];

/* =====================================================================  RÄTSEL-INSEL  */
const RT = ISLES.raetsel, rta = (dx: number, dz: number) => at('raetsel', dx, dz);
export const raetsel: WorldDef = {
  id: 'raetsel', name: 'Rätsel-Insel der Uralten', icon: '🗿', chapter: 7, theme: 'raetsel',
  desc: 'Der Prüfungsturm mit Werkzeug-Rätseln, die Schmiede von Brokk und eine schwebende Titanen-Festung.',
  shape: isle('raetsel', { height: 1.3, grass: 0x9ac87a, grass2: 0x8ab86a, rock: 0x9a9080, beach: 8, bumps: 1.4, hills: [{ ...rta(26, -24), r: 16, h: 7, tiers: 3 }], flats: [{ x: RT.x, z: RT.z, r: 18, y: 1.3 }], paths: [pathTo('raetsel', -160, 262, 6, 0xc9b48a)] }),
  spawn: spawnFrom('raetsel', 'fussball'),
  pois: { turm: { ...rta(-20, -20), name: 'Prüfungsturm', icon: '🏯' }, schmiede: { ...rta(20, 14), name: 'Schmiede', icon: '⚒️' }, dorf: { ...rta(0, 0), name: 'Dorf der Uralten', icon: '🗿' }, festung: { ...rta(26, -24), name: 'Titanen-Hügel', icon: '🗿' } },
  build: (ctx: WorldCtx) => {
    const { api } = ctx;
    statue(ctx, RT.x, RT.z, Math.PI, 0x9a9080, 2.4, 'figur');
    // Prüfungsturm: Hebel-Rätsel → rissige Wand (Knallbeere) → Truhe mit Enterhaken
    const tm = rta(-20, -20), ty = ctx.h(tm.x, tm.z);
    const t = house(ctx, { x: tm.x, z: tm.z, rot: 0.8, w: 14, d: 14, h: 10, wall: 0xb0a090, roof: 0x7a6a5a, enter: true, name: 'Prüfungsturm', icon: '🏯', roofType: 'cone', windows: false, floor: 0x9a8a7a });
    const l1 = t.f.at(-4, -4), l2 = t.f.at(0, -5.5), l3 = t.f.at(4, -4);
    sequencePuzzle(ctx, 'turm', [{ ...l1, color: 0xff6b5b, icon: '🗿', name: 'Steinkopf des Feuers' }, { ...l2, color: 0x3fa9ff, icon: '🗿', name: 'Steinkopf des Wassers' }, { ...l3, color: 0x4cd07d, icon: '🗿', name: 'Steinkopf der Erde' }], [1, 2, 0],
      () => api.toast('Grrrumm! Eine Wand im Turm bekommt Risse …', '🧱', 3000), { style: 'pillar', clue: 'Die Uralten sagen: „Erst das Wasser gibt Leben, dann wächst die Erde, zuletzt wärmt das Feuer.“', clueAt: t.f.at(0, 4) });
    const wall = t.f.at(6.6, 0);
    const wallM = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3, 3), new THREE.MeshStandardMaterial({ color: 0x8a7a6a })); (wallM.material as THREE.Material).userData.disposeWithWorld = true;
    wallM.position.set(wall.x, ty + 1.5, wall.z); wallM.rotation.y = 0.8; ctx.add(wallM);
    ctx.onUpdate(() => { wallM.visible = !api.flag('wand_gesprengt'); });
    spot(ctx, 'rissige_wand', t.f.at(5, 0).x, t.f.at(5, 0).z, '💥', () => api.flag('wand_gesprengt') ? 'Die Wand ist offen ✅' : api.flag('puzzle_turm') ? 'Rissige Wand sprengen (Knallbeere)' : 'Eine massive Wand', () => {
      if (api.flag('wand_gesprengt')) return;
      if (!api.flag('puzzle_turm')) { api.toast('Die Wand ist massiv. Vielleicht verändern die Steinköpfe etwas?', '🗿'); return; }
      if (!api.take('knallbeere', 1)) { api.toast('Eine Knallbeere würde die Risse sprengen! (Truhe vor dem Turm oder Bauland-Lager)', '💥'); return; }
      api.setFlag('wand_gesprengt'); api.sfx('poof'); api.burst(wall.x, ty + 1.5, wall.z, [0xffd23f, 0xff6fb5, 0x9fe8ff, 0xffffff], 60); api.toast('KNALL! Konfetti! Dahinter liegt eine alte Truhe.', '💥', 3000);
    }, { r: 2.8 });
    chest(ctx, 'turm_vor', tm.x + 9, tm.z + 9, 0.8, { item: ['knallbeere', 2] });
    chest(ctx, 'turm_schatz', t.f.at(9, 0).x, t.f.at(9, 0).z, 0.8, { stars: 15, item: ['enterhaken', 1] }, () => !!api.flag('wand_gesprengt'));
    // Schmiede
    const sm = rta(20, 14); const sh = house(ctx, { x: sm.x, z: sm.z, rot: -2.2, w: 10, d: 8, wall: 0x9a8a7a, roof: 0x5a4a3a, enter: true, name: 'Schmiede', icon: '⚒️' });
    furniture(ctx, sh, 'kamin', 0, -3.2);
    // Titanen-Hügel
    const th = rta(26, -24); statue(ctx, th.x, th.z, Math.PI, 0x8a8f9a, 3, 'figur');
    for (let i = 0; i < 18; i++) { const a = i * 0.35; const p = rta(Math.cos(a) * 50, Math.sin(a) * 50); ctx.tree(i % 3 ? 'tanne' : 'laub', p.x, p.z, 1); }
    for (let i = 0; i < 8; i++) rock(ctx, rta(Math.cos(i * 0.8) * 38, Math.sin(i * 0.8) * 38).x, rta(Math.cos(i * 0.8) * 38, Math.sin(i * 0.8) * 38).z, 1.2, 0x9a9080);
    for (let i = 0; i < 4; i++) house(ctx, { ...rta(Math.cos(i * 1.57 + 0.7) * 22, Math.sin(i * 1.57 + 0.7) * 22), rot: -(i * 1.57 + 0.7) - Math.PI / 2, w: 7, d: 6, wall: 0xd9c9a8, roof: 0x8a6a3a, enter: true });
    lever(ctx, 'titan', th.x + 4, th.z + 4, 'Uralter Hebel', () => api.toast('Tief im Berg brummt etwas. Der Titan Kron ist erwacht – er wartet im Verbotenen Wald!', '🗿', 4000));
  }
};
export const RAETSEL_NPCS: NpcDef[] = [
  npc('raetsel', 'milo', 'Held Milo', '🗡️', 'Abenteurer', rta(4, 6).x, rta(4, 6).z, ['Ein neuer Held? Willkommen!', 'Hallo, Abenteurerin, Abenteurer!'], ['Im Prüfungsturm braucht man Köpfchen, nicht Muskeln.', 'Mit dem Enterhaken kommt man überall hin. Na ja – fast.'], { look: { hair: 'strubbel', hairColor: 6, top: 'jacke', topColor: 5, acc: 'umhang', accColor: 0 } }),
  npc('raetsel', 'brokk', 'Schmied Brokk', '⚒️', 'Schmiede', rta(18, 10).x, rta(18, 10).z, ['KLONG! Oh, hallo.', 'Willkommen in meiner Schmiede!'], ['Bring mir Kristall-Splitter und ich verbessere dein Schwert. Es wirkt aber nur im Verbotenen Wald!'], { look: { hair: 'glatze', beard: 'voll', hairColor: 7, top: 'latz', topColor: 12, build: 2, age: 2 }, wander: 1, topics: [{ label: 'Schwert verbessern', to: 'schmied' }],
    dialog: { schmied: { t: 'Für 2 Kristall-Splitter schmiede ich dein Schwert eine Stufe besser.', choices: [{ t: '⚒️ Schwert verbessern (2 🔷)', if: { has: 'kristall', n: 2 }, do: [{ take: ['kristall', 2] }, { panel: 'schmieden' }] }, { t: 'Vielleicht später.' }] } } })
];
export const RAETSEL_QUESTS: QuestDef[] = [
  { id: 'w_raetsel', title: 'Die Prüfung der Uralten', icon: '🏯', world: 'raetsel', kind: 'world', giver: 'milo',
    summary: 'Im Prüfungsturm wartet ein Schatz der Uralten – für alle, die die Rätsel lösen.',
    offer: { start: { t: 'Der Prüfungsturm! Drinnen: Steinköpfe, eine rissige Wand und eine Truhe der Uralten. Ich bin zu ungeduldig dafür. Versuchst du es?', choices: [{ t: '🏯 Ich versuche es!', do: [{ start: 'w_raetsel' }] }, { t: 'Später.' }] } },
    stages: [
      { text: 'Berühre im Prüfungsturm die Steinköpfe in der richtigen Reihenfolge.', hints: ['Die Hinweis-Tafel steht im Turm.', 'Wasser, dann Erde, dann Feuer.', 'Blau, Grün, Rot.'], objectives: [{ id: 'p', type: 'flag', target: 'puzzle_turm', label: 'Löse das Steinkopf-Rätsel' }] },
      { text: 'Spreng die rissige Wand mit einer Knallbeere und öffne die Truhe dahinter.', hints: ['Knallbeeren liegen in der Truhe vor dem Turm.', 'Die Wand ist an der Seite im Turm.', 'Knallbeere einsetzen, dann Truhe öffnen.'], objectives: [{ id: 'w', type: 'flag', target: 'wand_gesprengt', via: 'rissige_wand', label: 'Spreng die Wand' }, { id: 'h', type: 'have', target: 'enterhaken', label: 'Finde den Schatz der Uralten' }] },
      { text: 'Zeig Milo den Enterhaken.', hints: ['Milo steht am Dorfplatz.', 'Mitte.', 'Sprich mit Milo.'], objectives: [{ id: 'm', type: 'talk', target: 'milo', label: 'Sprich mit Milo' }],
        dialog: { milo: { start: { t: 'Der Enterhaken der Uralten! Du hast die Prüfung bestanden. Ab jetzt bist du eine Heldin, ein Held wie ich!', do: [{ ability: 'enterhaken' }, { friend: 3 }], end: false } } } }
    ],
    rewards: { stars: 30, xp: 130, flag: 'done_raetsel', text: 'Die Prüfung der Uralten ist bestanden.' } }
];
