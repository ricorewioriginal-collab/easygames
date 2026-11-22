/* Live-Events: Jede echte Kalenderwoche (Montag bis Sonntag) gibt es drei neue Termine, für alle Spielstände gleich:
   eine Party, ein Konzert und ein Bootsrennen. Party und Konzert laufen jeden Spieltag in ihrem Zeitfenster
   (Party 21–3 Uhr, Konzert 19–23 Uhr), das Bootsrennen tagsüber (10–18 Uhr) im Glitzer-Boot. Wer alle drei schafft,
   bekommt den Wochenpass-Bonus und eine Event-Krone. Party-Finale mit Feuerwerk (feuerwerk.ts).
   Dazu feste Feuerwerke: samstags nach der CSD-Parade über dem Hafen, an Silvester um Mitternacht über der Skyline. */
import { Vector3, type Scene, type Mesh } from '../engine/bjs';
import { torus, glow, planeZ, canvasTex } from '../engine/geo';
import { sfx } from '../engine/Audio';
import { toast } from '../ui/ui';
import type { SaveData } from '../engine/Save';
import type { Marker } from '../ui/Hud';
import type { Gig } from './gigs';
import type { Game } from './Game';
import type { CityScene } from './CityScene';
import { change, hour } from './life';
import { isleXZ, ISLES } from './worlds';
import { isSilvester } from './weather';
import type { Fireworks } from './feuerwerk';

export type LiveKind = 'party' | 'konzert' | 'boot';
export interface LiveEvent {
  id: string; kind: LiveKind; icon: string; name: string; host: string; color: string; text: string;
  /** Ort (Stadtkoordinaten) */ at: () => [number, number];
  /** 3D-Minispiel (minis.ts) für Party und Konzert */ mini?: string;
  /** Bootsrennen: Tore auf dem Wasser, Sekunden für Gold/Silber/Bronze, Preisgeld */ cps?: () => Array<[number, number]>; medal?: [number, number, number]; prize?: [number, number, number];
  pay: number; rep: number;
}
export const KINDS: Record<LiveKind, { icon: string; name: string; from: number; to: number }> = {
  party: { icon: '🎉', name: 'Party', from: 21, to: 3 },
  konzert: { icon: '🎤', name: 'Konzert', from: 19, to: 23 },
  boot: { icon: '🚤', name: 'Bootsrennen', from: 10, to: 18 },
};
const isle = (id: string, x: number, z: number) => () => (ISLES[id] ? isleXZ(id, x, z) : [-84, 26] as [number, number]);
/** Bootsrennen starten am Steg der Strandbar, wo das Glitzer-Boot liegt */
export const DOCK: [number, number] = [-101, 30];

