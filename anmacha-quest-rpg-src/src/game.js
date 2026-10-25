// Spielablauf: Titel, Karte, Gespräche, Shop, Menü, Kampf. Gleiche Abläufe und Texte wie main.gd der Godot-Fassung.
// Anzeige und Bedienung kommen über `ui` (DOM) und `view` (Three.js); beide lassen sich für Tests durch Attrappen ersetzen.
import { MAPS, HEROES, JOINS, SKILLS, IPSKILLS, ITEMS, KEYNAMES, ENEMIES } from './data.js';
import * as L from './logic.js';

export const M = { TITLE: 0, WORLD: 1, BATTLE: 2 };
export const SAVE_KEY = 'anmachaQuest_save';

const BOSS_TEXT = {
  mcdroehn: ['MC Dröhn: Yo, Funker! Das ist MEIN Keller, MEIN Beat! Zeig, ob du Takt hast!'],
  koenigin: ['Königin Schunkel: Ach, wie süß – kleine Helden! Schunkelt mit mir, bis euch schwindelig wird!'],
  frostmod: ['Der Frost-Moderator: Und nun die Nachrichten: Heute Nacht wird es EISKALT für euch!'],
  riff: ['Riff-Titan: *KRAAAWWWWM* ... Zu laut? Gibt\'s nicht. LAUTER!'],
  rauschen: ['Das Große Rauschen: kshhhhhh ... Alle Stimmen werden eins. Alle Sender: Stille. Auch eure.']
};
const BOSS_AFTER = {
  mcdroehn: ['MC Dröhn verstummt – ein Frequenzkristall glüht auf. Der Bass-Keller ist befreit!', 'Auf der Weltkarte öffnet sich der Zugang zur Glitzerwiese. Im Funkhafen wartet jemand auf euch.'],
  koenigin: ['Die Königin sinkt in ihr Glitzerkissen. Der zweite Kristall erwacht!', 'Auf der Weltkarte öffnet sich die Frosthöhle. Im Funkhafen wartet jemand auf euch.'],
  frostmod: ['Der Moderator taut auf und räumt das Studio. Der dritte Kristall erwacht!', 'Auf der Weltkarte öffnet sich die Vulkanbühne. Im Funkhafen wartet jemand auf euch.'],
  riff: ['Der Titan sackt zusammen, die Verstärker verstummen. Der vierte Kristall erwacht!', 'Auf der Weltkarte öffnet sich der Rauschen-Turm im Norden.']
};

export class Game {
  constructor(ui, view, opts = {}) {
    this.ui = ui;
    this.view = view;
    this.rng = opts.rng || L.makeRng();
    this.store = opts.store || null;       // { get(k), set(k, v), has(k) }
    this.S = L.newState();
    this.mode = M.TITLE;
    this.busy = false;
    this.autoplay = false;
    this.autoN = 0;
    this.curHero = -1;
    this.dirStack = [];
    this.dpad = null;
    this.stepflip = 0;
    this.mt = 0;
    this.debug = !!opts.debug;
  }

  // ---------------------------------------------------------------- UI-Helfer (im Selbsttest ohne Anzeige)
  async say(lines) {
    if (this.autoplay) return;
    this.ui.setTouch(false);
    await this.ui.say(lines);
    this.ui.setTouch(this.mode === M.WORLD && !this.busy);
  }
  async choose(opts, canCancel = false, disabled = []) {
    if (this.autoplay) {
      await this.tick();
      for (let k = 0; k < opts.length; k++) if (!disabled[k]) return k;
      return 0;
    }
    return this.ui.choose(opts, canCancel, disabled, this.mode);
  }
  async chooseCross(disabled) {
    if (this.autoplay) {
      await this.tick();
      this.autoN++;
      let c = [0, 1, 2, 0, 3, 4, 0, 2][this.autoN % 8];
      if (disabled[c]) c = 0;
      return c;
    }
    return this.ui.chooseCross(disabled);
  }
  async banner(t, hold = 1.3) {
    if (this.autoplay) return;
    await this.ui.banner(t, hold);
  }
  async bmsg(t, hold = 0.7) {
    if (this.autoplay) return;
    this.ui.msg(t);
    if (hold > 0) await this.wait(hold);
  }
  tick() { return new Promise(r => setTimeout(r, 0)); }
  wait(t) {
    if (this.autoplay) return this.tick();
    return new Promise(r => setTimeout(r, t * 1000));
  }
  async fade(to, t = 0.22) {
    if (this.autoplay) { this.ui.fadeNow(to); return; }
    await this.ui.fade(to, t);
  }
  setTouch(v) { this.ui.setTouch(v); }

