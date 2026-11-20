/* Wetter über Rainbow City: klar, wolkig, Regen, Gewitter, Nebel. Es wechselt alle sechs Spielstunden und steht fest
   je Tag (gleicher Tag = gleiches Wetter, auch nach dem Laden). Nach Regen am Tag zeigt sich ein Regenbogen.
   Sparsam gebaut: Regen sind zwei Kopien eines einzigen Gitters, die der Kamera folgen. */
import { Mesh, VertexData, type Scene, type Vector3 } from '../engine/bjs';
import { glow, torus } from '../engine/geo';
import { sfx } from '../engine/Audio';
import type { World } from './World';

export type Sky = 'klar' | 'wolkig' | 'regen' | 'gewitter' | 'nebel';
export const SKY: Record<Sky, { icon: string; name: string; rain: number; gloom: number; fog: number }> = {
  klar: { icon: '☀️', name: 'Klar', rain: 0, gloom: 0, fog: 0 },
  wolkig: { icon: '⛅', name: 'Wolkig', rain: 0, gloom: .4, fog: .0006 },
  regen: { icon: '🌧️', name: 'Regen', rain: .75, gloom: .75, fog: .0022 },
  gewitter: { icon: '⛈️', name: 'Gewitter', rain: 1, gloom: 1, fog: .003 },
  nebel: { icon: '🌫️', name: 'Nebel', rain: 0, gloom: .55, fog: .011 },
};
const ORDER: Array<[Sky, number]> = [['klar', .46], ['wolkig', .22], ['regen', .17], ['nebel', .08], ['gewitter', .07]];
export const SLOTS = ['Vormittag', 'Nachmittag', 'Abend', 'Nacht'];
const hash = (n: number) => { let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
/** Abschnitt des Tages: 0 = 6–12 Uhr, 1 = 12–18, 2 = 18–24, 3 = 0–6 (time: 0 = 6 Uhr) */
export const slotOf = (time: number) => Math.min(3, Math.floor(((time % 1) + 1) % 1 * 4));
/** Samstagnachmittag ist CSD-Parade: da scheint immer die Sonne */
export const paradeSlot = (day: number, slot: number) => (day - 1) % 7 === 5 && slot === 1;
export function skyAt(day: number, time: number): Sky {
  const slot = slotOf(time);
  if (paradeSlot(day, slot) || day <= 1) return 'klar';
  let r = hash(day * 4 + slot);
  for (const [k, w] of ORDER) { if (r < w) return k; r -= w; }
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

  /** day/time aus dem Spielstand, ref = Spieler oder Auto */
  update(dt: number, day: number, time: number, ref: Vector3, quiet = false) {
    const sky = skyAt(day, time), k = SKY[sky], w = this.world.wx, f = Math.min(1, dt * .35);
    this.sky = sky;
    this.rain += (k.rain - this.rain) * f; w.gloom += (k.gloom - w.gloom) * f; w.fog += (k.fog - w.fog) * f;
    w.wet += ((k.rain > 0 ? 1 : 0) - w.wet) * Math.min(1, dt * (k.rain > 0 ? .25 : .03));   // Straßen trocknen langsam
    this.flash = Math.max(0, this.flash - dt * 5); w.flash = this.flash;
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