export const EVENTS: LiveEvent[] = [
  // Partys
  { id: 'schaum', kind: 'party', icon: '🫧', name: 'Schaumparty an der Strandbar', host: 'DJ Pixel', color: '#5ce1ff', at: () => [-84, 24], mini: 'dj', pay: 90, rep: 2,
    text: 'Die Schaumkanone läuft, DJ Pixel braucht eine zweite Hand am Pult. Bring die Menge zum Kochen!' },
  { id: 'rooftop', kind: 'party', icon: '🌃', name: 'Neon-Rooftop am Neonplatz', host: 'Rocco Sterling', color: '#ffcf5a', at: () => [131, 34], mini: 'dj', pay: 120, rep: 2,
    text: 'Sterling Nights lädt zur Nacht unter den Hochhäusern. Heute legst du auf, Rocco zahlt in Gold und Gästeliste.' },
  { id: 'playa', kind: 'party', icon: '🏝️', name: 'Beachparty auf Playa Arcoíris', host: 'Lola Caliente', color: '#ff8a3b', at: isle('canaria', 5, 4), mini: 'dj', pay: 110, rep: 2,
    text: '¡Fiesta! Lola baut die Strandbühne auf. Fackeln, Wellen, Bass bis zum Morgen.' },
  { id: 'blackout', kind: 'party', icon: '🔦', name: 'Blackout-Party im Rummel', host: 'Mika', color: '#5ce1ff', at: isle('rummel', 5, 4), mini: 'dark', pay: 110, rep: 2,
    text: 'Strom aus, Taschenlampen an: Mika macht aus dem Geisterhaus eine Party. Finde alle Gäste im Dunkeln!' },
  { id: 'vogue', kind: 'party', icon: '💃', name: 'Vogue-Ball auf der Pride Plaza', host: 'Mother Royal', color: '#ffd23b', at: () => [-19, 19], mini: 'style', pay: 100, rep: 3,
    text: 'Kategorien, Jury, Krone. Darling, heute Nacht läufst du den Runway, und der Look muss sitzen.' },
  // Konzerte
  { id: 'luma', kind: 'konzert', icon: '🎙️', name: 'Lady Luma live im Regenbogenpark', host: 'Lady Luma', color: '#ff3fb0', at: () => [41, 41], mini: 'kara', pay: 80, rep: 2,
    text: 'Open-Air-Abend! Lady Luma holt sich Gäste auf die Bühne, und heute bist du dran mit dem Duett.' },
  { id: 'chor', kind: 'konzert', icon: '🎶', name: 'Queerer Chor „Kehlkopf“ am Kai', host: 'Chorleiter Henning', color: '#3ee69a', at: () => [-76, 2], mini: 'kara', pay: 70, rep: 2,
    text: 'Vierzig Stimmen, eine Regenbogenfahne, ein Hafen voller Leute. Henning sucht noch eine Solostimme.' },
  { id: 'lindenhof', kind: 'konzert', icon: '🎸', name: 'Dorfrock in Lindenhof', host: 'Frau Ahmadi', color: '#ffb347', at: isle('lindenhof', 5, 4), mini: 'kara', pay: 80, rep: 2,
    text: 'Die Dorfband probt seit Wochen. Frau Ahmadi meint, ohne dich am Mikro wird das nichts.' },
  { id: 'neon', kind: 'konzert', icon: '🎹', name: 'Synthpop-Nacht im Kaleidoskop', host: 'Mama Vega', color: '#b56bff', at: () => [139, 26], mini: 'kara', pay: 90, rep: 2,
    text: 'Das Haus Vega feiert Synthpop. Drei Songs, ein Mikro, und die Hochstadt singt mit.' },
  // Bootsrennen
  { id: 'regatta', kind: 'boot', icon: '⛵', name: 'Hafen-Regatta', host: 'Bruno', color: '#3a9bff', at: () => DOCK, pay: 0, rep: 0,
    cps: () => [[-110, 55], [-82, 100], [-88, 180], [-157, 192], [-222, 180], [-222, 121], [-222, 58], [-157, 52], [-110, 50], DOCK], medal: [36, 46, 60], prize: [220, 140, 70],
    text: 'Einmal um die Hafeninsel Rostwerk herum und zurück an den Steg. Bruno hat die Bojen schon gesetzt.' },
  { id: 'kanal', kind: 'boot', icon: '🚤', name: 'Inselkanal-Sprint', host: 'Lola Caliente', color: '#ff8a3b', at: () => DOCK, pay: 0, rep: 0,
    cps: () => [[-110, 55], [-222, 55], [-222, -14], [-222, -82], [-157, -84], [-100, -84], [-100, -50]], medal: [29, 37, 48], prize: [280, 170, 90],
    text: 'Durch den Kanal zwischen Glitzeria und Lindenhof, vor der Playa entlang bis zur Flugschule. Wer die Kurven schneidet, gewinnt.' },
  { id: 'kap', kind: 'boot', icon: '🏁', name: 'Kap-Zuflucht-Rallye', host: 'Ayla Demir', color: '#3ddc97', at: () => DOCK, pay: 0, rep: 0,
    cps: () => [[-110, 55], [-84, 120], [-92, 190], [-92, 262], [-115, 320], [-200, 320], [-224, 256], [-222, 185], [-222, 121], [-222, 58], [-157, 52], [-110, 50], DOCK], medal: [54, 67, 86], prize: [320, 200, 100],
    text: 'Die lange Runde: an Rostwerk vorbei um Kap Zuflucht und zurück. Für die Kasse der Zuflucht.' },
];