  // ---------------------------------------------------------------- Speichern
  hasSave() { return !!(this.store && this.store.has(SAVE_KEY)); }
  saveGame() {
    if (!this.store) return;
    const S = this.S;
    const party = S.party.map(h => ({ id: h.id, name: h.name, lv: h.lv, exp: h.exp, hp: h.hp, sp: h.sp, ip: h.ip }));
    this.store.set(SAVE_KEY, JSON.stringify({ v: 3, party, inv: S.inv, gold: S.gold, gear: S.gear, flags: S.flags, map: S.mapId, gp: S.gp, t: S.playTime }));
  }
  loadGame() {
    if (!this.store) return false;
    let d = null;
    try { d = JSON.parse(this.store.get(SAVE_KEY)); } catch (e) { return false; }
    if (!d || !Array.isArray(d.party) || !d.party.length || !MAPS[d.map]) return false;
    const S = this.S;
    S.party = d.party.filter(h => HEROES[h.id]).map(h => ({ id: h.id, name: HEROES[h.id].name, lv: h.lv | 0 || 1, exp: h.exp | 0, hp: h.hp | 0, sp: h.sp | 0, ip: 0 }));
    if (!S.party.length) return false;
    S.inv = Object.assign({ trank: 0, aether: 0, weck: 0 }, d.inv || {});
    S.gold = d.gold | 0;
    S.gear = d.gear | 0;
    S.flags = d.flags || {};
    S.playTime = +d.t || 0;
    this.mode = M.WORLD;
    const gp = d.gp && L.tile({ ...S, map: MAPS[d.map], mw: MAPS[d.map].rows[0].length, mh: MAPS[d.map].rows.length }, d.gp.x, d.gp.y) !== '#' ? d.gp : L.startOf(d.map);
    this.loadMap(d.map, gp);
    return true;
  }
  loadMap(id, at) {
    L.loadMap(this.S, this.rng, id, at);
    this.moving = false;
    this.view.mapChanged?.();
  }

  // ---------------------------------------------------------------- Titel
  async showTitle() {
    this.mode = M.TITLE;
    this.busy = true;
    this.setTouch(false);
    this.ui.msg('');
    this.view.setMode?.(M.TITLE);
    const hasSave = this.hasSave();
    while (true) {
      const opts = hasSave ? ['Fortsetzen', 'Neues Spiel'] : ['Neues Spiel'];
      const r = await this.choose(opts);
      const isNew = (!hasSave && r === 0) || (hasSave && r === 1);
      if (isNew) { await this.newGame(); return; }
      if (this.loadGame()) { await this.startWorldAfterLoad(); return; }
    }
  }
  async newGame() {
    const S = this.S;
    S.party = [L.newHero(S, 'andrew'), L.newHero(S, 'marco')];
    S.inv = { trank: 5, aether: 2, weck: 0 };
    S.gold = 100;
    S.gear = 0;
    S.flags = {};
    S.playTime = 0;
    await this.fade(1.0, 0.25);
    this.mode = M.WORLD;
    this.loadMap('hub', { x: 12, y: 12 });
    await this.view.ready?.();
    await this.fade(0.0);
    this.busy = true;
    await this.say(['Frequenzia, die Welt der Funkwellen. Seit das Große Rauschen aufgetaucht ist, sind vier Sender-Reiche verstummt.',
      'Du bist Andrew, Funker aus Funkhafen – und Marco, der Frequenz-Magier, begleitet dich.',
      'Sprich mit der Alten Antenne in der Mitte des Hafens. Sie weiß, was zu tun ist.']);
    this.busy = false;
    this.setTouch(true);
  }
  async startWorldAfterLoad() {
    await this.fade(1.0, 0.25);
    this.mode = M.WORLD;
    await this.view.ready?.();
    this.busy = false;
    this.setTouch(true);
    await this.fade(0.0);
  }

  // ---------------------------------------------------------------- Bewegung (pro Bild)
  readDir() {
    if (this.dpad) return this.dpad;
    return this.dirStack.length ? this.dirStack[this.dirStack.length - 1] : null;
  }
  pressDir(d, down) {
    this.dirStack = this.dirStack.filter(v => !L.eq(v, d));
    if (down) this.dirStack.push(d);
  }
  clearDirs() { this.dirStack = []; this.dpad = null; }
  idle() { return !this.busy && !this.ui.isChoosing() && !this.ui.isTalking(); }

