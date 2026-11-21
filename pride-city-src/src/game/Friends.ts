/* Freund*innen in deiner Stadt (Online): zeigt die anderen als Figuren oder in ihrem Wagen, schickt die eigene Lage
   und meldet, wer kommt, geht, winkt oder etwas ruft. Regeln und Verbindung: online.ts. */
import { Vector3, type Scene, type TransformNode } from '../engine/bjs';
import { Actor, type Anim, type Look } from './Actor';
import { Net, Roster, SEND_MS, QUICK, EMOTES, type Member, type PState, type Invite } from './online';
import { carDef } from './vehicles';
import type { World } from './World';

interface Fig { a: Actor | null; car: TransformNode | null; carKey: string; busy: boolean; seen: boolean; pos: Vector3; rot: number }
const turn = (from: number, to: number, f: number) => { let d = (to - from) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return from + d * f; };

export class Friends {
  readonly net = new Net();
  readonly roster: Roster;
  private figs = new Map<string, Fig>();
  private sendT = 0;
  private sent = '';
  private idleT = 0;
  /** Meldung für die Anzeige (Toast) */
  onNote: (text: string, kind: 'join' | 'leave' | 'say') => void = () => {};
  /** Einladung in einen Club (online.ts Invite) */
  onInvite: (who: Member, inv: Invite) => void = () => {};
  /** eigenes Aussehen und Name, wenn jemand dazukommt */
  me: () => { n: string; l: Look; s: PState } = () => ({ n: 'Gast', l: { body: '', palette: '', skin: 0 }, s: { x: 0, z: 0, r: 0, a: 'idle', c: '', h: -1 } });

  constructor(private scene: Scene, private world: World, adult: () => boolean) {
    this.roster = new Roster(adult);
    this.net.onMsg = (m) => this.got(m);
    this.net.onClosed = () => { this.clear(); this.onNote('🌐 Die Verbindung zur Stadt ist beendet.', 'leave'); };
    this.net.onGuest = () => ({ t: 'ros', p: [{ id: 'host', name: this.me().n, look: this.me().l, st: this.me().s }, ...this.roster.members.values()] });
  }
  get list() { return [...this.roster.members.values()]; }

  private got(m: unknown) {
    const r = this.roster.apply(m); if (!r) return;
    if (r.ev === 'full') { this.onNote('🌐 Diese Stadt ist schon voll.', 'leave'); return; }
    const who = r.who!;
    if (r.ev === 'join') this.onNote(`🌐 ${who.name} ist jetzt in der Stadt.`, 'join');
    else if (r.ev === 'look') this.drop(who.id);   // neu eingekleidet: Figur wird frisch geladen
    else if (r.ev === 'leave') { this.drop(who.id); this.onNote(`👋 ${who.name} hat die Stadt verlassen.`, 'leave'); }
    else if (r.ev === 'quick' || r.ev === 'emote') this.onNote(r.text!, 'say');
    else if (r.ev === 'invite') this.onInvite(who, r.inv!);
  }
  private drop(id: string) { const f = this.figs.get(id); if (!f) return; f.a?.root.dispose(); f.car?.dispose(); this.figs.delete(id); }
  private clear() { for (const id of [...this.figs.keys()]) this.drop(id); this.roster.clear(); this.sent = ''; }

  /** Nach dem Verbinden: sich vorstellen */
  hello() { const me = this.me(); this.say({ t: 'hi', n: me.n, l: me.l, s: me.s }); }
  /** Aussehen geändert (Kleiderschrank) */
  relook() { if (this.net.on) this.hello(); }
  private say(m: Record<string, unknown>) { this.net.send(this.net.role === 'host' ? { ...m, id: 'host' } : m); }
  emote(k: string) { if (EMOTES.some((e) => e[0] === k)) this.say({ t: 'e', k }); }
  quick(i: number) { if (QUICK[i]) this.say({ t: 'q', i }); }
  leave() { this.net.close(); this.clear(); }
  /** In den eigenen Club einladen (alle in der Runde bekommen die Einladung) */
  invite(inv: Invite) { this.say({ t: 'club', ...inv }); }
  /** Eigene Lage schicken (auch aus Innenräumen, dann mit w = Ort) */
  send(dt: number, own: PState) {
    if (!this.net.on || (this.sendT -= dt * 1000) > 0) return;
    const s = { x: Math.round(own.x * 100) / 100, z: Math.round(own.z * 100) / 100, r: Math.round(own.r * 100) / 100, a: own.a, c: own.c, h: own.h, ...(own.w ? { w: own.w } : {}) }, k = JSON.stringify(s);
    this.idleT += SEND_MS;
    if (k !== this.sent || this.idleT > 4000) { this.sent = k; this.idleT = 0; this.say({ t: 's', s }); }
    this.sendT = SEND_MS;
  }

  /** Figur oder Wagen für eine Person bereitstellen (lädt im Hintergrund) */
  private async ensure(m: Member, f: Fig) {
    if (f.busy) return;
    const key = m.st.c ? m.st.c + ':' + m.st.h : '';
    if (!f.a) {
      f.busy = true;
      try { const a = await Actor.create(this.scene, m.look); if (this.figs.get(m.id) === f) { f.a = a; a.root.position.copyFrom(f.pos); } else a.root.dispose(); } catch { /* Figur fehlt: Markierung bleibt */ }
      f.busy = false; return;
    }
    if (key !== f.carKey) {
      f.busy = true; f.car?.dispose(); f.car = null; f.carKey = key;
      if (key) try { const o = await this.world.car(carDef(m.st.c).file); if (m.st.h >= 0) await this.world.paintCar(o, m.st.h); if (this.figs.get(m.id) === f && f.carKey === key) f.car = o; else o.dispose(); } catch { /* ohne Wagen weiter */ }
      f.busy = false;
    }
  }