/* ---------- Kalender ---------- */
/** ISO-Kalenderwoche als Zahl JJJJWW (für alle Spieler gleich) */
export function weekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)), wk = Math.ceil(((t.getTime() - y0.getTime()) / 864e5 + 1) / 7);
  return t.getUTCFullYear() * 100 + wk;
}
const hash = (n: number) => { let h = Math.imul(n ^ 0x2545f491, 0x9e3779b1); h ^= h >>> 15; h = Math.imul(h, 0x85ebca77); return ((h ^ (h >>> 13)) >>> 0) / 4294967296; };
/** Die drei Termine dieser Woche */
export function lineup(wk = weekKey()): LiveEvent[] {
  return (['party', 'konzert', 'boot'] as LiveKind[]).map((k, i) => { const l = EVENTS.filter((e) => e.kind === k); return l[Math.floor(hash(wk * 3 + i) * l.length) % l.length]; });
}
/** Tage bis zum nächsten Wechsel (Montag) */
export function daysLeft(d = new Date()) { return 7 - ((d.getDay() + 6) % 7); }
export const doneThisWeek = (s: SaveData, k: LiveKind) => s.flags['live_' + k] === weekKey();
export function isOpen(s: SaveData, k: LiveKind) { const h = hour(s), w = KINDS[k]; return w.from < w.to ? h >= w.from && h < w.to : h >= w.from || h < w.to; }
export const crowns = (s: SaveData) => Number(s.flags.liveCrowns) || 0;

/** Ergebnis buchen; true, wenn damit der Wochenpass voll ist */
export function claim(s: SaveData, e: LiveEvent): boolean {
  s.flags['live_' + e.kind] = weekKey(); s.flags.liveN = (Number(s.flags.liveN) || 0) + 1;
  const all = (['party', 'konzert', 'boot'] as LiveKind[]).every((k) => doneThisWeek(s, k));
  if (all && s.flags.livePass !== weekKey()) { s.flags.livePass = weekKey(); s.flags.liveCrowns = crowns(s) + 1; s.money += 300; s.rep += 5; return true; }
  return false;
}

/* ---------- In der Stadt: Bühnen, Marker, Mitmachen, feste Feuerwerke ---------- */
export class LiveCity {
  private stage: Array<{ ring: Mesh; sign: Mesh; id: string }> = [];
  private ask = 0;
  private seenWeek = 0;
  constructor(private g: Game, private city: CityScene, private scene: Scene, private fw: Fireworks) {}

  /** Termine, die gerade laufen und diese Woche noch offen sind */
  private open() { const s = this.g.save.data; return lineup().filter((e) => !doneThisWeek(s, e.kind) && isOpen(s, e.kind)); }

  private buildStage(e: LiveEvent) {
    const sc = this.scene, [x, z] = e.at();
    const ring = torus(sc, 2.6, .08, 32); ring.material = glow(sc, e.color, 1.8, { alpha: .8 }); ring.position.set(x, .15, z); ring.scaling.y = .15; ring.isPickable = false;
    const tex = canvasTex(sc, 512, 128, (c) => {
      c.fillStyle = 'rgba(15,8,30,.78)'; c.fillRect(0, 0, 512, 128); c.strokeStyle = e.color; c.lineWidth = 8; c.strokeRect(4, 4, 504, 120);
      c.fillStyle = '#fff'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText(`${KINDS[e.kind].icon} LIVE · ${KINDS[e.kind].name.toUpperCase()}`, 256, 56);
      c.font = '26px sans-serif'; c.fillText(e.name.length > 34 ? e.name.slice(0, 33) + '…' : e.name, 256, 100);
    }, true);
    const sign = planeZ(sc, 4.2, 1.05, true); sign.material = glow(sc, 0xffffff, 1.3, { tex }); sign.position.set(x, 3.6, z); sign.billboardMode = 7; sign.isPickable = false;
    this.stage.push({ ring, sign, id: e.id });
  }