  update(delta) {
    const S = this.S;
    if (this.mode !== M.WORLD) return;
    S.playTime += delta;
    if (!this.ui.touchVisible() && this.dpad) this.dpad = null;
    if (S.moving) {
      this.mt += delta / L.STEP_T;
      while (S.moving && this.mt >= 1.0) {
        const over = this.mt - 1.0;
        S.moving = false;
        S.ppos = { ...S.gtarget };
        S.gp = { ...S.gtarget };
        this.onStep();
        if (!this.idle()) break;
        const nd = this.readDir();
        if (nd) { this.tryStep(nd); if (S.moving) this.mt = over; }
      }
      if (S.moving) S.ppos = { x: S.mfrom.x + (S.gtarget.x - S.mfrom.x) * this.mt, y: S.mfrom.y + (S.gtarget.y - S.mfrom.y) * this.mt };
    } else if (this.idle()) {
      const d = this.readDir();
      if (d) this.tryStep(d);
    }
    if (this.idle()) {
      const r = L.updateRoamers(S, this.rng, delta);
      if (r) this.startRoamerFight(r);
    }
  }
  tryStep(d) {
    const S = this.S;
    S.face = { ...d };
    const t = { x: S.gp.x + d.x, y: S.gp.y + d.y };
    if (L.blocked(S, t)) return;
    const o = L.objAt(S, t);
    if (o) { this.interact(o); return; }
    S.moving = true;
    S.gtarget = t;
    S.mfrom = { ...S.gp };
    this.mt = 0;
    this.stepflip = 1 - this.stepflip;
  }
  onStep() {
    const S = this.S;
    S.steps++;
    for (const p of S.map.portals) if (p.x === S.gp.x && p.y === S.gp.y) { this.usePortal(p); return; }
    if (S.map.rate > 0) {
      S.grace -= 1;
      if (S.grace <= 0 && this.rng.randf() < S.map.rate * 0.4) this.startEncounter();
    }
  }
  async usePortal(p) {
    const S = this.S;
    this.busy = true;
    this.setTouch(false);
    if (p.req !== '' && !S.flags[p.req]) {
      await this.say([`Der Zugang nach "${p.label}" ist versiegelt. Befreie zuerst das vorherige Reich.`]);
      S.gp = { x: S.gp.x - S.face.x, y: S.gp.y - S.face.y };
      S.ppos = { ...S.gp };
      this.busy = false;
      this.setTouch(true);
      return;
    }
    await this.fade(1.0);
    const to = p.to;
    this.loadMap(to, { x: p.ax, y: p.ay });
    if (to === 'hub') this.saveGame();
    await this.view.ready?.();
    await this.fade(0.0);
    if (to === 'hub') {
      for (const j of JOINS) {
        if (S.flags[j[0]] && !L.hasHero(S, j[1])) {
          await this.say([j[2], `${HEROES[j[1]].name} schließt sich euch an.`]);
          S.party.push(L.newHero(S, j[1], Math.max(1, Math.trunc(L.avgLv(S)))));
          this.view.partyChanged?.();
        }
      }
    }
    this.busy = true;
    await this.banner(S.map.world || to === 'hub' ? S.map.name : `${S.map.name}  (Stufe ${S.map.lv})`);
    this.busy = false;
    this.setTouch(true);
  }