  /** own = eigene Lage (null, wenn du gerade nicht draußen bist) */
  update(dt: number, own: PState | null) {
    if (!this.net.on) return;
    if (own) this.send(dt, own);
    const f1 = 1 - Math.exp(-dt * 9);
    for (const m of this.roster.members.values()) {
      let f = this.figs.get(m.id);
      if (m.st.w) { if (f) { f.a?.root.setEnabled(false); f.car?.setEnabled(false); f.seen = false; } continue; }   // drinnen: hier nicht zeigen
      f?.a?.root.setEnabled(true);
      if (!f) { f = { a: null, car: null, carKey: '', busy: false, seen: false, pos: new Vector3(m.st.x, .1, m.st.z), rot: m.st.r }; this.figs.set(m.id, f); }
      void this.ensure(m, f);
      const far = Math.hypot(m.st.x - f.pos.x, m.st.z - f.pos.z) > 30;
      if (far || !f.seen) { f.pos.set(m.st.x, .1, m.st.z); f.rot = m.st.r; f.seen = true; }
      else { f.pos.x += (m.st.x - f.pos.x) * f1; f.pos.z += (m.st.z - f.pos.z) * f1; f.rot = turn(f.rot, m.st.r, f1); }
      const inCar = !!m.st.c && !!f.car;
      if (f.car) { f.car.setEnabled(inCar); if (inCar) { f.car.position.set(f.pos.x, .1, f.pos.z); f.car.rotation.y = f.rot; } }
      if (f.a) {
        f.a.root.visible = !m.st.c;
        if (!m.st.c) { f.a.root.position.copyFrom(f.pos); f.a.root.rotation.y = f.rot; if (f.a.anim !== m.st.a) f.a.play(m.st.a as Anim, .2); f.a.update(dt); }
      }
    }
  }

  /** Ort einer Person (für Markierung und Ansprechen), null wenn drinnen */
  posOf(id: string) { return this.roster.members.get(id)?.st.w ? null : this.figs.get(id)?.pos || null; }
  /** nächste Person zu Fuß in Reichweite */
  nearest(p: Vector3, r: number): Member | null {
    let best: Member | null = null, bd = r;
    for (const m of this.roster.members.values()) { const f = this.figs.get(m.id); if (!f || m.st.c || m.st.w) continue; const d = Math.hypot(f.pos.x - p.x, f.pos.z - p.z); if (d < bd) { bd = d; best = m; } }
    return best;
  }
}

/** Freund*innen im selben Innenraum (Club, Laden): eigene Figuren in der Raumszene, nur wer dort ist (st.w = key) */
export class RoomFriends {
  private figs = new Map<string, { a: Actor | null; busy: boolean; pos: Vector3; rot: number; look: string }>();
  constructor(private scene: Scene, private friends: Friends, readonly key: string) {}
  update(dt: number) {
    const f1 = 1 - Math.exp(-dt * 9), here = new Set<string>();
    if (this.friends.net.on) for (const m of this.friends.roster.members.values()) {
      if (m.st.w !== this.key) continue;
      here.add(m.id);
      let f = this.figs.get(m.id); const lk = JSON.stringify(m.look);
      if (f && f.look !== lk) { f.a?.root.dispose(); this.figs.delete(m.id); f = undefined; }
      if (!f) { f = { a: null, busy: false, pos: new Vector3(m.st.x, 0, m.st.z), rot: m.st.r, look: lk }; this.figs.set(m.id, f); }
      if (!f.a && !f.busy) { const ff = f; ff.busy = true; Actor.create(this.scene, m.look).then((a) => { if (this.figs.get(m.id) === ff) ff.a = a; else a.root.dispose(); }).catch(() => { /* ohne Figur */ }).finally(() => { ff.busy = false; }); }
      f.pos.x += (m.st.x - f.pos.x) * f1; f.pos.z += (m.st.z - f.pos.z) * f1; f.rot = turn(f.rot, m.st.r, f1);
      if (f.a) { f.a.root.position.copyFrom(f.pos); f.a.root.rotation.y = f.rot; if (f.a.anim !== m.st.a) f.a.play(m.st.a as Anim, .2); f.a.update(dt); }
    }
    for (const [id, f] of this.figs) if (!here.has(id)) { f.a?.root.dispose(); this.figs.delete(id); }
  }
  /** nächste Person in Reichweite (zum Ansprechen) */
  nearest(x: number, z: number, r: number): { id: string; name: string; x: number; z: number } | null {
    let best: { id: string; name: string; x: number; z: number } | null = null, bd = r;
    for (const [id, f] of this.figs) { const d = Math.hypot(f.pos.x - x, f.pos.z - z), m = this.friends.roster.members.get(id); if (m && d < bd) { bd = d; best = { id, name: m.name, x: f.pos.x, z: f.pos.z }; } }
    return best;
  }
  get count() { return this.figs.size; }
  /** Namensschilder für die Anzeige */
  marks() { const out: Array<{ id: string; icon: string; label: string; pos: Vector3 }> = []; for (const [id, f] of this.figs) { const m = this.friends.roster.members.get(id); if (m) out.push({ id: 'fr' + id, icon: '🌐', label: m.name, pos: new Vector3(f.pos.x, 2.3, f.pos.z) }); } return out; }
}
