// Mehrspieler im Spiel: verbindet Game, Protokoll (net.js), WebRTC (rtc.js) und die Spielerfiguren (avatars.js).
import { NetHost, NetGuest, dropOf } from './net.js';
import { createInvite, answerInvite } from './rtc.js';
import { AvatarView } from './avatars.js';
import { encodeEdits } from './storage.js';
import { MOB_TYPES, rollDrops } from './mobs.js';
import { MAX_STACK } from './crafting.js';
import { nameOf } from './items.js';

// Tiere des Gastgebers beim Gast: nur Anzeige und Treffer-Strahl, Bewegung kommt über das Netz
class RemoteMobs {
  constructor(view) { this.view = view; this.list = []; this.byId = new Map(); this.enabled = false; }
  set(records) {
    const seen = new Set();
    for (const r of records) {
      const [id, type, x, y, z, yaw, hurt, moving, role, name] = r;
      if (!Number.isInteger(id) || !MOB_TYPES[type] || ![x, y, z, yaw].every(Number.isFinite)) continue;
      seen.add(id);
      let m = this.byId.get(id);
      if (!m) {
        const T = MOB_TYPES[type];
        m = { id, type, T, x, y, z, yaw, hurtT: 0, moving: false, hostile: !!T.hostile, npc: !!T.npc, role: role || '', name: name || T.name };
        this.byId.set(id, m); this.list.push(m); this.view.add(m);
      }
      Object.assign(m, { x, y, z, yaw, moving: !!moving });
      if (hurt) m.hurtT = 0.2;
    }
    for (const m of this.list.slice()) if (!seen.has(m.id)) this.removeMob(m);
  }
  removeMob(m) { this.byId.delete(m.id); this.list.splice(this.list.indexOf(m), 1); this.view.remove(m); }
  update(dt) { for (const m of this.list) m.hurtT = Math.max(0, m.hurtT - dt); }
  raycast(ox, oy, oz, dx, dy, dz, reach) {
    let best = null, bt = reach;
    for (const m of this.list) {
      const h = m.T.half, lo = [m.x - h, m.y, m.z - h], hi = [m.x + h, m.y + m.T.h, m.z + h], o = [ox, oy, oz], d = [dx, dy, dz];
      let t0 = 0, t1 = bt;
      for (let a = 0; a < 3 && t0 <= t1; a++) {
        if (Math.abs(d[a]) < 1e-9) { if (o[a] < lo[a] || o[a] > hi[a]) t0 = Infinity; continue; }
        let u = (lo[a] - o[a]) / d[a], w = (hi[a] - o[a]) / d[a];
        if (u > w) [u, w] = [w, u];
        t0 = Math.max(t0, u); t1 = Math.min(t1, w);
      }
      if (t0 <= t1 && t0 < bt) { bt = t0; best = m; }
    }
    return best ? { mob: best, t: bt } : null;
  }
  remove(m) { if (this.byId.has(m.id)) this.removeMob(m); }
  clear() { for (const m of this.list.slice()) this.removeMob(m); }
  serialize() { return undefined; }
  hostileCount() { return 0; }
}

export class Multiplayer {
  constructor(game, ui) {
    this.game = game; this.ui = ui; // ui: { toast(text), players(list), status(text), ended(why) }
    this.avatars = new AvatarView(game.scene);
    this.host = null; this.guest = null; this.conns = new Set(); this.posT = 0; this.useStun = true;
  }
  get active() { return !!(this.host || this.guest); }

  // ---------- Gastgeber ----------
  open() {
    const g = this.game;
    if (this.host) return;
    this.host = new NetHost({
      world: g.world, now: () => performance.now(),
      info: () => ({ seed: g.seed, gen: g.gen, mode: g.mode, time: g.time, edits: encodeEdits(g.world.edits), pos: { x: g.player.x, y: g.player.y, z: g.player.z }, name: this.myName || 'Gastgeber' }),
      onPlant: (x, y, z) => g.farm.plant(x, y, z, g.age),
      onHit: (peer, id, dmg) => this.hostHit(peer, id, dmg),
      onJoin: p => { this.ui.toast(`${p.name} ist in deiner Welt`); this.avatars.set(p.id, { ...p.pos, name: p.name }); this.listPlayers(); },
      onLeave: p => { this.ui.toast(`${p.name} hat die Welt verlassen`); this.avatars.remove(p.id); this.listPlayers(); }
    });
    g.world.onSet = (x, y, z, t) => this.host && this.host.queueBlock(x, y, z, t);
    g.mp = this;
    if (!g.running) g.resume(); // die Welt läuft für die Gäste weiter, auch im Pausemenü
  }
  async invite() {
    this.open();
    let peer = null;
    const inv = await createInvite(this.useStun, dc => {
      peer = this.host.addPeer(t => dc.send(t));
      peer.dc = dc; peer.pc = inv.pc; this.conns.add(inv.pc);
      dc.onmessage = e => this.host.receive(peer, e.data);
      dc.onclose = () => { if (this.host) this.host.close(peer); this.conns.delete(inv.pc); };
    });
    inv.pc.onconnectionstatechange = () => { if (['failed', 'closed'].includes(inv.pc.connectionState) && peer && this.host) this.host.close(peer); };
    return inv;
  }
  hostHit(peer, id, dmg) {
    const g = this.game, m = g.mobs && g.mobs.list.find(x => x.id === id);
    if (!m || m.npc || Math.hypot(m.x - peer.pos.x, m.z - peer.pos.z) > 8) return null;
    if (!m.hit(dmg, peer.pos.x, peer.pos.z)) return null;
    g.spawnBreak(m.x - 0.5, m.y, m.z - 0.5, 60); g.mobs.remove(m, false); g.unsaved = true;
    return g.mode === 'creative' ? null : rollDrops(m.type);
  }
  others() { return this.host ? this.host.guests.map(p => ({ id: p.id, x: p.pos.x, y: p.pos.y, z: p.pos.z })) : null; }
  hurtGuest(m) {
    const p = this.host && this.host.peers.get(m.target);
    if (!p) return;
    this.host.hurt(p.id, m.T.dmg, m.T.name, [m.x, m.y + 0.3, m.z, m.T.range ? 1 : 0]);
  }
  kick(id) { const p = this.host && this.host.peers.get(id); if (p) { this.host.kick(p, 'Der Gastgeber hat dich aus der Welt genommen.'); try { p.pc.close(); } catch { /* schon zu */ } } }
  listPlayers() {
    const list = this.host ? this.host.guests.map(p => ({ id: p.id, name: p.name })) : [...this.avatars.list.entries()].map(([id, a]) => ({ id, name: a.name }));
    this.ui.players(list);
  }