  // ---------------------------------------------------------------- Interaktion
  async interact(o) {
    this.busy = true;
    this.setTouch(false);
    this.clearDirs();
    switch (o.t) {
      case 'chest': await this.openChest(o); break;
      case 'npc': await this.talkNpc(o.d); break;
      case 'boss': await this.fightBoss(o); break;
      case 'gate': await this.openGate(o); break;
    }
    this.busy = false;
    this.setTouch(this.mode === M.WORLD);
  }
  removeObj(o) {
    const i = this.S.objs.indexOf(o);
    if (i >= 0) this.S.objs.splice(i, 1);
  }
  async openGate(o) {
    const g = o.d, S = this.S;
    if (S.flags[g.key]) {
      S.flags[g.flag] = true;
      this.removeObj(o);
      this.view.fxWorld?.('gate', o);
      await this.say(['Der Schlüssel passt! Das Tor öffnet sich knarrend.']);
    } else {
      await this.say(['Das Tor zum Bossraum ist verriegelt. Irgendwo in diesem Reich liegt der Schlüssel in einer Truhe.']);
    }
  }
  async openChest(o) {
    const c = o.d, S = this.S;
    S.flags[c.id] = true;
    this.removeObj(o);
    this.view.fxWorld?.('chest', o);
    if (c.kind === 'gold') {
      S.gold += c.v;
      await this.say([`Truhe geöffnet: ${c.v} Münzen!`]);
    } else if (c.kind === 'key') {
      S.flags[c.v] = true;
      await this.say([`Truhe geöffnet: ${KEYNAMES[c.v]} gefunden! Damit lässt sich das Tor zum Bossraum öffnen.`]);
    } else {
      S.inv[c.v] = (S.inv[c.v] || 0) + c.n;
      await this.say([`Truhe geöffnet: ${ITEMS[c.v].name} x${c.n}!`]);
    }
  }
  async talkNpc(n) {
    const S = this.S;
    switch (n.kind) {
      case 'elder': {
        const k = L.bossesDone(S);
        if (S.flags.boss_rauschen) await this.say(['Alte Antenne: Das Rauschen ist verklungen. Hörst du? Frequenzia singt wieder.']);
        else if (k === 0) await this.say(['Alte Antenne: Andrew, Marco – das Große Rauschen verschluckt Sender um Sender. Vier Reiche sind verstummt.',
          'Verlasst den Hafen nach Süden und folgt der Karte. Der Bass-Keller im Westen ist der Anfang: Dort herrscht MC Dröhn.',
          'Jedes Reich hat einen Schlüssel für das Tor zum Boss. Kämpft, werdet stärker – und kauft Tränke bei Tonia!']);
        else if (k < 4) await this.say([`Alte Antenne: ${k} von 4 Reichen sind befreit. Das nächste Tor öffnet sich auf der Weltkarte, sobald der Wächter des letzten gefallen ist.`,
          'Reihenfolge: Bass-Keller, Glitzerwiese, Frosthöhle, Vulkanbühne.']);
        else await this.say(['Alte Antenne: Alle vier Frequenzkristalle sind erwacht! Das Tor zum Rauschen-Turm steht auf der Weltkarte offen – im Norden.',
          'Geht gut gerüstet hinein. Dort wartet das Große Rauschen selbst.']);
        break;
      }
      case 'shop': await this.shop(); break;
      case 'heal':
        for (const h of S.party) { h.hp = L.mhp(S, h); h.sp = L.msp(h); }
        this.view.fxWorld?.('heal');
        await this.say(['Der Heilbrunnen summt eine sanfte Melodie. LP und SP sind wieder voll!']);
        this.saveGame();
        break;
      case 'kid':
        if (L.bossesDone(S) >= 2) await this.say(['Lotte: Mein Radio rauscht nicht mehr so doll! Danke, Helden!']);
        else await this.say(['Lotte: Wenn ein Held Schaden nimmt, füllt sich seine IP-Leiste. Dann kann er einen Spezialangriff machen – der ist riesig!']);
        break;
      case 'guard':
        await this.say(['Wache Piet: Tipp: Mit "Wache" im Kampf halbierst du den Schaden. Mit MENÜ kannst du jederzeit speichern.']);
        break;
    }
  }
  async shop() {
    const S = this.S;
    await this.say(['Tonia: Frisch gelötet und günstig! Was darf\'s sein?']);
    while (true) {
      const r = await this.choose(['Kaufen', `Ausrüstung ${L.gearPrice(S)}M`, 'Tschüss', `Münzen: ${S.gold}`], true, [false, false, false, true]);
      if (r === 2 || r === -1) break;
      if (r === 0) {
        while (true) {
          const opts = [], dis = [];
          for (const k in ITEMS) {
            opts.push(`${ITEMS[k].name} ${ITEMS[k].price}M (${S.inv[k] || 0})`);
            dis.push(S.gold < ITEMS[k].price);
          }
          opts.push('Zurück');
          dis.push(false);
          const s = await this.choose(opts, true, dis);
          if (s === -1 || s === opts.length - 1) break;
          const k = Object.keys(ITEMS)[s];
          if (S.gold < ITEMS[k].price) continue;
          S.gold -= ITEMS[k].price;
          S.inv[k] = (S.inv[k] || 0) + 1;
          if (this.autoplay) break;
        }
      } else if (r === 1) {
        if (S.gear >= 6) await this.say(['Tonia: Besser kann ich es nicht mehr bauen!']);
        else if (S.gold < L.gearPrice(S)) await this.say(['Tonia: Dafür fehlen dir leider Münzen.']);
        else {
          S.gold -= L.gearPrice(S);
          S.gear += 1;
          for (const h of S.party) h.hp = Math.min(h.hp + 8, L.mhp(S, h));
          await this.say([`Tonia baut euch bessere Ausrüstung ein: Stufe ${S.gear}. Angriff, Abwehr und Magie steigen!`]);
        }
      }
      if (this.autoplay) break;
    }
  }
  async fightBoss(o) {
    const b = o.d, S = this.S;
    await this.say(BOSS_TEXT[b.id] || ['...']);
    const res = await this.runBattle([b.id], S.map.theme);
    if (res === 'win') {
      S.flags[b.flag] = true;
      this.removeObj(o);
      if (b.id === 'rauschen') await this.ending();
      else {
        await this.say(BOSS_AFTER[b.id] || ['Besiegt!']);
        this.saveGame();
      }
    } else if (res === 'lose') await this.gameOver();
  }
  async ending() {
    const S = this.S;
    await this.say(['Das Große Rauschen zerfällt in Millionen kleiner Töne. Aus dem Turm steigt ein klarer Ton auf.',
      'Alle vier Reiche – Rap, Schlager, Weihnacht und Rock – senden wieder. Frequenzia hat seine Stimme zurück!',
      `ENDE – Danke fürs Spielen von AnMaCha Quest!  Spielzeit: ${Math.trunc(S.playTime / 60)} Min.`]);
    S.flags.boss_rauschen = true;
    await this.fade(1.0);
    this.loadMap('hub', { x: 12, y: 12 });
    this.saveGame();
    await this.view.ready?.();
    await this.fade(0.0);
  }
  async gameOver() {
    const S = this.S;
    await this.fade(1.0);
    for (const h of S.party) { h.hp = L.mhp(S, h); h.sp = L.msp(h); }
    S.gold = Math.trunc(S.gold / 2);
    this.loadMap('hub', { x: 12, y: 12 });
    await this.view.ready?.();
    await this.fade(0.0);
    await this.say(['Ihr wacht im Funkhafen auf. Der Heilbrunnen hat euch zusammengeflickt – nur die Hälfte der Münzen ist weg.']);
  }

