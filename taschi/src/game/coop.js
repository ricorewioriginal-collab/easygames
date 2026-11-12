// 🤝 Koop-Erkunden online: Zwei Spieler bleiben nach dem Online-Menü
// verbunden und sehen einander in der Welt (gleiche Region). Jeder spielt sein
// eigenes Abenteuer weiter; trefft ihr euch, könnt ihr gemeinsam einen
// Sternennest-Raid bestreiten (gemeinsame KP des Riesen). Verbindung über die
// bestehende Online-Leitung (core/net.js, vermittelt von cloud/fire-peer.js).
import { THREE } from '../engine/three.js';
import { createCharacter, PLAYER_PRESETS } from '../engine/characters.js';
import { SPECIES } from '../data/species.js';
import * as L from '../logic/link.js';

const SEND_EVERY = 0.12;
const num = (v, d = 0) => Number.isFinite(+v) ? +v : d;

function nameTag(text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const x = c.getContext('2d');
  x.font = '700 30px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const w = Math.min(250, x.measureText(text).width + 34);
  x.fillStyle = 'rgba(20,30,60,.78)'; x.beginPath(); x.roundRect ? x.roundRect(128 - w / 2, 8, w, 48, 24) : x.rect(128 - w / 2, 8, w, 48); x.fill();
  x.fillStyle = '#fff'; x.fillText(text, 128, 33);
  const tex = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(1.8, 0.45, 1); s.renderOrder = 10;
  return s;
}

export class Coop {
  constructor(game, link, peer) {
    this.game = game; this.link = link; this.peer = peer;
    this.remote = null; this.ghost = null; this.sendT = 0; this.incoming = 0; this.raid = null;
    this.look = L.cleanLook(peer.look, PLAYER_PRESETS.d);
    this.off = link.on((d) => this.onMsg(d));
    game.coop = this;
    game.ui.toast('Koop aktiv: Ihr seht euch in derselben Region. ' + peer.name + ' ist dabei!', '🤝');
  }
  get open() { return this.link && !this.link.closed; }
  onMsg(d) {
    if (d.t === 'closed') { this.end(true); return false; }
    if (d.t === 'pos') { this.remote = { r: d.r | 0, x: num(d.x), z: num(d.z), ry: num(d.ry), v: num(d.v), at: performance.now() }; return true; }
    if (d.t === 'emote') { this.ghost?.ch.play('wave', 1.6); this.game.ui.toast(this.peer.name + ' winkt dir zu!', '👋'); return true; }
    if (d.t === 'raidInvite') { this.onInvite(d); return true; }
    if (d.t === 'raidAnswer') { this.raid?.answer?.(d); return true; }
    if (d.t === 'raidDmg') { this.incoming += Math.max(0, Math.min(99999, d.n | 0)); return true; }
    return false;
  }
  // gleiche Region und draußen?
  partnerHere() {
    const c = this.game.world.current, r = this.remote;
    if (!this.open || !r || c?.type !== 'region' || r.r !== c.region || performance.now() - r.at > 5000) return null;
    return { name: this.peer.name };
  }
  // pro Bild vom Spiel gerufen
  update(dt) {
    if (!this.open) return;
    const w = this.game.world, c = w.current, p = w.player?.root;
    this.sendT -= dt;
    if (p && this.sendT <= 0) {
      this.sendT = SEND_EVERY;
      this.link.send({ t: 'pos', r: c?.type === 'region' ? c.region : -1, x: +p.position.x.toFixed(2), z: +p.position.z.toFixed(2), ry: +p.rotation.y.toFixed(2), v: +(w.player.speed || 0).toFixed(1) });
    }
    const here = this.partnerHere();
    if (!here) { if (this.ghost) this.ghost.root.visible = false; return; }
    if (!this.ghost) this.ghost = this.makeGhost();
    const g = this.ghost, r = this.remote;
    if (g.root.parent !== w.scene) w.scene.add(g.root);
    g.root.visible = true;
    const k = Math.min(1, dt * 8);
    g.root.position.x += (r.x - g.root.position.x) * k; g.root.position.z += (r.z - g.root.position.z) * k;
    g.root.position.y = c.height(g.root.position.x, g.root.position.z);
    let dy = r.ry - g.root.rotation.y; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
    g.root.rotation.y += dy * k;
    g.ch.setLocomotion(r.v); g.ch.update(dt);
  }
  makeGhost() {
    const ch = createCharacter(this.look, { outline: this.game.quality.outlines });
    const root = new THREE.Group(); root.add(ch.root);
    const tag = nameTag('🌐 ' + this.peer.name); tag.position.y = 2.35; root.add(tag);
    return { ch, root };
  }
  wave() { this.link.send({ t: 'emote' }); this.game.world.player.play('wave', 1.6); }

