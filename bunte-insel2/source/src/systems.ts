/* Verdrahtet alle Spielsysteme mit dem Spiel-Kern: Bewohner, Dialoge, Quests, Belohnungen, Erfolge, Freundschaft,
   Schnellreise, Fahrzeuge, Begleiter, Wald-Kampf, Sammeln, Geschichte, Minispiele und die Oberflächen-Fenster. */
import type { Game } from './game.ts';
import type { AudioEngine } from './audio/music.ts';
import { THEMES } from './audio/themes.ts';
import type { Hud } from './ui/hud.ts';
import { NpcSystem } from './gameplay/npc.ts';
import { QuestEngine, type QuestDef } from './gameplay/quests.ts';
import { Dialogue } from './gameplay/dialogue.ts';
import { check, type Action, type Cond, type ScriptCtx } from './gameplay/script.ts';
import { ALL_NPCS } from './data/npcs/index.ts';
import { ALL_QUESTS } from './data/quests/index.ts';
import { ACHIEVEMENTS } from './data/achievements.ts';
import { ITEMS, itemName, ABILITIES } from './data/items.ts';
import { openJournal } from './ui/journal.ts';
import { openWorldMap } from './ui/worldmap.ts';
import { openGift, openInventory, openShop } from './ui/inventory.ts';
import { btn, h, modal } from './ui/dom.ts';
import { GeoBuilder } from './engine/geo.ts';
import { mats } from './engine/materials.ts';
import type { WorldDef } from './world/registry.ts';
import { levelFromXp } from './persistence/save.ts';
import { Companions } from './gameplay/companions.ts';
import { Vehicles } from './gameplay/vehicles.ts';
import { Combat } from './gameplay/combat.ts';
import { Sammeln } from './gameplay/sammeln.ts';
import { Story } from './story/story.ts';
import { Minigames } from './minigames/index.ts';
import { FOREST } from './world/worlds/hub.ts';
import { installPanels } from './ui/panels.ts';
import { installPrismaPanels } from './ui/prismaPanels.ts';
import type { Emote } from './characters/avatar.ts';

export interface Systems {
  pauseExtras(): { label: string; act: () => void; cls?: string }[];
  attachHud(h: Hud): void;
  npcs: NpcSystem; quests: QuestEngine; dialogue: Dialogue; vehicles: Vehicles; combat: Combat; story: Story;
  run(a: Action[] | undefined, npc?: string): void;
  check(c: Cond | undefined): boolean;
}