  // ---------------------------------------------------------------- Menü
  async openMenu() {
    if (this.busy || this.mode !== M.WORLD || this.ui.isChoosing() || this.ui.isTalking()) return;
    const S = this.S;
    this.busy = true;
    this.setTouch(false);
    this.clearDirs();
    while (true) {
      const r = await this.choose(['Status', 'Items', 'Speichern', 'Titel', 'Zurück'], true);
      if (r === -1 || r === 4) break;
      if (r === 0) {
        if (this.ui.status) await this.ui.status(this.statusData());
        else {
          const lines = S.party.map(h => `${h.name} (${L.hd(h).role}) Lv ${h.lv}  LP ${h.hp}/${L.mhp(S, h)}  SP ${h.sp}/${L.msp(h)}  ANG ${L.stat(S, h, 'atk')} ABW ${L.stat(S, h, 'def')} MAG ${L.stat(S, h, 'mag')}  EXP ${h.exp}/${L.need(h.lv)}`);
          lines.push(`Münzen: ${S.gold}   Ausrüstung: Stufe ${S.gear}   Kristalle: ${L.bossesDone(S)}/4`);
          await this.say(lines);
        }
      } else if (r === 1) await this.useItemMenu();
      else if (r === 2) { this.saveGame(); await this.say(['Spielstand gespeichert.']); }
      else if (r === 3) {
        this.saveGame();
        this.busy = false;
        await this.fade(1.0);
        await this.fade(0.0);
        this.showTitle();
        return;
      }
    }
    this.busy = false;
    this.setTouch(true);
  }
  statusData() {
    const S = this.S;
    return {
      heroes: S.party.map(h => ({ id: h.id, name: h.name, role: L.hd(h).role, col: L.hd(h).col, lv: h.lv, hp: h.hp, mhp: L.mhp(S, h), sp: h.sp, msp: L.msp(h),
        atk: L.stat(S, h, 'atk'), def: L.stat(S, h, 'def'), mag: L.stat(S, h, 'mag'), spd: L.stat(S, h, 'spd'), exp: h.exp, need: L.need(h.lv) })),
      gold: S.gold, gear: S.gear, crystals: L.bossesDone(S), time: S.playTime, inv: { ...S.inv }
    };
  }
  async useItemMenu() {
    const S = this.S;
    while (true) {
      const keys = [], opts = [];
      for (const k in ITEMS) if ((S.inv[k] || 0) > 0) { keys.push(k); opts.push(`${ITEMS[k].name} x${S.inv[k]}`); }
      if (!keys.length) { await this.say(['Keine Items im Beutel.']); return; }
      opts.push('Zurück');
      const s = await this.choose(opts, true);
      if (s === -1 || s === keys.length) return;
      const k = keys[s];
      const t = await this.chooseHero();
      if (t === -1) continue;
      if (L.applyItem(S, k, S.party[t])) S.inv[k] -= 1;
      else await this.say(['Das hätte jetzt keine Wirkung.']);
      if (this.autoplay) return;
    }
  }
  chooseHero() {
    const S = this.S;
    return this.choose(S.party.map(h => `${h.name}  ${h.hp}/${L.mhp(S, h)}`), true);
  }

  // ---------------------------------------------------------------- Kampf
  async startEncounter() {
    const S = this.S;
    this.busy = true;
    this.setTouch(false);
    this.clearDirs();
    S.grace = 6;
    let pool = S.map.enc, bg = S.map.theme;
    if (S.map.world) { pool = L.STAGE_POOL[L.stage(S)]; bg = S.reg[S.gp.y][S.gp.x]; }
    if (!pool.length) { this.busy = false; this.setTouch(true); return; }
    let n = 1 + (this.rng.randf() < 0.7 ? 1 : 0) + (this.rng.randf() < 0.3 ? 1 : 0);
    if (L.avgLv(S) < 3.0) n = Math.min(n, 2);
    const ids = [];
    for (let i = 0; i < n; i++) ids.push(pool[this.rng.randi() % pool.length]);
    await this.bmsg('Gegner greifen an!', 0.55);
    const r = await this.runBattle(ids, bg);
    if (r === 'lose') await this.gameOver();
    this.busy = false;
    this.setTouch(true);
  }
  async startRoamerFight(r) {
    const S = this.S;
    this.busy = true;
    this.setTouch(false);
    this.clearDirs();
    let pool = S.map.enc, bg = S.map.theme;
    if (S.map.world) { pool = L.STAGE_POOL[L.stage(S)]; bg = S.reg[S.gp.y][S.gp.x]; }
    const ids = [r.id];
    let extra = (this.rng.randf() < 0.5 ? 1 : 0) + (this.rng.randf() < 0.2 ? 1 : 0);
    if (L.avgLv(S) < 3.0) extra = 0;
    else if (L.avgLv(S) < 5.0) extra = Math.min(extra, 1);
    for (let i = 0; i < extra; i++) ids.push(pool[this.rng.randi() % pool.length]);
    await this.bmsg('Ein Monster stellt sich euch in den Weg!', 0.6);
    const res = await this.runBattle(ids, bg);
    if (res === 'win') { const i = S.roamers.indexOf(r); if (i >= 0) S.roamers.splice(i, 1); }
    else if (res === 'run') r.stun = 3.0;
    else if (res === 'lose') await this.gameOver();
    S.grace = 6;
    this.busy = false;
    this.setTouch(true);
  }