  update(dt: number, busy: boolean) {
    const s = this.g.save.data, h = hour(s);
    // neue Woche: kurz ansagen, was läuft
    const wk = weekKey();
    if (this.seenWeek !== wk && !busy && s.chapter > 1) {
      this.seenWeek = wk;
      if (s.flags.liveSeen !== wk) { s.flags.liveSeen = wk; const l = lineup(wk); setTimeout(() => this.g.hud.banner('📅 Live-Events dieser Woche', l.map((e) => e.icon + ' ' + e.name).join(' · '), 'info', 6000), 2500); }
    }
    // Bühnen der offenen Termine (höchstens drei, nur sichtbar während des Zeitfensters)
    const open = this.open();
    for (const e of open) if (!this.stage.some((q) => q.id === e.id)) this.buildStage(e);
    for (const q of this.stage) { const on = open.some((e) => e.id === q.id); if (q.ring.isEnabled() !== on) { q.ring.setEnabled(on); q.sign.setEnabled(on); } if (on) q.ring.rotation.y += dt * .6; }
    // feste Feuerwerke
    const sat = (s.day - 1) % 7 === 5;
    if (sat && h >= 22 && h < 23 && s.flags.fwSat !== s.day) { s.flags.fwSat = s.day; this.fw.show(-112, 4, 40, false, 24); if (!busy) toast('🎆 Feuerwerk über dem Hafen: Die CSD-Parade ist zu Ende, die Nacht beginnt!'); }
    if (isSilvester() && (h >= 23.6 || h < .4) && s.flags.fwNy !== s.day) {
      s.flags.fwNy = s.day; this.fw.show(150, 0, 60, true, 55); this.fw.show(-110, 0, 60, true, 30);
    }
    if (isSilvester() && h < .4 && s.flags.nyHello !== s.day && !busy) {
      s.flags.nyHello = s.day; change(s, { fun: 15, social: 10 }); sfx('cheer');
      this.g.hud.banner('🎆 Frohes neues Jahr, Rainbow City!', 'Feuerwerk über Skyline und Hafen · Spaß +15', 'good', 6000);
    }
    this.ask = Math.max(0, this.ask - dt);
    if (!busy) this.boatCheck();
  }

  markers(): Marker[] {
    if (this.city.gig) return [];
    return this.open().map((e) => { const [x, z] = e.at(); return { id: 'live' + e.id, icon: e.icon, label: `LIVE: ${e.name}`, pos: new Vector3(x, 3, z) }; });
  }

  /** Beschriftung für den Aktionsknopf, wenn du zu Fuß an Party oder Konzert stehst (das Rennen startet im Boot am Steg) */
  near(p: Vector3): string | null {
    if (this.city.gig) return null;
    for (const e of this.open()) { if (e.kind === 'boot') continue; const [x, z] = e.at(); if (Math.hypot(p.x - x, p.z - z) < 3.2) return `${e.icon} LIVE: ${e.name}`; }
    return null;
  }

  interact(p: Vector3) {
    const s = this.g.save.data, e = this.open().find((q) => { if (q.kind === 'boot') return false; const [x, z] = q.at(); return Math.hypot(p.x - x, p.z - z) < 3.2; });
    if (!e) return;
    this.g.dialog.say([{ who: e.host, color: e.color, text: e.text, choices: [
      { label: `${e.icon} Mitmachen (${e.pay} € Gage)`, fn: () => this.play(e) }, { label: 'Nur zuschauen', fn: () => { change(s, { fun: 8, social: 6 }); toast(`${e.icon} Du feierst eine Weile mit. Spaß +8`); this.city.refreshHud(); } }] }]);
  }

