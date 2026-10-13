// Game: state machine, main loop, save handling, region/interior transitions
// and all story / interaction scripts.
import { THREE } from '../engine/three.js';
import { Renderer, PROFILES } from '../engine/renderer.js';
import { Sky } from '../engine/sky.js';
import { globalUniforms } from '../engine/materials.js';
import { Preview } from '../engine/preview.js';
import { Settings } from '../core/settings.js';
import { Input } from '../core/input.js';
import { Audio } from '../core/audio.js';
import { createRng } from '../core/rng.js';
import { UI, h } from '../ui/ui.js';
import { lookForRole } from '../engine/characters.js';
import { HUD } from '../ui/hud.js';
import { openPauseMenu, openShop, openStorage, openTravel } from '../ui/menus.js';
import { titleScreen, slotScreen, creatorScreen, introSlides, starterPreview } from '../ui/screens.js';
import { World } from './world.js';
import { BattleScene } from './battle-scene.js';
import { REGIONS } from '../data/regions.js';
import { SPECIES } from '../data/species.js';
import { ITEMS } from '../data/items.js';
import { TRAINERS, GUILD_BATTLES, GUILD_MEMBERS } from '../data/trainers.js';
import { ULME, GUILD_SCENES, LEAGUE_FINALE, CREDITS, CHAPTERS, professorLines } from '../data/story.js';
import { makeMonster, healMonster, maxHp, evolve } from '../logic/monster.js';
import { rollEncounter, levelRange } from '../logic/encounters.js';
import { createStore, newSave, exportJSON, importJSON } from '../logic/save.js';
import * as P from '../logic/progress.js';
import * as Items from '../logic/items.js';

export const STATES = Object.freeze({ BOOT: 'boot', TITLE: 'title', CREATOR: 'creator', LOADING: 'loading', WORLD: 'world', BATTLE: 'battle', CUTSCENE: 'cutscene' });
const TRANSITIONS = {
  boot: ['title'], title: ['creator', 'loading', 'title'], creator: ['loading', 'title'], loading: ['world', 'cutscene', 'title'],
  world: ['battle', 'loading', 'cutscene', 'title'], battle: ['world', 'loading', 'cutscene'], cutscene: ['world', 'battle', 'loading', 'title']
};
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const LEGEND_REGION = { tiefenlied: 1, sturmkron: 11, mondhueter: 13, auraflamme: 14 };

