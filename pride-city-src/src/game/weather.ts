/* Wetter über Rainbow City: klar, wolkig, Regen, Gewitter, Nebel und im Winter Schnee. Es wechselt alle sechs Spielstunden
   und steht fest je Tag (gleicher Tag = gleiches Wetter, auch nach dem Laden). Nach Regen am Tag zeigt sich ein Regenbogen.
   Jahreszeiten folgen dem echten Kalender (wie bei Live-Events): Frühling, Sommer, Herbst, Winter. In der Weihnachtswoche
   schneit es abends und nachts, an Silvester gibt es Feuerwerk (feuerwerk.ts). In den Optionen lässt sich die Jahreszeit festlegen.
   Sparsam gebaut: Regen und Schnee sind je zwei Kopien eines einzigen Gitters, die der Kamera folgen. */
import { Mesh, VertexData, type Scene, type Vector3 } from '../engine/bjs';
import { glow, torus, canvasTex } from '../engine/geo';
import { sfx } from '../engine/Audio';
import type { World } from './World';

export type Sky = 'klar' | 'wolkig' | 'regen' | 'gewitter' | 'nebel' | 'schnee';
export const SKY: Record<Sky, { icon: string; name: string; rain: number; gloom: number; fog: number; snow?: number }> = {
  klar: { icon: '☀️', name: 'Klar', rain: 0, gloom: 0, fog: 0 },
  wolkig: { icon: '⛅', name: 'Wolkig', rain: 0, gloom: .4, fog: .0006 },
  regen: { icon: '🌧️', name: 'Regen', rain: .75, gloom: .75, fog: .0022 },
  gewitter: { icon: '⛈️', name: 'Gewitter', rain: 1, gloom: 1, fog: .003 },
  nebel: { icon: '🌫️', name: 'Nebel', rain: 0, gloom: .55, fog: .011 },
  schnee: { icon: '❄️', name: 'Schnee', rain: 0, gloom: .5, fog: .005, snow: 1 },
};
/* ---------- Jahreszeiten ---------- */
export type Season = 'fruehling' | 'sommer' | 'herbst' | 'winter';
export const SEASONS: Record<Season, { icon: string; name: string; text: string }> = {
  fruehling: { icon: '🌷', name: 'Frühling', text: 'Mild, mal Sonne, mal Schauer. Die Stadt blüht auf.' },
  sommer: { icon: '☀️', name: 'Sommer', text: 'Viel Sonne, warme Nächte, ab und zu ein kräftiges Gewitter.' },
  herbst: { icon: '🍂', name: 'Herbst', text: 'Mehr Regen und Nebel über dem Hafen, dafür goldene Abende.' },
  winter: { icon: '❄️', name: 'Winter', text: 'Kalt und klar oder Schnee. In der Weihnachtswoche schneit es abends, an Silvester gibt es Feuerwerk über der Skyline.' },
};
const WEIGHTS: Record<Season, Array<[Sky, number]>> = {
  fruehling: [['klar', .46], ['wolkig', .22], ['regen', .17], ['nebel', .08], ['gewitter', .07]],
  sommer: [['klar', .6], ['wolkig', .16], ['regen', .1], ['nebel', .03], ['gewitter', .11]],
  herbst: [['klar', .3], ['wolkig', .27], ['regen', .24], ['nebel', .15], ['gewitter', .04]],
  winter: [['klar', .32], ['wolkig', .24], ['schnee', .3], ['nebel', .12], ['regen', .02]],
};
/** Jahreszeit aus dem echten Datum (Nordhalbkugel) */
export const seasonOf = (d: Date): Season => (['winter', 'winter', 'fruehling', 'fruehling', 'fruehling', 'sommer', 'sommer', 'sommer', 'herbst', 'herbst', 'herbst', 'winter'] as Season[])[d.getMonth()];
/** Weihnachtswoche (20. bis 26. Dezember) und Silvester (31. Dezember und Neujahr) nach echtem Datum */
export const xmasOf = (d: Date) => d.getMonth() === 11 && d.getDate() >= 20 && d.getDate() <= 26;
export const silvesterOf = (d: Date) => (d.getMonth() === 11 && d.getDate() === 31) || (d.getMonth() === 0 && d.getDate() === 1);
/** Festgelegte Jahreszeit aus den Optionen („auto“ = echter Kalender); 'xmas' und 'silvester' spielen die Festtage nach */
let pick = 'auto';
export function useSeason(p: unknown) { pick = typeof p === 'string' ? p : 'auto'; }
export const seasonPick = () => pick;
export const season = (): Season => (pick === 'xmas' || pick === 'silvester' ? 'winter' : pick in SEASONS ? pick as Season : seasonOf(new Date()));
export const isXmas = () => pick === 'xmas' || (pick === 'auto' && xmasOf(new Date()));
export const isSilvester = () => pick === 'silvester' || (pick === 'auto' && silvesterOf(new Date()));
export const SLOTS = ['Vormittag', 'Nachmittag', 'Abend', 'Nacht'];
const hash = (n: number) => { let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
/** Abschnitt des Tages: 0 = 6–12 Uhr, 1 = 12–18, 2 = 18–24, 3 = 0–6 (time: 0 = 6 Uhr) */
export const slotOf = (time: number) => Math.min(3, Math.floor(((time % 1) + 1) % 1 * 4));
/** Samstagnachmittag ist CSD-Parade: da scheint immer die Sonne */
export const paradeSlot = (day: number, slot: number) => (day - 1) % 7 === 5 && slot === 1;
export function skyAt(day: number, time: number): Sky {
  const slot = slotOf(time);
  if (paradeSlot(day, slot) || day <= 1) return 'klar';
  if (isXmas() && slot >= 2) return 'schnee';     // weiße Weihnacht: abends und nachts Schnee
  if (isSilvester() && slot >= 2) return 'klar';  // klare Silvesternacht fürs Feuerwerk
  let r = hash(day * 4 + slot);
  for (const [k, w] of WEIGHTS[season()]) { if (r < w) return k; r -= w; }
  return 'klar';
}
const wet = (k: Sky) => k === 'regen' || k === 'gewitter';
/** Regenbogen: tagsüber im ersten Drittel eines trockenen Abschnitts direkt nach Regen */
export function rainbowAt(day: number, time: number) {
  const slot = slotOf(time), f = ((time % 1) * 4) % 1;
  if (slot > 1 || f > .34 || wet(skyAt(day, time))) return false;
  const prev = slot === 0 ? skyAt(day - 1, .8) : skyAt(day, (slot - 1) / 4 + .01);
  return wet(prev);
}
/** Vorhersage: dieser und die drei nächsten Abschnitte */
export function forecast(day: number, time: number) {
  const out: Array<{ label: string; sky: Sky; parade: boolean }> = [];
  let d = day, s = slotOf(time);
  for (let i = 0; i < 4; i++) { out.push({ label: i ? SLOTS[s] : 'Jetzt', sky: skyAt(d, s / 4 + .01), parade: paradeSlot(d, s) }); s++; if (s > 3) { s = 0; } if (s === 0) d++; }
  return out;
}

export class Weather {
  /** aktuelle Stärke 0 … 1 (weich überblendet) */
  rain = 0;
  sky: Sky = 'klar';
  rainbow = false;
  private drops: Mesh[] = [];
  private flakes: Mesh[] = [];
  /** aktuelle Schneestärke 0 … 1 */
  snow = 0;
  private flakeY = 0;
  private bow: Mesh[] = [];
  private bowA = 0;
  private fall = 0;
  private thunder = 6;
  private flash = 0;
  private hiss = 0;
  constructor(private scene: Scene, private world: World) {}

  private build() {
    const sc = this.scene, n = this.world.low ? 380 : 900, R = 15, H = 14;
    const pos: number[] = [], idx: number[] = [];
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const x = (rnd() * 2 - 1) * R, z = (rnd() * 2 - 1) * R, y = rnd() * H, len = .5 + rnd() * .45, a = rnd() * Math.PI, w = .017, dx = Math.cos(a) * w, dz = Math.sin(a) * w, b = pos.length / 3;
      pos.push(x - dx, y, z - dz, x + dx, y, z + dz, x + dx + .05, y + len, z + dz, x - dx + .05, y + len, z - dz);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    const vd = new VertexData(); vd.positions = pos; vd.indices = idx;
    const m = new Mesh('regen', sc); vd.applyToMesh(m);
    const mat = glow(sc, 0xcfe2ff, 1, { alpha: .42, double: true }); mat.disableDepthWrite = true;
    m.material = mat; m.isPickable = false; m.applyFog = false; m.alwaysSelectAsActiveMesh = true; m.setEnabled(false);
    const m2 = m.clone('regen2'); m2.setEnabled(false);
    this.drops = [m, m2];
    // Regenbogen: sechs Bögen weit hinter der Stadt, die untere Hälfte liegt unter dem Horizont
    [0xe40303, 0xff8c00, 0xffed00, 0x008026, 0x24408e, 0x732982].forEach((c, i) => {
      const t = torus(sc, 120 - i * 2.2, 1.1, 64); t.material = glow(sc, c, 1.1, { alpha: .001 });
      t.rotation.x = Math.PI / 2; t.isPickable = false; t.applyFog = false; t.setEnabled(false); this.bow.push(t);
    });
  }

  /** Schneeflocken: kleine gekreuzte Plättchen, zwei Kopien fallen langsam und treiben seitlich */
  private buildSnow() {
    const sc = this.scene, n = this.world.low ? 300 : 700, R = 16, H = 14;
    const pos: number[] = [], idx: number[] = [];
    let seed = 23; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const x = (rnd() * 2 - 1) * R, z = (rnd() * 2 - 1) * R, y = rnd() * H, w = .045 + rnd() * .04, b = pos.length / 3;
      pos.push(x - w, y, z, x + w, y, z, x + w, y + w * 2, z, x - w, y + w * 2, z, x, y, z - w, x, y, z + w, x, y + w * 2, z + w, x, y + w * 2, z - w);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3, b + 4, b + 5, b + 6, b + 4, b + 6, b + 7);
    }
    const vd = new VertexData(); vd.positions = pos; vd.indices = idx;
    const m = new Mesh('schnee', sc); vd.applyToMesh(m);
    // runde, weiche Flocken: kleine Textur mit Verlauf statt eckiger Plättchen
    vd.uvs = Array.from({ length: n * 2 }, () => [0, 0, 1, 0, 1, 1, 0, 1]).flat(); vd.applyToMesh(m);
    const tex = canvasTex(sc, 32, 32, (g) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.45, 'rgba(255,255,255,.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); }, true);
    const mat = glow(sc, 0xffffff, 1.25, { tex, alpha: .95, double: true }); mat.disableDepthWrite = true;
    m.material = mat; m.isPickable = false; m.applyFog = false; m.alwaysSelectAsActiveMesh = true; m.setEnabled(false);
    const m2 = m.clone('schnee2'); m2.setEnabled(false);
    this.flakes = [m, m2];
  }

  /** day/time aus dem Spielstand, ref = Spieler oder Auto */
  update(dt: number, day: number, time: number, ref: Vector3, quiet = false) {
    const sky = skyAt(day, time), k = SKY[sky], w = this.world.wx, f = Math.min(1, dt * .35);
    this.sky = sky;
    this.rain += (k.rain - this.rain) * f; w.gloom += (k.gloom - w.gloom) * f; w.fog += (k.fog - w.fog) * f;
    w.wet += ((k.rain > 0 ? 1 : 0) - w.wet) * Math.min(1, dt * (k.rain > 0 ? .25 : .03));   // Straßen trocknen langsam
    this.flash = Math.max(0, this.flash - dt * 5); w.flash = Math.max(this.flash, w.boom);
    // Schnee: fällt langsam, treibt im Wind; der Dunst wird heller (weißer Himmel)
    this.snow += ((k.snow || 0) - this.snow) * f; w.snow = this.snow;
    if (this.snow > .03) {
      if (!this.flakes.length) this.buildSnow();
      this.flakeY = (this.flakeY + dt * 1.6) % 14;
      const t = performance.now() / 1000;
      this.flakes.forEach((m, i) => { m.setEnabled(true); m.visibility = Math.min(1, this.snow * 1.15); m.position.set(ref.x + Math.sin(t * .4 + i) * 1.2, (i ? 14 : 0) - this.flakeY - 1, ref.z + Math.cos(t * .33 + i) * 1.2); });
    } else if (this.flakes[0]?.isEnabled()) this.flakes.forEach((m) => m.setEnabled(false));
    const raining = this.rain > .03;
    if ((raining || this.rainbow || rainbowAt(day, time)) && !this.drops.length) this.build();
    if (raining) {
      this.fall = (this.fall + dt * 19) % 14;
      this.drops.forEach((m, i) => { m.setEnabled(true); m.visibility = Math.min(1, this.rain * 1.2); m.position.set(ref.x, (i ? 14 : 0) - this.fall - 1, ref.z); });
      if (!quiet && (this.hiss -= dt) <= 0) { this.hiss = 1.1; sfx('rain'); }
      if (sky === 'gewitter' && (this.thunder -= dt) <= 0) { this.thunder = 7 + Math.random() * 14; this.flash = 1; if (!quiet) setTimeout(() => sfx('thunder'), 500 + Math.random() * 900); }
    } else if (this.drops[0]?.isEnabled()) this.drops.forEach((m) => m.setEnabled(false));
    // Regenbogen ein- und ausblenden
    const want = rainbowAt(day, time) && this.world.night < .3;
    const was = this.rainbow; this.rainbow = want;
    this.bowA += ((want ? .42 : 0) - this.bowA) * Math.min(1, dt * .4);
    const on = this.bowA > .01;
    for (const t of this.bow) { if (t.isEnabled() !== on) t.setEnabled(on); if (on) { t.position.set(ref.x - 150, -8, ref.z - 60); t.rotation.y = .5; (t.material as { alpha: number }).alpha = this.bowA; } }
    return want && !was;   // true: gerade erschienen
  }
}