  async runBattle(ids, bg) {
    const S = this.S;
    await this.fade(1.0, 0.18);
    this.ui.msg('');
    this.mode = M.BATTLE;
    S.enemies = ids.map(id => L.makeEnemy(S, id));
    for (const h of S.party) { h.ip = 0; h.down = h.hp <= 0; }
    await this.view.battleBegin?.(bg, S.enemies, S.party);
    this.setTouch(false);
    await this.fade(0.0, 0.18);
    const n = ids.length;
    const boss = S.enemies[0].boss;
    await this.bmsg(n === 1 ? `${S.enemies[0].name} erscheint!` : `${n} Gegner!`, 0.8);
    let result = '';
    let rounds = 0;
    while (result === '') {
      rounds++;
      const cmds = [];
      let i = 0;
      const ph = L.aliveHeroes(S);
      while (i < ph.length) {
        const h = ph[i];
        this.curHero = S.party.indexOf(h);
        let c = await this.pickCommand(h, boss);
        if (!c) continue;
        if (c.type === 'run') {
          if (this.rng.randf() < 0.65) { await this.bmsg('Ihr seid entkommen!', 0.8); result = 'run'; break; }
          await this.bmsg('Flucht misslungen!', 0.7);
          c = { type: 'guard', h };
        }
        cmds.push(c);
        i++;
      }
      this.curHero = -1;
      if (result !== '') break;
      const order = [];
      for (const c of cmds) order.push({ k: 'h', who: c.h, c, s: L.stat(S, c.h, 'spd') + this.rng.randf() * 3.0 });
      for (const e of L.aliveEnemies(S)) order.push({ k: 'e', who: e, s: e.spd + this.rng.randf() * 3.0 });
      order.sort((a, b) => b.s - a.s);
      const guard = [];
      for (const o of order) {
        if (!L.aliveEnemies(S).length || !L.aliveHeroes(S).length) break;
        if (o.k === 'h') { if (o.who.hp > 0) await this.heroAct(o.c, guard); }
        else if (o.who.hp > 0) await this.enemyAct(o.who, guard);
      }
      if (!L.aliveEnemies(S).length) result = 'win';
      else if (!L.aliveHeroes(S).length) result = 'lose';
      else if (this.autoplay && rounds > 200) result = 'lose';   // Sicherung für den Selbsttest
    }
    if (result === 'win') await this.victory();
    else if (result === 'lose') await this.bmsg('Das Team ist besiegt ...', 1.2);
    this.ui.msg('');
    await this.fade(1.0, 0.18);
    this.view.battleEnd?.();
    this.mode = M.WORLD;
    S.enemies = [];
    for (const h of S.party) delete h.down;
    await this.fade(0.0, 0.18);
    return result;
  }