export class Game {
  constructor(root, canvas) {
    this.state = STATES.BOOT;
    this.settings = new Settings();
    this.quality = PROFILES[this.settings.get('graphics')];
    this.renderer = new Renderer(canvas, this.settings.get('graphics'));
    this.renderer.adaptive = this.settings.get('adaptive');
    this.input = new Input(this.settings);
    this.audio = new Audio(this.settings);
    this.ui = new UI(root, { audio: this.audio, input: this.input, settings: this.settings });
    this.preview = new Preview();
    this.store = createStore(localStorage);
    this.slot = this.store.selected();
    this.rng = createRng(Date.now());
    this.world = new World(this);
    this.sky = new Sky(this.world.scene, this.quality);
    this.sky.onThunder = () => this.audio.sfx('thunder');
    this.battleScene = new BattleScene(this);
    this.hud = new HUD(this);
    this.hud.show(false);
    this.save = newSave();
    this.busy = 0;
    this.renderer.onResize = (w, hh) => { for (const c of [this.world.camera, this.battleScene.camera]) { c.aspect = w / hh; c.updateProjectionMatrix(); } this.preview.resize(); };
    this.renderer.resize();
    this.settings.on('change', (k) => {
      if (k === 'graphics') { this.quality = PROFILES[this.settings.get('graphics')]; this.renderer.setProfile(this.settings.get('graphics')); this.ui.toast('Grafikprofil: ' + this.quality.label + ' (gilt vollständig ab dem nächsten Gebietswechsel)'); }
      if (k === 'adaptive') this.renderer.adaptive = this.settings.get('adaptive');
    });
    this.clock = new THREE.Clock();
    this.autosaveT = 0; this.titleT = 0;
    const unlock = () => this.audio.unlock();
    addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.state === STATES.WORLD) this.saveNow(); });
    addEventListener('pagehide', () => { if (this.state === STATES.WORLD) this.saveNow(); });
    window.__taschi = this; // used by automated browser tests
  }
  setState(next) {
    if (this.state === next) return true;
    if (!TRANSITIONS[this.state]?.includes(next)) { console.warn('TASCHI: invalid transition', this.state, '→', next); return false; }
    this.state = next;
    document.body.dataset.state = next;
    this.input.flush();
    this.hud.show(next === STATES.WORLD);
    return true;
  }

  // ------------------------------------------------------------------ boot & title
  async boot(progress) {
    progress(0.2, 'Welt vorbereiten …');
    await this.world.loadRegion(0, 'start', (p, t) => progress(0.2 + p * 0.7, t));
    this.world.buildPlayer();
    this.world.player.root.visible = false;
    progress(1, 'Bereit');
    this.loop();
    this.setState(STATES.TITLE);
    this.showTitle();
  }
  showTitle() {
    this.ui.clear();
    this.hud.show(false);
    this.audio.play('title');
    this.audio.setAmbience('birds');
    const sum = this.store.summary(this.slot);
    const scr = titleScreen(this, {
      onContinue: () => this.continueGame(),
      onNew: async () => {
        if (!sum.empty) { const c = await this.ui.ask([{ text: 'Auf Platz ' + this.slot + ' gibt es schon ein Abenteuer. Überschreiben? (Exportiere es vorher, wenn du es behalten möchtest.)' }], ['Abbrechen', 'Überschreiben'], { cancelIndex: 0 }); if (c !== 1) return; }
        this.newGame();
      },
      onSlots: async () => { const n = await slotScreen(this); if (n) { this.slot = n; this.store.select(n); this.showTitle(); } },
      onSettings: () => { openPauseMenu(this, 'options'); }
    });
    this.ui.push(scr);
    this.titleScreenRef = scr;
    if (this.loadWarnings?.length) { for (const w of this.loadWarnings) this.ui.toast(w, '⚠'); this.loadWarnings = null; }
  }
  stashCloud() { const c = document.getElementById('cloudMount'); const holder = document.getElementById('cloudHolder'); if (c && holder && c.parentNode !== holder) holder.append(c); }
  async continueGame() {
    const { save, warnings } = this.store.load(this.slot);
    if (!save) { this.ui.toast('Kein Spielstand gefunden.'); return; }
    for (const w of warnings) this.ui.toast(w, '⚠');
    this.save = save;
    if (!save.team.length || !save.flags.introDone) { this.stashCloud(); this.ui.clear(); this.setState(STATES.LOADING); await this.enterLocation(save.location); this.setState(STATES.WORLD); return; }
    this.stashCloud();
    this.ui.clear();
    this.setState(STATES.LOADING);
    await this.enterLocation(save.location);
    this.setState(STATES.WORLD);
    this.ui.toast('Willkommen zurück, ' + save.player.name + '!');
  }
  async newGame() {
    this.stashCloud();
    this.ui.clear();
    this.setState(STATES.CREATOR);
    this.audio.play('lab');
    const p = await creatorScreen(this);
    this.save = newSave(p);
    this.store.write(this.slot, this.save);
    await introSlides(this);
    this.save.flags.introDone = true;
    this.setState(STATES.LOADING);
    await this.enterLocation({ map: 'region:0', spawn: 'start' });
    this.setState(STATES.WORLD);
    this.saveNow(true);
  }
  async toTitle() {
    this.saveNow(true);
    this.ui.clear();
    this.setState(STATES.TITLE);
    await this.loadWithScreen(() => this.world.loadRegion(0, 'start'));
    this.world.player.root.visible = false;
    if (this.world.follower) this.world.follower.c.root.visible = false;
    this.showTitle();
  }

  // ------------------------------------------------------------------ locations
  async loadWithScreen(fn, label = 'Unterwegs …') {
    const bar = h('i'), txt = h('div.loadtext', {}, label);
    const el = h('div.screen', { style: { background: 'radial-gradient(ellipse at 50% 30%, #2f5f8a, #0b1424)', zIndex: 49 } }, h('div.logo', {}, h('div.orb', { style: { width: '70px', height: '70px' } }), h('div.loadbar', {}, bar), txt));
    const scr = { el, onInput: () => true };
    this.ui.push(scr);
    const t0 = performance.now();
    try { return await fn((p, t) => { bar.style.width = Math.round(p * 100) + '%'; if (t) txt.textContent = t; }); }
    finally { const dt = performance.now() - t0; if (dt < 350) await wait(350 - dt); this.ui.pop(scr); }
  }
  async enterLocation(loc) {
    const [kind, id] = String(loc.map).split(':');
    const r = Number(id) || 0;
    this.world.buildPlayerIfNeeded?.();
    await this.loadWithScreen(async (prog) => {
      if (kind === 'region') await this.world.loadRegion(r, loc.spawn || { x: loc.x, z: loc.z, ry: loc.ry }, prog);
      else { await this.world.loadRegion(r, 'heal', prog); }
    }, kind === 'region' ? (r === 16 ? 'Sternengipfel' : REGIONS[r].name) : 'Unterwegs …');
    this.world.buildPlayer();
    const sp = loc.spawn ? (this.world.current.layout.spawn[loc.spawn] || this.world.current.layout.spawn.start) : loc;
    this.world.placePlayer(sp.x, sp.z, sp.ry ?? 0);
    this.world.player.root.visible = true;
    this.afterRegionLoaded();
  }
  afterRegionLoaded() {
    const r = this.world.current.region;
    this.hud.banner(r === 16 ? 'Sternengipfel' : REGIONS[r].name, r === 16 ? 'Halle der Sternenliga' : REGIONS[r].town);
    this.updateMusic(true);
    this.world.updateGates();
    this.save.visited[r] = true;
  }
  async travelToRegion(r, spawn) {
    this.busy++;
    this.saveNow();
    await this.ui.fade(true);
    try {
      this.setState(STATES.LOADING);
      await this.loadWithScreen((prog) => this.world.loadRegion(r, spawn, prog), r === 16 ? 'Sternengipfel' : REGIONS[r].name);
      this.world.refreshFollower();
      this.afterRegionLoaded();
      this.setState(STATES.WORLD);
    } finally { await this.ui.fade(false); this.busy--; }
    this.saveNow();
  }
  async enterInterior(kind) {
    const c = this.world.current;
    const ret = { region: c.region, x: this.world.player.root.position.x, z: this.world.player.root.position.z, ry: this.world.player.root.rotation.y + Math.PI };
    this.busy++;
    this.audio.sfx('door');
    await this.ui.fade(true);
    this.setState(STATES.LOADING);
    await this.world.loadInterior(kind, c.region, {});
    this.world.current.returnTo = ret;
    this.world.refreshFollower();
    this.setState(STATES.WORLD);
    this.updateLeagueGates();
    this.updateMusic(true);
    await this.ui.fade(false);
    this.busy--;
    if (kind === 'arena') this.arenaWelcome();
  }
  async leaveInterior() {
    const ret = this.world.current.returnTo;
    this.busy++;
    this.audio.sfx('door');
    await this.ui.fade(true);
    this.setState(STATES.LOADING);
    await this.loadWithScreen((prog) => this.world.loadRegion(ret.region, { x: ret.x, z: ret.z, ry: ret.ry }, prog), REGIONS[Math.min(15, ret.region)]?.name);
    this.world.refreshFollower();
    this.updateMusic(true);
    this.world.updateGates();
    this.setState(STATES.WORLD);
    await this.ui.fade(false);
    this.busy--;
  }
  updateLeagueGates() { for (const d of this.world.current?.interior?.dynamic || []) if (d.kind === 'leagueGate') d.mesh.visible = this.save.league <= d.idx; }
  inTown() { const c = this.world.current; if (!c || c.type !== 'region' || c.region === 16) return true; const p = this.world.player.root.position, L = c.layout; return Math.hypot(p.x - L.plaza.x, p.z - L.plaza.z) < 42; }
  updateMusic(force = false) {
    const c = this.world.current; if (!c) return;
    let track, amb;
    if (c.type === 'interior') { track = c.interior.music; amb = c.interior.ambience; }
    else if (c.region === 16) { track = this.save.flags.summitDone ? 'league' : 'guild'; amb = 'wind'; }
    else {
      const g = REGIONS[c.region];
      const nearGuild = c.layout.guild && this.save.guild[g.guild] !== 'done' && this.world.player.root.position.distanceTo(new THREE.Vector3(c.layout.guild.x, this.world.player.root.position.y, c.layout.guild.z)) < 28;
      track = nearGuild ? 'guild' : this.inTown() ? g.music : 'route';
      amb = this.isNight() ? (['sea', 'lava', 'swamp', 'wind'].includes(g.ambience) ? g.ambience : 'night') : g.ambience;
    }
    if (force || track !== this.audio.track?.id) this.audio.play(track);
    this.audio.setAmbience(amb);
  }
  isNight() { const m = this.save.worldTime; return m < 6 * 60 || m >= 20 * 60; }
  northOpen() { const r = this.world.current?.region; return r === 15 ? P.summitOpen(this.save) : P.northGateOpen(this.save, r); }

  // ------------------------------------------------------------------ saving
  saveNow(milestone = false) {
    const w = this.world, s = this.save;
    if (!s.team.length && !s.flags.introDone) return;
    if (w.current && w.player) {
      if (w.current.type === 'region') s.location = { map: 'region:' + w.current.region, x: +w.player.root.position.x.toFixed(2), z: +w.player.root.position.z.toFixed(2), ry: +w.player.root.rotation.y.toFixed(2) };
      else { const r = w.current.returnTo; s.location = { map: 'region:' + r.region, x: +r.x.toFixed(2), z: +r.z.toFixed(2), ry: r.ry }; }
    }
    this.store.write(this.slot, s);
    if (milestone) this.store.backup(this.slot, s);
  }
  exportSave() {
    this.saveNow();
    const blob = new Blob([exportJSON(this.save)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'taschi-spielstand-' + this.save.player.name + '.json';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    this.ui.toast('Spielstand exportiert', '⇩');
  }
  importSave() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = async () => {
      try {
        const f = inp.files?.[0]; if (!f) return;
        const s = importJSON(await f.text());
        this.store.backup(this.slot, this.save);
        this.save = s; this.store.write(this.slot, s);
        this.ui.clear();
        this.setState(STATES.LOADING);
        await this.enterLocation(s.location);
        this.setState(STATES.WORLD);
        this.ui.toast('Spielstand importiert', '⇧');
      } catch (e) { this.ui.say([{ text: 'Import fehlgeschlagen: ' + (e.message || e) }]); }
    };
    inp.click();
  }
  async toggleFullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { this.ui.toast('Vollbild ist hier nicht verfügbar.'); } }

  // ------------------------------------------------------------------ main loop
  loop() {
    const frame = () => {
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, this.clock.getDelta());
      globalUniforms.uTime.value += dt;
      this.input.update();
      if (this.ui.blocking) this.ui.handleInput(this.input);
      const worldActive = this.state === STATES.WORLD && !this.ui.blocking && !this.busy;
      if (worldActive) this.worldInput();
      if (this.state === STATES.WORLD) this.tickTime(dt);
      if (this.state === STATES.BATTLE) {
        this.battleScene.update(dt);
        this.renderer.render(this.battleScene.scene, this.battleScene.camera);
      } else {
        if (this.state === STATES.TITLE) this.titleCamera(dt);
        else this.world.update(dt, this.input, worldActive);
        if (this.state !== STATES.TITLE && this.world.player) this.sky.update(dt, this.save.worldTime, this.world.player.root.position, this.world.camera);
        else this.sky.update(dt, 10 * 60, new THREE.Vector3(0, 0, 14), this.world.camera);
        this.renderer.render(this.world.scene, this.world.camera);
      }
      this.preview.update(dt);
      this.hud.update(dt);
      this.renderer.adapt(dt);
      this.input.endFrame();
    };
    requestAnimationFrame(frame);
  }
  titleCamera(dt) {
    this.titleT += dt * 0.05;
    const c = this.world.camera;
    c.position.set(Math.sin(this.titleT) * 46, 26, 14 + Math.cos(this.titleT) * 46);
    c.lookAt(0, 2, 12);
    if (this.world.current?.map) this.world.current.map.update(globalUniforms.uTime.value, dt, c, c.position);
  }
  tickTime(dt) {
    const s = this.save;
    s.playTime += dt;
    const mode = this.settings.get('dayCycle');
    if (mode === 'day') s.worldTime = 11 * 60;
    else if (mode === 'realtime') { const d = new Date(); s.worldTime = d.getHours() * 60 + d.getMinutes(); }
    else s.worldTime = (s.worldTime + dt) % 1440; // 1 real second = 1 game minute
    this.autosaveT += dt;
    if (this.autosaveT > 30) { this.autosaveT = 0; this.saveNow(); }
    if (Math.floor(s.playTime) % 3 === 0 && Math.floor(s.playTime - dt) % 3 !== 0) this.updateMusic();
  }
  worldInput() {
    const i = this.input;
    if (i.pressed('menu')) { this.audio.sfx('confirm'); openPauseMenu(this, 'team'); return; }
    if (i.pressed('team')) { openPauseMenu(this, 'team'); return; }
    if (i.pressed('map')) { openPauseMenu(this, 'map'); return; }
    if (i.pressed('confirm') && this.world.near) { const e = this.world.near; this.script(() => this.interact(e)); }
    i.pressed('back');
  }
  async script(fn) {
    if (this.busy) return;
    this.busy++;
    try { await fn(); } catch (e) { console.error('TASCHI script error', e); this.ui.toast('Fehler: ' + e.message, '⚠'); }
    finally { this.busy--; this.input.flush(); }
  }

  // ------------------------------------------------------------------ objectives
  objective() { return P.mainObjective(this.save); }
  objectiveTarget() {
    const o = this.objective(), c = this.world.current;
    if (!c || c.type !== 'region' || (o.region !== null && o.region !== c.region && !(o.region === 16 && c.region === 15))) {
      if (c?.type === 'region' && o.region !== null && o.region !== undefined) { const L = c.layout; const g = L.gates.find(gt => (o.region > c.region ? gt.id === 'north' : gt.id === 'south')); return g || null; }
      return null;
    }
    const L = c.layout;
    switch (o.target) {
      case 'professor': return L.ulme || L.buildings.find(b => b.kind === 'lab')?.door;
      case 'podium': return L.dome?.podium;
      case 'puzzle': return L.puzzle;
      case 'arena': return L.buildings.find(b => b.kind === 'arena')?.door;
      case 'champion': return L.pavilion;
      case 'guild': return L.guild && this.save.guild[REGIONS[c.region]?.guild] !== 'done' && this.guildBattlesAt(REGIONS[c.region].guild)[0]?.where !== 'station' ? L.guild : L.buildings.find(b => b.kind === 'station')?.door || L.guild;
      case 'north': case 'league': return c.region === 16 ? (this.save.flags.summitDone ? L.buildings.find(b => b.kind === 'league')?.door : { x: 0, z: -10 }) : L.gates.find(g => g.id === 'north');
    }
    return null;
  }
  guildBattlesAt(site) {
    return (GUILD_BATTLES[site] || []).filter(t => !this.save.trainers[t.id]).map(t => ({ id: t.id, name: GUILD_MEMBERS[t.member].name, look: t.member === 'kett' ? 'twin' : GUILD_MEMBERS[t.member].look === 'twins' ? 'twin' : t.member, where: site === 2 && t.id !== 'g2_grunt' ? 'station' : 'camp' }));
  }

  // ------------------------------------------------------------------ interactions
  async interact(e) {
    const s = this.save, c = this.world.current, r = c.region;
    this.world.player.play('interact', 0.5);
    switch (e.kind) {
      case 'npc': return this.talkToNPC(e.npc);
      case 'door': {
        if (e.target === 'arena' && !P.arenaOpen(s, r)) { this.audio.sfx('error'); return this.ui.say([{ text: 'Das Tor der ' + REGIONS[r].gym.theme + ' ist mit einem Lichtsiegel verschlossen. Ein Schild: „Wer die Arena betreten will, löse zuerst das Rätsel ' + REGIONS[r].puzzle.name + ' am Siegelplatz.“' }]); }
        if (e.target === 'station' && !s.bag.gildenschluessel) { this.audio.sfx('error'); return this.ui.say([{ text: 'Eine schwere Stahltür mit violett-orangem Schloss. Ohne Gildenschlüssel kommst du hier nicht hinein.' }]); }
        if (e.target === 'station' && s.guild[2] === 'done') return this.ui.say([{ text: 'Die Forschungsstation ist versiegelt. Professor Ignis untersucht die Maschine.' }]);
        if (e.target === 'league' && !s.flags.summitDone) { this.audio.sfx('error'); return this.ui.say([{ text: 'Die Halle ist von Vargas Maschine abgeriegelt. Halte die Schattengilde auf!' }]); }
        if (e.target === 'house') return this.enterInterior('house');
        return this.enterInterior(e.target);
      }
      case 'exit': return this.leaveInterior();
      case 'knock': { const reg = REGIONS[Math.min(15, r)]; const n = reg.npcs[(e.id.length + r) % reg.npcs.length]; return this.ui.say([{ text: 'Du klopfst. Von drinnen ruft jemand: „Komm später wieder, ich backe gerade!“' }, { who: n.name, text: 'Übrigens: ' + n.lines.pre[0] }]); }
      case 'look': return this.ui.say([{ text: e.text }]);
      case 'landmark': return this.ui.say([{ text: e.label + '. ' + landmarkText(r, this.world.current.layout.landmark.kind) }]);
      case 'gate': return this.useGate(e);
      case 'chest': return this.openChest(e);
      case 'item': return this.pickItem(e);
      case 'gatedItem': { this.audio.sfx('item'); Items.add(s.bag, e.reward.item, 1); s.found[e.reward.id] = true; if (e.mesh) e.mesh.visible = false; return this.ui.say([{ text: 'Du findest: ' + ITEMS[e.reward.item].name + '!' }]); }
      case 'obstacle': return this.obstacle(e);
      case 'legend': return this.legend();
      case 'guild': return this.guildEvent(e.site);
      case 'champion': { const n = this.world.npcs.find(x => x.champion); return n ? this.talkToNPC(n) : null; }
      case 'heal': return this.healAt(e);
      case 'pc': return openStorage(this);
      case 'save': this.saveNow(true); this.audio.sfx('item'); return this.ui.say([{ text: 'Du trägst deine Reise ins Buch ein. Der Spielstand wurde gesichert.' }]);
      case 'travel': { const to = await openTravel(this); if (to !== null && to !== undefined) { this.ui.toast('Das Flugtaxi hebt ab …', '✈'); await this.travelToRegion(to, 'heal'); } return; }
      case 'shop': return openShop(this, REGIONS[Math.min(15, r)].npcs.find(n => n.role === 'haendler')?.name || 'Verkäufer');
      case 'dexinfo': return this.ui.say([{ who: 'Forschungscomputer', text: 'Taschidex-Auswertung: ' + P.caughtCount(s) + ' gefangene und ' + P.seenCount(s) + ' gesehene Arten. Hinweis: Manche Taschis zeigen sich nur nachts, in Höhlen oder am Wasser.' }]);
      case 'crystal': return this.caveCrystal(e);
      case 'rare': return this.rareEncounter();
      case 'machine': return this.ui.say([{ text: 'Auf dem Display der Maschine steht: „Projekt Lichtspeicher – Zielwert: 16 Lichter“. Daneben kleben Zettel mit zittriger Schrift: „Brix, prüfe die Kristallspannung!“' }]);
      case 'puzzle': return this.puzzleAct(e);
      case 'starter': return this.starterBall(e);
    }
  }
  async useGate(e) {
    const s = this.save, r = this.world.current.region;
    if (e.gate === 'north' && !this.northOpen()) {
      this.audio.sfx('error');
      if (r === 15) return this.ui.say([{ who: 'Torwächter', text: s.badges < 16 ? 'Nur wer alle sechzehn Licht-Siegel trägt, darf zum Sternengipfel.' : !s.champions[15] ? 'Besiege zuerst ' + REGIONS[15].champion.name + '.' : 'Die Gilde hat das Tor elektronisch verriegelt. Ohne passende Zugangskarte geht hier nichts.' }]);
      return this.ui.say([{ who: 'Torwächter', text: 'Das Nordtor öffnet sich erst, wenn du den Champion von ' + REGIONS[r].name + ', ' + REGIONS[r].champion.name + ', besiegt hast.' }]);
    }
    if (!s.team.length) return this.ui.say([{ text: 'Ohne eigenes Taschi ist es da draußen zu gefährlich.' }]);
    const to = e.to;
    const spawn = e.gate === 'north' ? 'south' : (to === 15 && r === 16 ? 'north' : 'north');
    const ok = await this.ui.ask([{ text: e.label + '?' }], ['Reisen', 'Bleiben'], { cancelIndex: 1 });
    if (ok !== 0) return;
    await this.travelToRegion(to, spawn);
  }
  async openChest(e) {
    const s = this.save, key = e.chestKey || 'region:' + this.world.current.region;
    if (s.chests[key]) return this.ui.say([{ text: 'Die Truhe ist leer.' }]);
    s.chests[key] = true;
    if (e.mesh?.userData.lid) { const lid = e.mesh.userData.lid; const t0 = performance.now(); const step = () => { const u = Math.min(1, (performance.now() - t0) / 500); lid.rotation.x = -1.9 * u; if (u < 1) requestAnimationFrame(step); }; step(); }
    this.audio.sfx('chest');
    const r = this.world.current.region;
    const reward = { coins: 80 + r * 30, items: { taschiball: 4, trank: 2, ...(r >= 4 ? { superball: 2 } : {}), ...(r >= 9 ? { supertrank: 2 } : {}), ...(key.startsWith('cave') ? { sternsplitter: 1 } : {}) } };
    const got = P.grantReward(s, reward);
    await wait(400);
    return this.ui.say([{ text: 'In der Truhe liegen: ' + got.join(', ') + '.' }]);
  }
  async pickItem(e) {
    const s = this.save, it = e.item;
    this.audio.sfx('item');
    if (e.mesh) e.mesh.visible = false;
    if (it.flag) { s.flags[it.flag] = true; s.found[it.id] = true; return this.ui.say([{ text: 'Du hast etwas gefunden: ' + it.label + '! Bring es zu der Person, die es vermisst.' }]); }
    s.found[it.id] = true;
    Items.add(s.bag, it.item, it.count || 1);
    return this.ui.say([{ text: 'Versteckter Fund: ' + (it.count > 1 ? it.count + '× ' : '') + ITEMS[it.item].name + '!' }]);
  }
  async obstacle(e) {
    const s = this.save, o = e.obstacle;
    const need = o.kind === 'boulder' ? ['gestein', 'erde'] : ['feuer', 'pflanze'];
    const helper = s.team.find(m => m.hp > 0 && (need.includes(SPECIES[m.id].type) || need.includes(SPECIES[m.id].type2)));
    const text = o.kind === 'boulder' ? 'Ein riesiger Felsbrocken versperrt einen schmalen Pfad. Ein starkes Gestein- oder Erde-Taschi könnte ihn zur Seite rollen.' : 'Dichtes Dornengestrüpp versperrt den Weg. Ein Feuer- oder Pflanzen-Taschi könnte es beiseiteschaffen.';
    if (!helper) return this.ui.say([{ text }]);
    const c = await this.ui.ask([{ text }, { text: SPECIES[helper.id].name + ' könnte helfen. Soll es?' }], ['Ja', 'Nein'], { cancelIndex: 1 });
    if (c !== 0) return;
    this.audio.sfx(o.kind === 'boulder' ? 'push' : 'hit', { type: 'feuer' });
    if (e.mesh) { const t0 = performance.now(); const step = () => { const u = Math.min(1, (performance.now() - t0) / 700); e.mesh.scale.setScalar(1 - u * 0.99); e.mesh.position.x += 0.02; if (u < 1) requestAnimationFrame(step); else e.mesh.visible = false; }; step(); }
    s.found['obstacle:' + this.world.current.region] = true;
    await wait(700);
    return this.ui.say([{ text: SPECIES[helper.id].name + ' hat den Weg freigemacht!' }]);
  }
  async healAt() {
    const s = this.save, c = this.world.current;
    const nurse = this.world.npcs.find(n => n.id === 'nurse');
    if (nurse) { nurse.facePlayer = true; nurse.ch.setTalking(true, 'happy'); }
    const ok = await this.ui.ask([{ who: nurse ? 'Schwester Hanna' : 'Heilquelle', text: nurse ? 'Willkommen im Heilzentrum! Sollen wir deine Taschis wieder fit machen?' : 'Das Licht der Quelle schimmert warm. Deine Taschis heilen?' }], ['Ja, bitte', 'Nein danke'], { cancelIndex: 1 });
    if (nurse) nurse.ch.setTalking(false);
    if (ok !== 0) { if (nurse) nurse.facePlayer = false; return; }
    this.audio.stopMusic();
    this.audio.sfx('heal');
    const glow = c.interior?.healGlow;
    if (glow) { const t0 = performance.now(); await new Promise(res => { const step = () => { const u = (performance.now() - t0) / 1800; glow.material.opacity = Math.max(0, Math.sin(u * Math.PI * 4)) * 0.7; if (u < 1) requestAnimationFrame(step); else { glow.material.opacity = 0; res(); } }; step(); }); }
    else await wait(1600);
    for (const m of s.team) healMonster(m);
    s.lastHeal = { map: 'region:' + c.region, spawn: 'heal' };
    this.world.refreshFollower();
    this.updateMusic(true);
    this.saveNow(true);
    if (nurse) { nurse.ch.play('wave', 1.2); nurse.facePlayer = false; }
    return this.ui.say([{ who: nurse ? 'Schwester Hanna' : '', text: 'Deine Taschis sind wieder topfit! Dein Spielstand wurde gesichert. Pass gut auf sie auf!' }]);
  }

  // ------------------------------------------------------------------ talking
  async talkToNPC(n) {
    const s = this.save, r = this.world.current.region;
    const ch = n.ch;
    n.facePlayer = true;
    try {
      if (n.id === 'ulme') return await this.ulmeTalk(n);
      if (n.trainer) return await this.trainerTalk(n);
      if (n.professor) return await this.professorTalk(n);
      if (n.id === 'nurse') return await this.healAt();
      if (n.id === 'clerk') return await openShop(this, n.name);
      if (n.talk === 'giver') return await this.questTalk(n, P.questById(n.quest));
      if (n.talk === 'resident') {
        const line = residentLine(n.data, s, r);
        const q = (REGIONS[r].quests || []).find(q => q.giver === n.data.name);
        ch.setTalking(true, 'talk');
        await this.ui.say([{ who: n.data.name, text: line }]);
        ch.setTalking(false);
        if (q) await this.questTalk(n, P.questById(q.id));
        return;
      }
      if (n.talk === 'family') { ch.setTalking(true); await this.ui.say([{ who: n.name, text: 'Schön, dass du vorbeischaust! Setz dich, wir haben gerade Tee gekocht. Hast du schon ' + REGIONS[Math.min(15, r)].landmark.name + ' gesehen?' }]); ch.setTalking(false); return; }
      if (n.talk === 'assistant') { ch.setTalking(true); await this.ui.say([{ who: n.name, text: 'Der Professor ist so stolz auf dich! Wusstest du, dass Taschis schneller wachsen, wenn sie im Team mitkämpfen?' }]); ch.setTalking(false); return; }
      if (n.talk === 'brix') { ch.setTalking(true, 'happy'); await this.ui.say([{ who: 'Brix', text: s.league >= 5 ? 'Sternenmeister! Schnurrik und ich bauen jetzt Nistkästen statt Fangmaschinen.' : 'Die Lichter sind frei. Viel Glück in der Sternenliga!' }]); ch.setTalking(false); return; }
      if (n.talk === 'varga') { ch.setTalking(true, 'sad'); await this.ui.say([{ who: 'Varga', text: 'Ich helfe, die gestohlenen Taschis heimzubringen. Das ist das Mindeste. Danke, dass du mich aufgehalten hast.' }]); ch.setTalking(false); return; }
      ch.setTalking(true); await this.ui.say([{ who: n.name, text: 'Hallo! Schönes Wetter heute, oder?' }]); ch.setTalking(false);
    } finally { n.facePlayer = false; }
  }
  async questTalk(n, q) {
    if (!q) return;
    const s = this.save, st = P.questState(s, q);
    const who = q.giver;
    if (st.status === 'new') {
      const c = await this.ui.ask([{ who, text: q.desc + ' Hilfst du mir?' }], ['Ja, mache ich', 'Später'], { cancelIndex: 1 });
      if (c === 0) { P.acceptQuest(s, q); this.audio.sfx('item'); this.ui.toast('Neue Aufgabe: ' + q.title, '📜'); }
    } else if (st.status === 'ready') {
      const res = P.turnInQuest(s, q);
      if (res.ok) { this.audio.sfx('chest'); n.ch?.play('cheer', 1.2); await this.ui.say([{ who, text: 'Wunderbar, vielen Dank! Hier, das ist für dich.' }, { text: 'Erhalten: ' + res.rewards.join(', ') }]); this.saveNow(true); }
    } else if (st.status === 'active') {
      const step = q.steps[st.step];
      await this.ui.say([{ who, text: 'Wie läuft es? ' + step.text + ' ' + P.stepProgress(s, step) }]);
    }
  }
  async ulmeTalk(n) {
    const s = this.save, f = s.flags;
    const say = async (lines) => { for (const l of lines) { n.ch.setTalking(true, l.mood); await this.ui.say([l]); } n.ch.setTalking(false); };
    if (!f.metUlme) {
      await say(ULME.greet);
      f.metUlme = true; this.saveNow();
      this.ui.toast('Neues Ziel: Untersuche die Taschibälle unter der Glaskuppel.', '➜');
      return;
    }
    if (!f.starterChosen) return say(ULME.reminder);
    if (!f.firstBattle) return this.firstBattle(n);
    if (!f.firstQuest) return this.ulmeFinish(n);
  }
  async starterBall(e) {
    const s = this.save, f = s.flags;
    if (!f.metUlme) return this.ui.say([{ text: 'Drei Taschibälle liegen versiegelt auf dem Podest. Professor Ulme wartet draußen vor der Kuppel.' }]);
    if (f.starterChosen) return this.ui.say([{ text: 'Die übrigen Bälle bleiben für die nächsten Trainer hier.' }]);
    const ok = await starterPreview(this, e.species);
    if (!ok) return;
    const m = makeMonster(e.species, 5, this.rng);
    s.team.push(m); s.dex[e.species] = 2; f.starterChosen = true; f.starter = e.species;
    this.audio.sfx('catch');
    this.world.player.play('cheer', 1.4);
    this.world.refreshFollower();
    await wait(600);
    await this.ui.say([{ text: SPECIES[e.species].name + ' springt aus dem Ball und schaut dich neugierig an. Ihr seid jetzt ein Team!' }]);
    const ulme = this.world.npcs.find(x => x.id === 'ulme');
    if (ulme) await this.firstBattle(ulme);
  }
  async firstBattle(ulme) {
    const s = this.save;
    for (const l of ULME.afterStarter) { ulme.ch.setTalking(true, l.mood); await this.ui.say([l]); }
    ulme.ch.setTalking(false);
    const foe = makeMonster('fellino', 3, this.rng);
    const res = await this.battle({ kind: 'wild', foeTeam: [foe], canRun: false, canCatch: false, ai: 0, music: 'battle' });
    s.flags.firstBattle = true;
    for (const m of s.team) healMonster(m);
    if (res.outcome === 'lose') await this.ui.say([{ who: 'Professor Ulme', text: 'Keine Sorge, das passiert den Besten. Ich habe dein Taschi schon wieder versorgt.' }]);
    await this.ulmeFinish(ulme);
  }
  async ulmeFinish(ulme) {
    const s = this.save;
    for (const l of ULME.afterBattle) { ulme.ch.setTalking(true, l.mood); await this.ui.say([l]); }
    ulme.ch.setTalking(false);
    P.grantReward(s, { items: { taschiball: 5, trank: 3 }, keyItem: 'pfadkarte' });
    this.audio.sfx('item');
    s.flags.firstQuest = true; s.flags.travelStarted = true;
    for (const q of P.regionQuests(0)) if (q.id === 'q0_lost') P.acceptQuest(s, q);
    this.ui.toast('Erhalten: 5× Taschiball, 3× Trank, Pfadkarte', '🎒');
    // Ulme walks back to his lab
    const lab = this.world.current.layout.buildings.find(b => b.kind === 'lab');
    ulme.facePlayer = false;
    ulme.walkTo = { x: lab.door.x, z: lab.door.z, speed: 2.4, done: () => { this.world.scene.remove(ulme.ch.root); this.world.npcs = this.world.npcs.filter(x => x !== ulme); } };
    this.saveNow(true);
  }
  async professorTalk(n) {
    const s = this.save, r = Math.min(15, this.world.current.region), region = REGIONS[r];
    const lines = r === 0 && s.flags.firstQuest && !s.flags['prof:0'] ? [{ who: 'Professor Ulme', text: 'Hier in meinem Labor erforsche ich Taschis. Komm jederzeit vorbei, wenn du Fragen hast!', mood: 'happy' }] : professorLines(region, s, region);
    for (const l of lines) { n.ch.setTalking(true, l.mood); await this.ui.say([l]); }
    n.ch.setTalking(false);
    s.flags['prof:' + r] = true;
    const q = P.questById('prof_' + r);
    await this.questTalk(n, q);
    // story hints
    const chap = P.chapterOf(s);
    if (!s.flags['chapter:' + chap]) { s.flags['chapter:' + chap] = true; await this.ui.say([{ who: region.professor.title, text: 'Neuigkeiten: ' + CHAPTERS[chap].text }]); }
    // research reward: heal team as a courtesy
    if (s.team.some(m => m.hp < maxHp(m))) { for (const m of s.team) healMonster(m); this.ui.toast(region.professor.title + ' hat dein Team versorgt.', '❤'); }
  }

  // ------------------------------------------------------------------ trainers
  trainerSpotted(n) {
    this.script(async () => {
      this.audio.sfx('encounter');
      const mark = h('div.toast', {}, '❗ ' + n.name);
      this.ui.toastBox.append(mark); setTimeout(() => mark.remove(), 1500);
      const p = this.world.player.root.position, rp = n.ch.root.position;
      const d = Math.hypot(p.x - rp.x, p.z - rp.z);
      const tx = rp.x + (p.x - rp.x) / d * (d - 1.3), tz = rp.z + (p.z - rp.z) / d * (d - 1.3);
      await new Promise(res => { n.walkTo = { x: tx, z: tz, speed: 3.5, done: res }; });
      this.world.player.root.rotation.y = Math.atan2(rp.x - p.x, rp.z - p.z);
      await this.trainerTalk(n);
    });
  }
  async trainerTalk(n) {
    const s = this.save, t = TRAINERS[n.trainer], r = this.world.current.region;
    if (!t) return;
    if (t.kind === 'guild') return this.guildEvent(t.site);
    if (t.kind === 'leader') return this.leaderTalk(n, t);
    if (t.kind === 'champion') return this.championTalk(n, t);
    if (t.kind === 'league') return this.leagueTalk(n, t);
    if (s.trainers[t.id]) { n.ch.setTalking(true); await this.ui.say([{ who: t.cls + ' ' + t.name, text: t.defeat + ' Viel Erfolg auf deiner Reise!' }]); n.ch.setTalking(false); return; }
    if (!s.team.some(m => m.hp > 0)) return this.ui.say([{ who: t.name, text: 'Deine Taschis sind erschöpft. Ruh dich erst im Heilzentrum aus!' }]);
    n.ch.setTalking(true, 'happy'); await this.ui.say([{ who: t.cls + ' ' + t.name, text: t.intro }]); n.ch.setTalking(false);
    await this.trainerBattle(t, n);
    void r;
  }
  async trainerBattle(t, n, extra = {}) {
    const s = this.save;
    const team = t.team.map(x => makeMonster(x.id, x.lv, this.rng));
    const music = t.kind === 'leader' ? 'gym' : t.kind === 'champion' || t.kind === 'rematch' ? 'champion' : t.kind === 'league' ? (t.id === 'league_4' ? 'finale' : 'champion') : t.kind === 'guild' ? (t.member === 'varga' && t.site === 7 ? 'finale' : 'guildBattle') : 'trainer';
    const res = await this.battle({ kind: 'trainer', foeTeam: team, format: t.format, ai: t.ai, items: t.items, trainerName: t.name, trainerTitle: t.cls, trainerLookDef: lookOfTrainer(t), pair: t.format === 'double', reward: t.reward, defeatText: t.defeat, music, ...extra });
    if (res.outcome === 'win') { s.trainers[t.id] = true; s.coins += t.reward; s.stats.wins = (s.stats.wins || 0) + 1; this.saveNow(); }
    return res;
  }
  async arenaWelcome() {
    const r = this.world.current.region, s = this.save;
    if (s.flags['arenaHint:' + r]) return;
    s.flags['arenaHint:' + r] = true;
    await this.ui.say([{ who: 'Arena-Berater', text: 'Willkommen in der ' + REGIONS[r].gym.theme + '! Vor der Arenaleitung musst du die Herausforderung in der Mitte meistern. Das Gitter öffnet sich, sobald sie gelöst ist.' }]);
  }
  async leaderTalk(n, t) {
    const s = this.save, r = t.region, region = REGIONS[r];
    const who = 'Arenaleitung ' + t.name;
    const say = async (text, mood = 'talk') => { n.ch.setTalking(true, mood); await this.ui.say([{ who, text }]); n.ch.setTalking(false); };
    if (s.badges > r) return say('Du trägst das Siegel dieser Arena schon. ' + (s.champions[r] ? 'Und auch der Champion hat dich anerkannt!' : region.champion.name + ' erwartet dich im Champion-Pavillon auf dem Hügel.'), 'happy');
    if (s.badges < r) return say('Komm wieder, wenn du die vorherigen Siegel gesammelt hast.');
    if (region.guild !== undefined && P.guildNext(s, region.guild) !== 'done') return say('Die Schattengilde treibt in ' + region.name + ' ihr Unwesen! Kümmere dich zuerst darum – die Region braucht dich.', 'worried');
    const pending = ['gymtr_' + r + '_0', 'gymtr_' + r + '_1'].filter(id => !s.trainers[id]);
    if (pending.length) return say('Erst wenn du meine Schüler in der Arena besiegt hast, trete ich gegen dich an.');
    await say(region.gym.intro, 'happy');
    const res = await this.trainerBattle(t, n, { indoor: true });
    if (res.outcome !== 'win') return;
    s.badges = r + 1;
    P.grantReward(s, { items: r < 5 ? { superball: 3 } : r < 10 ? { supertrank: 3 } : { vitaltrank: 2 } });
    this.audio.sfx('levelup'); this.world.player.play('cheer', 1.6);
    await this.ui.say([{ text: 'Du erhältst das Licht-Siegel von ' + region.name + '! (' + s.badges + '/16)' }, { who, text: 'Jetzt wartet ' + region.champion.name + ' im Champion-Pavillon. Erst wer den Champion besiegt, darf weiterreisen.' }]);
    this.saveNow(true);
  }
  async championTalk(n, t) {
    const s = this.save, r = t.region, region = REGIONS[r];
    const who = 'Champion ' + region.champion.name;
    const say = async (text, mood = 'talk') => { n.ch.setTalking(true, mood); await this.ui.say([{ who, text }]); n.ch.setTalking(false); };
    if (s.champions[r]) {
      if (P.postgame(s) && !s.trainers['rematch_' + r]) {
        const c = await this.ui.ask([{ who, text: 'Sternenmeister! Ich habe hart trainiert. Eine Revanche auf höchstem Niveau?' }], ['Revanche!', 'Später'], { cancelIndex: 1 });
        if (c === 0) { const rt = TRAINERS['rematch_' + r]; const res = await this.trainerBattle(rt, n); if (res.outcome === 'win') { P.grantReward(s, { items: { sternball: 2, vitaltrank: 1 } }); this.ui.toast('Revanche gewonnen!', '♛'); } }
        return;
      }
      return say(region.champion.defeat, 'happy');
    }
    if (s.badges <= r) return say('Erst mit dem Siegel von ' + region.gym.leader + ' kannst du mich herausfordern.');
    await say(region.champion.intro);
    const res = await this.trainerBattle(t, n);
    if (res.outcome !== 'win') return;
    s.champions[r] = true;
    this.world.updateGates();
    this.audio.sfx('levelup'); this.world.player.play('cheer', 1.6);
    await this.ui.say([{ text: 'Du hast ' + region.champion.name + ' besiegt und ' + region.name + ' gemeistert!' }, { text: r < 15 ? 'Das Nordtor nach ' + REGIONS[r + 1].name + ' ist jetzt offen.' : 'Der Weg zum Sternengipfel liegt hinter dem Nordtor von Himmelskrone.' }]);
    this.saveNow(true);
  }

  // ------------------------------------------------------------------ Schattengilde
  async guildEvent(site) {
    const s = this.save;
    if (!s.team.some(m => m.hp > 0)) return this.ui.say([{ text: 'Deine Taschis sind zu erschöpft für einen Kampf. Heile sie zuerst.' }]);
    if (P.guildNext(s, site) === 'done') return this.ui.say([{ text: site === 7 ? 'Die Maschine ist abgeschaltet. Die Lichter leuchten wieder.' : 'Hier campierte die Schattengilde. Nur ein paar leere Käfige sind übrig.' }]);
    const scene = GUILD_SCENES[site];
    const list = GUILD_BATTLES[site];
    const inStation = this.world.current.type === 'interior' && this.world.current.kind === 'station';
    // first contact: intro scene
    if (!s.flags['guildIntro:' + site]) {
      this.audio.play('guild');
      s.flags['guildIntro:' + site] = true;
      await this.ui.say([{ text: '— ' + scene.title + ' —' }]);
      if (site !== 2 || inStation) await this.ui.say(scene.intro, { guild: true });
      else await this.ui.say([{ who: 'Gildenhelfer', text: 'Halt! Die Forschungsstation am Glutkegel ist Sperrgebiet. Wer hier rein will, muss an mir vorbei!', mood: 'angry' }], { guild: true });
    }
    if (site === 2 && inStation && !s.flags['guildIntro:station']) { s.flags['guildIntro:station'] = true; await this.ui.say(scene.intro, { guild: true }); }
    // fight the remaining members in order (camp or station part)
    for (const def of list) {
      if (s.trainers[def.id]) continue;
      const where = site === 2 && def.id !== 'g2_grunt' ? 'station' : 'camp';
      if (site === 2 && where === 'station' && !inStation) {
        await this.ui.say([{ text: 'Der Gildenhelfer lässt einen Schlüssel fallen und flieht in die Forschungsstation!' }]);
        if (!s.bag.gildenschluessel) { Items.add(s.bag, 'gildenschluessel', 1); this.ui.toast('Erhalten: Gildenschlüssel', '🗝'); }
        return;
      }
      const t = TRAINERS[def.id];
      const npc = this.world.npcs.find(x => x.trainer === def.id);
      if (def.member !== 'grunt' && def !== list[0]) { npc?.ch.setTalking(true, 'angry'); await this.ui.say([{ who: t.name, text: guildTaunt(def.member) }], { guild: true }); npc?.ch.setTalking(false); }
      const res = await this.trainerBattle(t, npc);
      if (res.outcome !== 'win') return;
      if (npc) { npc.ch.hold('defeat'); }
    }
    // site complete
    s.guild[site] = 'done';
    await this.ui.say(scene.win, { guild: true });
    P.grantReward(s, { coins: 300 + site * 150, items: { superball: 3 + site, trank: 2 } });
    if (site === 6) { Items.add(s.bag, 'brixcode', 1); this.ui.toast('Erhalten: Brix’ Zugangskarte', '🗝'); }
    if (site === 7) return this.summitFinale();
    this.ui.toast('Die Schattengilde ist aus der Region vertrieben! Gefangene Taschis befreit.', '✦');
    for (const npc of this.world.npcs.filter(x => x.guild)) { npc.walkTo = { x: npc.ch.root.position.x + 30, z: npc.ch.root.position.z + 30, speed: 5, done: () => { this.world.scene.remove(npc.ch.root); this.world.npcs = this.world.npcs.filter(x => x !== npc); } }; }
    const camp = this.world.current.map?.dynamic.find(d => d.kind === 'guildCamp');
    if (camp) { const bal = camp.group.children[0]; const t0 = performance.now(); const step = () => { const u = (performance.now() - t0) / 4000; bal.position.y = u * 40; if (u < 1) requestAnimationFrame(step); else bal.visible = false; }; step(); }
    this.updateMusic(true);
    this.saveNow(true);
  }
  async summitFinale() {
    const s = this.save;
    s.flags.summitDone = true;
    s.story.chapter = 5;
    this.world.player.play('cheer', 2);
    await this.ui.fade(true, true);
    await this.ui.fade(false, true);
    this.ui.toast('Die sechzehn Lichter leuchten wieder!', '★');
    this.saveNow(true);
    await this.travelToRegion(16, 'south');
  }
  async leagueTalk(n, t) {
    const s = this.save, i = Number(t.id.split('_')[1]);
    const who = t.cls + ' ' + t.name;
    if (s.league > i) { n.ch.setTalking(true, 'happy'); await this.ui.say([{ who, text: i === 4 && s.league >= 5 ? 'Sternenmeister! Komm jederzeit zurück, wenn du eine neue Herausforderung suchst.' : 'Du hast diese Prüfung bereits bestanden.' }]); n.ch.setTalking(false); return; }
    if (s.league < i) return this.ui.say([{ who, text: 'Bestehe zuerst die vorherige Prüfung.' }]);
    n.ch.setTalking(true); await this.ui.say([{ who, text: t.intro }]); n.ch.setTalking(false);
    const res = await this.trainerBattle(t, n, { indoor: true });
    if (res.outcome !== 'win') return;
    s.league = Math.max(s.league, i + 1);
    this.updateLeagueGates();
    this.ui.toast('Meisterprüfung ' + (i + 1) + '/5 bestanden!', '★');
    this.saveNow(true);
    if (i === 4) await this.leagueFinale();
  }
  async leagueFinale() {
    const s = this.save;
    this.audio.play('credits');
    await this.ui.say(LEAGUE_FINALE);
    if (!s.dex.schnurrik || s.dex.schnurrik !== 2) {
      const m = makeMonster('schnurrik', 50, this.rng);
      s.dex.schnurrik = 2;
      if (s.team.length < 6) s.team.push(m); else s.box.push(m);
      this.ui.toast('Schnurrik schließt sich deinem Team an!', '🐾');
    }
    await this.credits();
    s.story.chapter = 6;
    this.saveNow(true);
    await this.ui.say([{ text: 'Postgame: Die vier uralten Wächter warten an ihren Schreinen, alle Champions fordern dich zur Revanche heraus – und der Taschidex ist noch nicht vollständig!' }]);
  }
  credits() {
    return new Promise(res => {
      const box = h('div.slides');
      const el = h('div.screen', { style: { background: 'radial-gradient(ellipse at center, #2a2f5a, #05070f)' } }, box);
      let i = 0;
      const next = () => { if (i >= CREDITS.length) { this.ui.pop(scr); res(); return; } box.replaceChildren(h('h2', {}, CREDITS[i++])); setTimeout(next, 2600); };
      const scr = { el, onInput: (inp) => { if (inp.pressed('back')) { i = CREDITS.length; } inp.nav(); return true; } };
      this.ui.push(scr); next();
    });
  }

  // ------------------------------------------------------------------ legends, caves
  async legend() {
    const s = this.save, r = this.world.current.region;
    const id = Object.keys(LEGEND_REGION).find(k => LEGEND_REGION[k] === r);
    const sp = SPECIES[id];
    if (!s.champions[r]) return this.ui.say([{ text: 'Eine uralte Inschrift: „Nur wer den Champion dieser Region besiegt hat, darf den Wächter wecken.“' }]);
    if (s.legends[id] === 'caught' || s.dex[id] === 2) return this.ui.say([{ text: 'Der Schrein ist still. ' + sp.name + ' reist nun mit dir.' }]);
    const c = await this.ui.ask([{ text: 'Der Schrein beginnt zu leuchten … ' + sp.bio }, { text: 'Willst du den Wächter rufen?' }], ['Rufen', 'Lieber nicht'], { cancelIndex: 1 });
    if (c !== 0) return;
    this.world.cam.shake = 0.6; this.audio.sfx('thunder');
    const res = await this.battle({ kind: 'wild', foeTeam: [makeMonster(id, 50 + (r % 10), this.rng)], canRun: true, canCatch: true, ai: 2, music: 'champion' });
    if (res.outcome === 'caught') s.legends[id] = 'caught';
    else if (res.outcome === 'win') await this.ui.say([{ text: sp.name + ' zieht sich in den Schrein zurück. Vielleicht kannst du es später erneut rufen.' }]);
  }
  async caveCrystal(e) {
    const s = this.save, key = 'crystal:' + e.cave + ':' + e.idx;
    if (s.found[key]) return this.ui.say([{ text: 'Der Kristall glimmt nur noch schwach.' }]);
    s.found[key] = true;
    if (e.mesh) e.mesh.material.emissiveIntensity = 0.1;
    if (e.light) e.light.intensity = 0.2;
    this.audio.sfx('item');
    const item = ['kristallsplitter', 'eiskristall', 'sternsplitter'][e.idx % 3];
    Items.add(s.bag, item, 1);
    await this.ui.say([{ text: 'Du löst einen Splitter vom Kristall: ' + ITEMS[item].name + '! Ein Höhlen-Taschi schreckt hoch!' }]);
    await this.randomEncounter('cave');
  }
  async rareEncounter() {
    const s = this.save, r = this.world.current.region, key = 'rare:' + r + ':' + new Date().toDateString();
    if (s.found[key]) return this.ui.say([{ text: 'Im Spalt ist es ruhig. Vielleicht morgen wieder.' }]);
    s.found[key] = true;
    const m = rollEncounter(r, this.rng, { habitat: 'cave', levelBoost: 5 });
    await this.ui.say([{ text: 'Aus dem funkelnden Spalt springt ein besonders kräftiges ' + SPECIES[m.id].name + '!' }]);
    return this.battle({ kind: 'wild', foeTeam: [m], canRun: true, canCatch: true, ai: 1 });
  }

  // ------------------------------------------------------------------ puzzles
  async puzzleAct(e) {
    const pv = e.pv; if (!pv) return;
    const res = pv.act(e, this.world.player.root.position);
    this.onPuzzleResult(pv, res);
  }
  onPuzzleResult(pv, res) {
    if (res.sound) this.audio.sfx(res.sound);
    if (res.text && !res.solved) this.ui.toast(res.text);
    if (res.solved && !this.save.puzzles[pv.key]) {
      this.save.puzzles[pv.key] = true;
      this.world.player.play('cheer', 1.2);
      if (pv.key.startsWith('gym:')) { const bar = this.world.current.interior?.barrier; if (bar) bar.visible = false; this.ui.toast('Das Gitter zur Arenaleitung öffnet sich!', '✦'); }
      else { P.grantReward(this.save, { coins: 100 + this.world.current.region * 20 }); this.ui.toast('Rätsel gelöst! Das Siegel der Arena erlischt. ★' + (100 + this.world.current.region * 20), '✦'); }
      this.saveNow(true);
    }
  }

  // ------------------------------------------------------------------ battles
  async randomEncounter(habitat = 'grass') {
    const r = Math.min(15, this.world.current.region);
    if (!this.save.team.some(m => m.hp > 0)) return;
    const foe = rollEncounter(r, this.rng, { habitat, night: this.isNight() });
    this.audio.sfx('encounter');
    const double = habitat === 'grass' && this.save.team.filter(m => m.hp > 0).length >= 2 && this.rng.next() < 0.06;
    const team = double ? [foe, rollEncounter(r, this.rng, { habitat })] : [foe];
    await this.battle({ kind: 'wild', foeTeam: team, format: double ? 'double' : undefined, canCatch: !double, ai: 0 });
  }
  encounterFromWild(w) {
    this.script(async () => {
      const r = Math.min(15, this.world.current.region);
      const [lo, hi] = levelRange(r);
      const m = makeMonster(w.id, this.rng.int(lo, hi), this.rng);
      this.audio.sfx('encounter');
      await this.battle({ kind: 'wild', foeTeam: [m], ai: 0 });
      this.world.removeWild(w);
    });
  }
  async battle(opts) {
    const s = this.save;
    const prev = this.state;
    // swirl transition
    const swirl = h('div.swirl'); this.ui.root.append(swirl);
    this.audio.play(opts.music || (opts.kind === 'wild' ? 'battle' : 'trainer'), { restart: true });
    await wait(650);
    this.setState(STATES.BATTLE);
    swirl.remove();
    const region = this.world.current.region;
    const indoor = opts.indoor ?? (this.world.current.type === 'interior');
    if (opts.trainerLookDef) opts.trainerLook = lookForRole(opts.trainerLookDef.role, opts.trainerLookDef.name);
    const res = await this.battleScene.run({ ...opts, region, indoor });
    s.stats.battles = (s.stats.battles || 0) + 1;
    if (res.outcome === 'caught') {
      const c = res.caught;
      c.caughtIn = region; c.ball = res.ball;
      s.dex[c.id] = 2;
      s.stats.caught = (s.stats.caught || 0) + 1;
      s.stats['caughtIn:' + Math.min(15, region)] = (s.stats['caughtIn:' + Math.min(15, region)] || 0) + 1;
      if (s.team.length < 6) s.team.push(c); else s.box.push(c);
      this.ui.toast(SPECIES[c.id].name + (s.team.includes(c) ? ' ist jetzt in deinem Team.' : ' wurde ins Lager geschickt.'), '◉');
    }
    if (res.outcome === 'lose') { await this.whiteout(); return res; }
    this.setState(prev === STATES.BATTLE ? STATES.WORLD : STATES.WORLD);
    this.world.refreshFollower();
    this.updateMusic(true);
    this.saveNow();
    return res;
  }
  async whiteout() {
    const s = this.save;
    const lost = Math.floor(s.coins * 0.1);
    s.coins -= lost;
    await this.ui.fade(true);
    for (const m of s.team) healMonster(m);
    this.setState(STATES.WORLD);
    const [, id] = String(s.lastHeal.map).split(':');
    const r = Number(id) || 0;
    this.setState(STATES.LOADING);
    await this.loadWithScreen((prog) => this.world.loadRegion(r, 'heal', prog), REGIONS[Math.min(15, r)]?.name);
    this.world.refreshFollower();
    this.afterRegionLoaded();
    this.setState(STATES.WORLD);
    await this.ui.fade(false);
    await this.ui.say([{ text: 'Du bist mit deinen erschöpften Taschis zum Heilzentrum geeilt. Sie sind wieder fit. (Verloren: ★' + lost + ')' }]);
    this.saveNow();
  }
  evolveInWorld(m, ev) {
    this.audio.sfx('evolve');
    this.save.dex[ev.to] = 2;
    this.world.refreshFollower();
    this.ui.say([{ text: 'Was? ' + SPECIES[ev.from].name + ' entwickelt sich … zu ' + SPECIES[ev.to].name + '!' }]);
  }
}