export function installSystems(g: Game, audio: AudioEngine): Systems {
  const sctx: ScriptCtx = { get save() { return g.save; }, isNight: () => g.env.isNight };
  const cond = (c: Cond | undefined) => check(c, sctx);
  const npcs = g.addSystem(new NpcSystem(g));
  npcs.register(ALL_NPCS);
  npcs.cond = cond;
  const worldName = (id: string) => g.worlds.byId(id)?.name ?? id;
  let hud: Hud | null = null;

  /* ---------- Aktionen ---------- */
  const run = (list: Action[] | undefined, npc?: string): void => {
    if (!list) return;
    for (const a of list) {
      if (a.give) g.give(a.give[0], a.give[1] ?? 1);
      if (a.take) g.take(a.take[0], a.take[1] ?? 1);
      if (a.stars) g.addStars(a.stars);
      if (a.spend) g.spendStars(a.spend);
      if (a.xp) g.addXp(a.xp);
      if (a.flag) g.setFlag(a.flag, 1);
      if (a.unflag) delete g.save.flags[a.unflag];
      if (a.setFlag) g.setFlag(a.setFlag[0], a.setFlag[1]);
      if (a.start) quests.start(a.start);
      if (a.obj) quests.progress(a.obj[0], a.obj[1], 1);
      if (a.ability) g.unlockAbility(a.ability);
      if (a.cosmetic) g.unlockCosmetic(a.cosmetic);
      if (a.friend && npc) befriend(npc, a.friend, true);
      if (a.achieve) achieve(a.achieve);
      if (a.companion) companions.add(a.companion);
      if (a.chapter !== undefined) story.setChapter(a.chapter);
      if (a.choice) { g.save.story.choices[a.choice[0]] = a.choice[1]; }
      if (a.sfx) g.sfx(a.sfx);
      if (a.burst) { const p = g.player.pos; g.burst(p.x, p.y + 1.2, p.z, [0xffd23f, 0xff6fb5, 0x7fd8ff, 0x4cd07d], 36); }
      if (a.night) g.setNight(true);
      if (a.day) g.setNight(false);
      if (a.teleport) g.teleport(a.teleport[0], a.teleport[1], a.teleport[2]);
      if (a.toast) g.toast(a.toast, '✨', 3000);
      if (a.shop) { dialogue.end(); openShop(g, a.shop); }
      if (a.panel) { dialogue.end(); g.openPanel(a.panel, a.panelArg); }
      if (a.minigame) { dialogue.end(); g.startMinigame(a.minigame); }
    }
    npcs.refresh();
    quests.recheck();
  };

  /* ---------- Quests ---------- */
  const quests = new QuestEngine({
    get save() { return g.save; },
    now: () => Date.now(),
    check: cond,
    run: (a, npc) => run(a, npc),
    pos: () => ({ x: g.player.pos.x, z: g.player.pos.z }),
    world: () => g.currentWorld?.id ?? '',
    reward: (q: QuestDef) => {
      const r = q.rewards;
      if (r.stars) g.addStars(r.stars, 'Belohnung');
      if (r.xp) g.addXp(r.xp);
      for (const [it, n] of r.items ?? []) g.give(it, n);
      if (r.ability) g.unlockAbility(r.ability);
      if (r.cosmetic) g.unlockCosmetic(r.cosmetic);
      if (r.flag) g.setFlag(r.flag);
    },
    notify: (kind, q, extra) => {
      if (kind === 'start') { g.sfx('open'); hud?.banner('📜 ' + q.title, 'Neue Aufgabe!'); hud?.setJournalDot(true); }
      if (kind === 'obj') { g.sfx('success', 0.7); g.toast('✅ ' + (extra ?? ''), undefined, 2400); }
      if (kind === 'stage') { const st = quests.stageOf(q.id); g.toast('📜 ' + q.title + ': ' + (st?.text ?? ''), undefined, 4200); }
      if (kind === 'done') {
        g.sfx('quest'); hud?.banner('🎉 ' + q.title, q.rewards.text ?? 'Geschafft!');
        const p = g.player.pos; g.burst(p.x, p.y + 1.5, p.z, [0xffd23f, 0xff6fb5, 0x7fd8ff, 0x4cd07d, 0xb36bff], 60);
        const done = Object.values(g.save.quests).filter(s => s.done).length;
        if (done >= 5) achieve('helfer'); if (done >= 20) achieve('held');
        g.events.emit('questDone', { quest: q.id });
      }
    }
  });
  quests.register(ALL_QUESTS);
  g.addSystem({ id: 'quests', update: (() => { let t = 0; return (dt: number) => { t += dt; if (t > 0.4) { t = 0; quests.recheck(); } }; })() });
  // Ereignisse → Quest-Ziele
  const ev = g.events;
  ev.on('talk', e => { quests.event('talk', e.npc); achieve('erste_schritte'); const r = rel(e.npc); r.talks++; });
  ev.on('interact', e => quests.event('interact', e.id));
  ev.on('item', e => { quests.event('collect', e.id, e.count); quests.recheck(); });
  ev.on('defeat', e => { quests.event('defeat', e.enemy); quests.event('defeat', '*'); });
  ev.on('minigame', e => { if (!e.win) return; quests.event('minigame', e.id); if (e.id === 'pixelplan' && g.currentWorld?.id === 'park') g.setFlag('park_memory'); });
  ev.on('flag', e => quests.event('flag', e.id));
  ev.on('vehicle', e => { quests.event('vehicle', e.type); quests.event('vehicle', '*'); });
  ev.on('enterWorld', e => quests.event('enter', e.world));
  ev.on('collect', e => quests.event('collect', e.id));
  ev.on('fish', e => quests.event('fish', e.id));
  ev.on('discover', e => quests.event('discover', e.id));
  ev.on('photo', e => quests.event('photo', e.subject));
  ev.on('emote', e => quests.event('emote', e.id));

  /* ---------- Dialoge ---------- */
  const dialogue = new Dialogue(g, npcs, { check: cond, run, offers: n => quests.offersFrom(n), questDialog: n => quests.dialogFor(n) });
  g.addSystem({ id: 'dialog', update: dt => dialogue.update(dt) });
  g.panels.talk = id => dialogue.talk(id as string);
  g.panels.startQuest = id => quests.start(id as string);
  g.panels.dialog = arg => { const a = arg as { tree: import('./gameplay/quests.ts').DialogTree; npc?: string }; dialogue.runTree(a.tree, 'start', a.npc); };

  /* ---------- Freundschaft ---------- */
  const rel = (id: string) => (g.save.npcs[id] ??= { friend: 0, lastTalkDay: -1, talks: 0, gifts: 0 });
  const befriend = (id: string, amount: number, daily: boolean) => {
    const r = rel(id), day = g.save.clock.day;
    if (daily) { if (r.lastTalkDay === day) return; r.lastTalkDay = day; }
    const before = Math.ceil(r.friend / 2);
    r.friend = Math.min(10, r.friend + amount);
    const after = Math.ceil(r.friend / 2);
    if (after > before) { const d = npcs.defs.get(id); g.toast((d?.name ?? id) + ': Freundschaft ' + '❤️'.repeat(after), undefined, 2600); g.events.emit('friendship', { npc: id, level: after }); }
    if (r.friend >= 10) achieve('freundschaft');
    if (Object.values(g.save.npcs).filter(x => x.friend >= 4).length >= 10) achieve('beliebt');
  };
  g.panels.gift = arg => {
    const id = arg as string, d = npcs.defs.get(id);
    if (!d) return;
    openGift(g, d.name, d.likes ?? [], item => {
      if (!g.take(item)) return;
      const liked = d.likes?.includes(item);
      rel(id).gifts++;
      befriend(id, liked ? 3 : 1, false);
      npcs.emote(id, liked ? 'cheer' : 'wave', 2);
      g.bark(d.name, liked ? 'Oh! ' + itemName(item) + ' – das mag ich am allerliebsten! Danke!' : 'Danke für ' + itemName(item) + '! Das ist lieb von dir.', d.icon);
      if (liked) g.addStars(2);
      ev.emit('deliver', { npc: id, item });
    });
  };

  /* ---------- Erfolge ---------- */
  const achieve = (id: string) => {
    if (g.save.achievements.includes(id)) return;
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return;
    g.save.achievements.push(id);
    g.sfx('levelup', 0.6);
    hud?.toast('🏆 Erfolg: ' + a.name, a.icon, 3500, true);
    if (a.reward) g.addStars(a.reward);
    ev.emit('achievement', { id });
  };
  g.panels.achieve = id => achieve(id as string);
  g.addSystem({
    id: 'erfolge', update: (() => { let t = 0; return (dt: number) => {
      t += dt; if (t < 2) return; t = 0;
      const s = g.save;
      if (s.visited.length >= 5) achieve('entdecker');
      if (g.worlds.defs.every(w => s.visited.includes(w.id))) achieve('weltenbummler');
      if (s.stars >= 500) achieve('reich');
      if (levelFromXp(s.xp) >= 10) achieve('stufe10');
      if (g.env.isNight) achieve('nachteule');
      if (g.player.swimming && !g.currentWorld) achieve('schwimmer');
      if (s.imported) achieve('erinnerung');
    }; })()
  });
  g.panels.ability = id => {
    const a = ABILITIES[id as string];
    if (!a) return;
    const m = modal({ title: 'Neue Fähigkeit!', icon: a.icon });
    m.body.append(h('div', { style: 'text-align:center;font-size:4rem' }, a.icon), h('h2', { style: 'text-align:center' }, a.name), h('p', { style: 'text-align:center;font-size:1.15rem' }, a.desc));
    m.footer.classList.remove('hidden'); m.footer.append(btn('Super!', () => m.close(), 'green'));
    g.sfx('levelup'); if (id === 'gleiten') achieve('gleiten'); if (id === 'feenstaub') achieve('feenstaub');
  };

  /* ---------- Begleiter, Fahrzeuge, Kampf, Sammeln, Geschichte, Minispiele ---------- */
  const companions = g.addSystem(new Companions(g));
  const vehicles = g.addSystem(new Vehicles(g, audio));
  g.vehicleCheck = () => vehicles.inVehicle;
  g.panels.enterVehicle = id => vehicles.enterById(id as string);
  ev.on('vehicle', e => { achieve('fahrer'); if (['heli', 'drache', 'nautilux', 'ballon', 'schluesselmobil'].includes(e.type)) achieve('pilot'); if (['segelboot', 'floss', 'dampferboot'].includes(e.type)) achieve('kapitaen'); if (Object.keys(g.save.stats).filter(k => k.startsWith('veh_')).length >= 8) achieve('fuhrpark'); });
  const combat = g.addSystem(new Combat(g, audio));
  ev.on('defeat', e => { if (g.save.fight.defeated >= 10) achieve('waldlaeufer'); if (e.boss) achieve('waldheld'); if (g.save.fight.bosses.length >= 4) achieve('wald_held'); });
  installPanels(g, { bossAltar: () => combat.bossAltarPanel() });
  installPrismaPanels(g);
  const sammeln = g.addSystem(new Sammeln(g));
  ev.on('fish', () => { if (Object.keys(g.save.sammel.fish).length >= 5) achieve('angler'); });
  ev.on('collect', e => { if (e.kind === 'bug' && Object.keys(g.save.sammel.bugs).length >= 5) achieve('kaeferfreund'); if (e.kind === 'find' && Object.keys(g.save.sammel.finds).length >= 5) achieve('schatzgraeber'); });
  const story = g.addSystem(new Story(g, { quests, npcs, run, check: cond, achieve, dialogue }));
  const minis = new Minigames(g, audio);
  g.panels.minigame = arg => { const a = arg as { id: string }; dialogue.end(); minis.start(a.id, a as Record<string, unknown>); };

  /* ---------- Schnellreise: Weltensteine ---------- */
  const canTravel = (w: WorldDef): { ok: boolean; why?: string } => {
    if (story.locked(w.id)) return { ok: false, why: '🔒 ' + story.lockReason(w.id) };
    if (g.mode === 'free') return { ok: true };
    if (g.save.discovered.includes('stein:' + w.id)) return { ok: true };
    return { ok: false, why: 'Berühre zuerst den Weltenstein dort.' };
  };
  const travel = (w: WorldDef) => {
    if (vehicles.inVehicle) vehicles.exit(true);
    const fade = document.querySelector('.fade') ?? h('div', { class: 'fade' });
    if (!fade.parentElement) document.body.append(fade);
    fade.classList.add('on');
    g.sfx('magic');
    setTimeout(() => {
      // Figur schaut in Richtung des Zielgebiets (Inselmitte)
      const sx = w.spawn.x, sz = w.spawn.z;
      const yaw = Math.hypot(w.shape.x - sx, w.shape.z - sz) > 4 ? Math.atan2(w.shape.x - sx, w.shape.z - sz) : w.spawn.yaw;
      g.teleport(sx, sz, yaw);
      companions.teleportAll();
      setTimeout(() => fade.classList.remove('on'), 120);
    }, 380);
  };
  const stoneGeo = (() => { const b = new GeoBuilder(); b.cyl(0, 0, 0, 0.9, 1.1, 0.4, 0x8a8fa6, 8); b.cone(0, 0.35, 0, 0.55, 2.4, 0xbfe6ff, 6); return b.build(); })();
  g.addSystem({
    id: 'weltensteine',
    onWorldLoad: lw => {
      const w = lw.def, x = w.spawn.x + 3, z = w.spawn.z + 3, y = g.field.height(x, z);
      const m = new THREE.Mesh(stoneGeo, mats().shiny); m.position.set(x, y, z); m.castShadow = true; lw.root.add(m);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), new THREE.MeshBasicMaterial({ color: 0x9fe8ff })); (glow.material as THREE.Material).userData.disposeWithWorld = true; glow.position.set(x, y + 3.1, z); lw.root.add(glow);
      lw.updaters.push((_dt, t) => { glow.position.y = y + 3.1 + Math.sin(t * 2) * 0.15; m.rotation.y = t * 0.3; });
      g.physics.circle(w.id, x, z, 1.0, y - 1, y + 2.6);
      g.interact.add({ id: 'stein:' + w.id, tag: w.id, x, y, z, r: 3, icon: '💎', label: () => g.save.discovered.includes('stein:' + w.id) ? 'Weltenstein: Schnellreise' : 'Weltenstein berühren', priority: 1,
        act: () => { if (!g.save.discovered.includes('stein:' + w.id)) { g.discover('stein:' + w.id, 'Weltenstein ' + w.name); g.burst(x, y + 2, z, [0x9fe8ff, 0xffffff, 0xb36bff], 30); g.sfx('magic'); } else g.openPanel('map'); } });
    }
  });

  /* ---------- Orte entdecken (Wahrzeichen) ---------- */
  g.addSystem({
    id: 'entdecken', update: (() => { let t = 0; return (dt: number) => {
      t += dt; if (t < 0.5) return; t = 0;
      const w = g.currentWorld; if (!w) return;
      const p = g.player.pos;
      for (const [k, poi] of Object.entries(w.pois)) {
        const id = w.id + ':' + k;
        if (g.save.discovered.includes(id)) continue;
        if (Math.hypot(p.x - poi.x, p.z - poi.z) < 9) g.discover(id, poi.name);
      }
    }; })()
  });

  /* ---------- Zielmarkierung in der Welt ---------- */
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 60, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe14a, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
  beam.renderOrder = 4; g.scene.add(beam); beam.visible = false;
  const targetOf = (): { x: number; z: number; y?: number } | null => {
    const t = story.overrideTarget() ?? null;
    if (t) return t;
    const tr = quests.trackedObjective();
    if (!tr?.o) return null;
    const o = tr.o;
    if (o.at) return o.at;
    if (o.type === 'talk') { const live = npcs.live.get(o.target); if (live) return { x: live.pos.x, z: live.pos.z }; const d = npcs.defs.get(o.target); if (d) return { x: d.x, z: d.z }; }
    if (o.type === 'interact') { const i = g.interact.get(o.target); if (i) return { x: i.x, z: i.z }; }
    if (o.type === 'enter') { const w = g.worlds.byId(o.target); if (w) return { x: w.spawn.x, z: w.spawn.z }; }
    // Gespräch mit Quest-Dialog: Auftraggeber
    const dlgNpc = tr.st.dialog ? Object.keys(tr.st.dialog)[0] : null;
    if (dlgNpc) { const live = npcs.live.get(dlgNpc); if (live) return { x: live.pos.x, z: live.pos.z }; const d = npcs.defs.get(dlgNpc); if (d) return { x: d.x, z: d.z }; }
    return null;
  };
  g.addSystem({
    id: 'marker', update: (_dt, t) => {
      const tg = targetOf();
      if (!tg) { beam.visible = false; return; }
      const d = Math.hypot(tg.x - g.player.pos.x, tg.z - g.player.pos.z);
      beam.visible = d > 5 && d < 260;
      const y = g.physics.ground(tg.x, tg.z, 200).y;
      beam.position.set(tg.x, y + 30, tg.z);
      (beam.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(t * 3) * 0.08;
    }
  });
  const trackerInfo = () => {
    const so = story.trackerOverride();
    if (so) return so;
    const tr = quests.trackedObjective();
    if (!tr) {
      // Hinweis: wer hat Aufgaben?
      return null;
    }
    return { icon: tr.q.icon, title: tr.q.title, text: tr.o ? tr.o.label + ((tr.o.n ?? 1) > 1 ? ' (' + (g.save.quests[tr.q.id]?.progress[tr.o.id] ?? 0) + '/' + tr.o.n + ')' : '') : tr.st.text, target: targetOf() };
  };

  /* ---------- Fenster ---------- */
  g.panels.journal = arg => { hud?.setJournalDot(false); openJournal(g, quests, npcs, worldName, (arg as string) ?? 'quests'); };
  g.panels.map = () => openWorldMap(g, {
    image: hud!.minimap.image, target: targetOf(),
    markers: [...questGiverMarkers(), { x: 96, z: 102, icon: '🔱', label: 'Atlantis' }],
    canTravel, travel
  });
  const questGiverMarkers = () => {
    const out: { x: number; z: number; icon: string; label: string }[] = [];
    for (const q of quests.defs.values()) { if (!q.giver || !quests.available(q)) continue; const d = npcs.defs.get(q.giver); if (d && !story.locked(d.world)) out.push({ x: d.x, z: d.z, icon: q.kind === 'main' ? '❗' : '📜', label: q.title }); }
    return out;
  };
  g.panels.inventory = () => openInventory(g, id => useItem(id));
  g.panels.shop = id => openShop(g, id as string);
  const useItem = (id: string): boolean => {
    const d = ITEMS[id];
    if (!d) return false;
    if (d.heal) {
      if (!g.take(id)) return false;
      const healed = combat.heal(d.heal);
      g.toast(healed ? 'Lecker! +' + d.heal + ' ❤️' : 'Lecker!', d.icon);
      g.avatar.play('cheer', 1); g.sfx('pickup');
      ev.emit('itemUsed', { id });
      return true;
    }
    if (id === 'angel' || id === 'kescher' || id === 'schaufel') { sammeln.useTool(id); return true; }
    g.toast(d.use, d.icon, 3500);
    return false;
  };
  g.panels.useItem = id => useItem(id as string);
  g.panels.emotes = () => {
    const m = modal({ title: 'Gesten', icon: '😄' });
    const list: [Emote, string, string][] = [['wave', '👋', 'Winken'], ['cheer', '🙌', 'Jubeln'], ['dance', '💃', 'Tanzen'], ['laugh', '😂', 'Lachen'], ['bow', '🙇', 'Verbeugen'], ['clap', '👏', 'Klatschen'], ['think', '🤔', 'Nachdenken'], ['point', '👉', 'Zeigen'], ['spin', '🌀', 'Drehen']];
    m.body.append(h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(110px,1fr))' }, list.map(([e, i, l]) => btn(i + ' ' + l, () => {
      m.close(); g.avatar.play(e, e === 'dance' ? 4 : 2); ev.emit('emote', { id: e });
      if (e === 'dance') { const key = 'tanz:' + (g.currentWorld?.id ?? 'meer'); if (!g.save.flags[key]) { g.save.flags[key] = 1; if (Object.keys(g.save.flags).filter(k => k.startsWith('tanz:')).length >= 3) achieve('tanz'); } }
      for (const n of npcs.live.values()) if (Math.hypot(n.pos.x - g.player.pos.x, n.pos.z - g.player.pos.z) < 8) n.avatar?.play(e === 'dance' ? 'dance' : 'wave', e === 'dance' ? 4 : 1.5);
    }, 'ghost'))));
  };
  g.panels.sleep = () => {
    const m = modal({ title: 'Ausruhen', icon: '😴' });
    m.body.append(h('p', null, g.env.isNight ? 'Gute Nacht! Schlafen bis zum nächsten Morgen?' : 'Ein Nickerchen bis zum Abend?'));
    m.footer.classList.remove('hidden');
    m.footer.append(btn('Nein', () => m.close(), 'ghost'), btn('😴 Ja', () => {
      m.close();
      const fade = document.querySelector('.fade') ?? h('div', { class: 'fade' }); if (!fade.parentElement) document.body.append(fade);
      (fade as HTMLElement).style.background = '#0d1a40'; fade.classList.add('on');
      setTimeout(() => {
        if (g.env.isNight) { g.env.t = 0.28; g.save.clock.day++; ev.emit('dayChange', { day: g.save.clock.day }); } else g.env.t = 0.78;
        combat.heal(99); achieve('schlafmuetze'); g.setFlag('geschlafen'); ev.emit('sleep', {});
        g.persist();
        setTimeout(() => { fade.classList.remove('on'); (fade as HTMLElement).style.background = ''; g.toast(g.env.isNight ? 'Guten Abend!' : 'Guten Morgen! Ein neuer Tag – alle freuen sich, mit dir zu plaudern.', g.env.isNight ? '🌙' : '☀️', 3200); }, 300);
      }, 600);
    }, 'green'));
  };
  // Neuer Tag auch ohne Schlafen (Tageswechsel um Mitternacht)
  g.addSystem({ id: 'tag', update: (() => { let lastT = -1; return () => { const t = g.env.t; if (lastT > 0.9 && t < 0.1) { g.save.clock.day++; ev.emit('dayChange', { day: g.save.clock.day }); } lastT = t; }; })() });

  /* ---------- Musik & Umgebung ---------- */
  g.addSystem({
    id: 'klang',
    update: (dt) => {
      const z = g.currentZone, w = g.currentWorld;
      const theme = combat.music() ?? minis.music() ?? (z?.theme ? THEMES[z.theme] : undefined) ?? (w ? THEMES[w.theme] : undefined) ?? THEMES.insel;
      audio.setTheme(theme);
      audio.night = g.env.isNight;
      const p = g.player.pos, ground = g.field.height(p.x, p.z);
      const coast = w ? Math.min(1, Math.max(0, (Math.hypot(p.x - w.shape.x, p.z - w.shape.z) - (w.shape.r - 40)) / 40)) : 1;
      audio.ambient(w?.underground ? 0 : Math.min(1, coast * 0.85 + (ground < 0.5 ? 0.3 : 0.1)), Math.min(1, Math.max(0, (p.y - 3) / 15)) + 0.2, z?.combat || w?.underground ? 0 : 1, dt);
    }
  });

  void FOREST;
  return {
    npcs, quests, dialogue, vehicles, combat, story, run, check: cond,
    pauseExtras: () => [
      { label: '📖 Tagebuch', act: () => g.openPanel('journal') },
      { label: '🗺️ Karte & Schnellreise', act: () => g.openPanel('map') },
      { label: '🐾 Begleiter wählen', act: () => g.openPanel('companions') },
      { label: '🏠 Nach Hause', act: () => { const hw = g.worlds.byId('hub')!; if (vehicles.inVehicle) vehicles.exit(true); g.teleport(-50, 50, Math.atan2(hw.shape.x + 50, hw.shape.z - 50)); companions.teleportAll(); } },
      ...story.pauseExtras()
    ],
    attachHud: (hd: Hud) => {
      hud = hd;
      hd.tracking = trackerInfo;
      hd.onTrackerClick = () => g.openPanel('journal');
      hd.heartsFn = () => combat.hudInfo();
      hd.minimap.target = () => { const t = trackerInfo(); return t?.target ?? null; };
      hd.minimap.markers = () => {
        const out: { x: number; z: number; icon: string }[] = [];
        for (const q of quests.defs.values()) { if (!q.giver || !quests.available(q)) continue; const n = npcs.live.get(q.giver); if (n) out.push({ x: n.pos.x, z: n.pos.z, icon: q.kind === 'main' ? '❗' : '📜' }); }
        for (const v of vehicles.nearbyIcons()) out.push(v);
        return out;
      };
      vehicles.hud = hd; combat.hud = hd; story.hud = hd;
    }
  };
}
