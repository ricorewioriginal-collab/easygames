/* Innenräume mit Charakter: Boden, Wände, Decke und Fenster mit gemalten Oberflächen (Dielen, Fliesen, Tapete, Klinker),
   Deckenlampen und LED-Leisten, dazu Möbel aus den einfachen Maßen der Einrichtungsliste: Theke mit Sockel, Platte,
   Flaschenregal und Lichtleiste, Schränke und Automaten mit Fronten, Hocker mit Polster. Ein Raum = wenige Materialien. */
import { Matrix, Quaternion, Vector3, Texture, col, type Scene, type Mesh, type PBRMaterial, type FreeCamera } from '../engine/bjs';
import { planeZ, ground, box, cyl, pbr, glow, canvasTex } from '../engine/geo';
import type { Theme, Item } from './interiors';

export type RoomStyle = 'wood' | 'tile' | 'dark' | 'carpet';
type BoxItem = Extract<Item, { box: [number, number, number] }>;

const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');
const lum = (c: number) => (((c >> 16) & 255) * .3 + ((c >> 8) & 255) * .59 + (c & 255) * .11) / 255;
const shade = (c: number, k: number) => { const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))); return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255); };
const mix = (a: number, b: number, t: number) => { const f = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t); return (f(16) << 16) | (f(8) << 8) | f(0); };

/** Stil aus den Farben des Ortes: dunkel = Club/Bar, braun = Dielen, grau/hell = Fliesen, sonst Teppich */
export function styleOf(t: Theme): RoomStyle {
  const f = t.floor, r = (f >> 16) & 255, g = (f >> 8) & 255, b = f & 255;
  if (lum(f) < .2) return 'dark';
  if (r > g * 1.15 && g > b * 1.1) return 'wood';
  if (Math.max(r, g, b) - Math.min(r, g, b) < 40) return 'tile';
  return 'carpet';
}

function wrap(t: Texture, u: number, v: number) { t.wrapU = 1; t.wrapV = 1; t.uScale = u; t.vScale = v; return t; }
function rng(seed: number) { let r = seed || 7; return () => (r = (r * 16807) % 2147483647) / 2147483647; }

function floorTex(sc: Scene, style: RoomStyle, c: number) {
  return canvasTex(sc, 512, 512, (g) => {
    const rnd = rng(c & 0xffff);
    g.fillStyle = hex(c); g.fillRect(0, 0, 512, 512);
    if (style === 'wood') {
      for (let y = 0; y < 8; y++) {
        const off = (y % 2) * 128 + rnd() * 60;
        for (let x = -1; x < 3; x++) {
          g.fillStyle = hex(shade(c, .82 + rnd() * .34)); g.fillRect(x * 256 + off, y * 64, 254, 62);
          g.strokeStyle = 'rgba(0,0,0,.10)'; g.lineWidth = 1;
          for (let k = 0; k < 4; k++) { const yy = y * 64 + 8 + rnd() * 48; g.beginPath(); g.moveTo(x * 256 + off, yy); g.bezierCurveTo(x * 256 + off + 80, yy + rnd() * 8 - 4, x * 256 + off + 170, yy + rnd() * 8 - 4, x * 256 + off + 254, yy); g.stroke(); }
        }
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y * 64 + 62, 512, 2);
      }
    } else if (style === 'tile' || style === 'dark') {
      const n = style === 'dark' ? 4 : 8, s = 512 / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const alt = (x + y) % 2;
        g.fillStyle = hex(shade(c, style === 'dark' ? (alt ? 1.5 : .8) + rnd() * .15 : (alt ? 1.06 : .86) + rnd() * .05)); g.fillRect(x * s, y * s, s, s);
        const gr = g.createLinearGradient(x * s, y * s, x * s + s, y * s + s); gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(0,0,0,.10)'); g.fillStyle = gr; g.fillRect(x * s, y * s, s, s);
      }
      g.strokeStyle = style === 'dark' ? 'rgba(0,0,0,.6)' : 'rgba(60,60,70,.45)'; g.lineWidth = 3;
      for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
    } else {
      for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,255,255' : '0,0,0'},${.04 + rnd() * .07})`; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
      g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 6;
      for (let i = 0; i < 4; i++) { g.strokeRect(i * 128 + 20, 20, 88, 472); }
    }
  });
}