  async pickCommand(h, boss) {
    const S = this.S;
    const ip = IPSKILLS[L.hd(h).ip];
    while (true) {
      const r = await this.chooseCross([false, false, h.ip < ip.ip, false, false, false]);
      switch (r) {
        case 0: {
          const t = await this.pickEnemy();
          if (t >= 0) return { type: 'atk', h, t: S.enemies[t] };
          break;
        }
        case 1: {
          const sk = L.hd(h).skills;
          const opts = [], dis = [];
          for (const s of sk) { const d = SKILLS[s]; opts.push(`${d.name} ${d.sp}SP`); dis.push(h.sp < d.sp); }
          opts.push('Zurück');
          dis.push(false);
          let si = await this.choose(opts, true, dis);
          if (this.autoplay && si >= 0 && si < sk.length && h.sp < SKILLS[sk[si]].sp) si = -1;
          if (si >= 0 && si < sk.length) {
            const c = await this.pickSkillTarget(h, SKILLS[sk[si]], sk[si], false);
            if (c) return c;
          }
          break;
        }
        case 2: {
          if (h.ip < ip.ip) break;
          const c = await this.pickSkillTarget(h, ip, L.hd(h).ip, true);
          if (c) return c;
          break;
        }
        case 3: {
          const keys = [], opts = [];
          for (const k in ITEMS) if ((S.inv[k] || 0) > 0) { keys.push(k); opts.push(`${ITEMS[k].name} x${S.inv[k]}`); }
          if (!keys.length) await this.bmsg('Keine Items!', 0.6);
          else {
            opts.push('Zurück');
            const si = await this.choose(opts, true);
            if (si >= 0 && si < keys.length) {
              const ti = await this.chooseHero();
              if (ti >= 0) return { type: 'item', h, i: keys[si], t: S.party[ti] };
            }
          }
          break;
        }
        case 4: return { type: 'guard', h };
        case 5:
          if (boss) await this.bmsg('Vor diesem Gegner gibt es kein Entkommen!', 0.9);
          else return { type: 'run', h };
          break;
      }
    }
  }
  async pickSkillTarget(h, d, k, isIp) {
    const S = this.S;
    const type = isIp ? 'ipskill' : 'skill';
    if (d.kind === 'heal' && !d.all) {
      const ti = await this.chooseHero();
      if (ti >= 0) return { type, h, s: k, t: S.party[ti] };
      return null;
    }
    if (d.all || d.kind === 'guard') return { type, h, s: k, t: null };
    const t = await this.pickEnemy();
    if (t >= 0) return { type, h, s: k, t: S.enemies[t] };
    return null;
  }
  async pickEnemy() {
    const S = this.S;
    const idx = [], opts = [];
    S.enemies.forEach((e, i) => { if (e.hp > 0) { idx.push(i); opts.push(e.name); } });
    if (idx.length === 1) return idx[0];
    opts.push('Zurück');
    this.ui.targetHint?.(idx);
    const r = await this.choose(opts, true);
    this.ui.targetHint?.(null);
    if (r < 0 || r >= idx.length) return -1;
    return idx[r];
  }
  hitEnemy(e, dmg, fx = 'slash') {
    const S = this.S;
    e.hp = Math.max(0, e.hp - dmg);
    const i = S.enemies.indexOf(e);
    this.view.battleEnemy?.(i, 'hurt');
    this.view.battleFx?.(fx, 'enemy', i);
    this.ui.floatEnemy?.(i, String(dmg), fx === 'magic' ? '#d8b8ff' : '#ffffff');
  }
  hurtHero(h, dmg, heavy = false) {
    const S = this.S;
    h.hp = Math.max(0, h.hp - dmg);
    h.ip = Math.min(100, h.ip + (heavy ? 22 : 12));
    const i = S.party.indexOf(h);
    this.ui.floatHero?.(i, String(dmg), '#ff7373');
    this.view.battleHero?.(i, 'hurt');
    this.view.battleFx?.(heavy ? 'heavy' : 'hit', 'hero', i);
    this.view.shake?.(heavy ? 0.32 : 0.22);
  }
  async heroAct(c, guard) {
    const S = this.S, h = c.h, hi = S.party.indexOf(h);
    switch (c.type) {
      case 'guard':
        guard.push(h);
        this.view.battleHero?.(hi, 'guard');
        this.view.battleFx?.('guard', 'hero', hi);
        await this.bmsg(`${h.name} geht in Deckung.`, 0.45);
        break;
      case 'atk': {
        let t = c.t;
        if (t.hp <= 0) { const al = L.aliveEnemies(S); if (!al.length) return; t = al[0]; }
        await this.bmsg(`${h.name} greift ${t.name} an!`, 0.35);
        this.view.battleHero?.(hi, 'attack', S.enemies.indexOf(t));
        await this.wait(0.28);
        this.hitEnemy(t, L.dmgPhys(this.rng, L.stat(S, h, 'atk'), t.def));
        await this.wait(0.5);
        break;
      }
      case 'item': {
        const t = c.t;
        if ((S.inv[c.i] || 0) > 0 && L.applyItem(S, c.i, t)) {
          S.inv[c.i] -= 1;
          await this.bmsg(`${h.name} nutzt ${ITEMS[c.i].name} auf ${t.name}.`, 0.8);
          const ti = S.party.indexOf(t);
          this.ui.floatHero?.(ti, '+', '#66ff99');
          this.view.battleFx?.('heal', 'hero', ti);
          if (t.down && t.hp > 0) { t.down = false; this.view.battleHero?.(ti, 'idle'); }
        } else await this.bmsg('Ohne Wirkung ...', 0.5);
        break;
      }
      case 'skill':
      case 'ipskill': {
        const isIp = c.type === 'ipskill';
        const d = isIp ? IPSKILLS[c.s] : SKILLS[c.s];
        if (isIp) {
          if (h.ip < d.ip) return;
          h.ip -= d.ip;
        } else {
          if (h.sp < d.sp) { await this.bmsg('Zu wenig SP!', 0.5); return; }
          h.sp -= d.sp;
        }
        await this.bmsg(`${h.name}: ${d.name}!`, 0.5);
        this.view.battleHero?.(hi, d.kind === 'phys' ? 'attack' : 'cast', c.t && S.enemies.includes(c.t) ? S.enemies.indexOf(c.t) : -1);
        if (isIp) this.view.battleFx?.('special', 'hero', hi);
        await this.wait(0.3);
        if (d.kind === 'heal') {
          let tg = d.all ? L.aliveHeroes(S) : [c.t];
          if (isIp) {
            for (const x of S.party) if (x.hp <= 0) x.hp = Math.max(1, Math.trunc(L.mhp(S, x) / 2));
            tg = S.party;
          }
          for (const t of tg) {
            const amt = d.mult > 50.0 ? L.mhp(S, t) - t.hp : Math.trunc((L.stat(S, h, 'mag') * d.mult + 12) * this.rng.range(0.95, 1.05));
            t.hp = Math.min(L.mhp(S, t), t.hp + amt);
            const ti = S.party.indexOf(t);
            this.ui.floatHero?.(ti, '+' + amt, '#66ff99');
            this.view.battleFx?.('heal', 'hero', ti);
            if (t.down && t.hp > 0) { t.down = false; this.view.battleHero?.(ti, 'idle'); }
          }
          await this.wait(0.5);
        } else if (d.kind === 'guard') {
          for (const x of L.aliveHeroes(S)) { guard.push(x); this.view.battleFx?.('guard', 'hero', S.party.indexOf(x)); }
          await this.wait(0.3);
        } else {
          let tg = d.all ? L.aliveEnemies(S) : [c.t];
          if (!d.all && tg[0].hp <= 0) tg = L.aliveEnemies(S).slice(0, 1);
          const hits = d.hits || 1;
          for (let k = 0; k < hits; k++) {
            for (const t of tg) {
              if (t.hp <= 0) continue;
              if (d.kind === 'phys') this.hitEnemy(t, L.dmgPhys(this.rng, L.stat(S, h, 'atk'), t.def, d.mult), isIp ? 'bigslash' : 'slash');
              else this.hitEnemy(t, L.dmgMag(this.rng, L.stat(S, h, 'mag'), t.def, d.mult), 'magic');
            }
            await this.wait(0.3);
          }
          await this.wait(0.3);
        }
        break;
      }
    }
    for (const e of S.enemies) {
      if (e.hp <= 0 && !e.dead) {
        e.dead = true;
        this.view.battleEnemyDown?.(S.enemies.indexOf(e));
        await this.bmsg(`${e.name} wird zu Rauschen!`, 0.6);
      }
    }
  }
  async enemyAct(e, guard) {
    const S = this.S;
    const al = L.aliveHeroes(S);
    if (!al.length) return;
    e.turn += 1;
    const spec = e.spec;
    const useSpec = spec.length > 0 && e.turn % 3 === 0;
    const ei = S.enemies.indexOf(e);
    if (useSpec) {
      this.view.battleEnemy?.(ei, 'attack');
      await this.bmsg(`${e.name}: ${spec[0]}!`, 0.7);
      this.view.battleFx?.('spec', 'enemy', ei);
      for (const h of al) {
        let dm = L.dmgPhys(this.rng, e.atk, L.stat(S, h, 'def'), spec[1]);
        if (guard.includes(h)) dm = Math.max(1, Math.trunc(dm / 2));
        this.hurtHero(h, dm, true);
      }
      await this.wait(0.5);
    } else {
      const heavy = this.rng.randf() < 0.2;
      const t = al[this.rng.randi() % al.length];
      this.view.battleEnemy?.(ei, 'attack', S.party.indexOf(t));
      await this.bmsg((heavy ? `${e.name} wuchtet auf ${t.name} ein!` : `${e.name} greift ${t.name} an!`), 0.4);
      let dm = L.dmgPhys(this.rng, e.atk, L.stat(S, t, 'def'), heavy ? 1.5 : 1.0);
      if (guard.includes(t)) dm = Math.max(1, Math.trunc(dm / 2));
      this.hurtHero(t, dm, heavy);
      await this.wait(0.45);
    }
    for (const h of S.party) {
      const i = S.party.indexOf(h);
      if (h.hp <= 0 && !h.down) {
        h.down = true;
        this.view.battleHero?.(i, 'death');
        await this.bmsg(`${h.name} geht zu Boden!`, 0.5);
      } else if (h.hp > 0 && h.down) {
        h.down = false;
        this.view.battleHero?.(i, 'idle');
      }
    }
  }
  async victory() {
    const S = this.S;
    let xp = 0, gd = 0;
    for (const e of S.enemies) { xp += e.exp; gd += e.gold; }
    xp = L.victoryExp(S, xp);
    S.gold += gd;
    this.view.battleFx?.('victory');
    this.view.battleHero?.(-1, 'victory');
    await this.bmsg(`Sieg!  +${xp} EXP  +${gd} Münzen`, 1.0);
    if (this.rng.randf() < 0.25) {
      S.inv.trank = (S.inv.trank || 0) + 1;
      await this.bmsg('Beute: Trank', 0.7);
    }
    for (const h of S.party) {
      h.down = false;
      if (h.hp <= 0) continue;
      for (const lv of L.gainExp(S, h, xp)) await this.bmsg(`${h.name} erreicht Stufe ${lv}!`, 0.9);
    }
  }

  // Debug (nur mit ?debug): F9 Kampf, F8 nächste Karte
  debugKey(k) {
    if (!this.debug || this.mode !== M.WORLD || !this.idle()) return;
    if (k === 'F9') this.startEncounter();
    if (k === 'F8') {
      const nx = L.MAP_ORDER[(L.MAP_ORDER.indexOf(this.S.mapId) + 1) % L.MAP_ORDER.length];
      this.loadMap(nx, L.startOf(nx));
    }
  }
}