// --------------------------------------------------------------------------
function residentLine(npc, s, r) {
  const lines = s.champions[r] ? npc.lines.done : s.badges > r ? npc.lines.post : npc.lines.pre;
  const key = 'talk:' + r + ':' + npc.name;
  const i = (s.flags[key] = ((s.flags[key] || 0) + 1)) - 1;
  return lines[i % lines.length];
}
function lookOfTrainer(t) {
  const roleFor = { leader: 'leader', champion: 'champion', rematch: 'champion', league: t.id === 'league_4' ? 'lyra' : 'champion', gymTrainer: 'trainer', route: t.format === 'double' ? 'kind' : 'trainer', guild: { varga: 'varga', selma: 'selma', brix: 'brix', kett: 'twin', grunt: 'grunt' }[t.member] };
  return { role: roleFor[t.kind] || 'trainer', name: t.name };
}
function guildTaunt(member) {
  return { varga: 'Du schon wieder. Diesmal halte ich mich nicht zurück.', selma: 'Bühne frei für meinen großen Auftritt!', brix: 'Bitte … mach es mir nicht so schwer.', kett: 'Diesmal sind wir vorbereitet! – Sind wir? – Ja!' }[member] || 'Aus dem Weg!';
}
function landmarkText(r, kind) {
  if (r === 16) return 'Die Maschine summt bedrohlich. Violette Kabel führen zu sechzehn Kristallen.';
  const t = { mill: 'Das Mühlrad dreht sich gemächlich. An der Wand hängen alte Bilder mit Runenzeichen.', lighthouse: 'Von hier oben sieht man weit über das Meer.', windmills: 'Die Windräder surren. Elektro-Taschis tanzen um die Masten.', shrine: 'Ein stiller Ort. Steinerne Laternen säumen den Weg.', mushrooms: 'Riesige Pilze leuchten sanft im Halbdunkel.', windtower: 'Der Wind pfeift durch den alten Turm.', volcano: 'Der Glutkegel brodelt. Die Luft flimmert vor Hitze.', observatory: 'Durch das Teleskop sieht man die sechzehn Lichter am Himmel.', boardwalk: 'Die Stelzenhäuser knarzen im Nebel.', frozenlake: 'Das Eis des Spiegelsees singt leise.', bigtree: 'Der Weltenbaum ist so groß, dass Häuser in seiner Krone wohnen.', stormtowers: 'Zwischen den Kupferstäben knistert es.', crystalspires: 'Die Kristalle summen in einem tiefen Ton.', moonarch: 'Der steinerne Bogen glänzt silbern.', suntemple: 'Die Sonnenscheibe auf dem Tempel dreht sich langsam.', skybridge: 'Schwebende Inseln, verbunden durch Wolkenbrücken.' };
  return t[kind] || '';
}