/** Wand: unten Sockelleiste und Paneel, oben Tapete oder Putz; im dunklen Stil Klinker */
function wallTex(sc: Scene, style: RoomStyle, c: number, accent: number) {
  return canvasTex(sc, 512, 512, (g) => {
    const rnd = rng((c >> 4) & 0xffff);
    g.fillStyle = hex(c); g.fillRect(0, 0, 512, 512);
    if (style === 'dark') {
      for (let y = 0; y < 16; y++) for (let x = -1; x < 5; x++) {
        g.fillStyle = hex(shade(c, .75 + rnd() * .7)); g.fillRect(x * 128 + (y % 2) * 64 + 2, y * 32 + 2, 124, 28);
      }
    } else {
      // Tapete: feine Streifen im Ton der Wand
      for (let x = 0; x < 512; x += 32) { g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x, 0, 14, 512); g.fillStyle = 'rgba(0,0,0,.035)'; g.fillRect(x + 22, 0, 3, 512); }
      for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * .035})`; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
      // Paneel unten (ein Viertel der Höhe) mit Kassetten
      const p = shade(mix(c, accent, .22), .78);
      g.fillStyle = hex(p); g.fillRect(0, 372, 512, 140);
      for (let x = 0; x < 512; x += 128) { g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 3; g.strokeRect(x + 14, 392, 100, 92); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; g.strokeRect(x + 17, 395, 100, 92); }
      g.fillStyle = hex(shade(p, 1.25)); g.fillRect(0, 366, 512, 8);
    }
    // Sockelleiste und Schatten zum Boden und zur Decke hin
    g.fillStyle = hex(style === 'dark' ? shade(c, .45) : shade(c, .5)); g.fillRect(0, 494, 512, 18);
    const top = g.createLinearGradient(0, 0, 0, 90); top.addColorStop(0, 'rgba(0,0,0,.38)'); top.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = top; g.fillRect(0, 0, 512, 90);
    const bot = g.createLinearGradient(0, 400, 0, 512); bot.addColorStop(0, 'rgba(0,0,0,0)'); bot.addColorStop(1, 'rgba(0,0,0,.30)'); g.fillStyle = bot; g.fillRect(0, 400, 512, 112);
  });
}

/** Front eines Möbels: Kassetten mit Kanten (wird mit der Farbe des Möbels getönt) */
const fronts = new WeakMap<Scene, Record<string, Texture>>();
function frontTex(sc: Scene, kind: 'slats' | 'panel' | 'plain', u = 1, v = 1) {
  // je Wiederholung eine eigene Textur (eine Kopie einer Canvas-Textur bliebe schwarz)
  const all = fronts.get(sc) || {}, key = kind + '/' + u.toFixed(2) + '/' + v.toFixed(2); fronts.set(sc, all);
  if (all[key]) return all[key];
  return (all[key] = wrap(canvasTex(sc, 256, 256, (g) => {
    g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, 256, 256);
    if (kind === 'slats') for (let x = 0; x < 256; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.8, '#cfcfcf'); gr.addColorStop(1, '#6a6a6a'); g.fillStyle = gr; g.fillRect(x, 0, 32, 256); }
    else if (kind === 'panel') { g.fillStyle = '#f6f6f6'; g.fillRect(14, 14, 228, 228); g.strokeStyle = '#7a7a7a'; g.lineWidth = 5; g.strokeRect(14, 14, 228, 228); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.strokeRect(20, 20, 216, 216); g.fillStyle = '#9a9a9a'; g.fillRect(116, 118, 24, 6); }
    const v = g.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, 'rgba(255,255,255,.12)'); v.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = v; g.fillRect(0, 0, 256, 256);
  }), u, v));
}

export interface Shell { leds: PBRMaterial[]; panes: PBRMaterial[]; }

/** Raumhülle: Boden, vier Wände, Decke, Fenster zur Straße, Deckenlampen, Lichtleisten */
export function buildShell(sc: Scene, t: Theme, W: number, D: number, H: number, wins: number[] = [-W / 4 - .4, W / 4 - .4]): Shell {
  const style = styleOf(t), dark = style === 'dark';
  const leds: PBRMaterial[] = [], panes: PBRMaterial[] = [];
  const fm = pbr(sc, 0xffffff, dark ? .22 : style === 'tile' ? .35 : style === 'wood' ? .5 : .95, dark ? .25 : 0);
  fm.albedoTexture = wrap(floorTex(sc, style, t.floor), W / (style === 'wood' ? 3 : dark ? 4 : style === 'tile' ? 3.2 : 4), D / (style === 'wood' ? 3 : dark ? 4 : style === 'tile' ? 3.2 : 4));
  const floor = ground(sc, W, D); floor.material = fm; floor.receiveShadows = true;
  // Schatten in den Ecken und entlang der Wände (gemalt, kostet nichts)
  const ao = ground(sc, W, D); ao.position.y = .012; ao.isPickable = false;
  const aoM = glow(sc, 0x000000, 1, { tex: canvasTex(sc, 256, 256, (g) => {
    g.clearRect(0, 0, 256, 256);
    for (const [x0, y0, x1, y1] of [[0, 0, 0, 46], [0, 256, 0, 210], [0, 0, 46, 0], [256, 0, 210, 0]]) { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  }, true) }); ao.material = aoM;
  const accent = t.light;
  const wallMat = (len: number) => { const m = pbr(sc, 0xffffff, .92); m.albedoTexture = wrap(wallTex(sc, style, t.wall, accent), len / 3.2, -1); return m; };   // v gespiegelt: Paneel unten, Schatten zur Decke oben
  const mLong = wallMat(W), mShort = wallMat(D);
  const wall = (w: number, d: number, x: number, z: number, m: PBRMaterial) => { const o = box(sc, w, H, d); o.material = m; o.position.set(x, H / 2, z); o.receiveShadows = true; o.isPickable = false; return o; };
  wall(W + .4, .2, 0, -D / 2 - .1, mLong); wall(W + .4, .2, 0, D / 2 + .1, mLong); wall(.2, D, -W / 2 - .1, 0, mShort); wall(.2, D, W / 2 + .1, 0, mShort);
  const ceil = ground(sc, W, D); ceil.rotation.x = Math.PI; ceil.position.y = H; ceil.material = pbr(sc, dark ? shade(t.wall, .55) : 0xf4f1ec, 1); ceil.isPickable = false;
  // Deckenlampen (leuchtende Scheiben) und im dunklen Stil LED-Leisten rundum
  const lampM = glow(sc, dark ? t.light : 0xfff3dd, dark ? 1.5 : 1.25);
  for (const lx of [-W / 4, W / 4]) for (const lz of [-D / 4, D / 4]) {
    const d = cyl(sc, .34, .34, .05, 20); d.material = lampM; d.position.set(lx, H - .03, lz); d.isPickable = false;
    const rim = cyl(sc, .42, .42, .04, 20); rim.material = pbr(sc, dark ? 0x101014 : 0xd8d2c8, .5, .4); rim.position.set(lx, H - .01, lz); rim.isPickable = false;
  }
  const led = glow(sc, t.light, 1.5); leds.push(led);
  const strip = (w: number, d: number, x: number, y: number, z: number) => { const o = box(sc, w, .05, d); o.material = led; o.position.set(x, y, z); o.isPickable = false; };
  strip(W - .2, .05, 0, H - .16, -D / 2 + .04); strip(.05, D - .2, -W / 2 + .04, H - .16, 0); strip(.05, D - .2, W / 2 - .04, H - .16, 0);
  if (dark) { strip(W - .2, .05, 0, .07, -D / 2 + .04); strip(.05, D - .2, -W / 2 + .04, .07, 0); }
  // Fenster zur Straße in der vorderen Wand: Himmel und Häuser gegenüber, nachts mit Lichtern (panes werden nachgeführt)
  const view = canvasTex(sc, 256, 128, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#9fd0ff'); gr.addColorStop(1, '#ffe9d0'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
    const rnd = rng(t.floor & 0xfff);
    for (let x = 0; x < 256;) { const bw = 26 + rnd() * 34, bh = 50 + rnd() * 60, cc = ['#e86a9a', '#6ac8e8', '#f0c05a', '#9a7ae8', '#6ad8a0'][Math.floor(rnd() * 5)]; g.fillStyle = cc; g.fillRect(x, 128 - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,.75)'; for (let wy = 128 - bh + 8; wy < 120; wy += 14) for (let wx = x + 5; wx < x + bw - 7; wx += 11) g.fillRect(wx, wy, 6, 8); x += bw + 2; }
  });
  const frameM = pbr(sc, dark ? 0x15101c : 0xf3efe8, .6);
  for (const wx of wins) {
    const pm = glow(sc, 0xffffff, 1, { tex: view }); panes.push(pm);
    const p = planeZ(sc, 2.6, 1.5); p.material = pm; p.rotation.y = Math.PI; p.position.set(wx, 1.95, D / 2 - .02); p.isPickable = false;
    for (const [fw, fh, fx, fy] of [[2.8, .1, 0, .8], [2.8, .1, 0, -.8], [.1, 1.7, -1.35, 0], [.1, 1.7, 1.35, 0], [.06, 1.5, 0, 0]]) { const f = box(sc, fw, fh, .08); f.material = frameM; f.position.set(wx + fx, 1.95 + fy, D / 2 - .05); f.isPickable = false; }
    const sill = box(sc, 2.9, .06, .28); sill.material = frameM; sill.position.set(wx, 1.12, D / 2 - .14); sill.isPickable = false;
  }
  return { leds, panes };
}

/** Fenster und Leisten dem Tag anpassen (night 0 … 1) */
export function shellTime(s: Shell, night: number, t: number) {
  const k = 1 - night * .82;
  for (const p of s.panes) p.albedoColor.set(k, k * (1 - night * .1), k + night * .12);
  for (const [i, m] of s.leds.entries()) { const base = (m.metadata ||= { c: m.albedoColor.clone() }).c; m.albedoColor.copyFrom(base).scaleInPlace(.85 + Math.sin(t * 1.4 + i) * .15); }
}

/** Möbel aus einem Maß-Eintrag: liefert true, wenn hier etwas Besseres als ein Klotz gebaut wurde */
export function furnish(sc: Scene, it: BoxItem, t: Theme, W: number, D: number, glowing: PBRMaterial[]): boolean {
  const [w, h, d] = it.box, y0 = it.y || 0, c = it.c;
  const cast = (m: Mesh) => { m.receiveShadows = true; (m as Mesh & { _pcCast?: boolean })._pcCast = true; m.isPickable = false; return m; };
  const part = (bw: number, bh: number, bd: number, x: number, y: number, z: number, m: PBRMaterial) => { const o = cast(box(sc, bw, bh, bd)); o.material = m; o.position.set(x, y + bh / 2, z); return o; };
  const tinted = (cc: number, kind: 'slats' | 'panel' | 'plain', u: number, v: number, r = .6) => { const m = pbr(sc, cc, r); m.albedoTexture = frontTex(sc, kind, Math.max(1, Math.round(u)), Math.max(1, Math.round(v))); return m; };
  const emis = (m: PBRMaterial) => { if (it.e) { m.emissiveColor = col(c, it.e); m.metadata = { c }; glowing.push(m); } return m; };
  const long = Math.max(w, d), short = Math.min(w, d), alongX = w >= d;
  // Tanzfläche und andere flache Leuchtflächen: glänzend lassen
  if (h < .15) return false;
  // Hocker: klein und niedrig
  if (it.col && h <= .85 && long <= .6 && !y0) {
    const leg = cast(cyl(sc, .05, .05, h - .12, 10)); leg.material = pbr(sc, 0xc8ccd4, .25, .9); leg.position.set(it.x, (h - .12) / 2, it.z);
    const foot = cast(cyl(sc, .22, .24, .04, 16)); foot.material = leg.material; foot.position.set(it.x, .02, it.z);
    const seat = cast(cyl(sc, .24, .22, .12, 18)); seat.material = pbr(sc, c, .55); seat.position.set(it.x, h - .06, it.z);
    return true;
  }
  // Muckibude: Hantelbank mit Ständer und Langhantel statt grauer Kästen, Laufband mit Pult
  if (t.id === 'gym' && it.col && !y0 && h >= 1.1) {
    const steel = pbr(sc, 0xc4cad2, .28, .9), pad = pbr(sc, 0x1c1c22, .7), plate = pbr(sc, 0x2a2a30, .5, .3);
    if (c === 0x16161c) {
      // Laufband
      part(w - .1, .18, d, it.x, 0, it.z, pad); part(w - .3, .03, d - .5, it.x, .18, it.z + .15, pbr(sc, 0x33333a, .9));
      for (const sx of [-1, 1]) { part(.06, 1.2, .06, it.x + sx * (w / 2 - .1), .18, it.z - d / 2 + .15, steel); part(.05, .05, 1, it.x + sx * (w / 2 - .1), 1.05, it.z - d / 2 + .6, steel); }
      part(w - .2, .3, .1, it.x, 1.25, it.z - d / 2 + .15, pad);
      const scr = box(sc, w - .45, .2, .02); scr.material = glow(sc, 0x5ce1ff, 1.1); scr.position.set(it.x, 1.42, it.z - d / 2 + .21); scr.isPickable = false;
      return true;
    }
    part(.42, .12, d - .5, it.x, .42, it.z + .15, pad); part(.3, .42, .1, it.x, 0, it.z + d / 2 - .25, steel); part(.3, .42, .1, it.x, 0, it.z - .3, steel);
    for (const sx of [-1, 1]) { part(.07, 1.25, .07, it.x + sx * .52, 0, it.z - d / 2 + .3, steel); part(.07, .07, .5, it.x + sx * .52, 0, it.z - d / 2 + .3, steel); }
    const bar = cast(cyl(sc, .025, .025, 1.9, 10)); bar.material = steel; bar.rotation.z = Math.PI / 2; bar.position.set(it.x, 1.2, it.z - d / 2 + .3);
    for (const sx of [-1, 1]) for (const k of [0, 1]) { const pl = cast(cyl(sc, .24 - k * .05, .24 - k * .05, .05, 18)); pl.material = k ? pbr(sc, [0xff3b6b, 0x5ce1ff, 0xffd23b][Math.abs(Math.round(it.x)) % 3], .5) : plate; pl.rotation.z = Math.PI / 2; pl.position.set(it.x + sx * (.74 + k * .07), 1.2, it.z - d / 2 + .3); }
    return true;
  }
  // Theke: hüfthoch, lang und schmal
  if (it.col && !y0 && h >= .9 && h <= 1.3 && long >= 2 && short <= 1.05) {
    const body = tinted(c, 'slats', long / .9, 1), dk = pbr(sc, shade(c, .35), .7);
    part(w - (alongX ? 0 : .08), .1, d - (alongX ? .08 : 0), it.x, 0, it.z, dk);
    emis(body); part(w, h - .16, d, it.x, .1, it.z, body);
    const topM = pbr(sc, lum(c) > .6 ? 0x3a2a22 : 0xf1ece4, .22, .05);
    part(w + .12, .06, d + .12, it.x, h - .06, it.z, topM);
    // Lichtleiste unter der Platte zum Raum hin
    const led = glow(sc, t.light, 1.5), toRoomZ = it.z < 0 ? 1 : -1, toRoomX = it.x < 0 ? 1 : -1;
    const ls = box(sc, alongX ? w - .1 : .04, .04, alongX ? .04 : d - .1); ls.material = led; ls.isPickable = false;
    ls.position.set(it.x + (alongX ? 0 : toRoomX * (w / 2 + .02)), h - .13, it.z + (alongX ? toRoomZ * (d / 2 + .02) : 0));
    // Gläser, Kasse und Flaschen auf der Platte
    const glassM = pbr(sc, 0xdff4ff, .08, 0, { alpha: .45 }), n = Math.max(2, Math.floor(long / 1.1));
    for (let i = 0; i < n; i++) {
      const u = (i + .5) / n - .5, gx = it.x + (alongX ? u * (w - .5) : 0), gz = it.z + (alongX ? 0 : u * (d - .5));
      if (i === 0) { const reg = part(.42, .3, .34, gx, h, gz, pbr(sc, 0x22222a, .5, .3)); reg.rotation.y = alongX ? 0 : Math.PI / 2; const scr = box(sc, .3, .16, .02); scr.material = glow(sc, 0x7fd4ff, 1.1); scr.position.set(gx, h + .4, gz); scr.isPickable = false; }
      else { const gl = cyl(sc, .045, .035, .14, 10); gl.material = glassM; gl.position.set(gx, h + .07, gz); gl.isPickable = false; }
    }
    // Rückwand mit Flaschenregal, wenn die Theke an einer Wand steht
    const backZ = alongX && Math.abs(it.z) > D / 2 - 1.9, backX = !alongX && Math.abs(it.x) > W / 2 - 1.9;
    if (backZ || backX) {
      const sz = Math.sign(it.z) || -1, sx = Math.sign(it.x) || 1, len = long - .3;
      const wz = sz * (D / 2 - .16), wxx = sx * (W / 2 - .16);
      const boardM = pbr(sc, shade(c, .5), .5), light = glow(sc, t.light, .9);
      const panel = box(sc, backZ ? len : .04, 1.25, backZ ? .04 : len); panel.material = light; panel.isPickable = false; panel.position.set(backZ ? it.x : wxx + sx * .1, 1.95, backZ ? wz + sz * .1 : it.z);
      const bottle = cyl(sc, .028, .06, .3, 8); bottle.isPickable = false; const bm = pbr(sc, 0xffffff, .15, 0); bottle.material = bm;
      const mats: number[] = [], cols: number[] = [], pal = [0xff5c8a, 0x5ce1ff, 0xffd23b, 0x7bffb0, 0xb56bff, 0xff8a3b, 0xf2f2f2, 0x2f8f5a];
      const rnd = rng(Math.round(Math.abs(it.x * 31 + it.z * 17)) + 5);
      for (const sy of [1.5, 1.95, 2.4]) {
        const b = part(backZ ? len : .22, .04, backZ ? .22 : len, backZ ? it.x : wxx, sy - .04, backZ ? wz : it.z, boardM); b.receiveShadows = false;
        for (let u = -len / 2 + .12; u < len / 2 - .1; u += .16 + rnd() * .06) {
          const sc2 = .8 + rnd() * .5; Matrix.Compose(new Vector3(1, sc2, 1), Quaternion.Identity(), new Vector3(backZ ? it.x + u : wxx, sy + .15 * sc2, backZ ? wz : it.z + u)).toArray(mats, mats.length);
          const k = col(pal[Math.floor(rnd() * pal.length)]); cols.push(k.r, k.g, k.b, 1);
        }
      }
      bottle.thinInstanceSetBuffer('matrix', new Float32Array(mats), 16, true); bottle.thinInstanceSetBuffer('color', new Float32Array(cols), 4, true); bottle.alwaysSelectAsActiveMesh = true;
    }
    return true;
  }
  // Boutique: Kleiderstange mit bunten Teilen auf Bügeln statt Schrank, darunter Schuhe
  if (t.id === 'boutique' && it.col && !y0 && h >= 1.3 && w >= 1.2 && d <= .8) {
    const steel = pbr(sc, 0xd8c690, .25, .9);
    part(w, .06, d + .2, it.x, 0, it.z, pbr(sc, shade(c, .8), .5));
    for (const sx of [-1, 1]) part(.05, h, .05, it.x + sx * (w / 2 - .05), .06, it.z, steel);
    part(w - .06, .04, .04, it.x, h, it.z, steel);
    const sign = part(w * .5, .22, .04, it.x, h + .12, it.z, emis(pbr(sc, c, .5))); sign.receiveShadows = false;
    const cloth = box(sc, .05, 1, .46); cloth.isPickable = false; cloth.material = pbr(sc, 0xffffff, .85); cast(cloth);
    const shoe = box(sc, .12, .1, .28); shoe.isPickable = false; shoe.material = pbr(sc, 0xffffff, .4);
    const pal = [0xff4fa3, 0x9b5cff, 0x5ce1ff, 0xffc83d, 0xff3b3b, 0x3ee69a, 0x16161c, 0xf2f2f2, 0xff8a3b, c];
    const rnd = rng(Math.round(Math.abs(it.x * 37)) + 3), cm: number[] = [], cc: number[] = [], sm: number[] = [], sc3: number[] = [];
    for (let u = -w / 2 + .18; u < w / 2 - .12; u += .1 + rnd() * .05) {
      const len = .55 + rnd() * .55, k = col(pal[Math.floor(rnd() * pal.length)]);
      Matrix.Compose(new Vector3(1, len, .8 + rnd() * .25), Quaternion.FromEulerAngles(0, (rnd() - .5) * .25, 0), new Vector3(it.x + u, h - .06 - len / 2, it.z)).toArray(cm, cm.length); cc.push(k.r, k.g, k.b, 1);
    }
    for (let u = -w / 2 + .25; u < w / 2 - .2; u += .34) { const k = col(pal[Math.floor(rnd() * pal.length)]); Matrix.Translation(it.x + u, .11, it.z + .05).toArray(sm, sm.length); sc3.push(k.r, k.g, k.b, 1); }
    cloth.thinInstanceSetBuffer('matrix', new Float32Array(cm), 16, true); cloth.thinInstanceSetBuffer('color', new Float32Array(cc), 4, true); cloth.alwaysSelectAsActiveMesh = true;
    shoe.thinInstanceSetBuffer('matrix', new Float32Array(sm), 16, true); shoe.thinInstanceSetBuffer('color', new Float32Array(sc3), 4, true); shoe.alwaysSelectAsActiveMesh = true;
    return true;
  }
  // Schrank, Automat, Kabine: hoch und fest
  if (it.col && !y0 && h >= 1.3) {
    const cols2 = Math.max(1, Math.round(w / .8)), rows = Math.max(1, Math.round(h / 1.1));
    const m = emis(tinted(c, 'panel', alongX ? cols2 : Math.max(1, Math.round(d / .8)), rows));
    part(w - .06, .08, d - .06, it.x, 0, it.z, pbr(sc, shade(c, .3), .7));
    part(w, h - .14, d, it.x, .08, it.z, m);
    part(w + .06, .06, d + .06, it.x, h - .06, it.z, pbr(sc, shade(c, .6), .5));
    return true;
  }
  // Podest, Bühne, Bank: flach und breit, mit Kante
  if (it.col && h < .9 && long >= 2) {
    const m = emis(tinted(c, 'slats', long / .6, 1, .55));
    part(w, h - .05, d, it.x, y0, it.z, m);
    part(w + .08, .05, d + .08, it.x, y0 + h - .05, it.z, pbr(sc, shade(c, 1.35), .35));
    return true;
  }
  return false;
}

/** Kamera hinter der Figur wie draußen: wischen dreht, beim Laufen folgt sie; an Wänden und Decke rückt sie heran */
export class RoomCam {
  yaw = .95; tYaw = .95; pitch = .36;
  private pos = new Vector3();
  private idle = 9;
  private snap = true;
  constructor(private W: number, private D: number, private H: number, public dist = 4.2) {}
  reset(yaw = .95, pitch = .36) { this.yaw = this.tYaw = yaw; this.pitch = pitch; this.idle = 0; this.snap = true; }
  /** Laufrichtung in der Welt aus dem Stick, relativ zur Kamera */
  dir(mx: number, my: number): [number, number] { const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw); return [fx * my - fz * mx, fz * my + fx * mx]; }
  update(dt: number, camera: FreeCamera, p: Vector3, facing: number, o: { look: { x: number; y: number }; move: { x: number; y: number }; speed: number; invertY: boolean; busy: boolean; portrait: boolean; /** Figur schwebt (Flug) */ lift?: number }) {
    const { W, D, H } = this, lk = .005 * o.speed;
    if (!o.busy) {
      this.tYaw -= o.look.x * lk; this.pitch = Math.max(.08, Math.min(.9, this.pitch + o.look.y * lk * (o.invertY ? -1 : 1)));
      this.idle = o.look.x || o.look.y ? 0 : this.idle + dt;
      if (this.idle > 1.2 && Math.hypot(o.move.x, o.move.y) > .3) { let d = facing + Math.PI - this.tYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) < 2.3) this.tYaw += d * Math.min(1, dt * 1.5); }
    }
    this.yaw += (this.tYaw - this.yaw) * Math.min(1, dt * 12);
    const ty = 1.45 + (o.lift || 0), vx = Math.sin(this.yaw) * Math.cos(this.pitch) * this.dist, vy = Math.sin(this.pitch) * this.dist, vz = Math.cos(this.yaw) * Math.cos(this.pitch) * this.dist;
    let f = 1;
    const lim = (v: number, room: number) => { if (v > 1e-4 && room / v < f) f = Math.max(.2, room / v); };
    lim(vx, W / 2 - .3 - p.x); lim(-vx, p.x + W / 2 - .3); lim(vz, D / 2 - .3 - p.z); lim(-vz, p.z + D / 2 - .3); lim(vy, H - .3 - ty);
    // wird es eng, schaut die Kamera steiler von oben, statt der Figur im Nacken zu sitzen
    const wx = p.x + vx * f, wy = Math.min(H - .3, ty + vy * f + (1 - f) * 1.5), wz = p.z + vz * f, e = this.snap ? 1 : Math.min(1, dt * 9);
    this.pos.set(this.pos.x + (wx - this.pos.x) * e, this.pos.y + (wy - this.pos.y) * e, this.pos.z + (wz - this.pos.z) * e); this.snap = false;
    camera.position.copyFrom(this.pos);
    camera.setTarget(new Vector3(p.x, ty + (o.portrait ? .25 : 0), p.z));
  }
}