  // ------------------------------------------------------------ Raid zu zweit
  leadPack() { const m = this.game.save.team.find(x => x.hp > 0); return m ? L.packMon(m) : null; }
  friendFrom(d) {
    const mon = d.mon ? L.unpackMon(d.mon, { ot: this.peer.name }) : null;
    return mon ? { name: this.peer.name, look: this.look, mon } : null;
  }
  share() {
    return (dealt) => { if (dealt > 0) this.link.send({ t: 'raidDmg', n: Math.round(dealt) }); const n = this.incoming; this.incoming = 0; return n; };
  }
  async inviteRaid(raid) {
    const g = this.game;
    this.link.send({ t: 'raidInvite', raid: { id: raid.id, lv: raid.lv, stars: raid.stars, region: raid.region, key: raid.key, shiny: !!raid.shiny }, mon: this.leadPack() });
    g.ui.toast('Einladung an ' + this.peer.name + ' gesendet …', '⭐');
    const d = await new Promise(res => { this.raid = { answer: res }; setTimeout(() => res(null), 30000); });
    this.raid = null;
    if (!d?.ok) { g.ui.toast(d ? this.peer.name + ' kann gerade nicht.' : 'Keine Antwort von ' + this.peer.name + '.', '⭐'); return; }
    const friend = this.friendFrom(d); if (!friend) return;
    this.incoming = 0;
    await g.raidBattle(raid, { friend, share: this.share() });
  }
  async onInvite(d) {
    const g = this.game, r = d.raid || {};
    const raid = { id: String(r.id), lv: Math.max(1, Math.min(100, r.lv | 0)), stars: Math.max(1, Math.min(5, r.stars | 0)), region: r.region | 0, key: String(r.key || ''), shiny: !!r.shiny };
    const friend = this.friendFrom(d);
    if (!SPECIES[raid.id] || !friend || g.busy || g.state !== 'world' || g.ui.blocking || !g.save.team.some(m => m.hp > 0)) { this.link.send({ t: 'raidAnswer', ok: false }); return; }
    await g.script(async () => {
      const c = await g.ui.ask([{ who: this.peer.name, text: 'Ich habe ein riesiges ' + SPECIES[raid.id].name + ' im Sternennest gefunden! Kämpfst du mit?' }], ['Mitmachen', 'Lieber nicht'], { cancelIndex: 1 });
      this.link.send({ t: 'raidAnswer', ok: c === 0, mon: c === 0 ? this.leadPack() : null });
      if (c !== 0) return;
      this.incoming = 0;
      await g.raidBattle(raid, { friend, share: this.share() });
    });
  }
  end(lost = false) {
    if (this.ended) return; this.ended = true;
    this.off?.();
    if (this.ghost) { this.ghost.root.parent?.remove(this.ghost.root); this.ghost = null; }
    if (this.game.coop === this) this.game.coop = null;
    if (!lost && this.open) this.link.close();
    this.game.ui.toast('Koop beendet' + (lost ? ': ' + this.peer.name + ' ist nicht mehr verbunden.' : '.'), '🤝');
  }
}
