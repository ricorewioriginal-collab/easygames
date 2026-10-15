// Integration ohne GPU: echte Weltgeometrie, Kollisionsprüfung, Quests und Speicherformat.
// Canvas wird nur für Schild-Texturen ersetzt; dies prüft keine Darstellung oder Touch-Bedienung.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
vm.runInThisContext(readFileSync(new URL('../public/vendor/three.min.js', import.meta.url), 'utf8'));
const context = new Proxy({ measureText: t => ({ width: String(t).length * 24 }), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) }, { get: (o, k) => k in o ? o[k] : () => {} });
globalThis.document = { createElement: () => ({ width: 100, height: 100, getContext: () => context }) };
const [{ WorldManager }, { TerrainField }, { Physics }, { InteractSystem }, { PROFILES }, { ALL_WORLDS }, { Neighborhoods }, { NEIGHBORHOODS }, { newSave, sanitizeSave }, { DEFAULT_APPEARANCE }, { EventBus }, { QuestEngine }, { ALL_QUESTS }, { ALL_NPCS }, { interactFor, resolveObjective }, { Building }] = await Promise.all([
  import('../src/world/registry.ts'), import('../src/world/terrain.ts'), import('../src/world/physics.ts'), import('../src/gameplay/interact.ts'), import('../src/engine/renderer.ts'), import('../src/world/worlds/index.ts'), import('../src/gameplay/neighborhoods.ts'), import('../src/data/neighborhoods.ts'), import('../src/persistence/save.ts'), import('../src/characters/appearance.ts'), import('../src/core/events.ts'), import('../src/gameplay/quests.ts'), import('../src/data/quests/index.ts'), import('../src/data/npcs/index.ts'), import('../src/gameplay/targets.ts'), import('../src/gameplay/building.ts')
]);
function fixture() {
  const g = { scene: new THREE.Scene(), field: new TerrainField(), physics: new Physics(), interact: new InteractSystem(), panels: {}, renderer: { profile: PROFILES.low }, events: new EventBus(), settings: {}, player: { pos: new THREE.Vector3() }, currentWorld: null, save: newSave(1, 'free', 'Test', DEFAULT_APPEARANCE), mode: 'free', time: 0 };
  g.physics.terrain = g.field.height;
  Object.assign(g, { flag: id => g.save.flags[id] ?? 0, setFlag: (id, n = 1) => { g.save.flags[id] = n; g.events.emit('flag', { id }); }, has: (id, n = 1) => (g.save.inventory[id] ?? 0) >= n, count: id => g.save.inventory[id] ?? 0, give: (id, n = 1) => { g.save.inventory[id] = (g.save.inventory[id] ?? 0) + n; }, take: (id, n = 1) => { if (!g.has(id, n)) return false; g.save.inventory[id] -= n; return true; }, isCollected: id => g.save.collected.includes(id), collectOnce: id => { if (g.isCollected(id)) return false; g.save.collected.push(id); return true; }, questStage: id => g.save.quests[id] ? g.save.quests[id].done ? 999 : g.save.quests[id].stage : -1, questDone: id => !!g.save.quests[id]?.done, hasAbility: id => g.save.abilities.includes(id), playerPos: () => g.player.pos, isNight: () => false, system: () => undefined, addStars: n => { g.save.stars += n; }, bark() {}, toast() {}, sfx() {}, burst() {}, openPanel() {}, discover() {}, startQuest() {}, persist() { return true; } });
  const npcs = { defs: new Map(ALL_NPCS.map(n => [n.id, n])), live: new Map(), register(list) { list.forEach(n => this.defs.set(n.id, n)); }, spawn() {} };
  const quests = new QuestEngine({ get save() { return g.save; }, now: () => 0, reward() {}, run() {}, notify() {}, check: () => true, pos: () => g.player.pos, world: () => g.currentWorld?.id ?? '' }); quests.register(ALL_QUESTS);
  g.events.on('flag', e => quests.event('flag', e.id));
  g.worlds = new WorldManager(g.scene, g.field, g.physics, g.interact, () => g, PROFILES.low); ALL_WORLDS.forEach(w => g.worlds.register(w));
  const life = new Neighborhoods(g, npcs, quests), building = new Building(g);
  g.worlds.onLoad = w => { life.onWorldLoad(w); building.onWorldLoad(w); };
  g.worlds.onUnload = id => { life.onWorldUnload(id); building.onWorldUnload(id); };
  return { g, life, quests, npcs, building };
}
test('alle 20 Welten haben erreichbare Aktivitäten; Positionen bleiben nach erneutem Laden gleich', () => {
  const { g, life, npcs } = fixture();
  for (const w of ALL_WORLDS) {
    g.currentWorld = w; g.worlds.load(w.id);
    if (w.id === 'bauland') { assert.ok(g.interact.get('freie_baukiste')); g.worlds.unload(w.id); continue; }
    const site = life.sites.get(w.id); assert.ok(site, w.id);
    const pos = { x: site.x, z: site.z };
    for (const i of g.interact.all.filter(i => i.id.startsWith('ort:' + w.id + ':'))) {
      const p = { x: i.x, y: i.y + 0.05, z: i.z };
      const hit = g.physics.move(p, 0, 0, 0.38, 1.8);
      assert.ok(!hit.hit || Math.hypot(p.x - i.x, p.z - i.z) < i.r - 0.5, w.id + ' ' + i.id + ' blockiert');
    }
    assert.ok(npcs.defs.has('nachbar_' + w.id));
    g.worlds.unload(w.id); g.worlds.load(w.id);
    assert.deepEqual({ x: life.sites.get(w.id).x, z: life.sites.get(w.id).z }, pos, w.id + ' verschoben');
    g.worlds.unload(w.id);
  }
  assert.equal(NEIGHBORHOODS.length, 19);
});
test('säen, gießen, Inselwechsel und Ernte erhalten Fortschritt; Aufgabenbelohnung nur einmal', () => {
  const { g, life, quests } = fixture(); g.currentWorld = g.worlds.byId('hub'); g.worlds.load('hub'); quests.start('ort_hub');
  for (let i = 0; i < 3; i++) { const point = g.interact.get('ort:hub:beet' + i); point.act(); point.act(); }
  assert.equal(g.count('karotte'), 0); g.save.playTime += 15;
  const before = g.save.flags['ort:hub:wuchs0']; g.worlds.unload('hub'); g.worlds.load('hub'); assert.equal(g.flag('ort:hub:wuchs0'), before);
  for (let i = 0; i < 3; i++) g.interact.get('ort:hub:beet' + i).act();
  assert.equal(g.count('karotte'), 3); assert.ok(quests.isDone('ort_hub'));
  const after = g.count('karotte'); life.sites.get('hub').reset(); assert.equal(g.count('karotte'), after);
});
test('Ball trifft das echte Tor auf dem Spielfeld; drei Tore schließen die Aufgabe ab', () => {
  const { g, life, quests } = fixture(); g.currentWorld = g.worlds.byId('fussball'); g.worlds.load('fussball'); quests.start('ort_fussball');
  const s = life.sites.get('fussball'), ball = g.interact.get('ort:fussball:ball');
  for (let shot = 0; shot < 3; shot++) { g.player.pos.set(s.x - 1, g.field.height(s.x, s.z), s.z); ball.act(); for (let frame = 0; frame < 240; frame++) life.update(1 / 60); }
  assert.ok(g.flag('ort:fussball:fertig')); assert.ok(quests.isDone('ort_fussball'));
});
test('freies Bauwerk wird geladen, erhält Kollision und wird beim Inselwechsel entfernt', () => {
  const { g } = fixture(); const w = g.worlds.byId('bauland'); g.save.flags['bau:0:0:0'] = 1; g.save.flags['bau:0:0:1'] = 2;
  g.worlds.load('bauland');
  const x = w.shape.x + 62 - 9, z = w.shape.z + 30 - 9;
  assert.equal(g.physics.ground(x, z, 200).y, g.field.height(x, z) + 4);
  g.worlds.unload('bauland'); assert.equal(g.physics.ground(x, z, 200).solid, null);
  g.worlds.load('bauland'); assert.equal(g.physics.ground(x, z, 200).y, g.field.height(x, z) + 4); g.worlds.unload('bauland');
});
test('neuer Einstieg ist bei Rosi; alte Positionen werden bei der Speicherbereinigung erhalten', () => {
  const { g } = fixture(); assert.ok(Math.hypot(g.save.pos.x - 4, g.save.pos.z + 18) < 8);
  g.save.pos = { world: 'stadt', x: 10, y: 3, z: -290, yaw: 1 }; g.save.flags['bau:0:0:0'] = 5;
  const restored = sanitizeSave(JSON.parse(JSON.stringify(g.save)), 1);
  assert.deepEqual(restored.pos, g.save.pos); assert.equal(restored.flags['bau:0:0:0'], 5);
});
test('jedes ursprüngliche Quest-Ziel hat einen konkreten Ort oder einen nachweisbaren Gesprächspartner', () => {
  const { g, npcs } = fixture(), missing = [];
  for (const w of ALL_WORLDS) {
    g.currentWorld = w; g.worlds.load(w.id); g.player.pos.set(w.spawn.x, 2, w.spawn.z);
    // Statische Abdeckung aller Phasen: auch momentan gesperrte Ziele müssen einen definierten Ort besitzen.
    const inspect = { ...g, interact: { all: g.interact.all.map(i => ({ ...i, when: undefined })) } };
    for (const q of ALL_QUESTS.filter(q => q.world === w.id)) q.stages.forEach((st, phase) => st.objectives.forEach(o => {
      const known = o.at || o.type === 'talk' && npcs.defs.has(o.target) || o.via && npcs.defs.has(o.via) || o.type === 'enter' && g.worlds.byId(o.target) || o.type === 'discover' && g.worlds.byId(o.target.split(':')[0])?.pois[o.target.split(':')[1]] || o.type === 'flag' && o.target.startsWith('done_') && ALL_QUESTS.some(q => q.rewards.flag === o.target) || interactFor(inspect, o);
      if (!known) missing.push(q.id + ' #' + phase + ' ' + o.type + ' ' + o.target);
    }));
    g.worlds.unload(w.id);
  }
  assert.deepEqual(missing, []);
});
test('ein Splitter aus einer anderen Welt erfüllt kein neues Sammelziel; der echte Fund bleibt gespeichert', () => {
  const { g, quests } = fixture();
  g.save.quests.w_drachen = { stage: 2, progress: {}, done: false, started: 0, hints: 0 };
  g.save.inventory.splitter = 1; quests.recheck();
  assert.equal(g.save.quests.w_drachen.progress.s ?? 0, 0);
  g.save.collected.push('pick:dr_splitter'); quests.recheck();
  assert.equal(g.save.quests.w_drachen.progress.s, 1);
});
test('Zielsuche überspringt verbrauchte Fundstellen und folgt der aktuellen NPC-Position', () => {
  const { g, npcs } = fixture();
  g.interact.add({ id: 'pick:alt', tag: 'hub', x: 0, y: 1, z: 0, r: 2, icon: '💎', label: 'alt', meta: { item: 'kristall' }, when: () => false, act() {} });
  g.interact.add({ id: 'pick:neu', tag: 'hub', x: 10, y: 1, z: 0, r: 2, icon: '💎', label: 'neu', meta: { item: 'kristall' }, act() {} });
  assert.equal(interactFor(g, { id: 'k', type: 'have', target: 'kristall', label: 'Kristall' }).id, 'pick:neu');
  npcs.live.set('florian', { pos: { x: 42, z: -300 } });
  const q = ALL_QUESTS.find(q => q.id === 's_stadt_brief');
  assert.deepEqual(resolveObjective(g, npcs, q, q.stages[0], q.stages[0].objectives[0]), { x: 42, z: -300, precise: true });
});