  // ---------- Gast ----------
  async join(invite, name) {
    const g = this.game;
    this.myName = name;
    this.guest = new NetGuest({
      onWelcome: info => this.welcome(info),
      onBlocks: list => { const w = g.world; if (!w) return; for (const [x, y, z, t] of list) { if (w.ensure) w.ensure(x >> 4, z >> 4); w.setBlock(x, y, z, t); } },
      onPlayer: (id, p) => { this.avatars.set(id, p); if (p.name) this.listPlayers(); },
      onLeft: id => { const a = this.avatars.list.get(id); if (a) this.ui.toast(`${a.name || 'Ein Spieler'} ist gegangen`); this.avatars.remove(id); this.listPlayers(); },
      onMobs: list => { if (g.mobs instanceof RemoteMobs) g.mobs.set(list); },
      onHurt: m => g.remoteHurt(m),
      onDrops: list => {
        for (const [id, n] of list) g.inv[id] = Math.min(MAX_STACK, (g.inv[id] || 0) + n);
        this.ui.toast(list.map(([id, n]) => `+${n} ${nameOf(id)}`).join(' · ')); g.onChange();
      },
      onTime: t => { g.time = t; },
      onReject: cells => this.reject(cells),
      onBye: why => this.end(why)
    }, t => this.dc && this.dc.readyState === 'open' && this.dc.send(t), name);
    const ans = await answerInvite(invite, this.useStun, (dc, pc) => {
      this.dc = dc; this.conns.add(pc);
      dc.onmessage = e => this.guest && this.guest.receive(e.data);
      dc.onclose = () => this.end('Die Verbindung zum Gastgeber ist getrennt.');
      this.guest.hello();
      this.ui.status('Verbunden, Welt wird geladen …');
    });
    ans.pc.onconnectionstatechange = () => { if (['failed', 'closed'].includes(ans.pc.connectionState)) this.end('Die Verbindung zum Gastgeber ist getrennt.'); };
    return ans.code;
  }
  welcome(info) {
    const g = this.game;
    g.start({ name: `Bei ${info.host}`, seed: info.seed, gen: info.gen, mode: info.mode, time: info.time, edits: info.edits, px: info.pos.x + 1.5, py: info.pos.y, pz: info.pos.z, yaw: 0, pitch: 0 });
    g.mp = this; g.net = this.guest;
    g.mobs.clear(); g.mobs = new RemoteMobs(g.mobView); // Tiere kommen vom Gastgeber
    this.ui.joined(info);
  }
  reject(cells) {
    const g = this.game;
    for (const [x, y, z, from, to, actual] of cells) {
      g.world.setBlock(x, y, z, actual >= 0 ? actual : from);
      if (g.mode === 'creative') continue;
      if (to) g.inv[to] = Math.min(MAX_STACK, (g.inv[to] || 0) + 1); // gesetzter Block zurück in den Vorrat
      else { const d = dropOf(from); g.inv[d] = Math.max(0, (g.inv[d] || 0) - 1); } // Beute wieder abziehen
    }
    g.onChange();
    this.ui.toast('Der Gastgeber hat eine Änderung nicht übernommen');
  }

  // ---------- jedes Bild ----------
  tick(dt) {
    const g = this.game, p = g.player;
    this.avatars.update(dt, g.light);
    if (this.host) {
      this.host.tick(dt, { x: p.x, y: p.y, z: p.z, yaw: g.yaw }, g.time, g.mobs ? g.mobs.list : null);
      for (const q of this.host.guests) this.avatars.set(q.id, q.pos);
    }
    if (this.guest && this.guest.token) {
      this.guest.flush();
      if ((this.posT -= dt) <= 0) { this.posT = 0.1; this.guest.pos({ x: p.x, y: p.y, z: p.z, yaw: g.yaw, pitch: g.pitch }); }
      if (g.mobs instanceof RemoteMobs) g.mobs.update(dt);
    }
  }
  end(why) {
    if (!this.active && !this.conns.size) return;
    const wasGuest = !!this.guest;
    if (this.host) for (const p of this.host.guests) this.host.kick(p, 'Der Gastgeber hat die Welt geschlossen.');
    for (const pc of this.conns) try { pc.close(); } catch { /* schon zu */ }
    this.conns.clear(); this.host = null; this.guest = null; this.dc = null;
    this.avatars.clear();
    const g = this.game;
    if (g.world) g.world.onSet = null;
    g.mp = null; g.net = null;
    if (why) this.ui.ended(why, wasGuest);
  }
}