  /** Im Glitzer-Boot am Steg anhalten: die Rennleitung fragt (wie bei den Straßenrennen) */
  private boatCheck() {
    const c = this.city.car, s = this.g.save.data;
    if (!c || c.def.ride !== 'boat' || this.ask > 0 || Math.abs(c.v) > 2.5 || this.city.gig) return;
    const e = this.open().find((q) => q.kind === 'boot'); if (!e) return;
    if (Math.hypot(c.o.position.x - DOCK[0], c.o.position.z - DOCK[1]) > 7) return;
    this.ask = 12; c.v = 0;
    const [g, sl, br] = e.medal!, best = Number(s.flags['liveBest_' + e.id]) || 0;
    this.g.dialog.say([{ who: `${e.icon} ${e.host}`, color: e.color, text: `${e.name}: ${e.text} Gold bis ${g} s, Silber bis ${sl} s, Bronze bis ${br} s.${best ? ` Deine Bestzeit: ${best.toFixed(1)} s.` : ''}`, choices: [
      { label: `Start! (bis ${e.prize![0]} €)`, fn: () => this.race(e) }, { label: 'Gleich', fn: () => {} }] }]);
  }

  private play(e: LiveEvent) {
    const s = this.g.save.data, [x, z] = e.at();
    this.g.playMini(e.mini || 'dj', { onDone: (r) => {
      if (r.quit) return;
      const pay = r.won ? e.pay : Math.round(e.pay / 2);
      s.money += pay; s.rep += r.won ? e.rep : 1; change(s, { fun: 12, social: 12 });
      const full = claim(s, e); this.g.save.write(); this.city.refreshHud();
      sfx(r.won ? 'cheer' : 'applause');
      this.g.hud.banner(`${e.icon} ${e.name}`, `${r.won ? 'Die Menge tobt!' : 'Applaus!'} +${pay} €${full ? ' · 👑 Wochenpass voll: +300 € und eine Event-Krone' : ''}`, 'good', 5200);
      if (e.kind === 'party') setTimeout(() => this.fw.show(x, z, 14, false, 10), 800);
    } });
  }

  private race(e: LiveEvent) {
    const s = this.g.save.data, cps = e.cps!(), [g, sl, br] = e.medal!;
    const gig: Gig = { id: 'live_' + e.id, who: e.host, color: e.color, title: `${e.icon} ${e.name}`, call: '', quiet: true, pay: 0, rep: 0, done: '', time: br,
      steps: cps.map(([x, z], i) => ({ x, z, r: 7, label: i === cps.length - 1 ? 'Ziel' : `Boje ${i + 1}/${cps.length}`, icon: i === cps.length - 1 ? '🏁' : '🟠' })),
      after: (left) => {
        const sec = br - (left || 0), m = sec <= g ? 0 : sec <= sl ? 1 : 2, pay = e.prize![m];
        s.money += pay; s.rep += 3 - m; const full = claim(s, e);
        const best = Number(s.flags['liveBest_' + e.id]) || 0; if (!best || sec < best) s.flags['liveBest_' + e.id] = Math.round(sec * 10) / 10;
        sfx('win'); this.fw.show(DOCK[0] - 8, DOCK[1], 10, false, 8);
        this.g.hud.banner(['🥇 Gold', '🥈 Silber', '🥉 Bronze'][m], `${e.name} in ${sec.toFixed(1)} s · +${pay} €${full ? ' · 👑 Wochenpass voll: +300 € und eine Event-Krone' : ''}`, 'good', 5200);
        this.g.save.write(); this.city.refreshHud();
      },
      failed: () => { sfx('miss'); this.g.hud.banner('Zeit abgelaufen', `${e.name}: Bronze gibt es bis ${br} s. Gleich noch mal?`, 'bad', 3600); },
    };
    sfx('horn'); this.city.startGig(gig);
  }
}
