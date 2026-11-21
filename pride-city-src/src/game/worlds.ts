/* Welten jenseits von Rainbow City: eigene Inseln im selben Stil, erreichbar durch das Weltentor am Hafen (hinlaufen)
   oder per Schnellreise im Handy. Jede Welt hat eine Gastgeberin oder einen Gastgeber, eine kleine Geschichte in drei
   Aufgaben (sammeln, Ringe fliegen, Finale) und Leute zum Reden. Alles hier ist eigene Erfindung von Pride City. */
import type { Mesh, PBRMaterial, Scene } from '../engine/bjs';
import type { Spot } from './interiors';

/** Baukasten, den WorldScene den Welten reicht */
export interface Kit {
  sc: Scene;
  /** mattes Material (je Farbe einmal) */ M(c: number, rough?: number, metal?: number): PBRMaterial;
  /** leuchtendes Material */ G(c: number, k?: number, alpha?: number): PBRMaterial;
  box(w: number, h: number, d: number, m: PBRMaterial, x: number, y: number, z: number, ry?: number): Mesh;
  cyl(rt: number, rb: number, h: number, m: PBRMaterial, x: number, y: number, z: number, seg?: number): Mesh;
  ball(r: number, m: PBRMaterial, x: number, y: number, z: number, sx?: number, sy?: number, sz?: number): Mesh;
  arc(r: number, tube: number, m: PBRMaterial, x: number, y: number, z: number, ry?: number): Mesh;
  /** Schriftzug als Neon */ sign(text: string, color: string, x: number, y: number, z: number, ry: number, w: number): void;
  /** Hindernis (Kreis) */ solid(x: number, z: number, r: number): void;
  /** Zufall 0…1, je Welt gleich */ rnd(): number;
}

export interface WorldNpc { name: string; rb: string; x: number; z: number; yaw?: number; anim?: 'idle' | 'talk' | 'dance1' | 'dance2' | 'dance3' | 'sit' | 'cheer'; color: string; lines?: string[] }
export interface WorldDef {
  id: string; name: string; icon: string; sub: string; adult?: boolean;
  /** Himmel oben/unten, Boden, Wasser */ sky: [string, string]; ground: number; water: number; light: number;
  /** Halbmesser der Insel in Metern */ r: number;
  music: 'city' | 'club' | 'show';
  host: WorldNpc & { intro: string[]; ask1: string; ask2: string; finale: string[]; after: string[] };
  /** was gesammelt wird */ item: { icon: string; name: string; color: number; n: number };
  /** Lohn für die drei Aufgaben */ pay: [number, number, number];
  folk: WorldNpc[];
  /** Nachtwelt: gedämpftes Licht (0…1) */ dim?: number;
  /** Stellen mit Wirkung auf die Bedürfnisse (wie in den Häusern) */ spots?: Spot[];
  build(k: Kit): void;
}

const RAINBOW = [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff];

/** Einhorn aus Grundformen (Tiere dürfen stilisiert sein, Menschen bleiben echte Figuren) */
function unicorn(k: Kit, x: number, z: number, ry: number, coat: number, s = 1) {
  const c = Math.cos(ry), sn = Math.sin(ry), P = (lx: number, lz: number): [number, number] => [x + (lx * c + lz * sn) * s, z + (-lx * sn + lz * c) * s];
  const m = k.M(coat, .55), hoof = k.M(0xffd23b, .3, .6);
  const [bx, bz] = P(0, 0); const body = k.ball(.55 * s, m, bx, 1.15 * s, bz, 1, .95, 1.75); body.rotation.y = ry;
  for (const [lx, lz] of [[-.28, .6], [.28, .6], [-.28, -.6], [.28, -.6]]) { const [px, pz] = P(lx, lz); k.cyl(.09 * s, .08 * s, .85 * s, m, px, .45 * s, pz, 8); k.cyl(.1 * s, .1 * s, .1 * s, hoof, px, .05 * s, pz, 8); }
  const [nx, nz] = P(0, .95); const neck = k.cyl(.2 * s, .26 * s, .8 * s, m, nx, 1.7 * s, nz, 10); neck.rotation.set(.5 * c, 0, -.5 * sn);
  const [hx, hz] = P(0, 1.25); const head = k.ball(.26 * s, m, hx, 2.1 * s, hz, 1, 1, 1.5); head.rotation.y = ry;
  const [ox, oz] = P(0, 1.35); k.cyl(0, .06 * s, .55 * s, k.G(0xffe07a, 1.3), ox, 2.55 * s, oz, 8);
  RAINBOW.forEach((col, i) => { const [mx, mz] = P(0, .95 - i * .16); k.ball(.13 * s, k.M(col, .6), mx, (2.05 - i * .13) * s, mz); });
  RAINBOW.slice(0, 4).forEach((col, i) => { const [tx, tz] = P(0, -1 - i * .12); k.ball(.11 * s, k.M(col, .6), tx, (1.2 - i * .16) * s, tz); });
  k.solid(bx, bz, .9 * s);
}
function palm(k: Kit, x: number, z: number, h = 5) {
  const trunk = k.M(0x9a6a3a, .9), leaf = k.M(0x2f9f5a, .8);
  k.cyl(.16, .24, h, trunk, x, h / 2, z, 8);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, l = k.box(.5, .06, 2.4, leaf, x + Math.sin(a) * 1.1, h - .15, z + Math.cos(a) * 1.1, a); l.rotation.x = .35; }
  k.solid(x, z, .35);
}

export const WORLDS: WorldDef[] = [
  {
    id: 'einhorn', name: 'Glitzeria', icon: '🦄', sub: 'Einhorn-Welt: Zuckerwatte, Regenbögen und eine Herde ohne Glitzer',
    sky: ['#8fd3ff', '#ffd0ef'], ground: 0xffc4e6, water: 0xa7e8ff, light: 0xfff0fa, r: 46, music: 'show',
    host: { name: 'Stella Sternenstaub', rb: 'Female_Party_01', x: 0, z: 6, yaw: Math.PI, anim: 'idle', color: '#ff7bd5',
      intro: ['Willkommen in Glitzeria, Schatz! Ich bin Stella, die Hüterin der Herde.', 'Heute Abend ist die große Glitzerparade. Aber der Sturm hat den Einhörnern den Sternenstaub aus der Mähne gepustet.', 'Ohne Glitzer keine Parade. Hilfst du mir?'],
      ask1: 'Sammle die Glitzersterne ein, die über die Insel verstreut liegen. Ein paar schweben in der Luft, dafür brauchst du den Flitzer.',
      ask2: 'Jetzt muss der Staub in den Himmel. Flieg durch alle Regenbogenringe, dann rieselt er auf die Herde herab.',
      finale: ['Schau sie dir an. Sie funkeln wieder!', 'Die Parade kann starten. Und du läufst ganz vorne mit, das hast du dir verdient.', 'Hier, dein Anteil aus der Glitzerkasse. Komm bald wieder, Glitzeria vergisst niemanden.'],
      after: ['Die Herde fragt jeden Tag nach dir.', 'Einhörner mögen dich. Das merkt man daran, dass sie dir nicht auf den Fuß treten.'] },
    item: { icon: '⭐', name: 'Glitzersterne', color: 0xffe14a, n: 8 }, pay: [120, 180, 400],
    folk: [
      { name: 'Wolke', rb: 'Female_Adult_04', x: -9, z: -6, anim: 'dance1', color: '#9fd0ff', lines: ['Ich wohne hier seit einem Urlaub, der nie aufgehört hat.', 'Zuckerwatte zum Frühstück. Mein Zahnarzt weint, ich nicht.'] },
      { name: 'Prinz Karamell', rb: 'Male_Adult_07', x: 11, z: -3, anim: 'talk', color: '#ffb347', lines: ['Jedes Einhorn hier hat einen eigenen Regenbogen. Meins teilt nicht gern.', 'Der Flitzer? Glitzert, fliegt und ist nicht zu übersehen. Passt zu dir.'] },
      { name: 'Fee Fabiola', rb: 'Female_Adult_09', x: -4, z: 14, anim: 'dance2', color: '#b56bff', lines: ['Wünsch dir was. Nein, lauter. Das Universum ist schwerhörig.', 'In Glitzeria ist jeden Tag Pride.'] },
    ],
    build(k) {
      const candy = [0xff8fd0, 0x9fe3ff, 0xfff08a, 0xc9a2ff, 0x9af0c0];
      // Zuckerwattebäume
      for (let i = 0; i < 26; i++) {
        const a = k.rnd() * Math.PI * 2, d = 12 + k.rnd() * 30, x = Math.sin(a) * d, z = Math.cos(a) * d, h = 2.2 + k.rnd() * 2.2;
        k.cyl(.14, .2, h, k.M(0xfff3e0, .8), x, h / 2, z, 8);
        const c = candy[i % 5]; k.ball(1.1 + k.rnd() * .5, k.M(c, .95), x, h + .7, z); k.ball(.7, k.M(c, .95), x + .7, h + .3, z + .2); k.ball(.6, k.M(c, .95), x - .6, h + .4, z - .3);
        k.solid(x, z, .4);
      }
      // Regenbögen als Tore
      for (const [x, z, ry, r] of [[0, -14, 0, 7], [-22, 8, 1.2, 5.5], [24, 10, -1, 5.5], [0, 30, 0, 6.5]] as const) RAINBOW.forEach((c, i) => k.arc(r - i * .32, .16, k.G(c, .85), x, 0, z, ry));
      // Wolken
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, x = Math.sin(a) * 30, z = Math.cos(a) * 30, y = 11 + (i % 3) * 3, w = k.M(0xffffff, 1); k.ball(2.4, w, x, y, z, 1.6, .7, 1); k.ball(1.7, w, x + 2.2, y - .2, z, 1.3, .7, 1); k.ball(1.5, w, x - 2.1, y - .1, z + .4, 1.3, .7, 1); }
      // Kristallschloss
      const wall = k.M(0xfdf1ff, .35, .1), roof = k.M(0xff7bd5, .4);
      k.box(9, 5, 6, wall, 0, 2.5, -30); k.solid(-3, -30, 3); k.solid(3, -30, 3); k.solid(0, -30, 3.4);
      for (const tx of [-5.2, 5.2]) { k.cyl(1.4, 1.5, 8, wall, tx, 4, -30, 14); k.cyl(0, 1.8, 3.2, roof, tx, 9.6, -30, 14); k.solid(tx, -30, 1.7); }
      k.cyl(0, 3.4, 3, roof, 0, 6.5, -30, 4); k.box(2, 3, .2, k.G(0xffd6f4, 1), 0, 1.5, -26.95);
      k.sign('GLITZERIA', '#ff7bd5', 0, 6.2, -26.9, Math.PI, 7);
      // Herde
      unicorn(k, -6, -2, .6, 0xffffff); unicorn(k, 7, 3, -1.9, 0xffe3f4); unicorn(k, -13, 9, 2.4, 0xe4f1ff, .8); unicorn(k, 15, -12, .2, 0xfff3c4, 1.1); unicorn(k, 3, 20, 3.4, 0xf1e4ff, .7);
      // Bonbonweg und Lutscher
      for (let i = 0; i < 14; i++) k.cyl(.7, .7, .06, k.M(candy[i % 5], .5), Math.sin(i * .5) * 2.5, .04, 30 - i * 3.6, 14);
      for (let i = 0; i < 10; i++) { const a = k.rnd() * 6.28, d = 8 + k.rnd() * 30, x = Math.sin(a) * d, z = Math.cos(a) * d; k.cyl(.05, .05, 1.6, k.M(0xffffff), x, .8, z, 6); const l = k.cyl(.55, .55, .12, k.M(RAINBOW[i % 6], .4), x, 1.9, z, 16); l.rotation.x = Math.PI / 2; }
    },
  },
  {
    id: 'canaria', name: 'Playa Arcoíris', icon: '🏝️', sub: 'Insel-Pride wie auf Gran Canaria: Dünen, Strandbars und die große Bühne',
    sky: ['#3aa0ff', '#ffe2b0'], ground: 0xf2d79a, water: 0x23b6d8, light: 0xfff4dc, r: 52, music: 'club',
    host: { name: 'Lola Caliente', rb: 'Female_Party_02', x: 0, z: 8, yaw: Math.PI, anim: 'idle', color: '#ff8a3b',
      intro: ['¡Hola, guapo! Ich bin Lola, ich moderiere seit zwanzig Jahren die Pride-Gala auf dieser Insel.', 'Heute Nacht steigt die große Show. Und irgendein Witzbold hat meine Fächer in den Dünen verteilt. Alle acht!', 'Eine Dragqueen ohne Fächer ist wie Sangria ohne Obst. Hilf mir, cariño.'],
      ask1: 'Such meine acht Pride-Fächer. Sie liegen in den Dünen, am Strand und, frag mich nicht wie, ein paar hängen in der Luft.',
      ask2: 'Jetzt die Werbung: Flieg mit dem Flitzer durch alle Ringe über dem Strand, damit die ganze Insel weiß, dass heute Gala ist.',
      finale: ['Die Dünen sind voll, der Platz ist voll, sogar die Liegen sind voll. Das warst du!', 'Komm mit auf die Bühne. Heute verbeugst du dich neben mir.', 'Und hier ist deine Gage. Auf der Insel sagt man: Wer einmal bei der Gala war, kommt jedes Jahr wieder.'],
      after: ['Die Gala läuft jeden Abend. Dein Platz in der ersten Reihe ist reserviert.', 'Trink Wasser, cariño. Die Sonne hier kennt keine Gnade.'] },
    item: { icon: '🪭', name: 'Pride-Fächer', color: 0xff4fa3, n: 8 }, pay: [150, 220, 500],
    folk: [
      { name: 'Javi', rb: 'Male_Adult_05', x: -12, z: 2, anim: 'talk', color: '#5ce1ff', lines: ['Ich mache die besten Mojitos im Centro. Sagt meine Mutter, und die trinkt nicht mal.', 'Mittags Düne, abends Bühne. So geht Insel.'] },
      { name: 'Bärbel und ihr Mann', rb: 'Female_Adult_06', x: 13, z: 5, anim: 'cheer', color: '#ffd23b', lines: ['Wir kommen seit 1998 jedes Jahr her. Früher wegen der Sonne, heute wegen der Show.', 'Die jungen Leute sind so nett. Einer hat mir Glitzer geschenkt.'] },
      { name: 'Milo', rb: 'Male_Adult_02', x: -5, z: -9, anim: 'dance1', color: '#b56bff', lines: ['Erste Pride meines Lebens. Ich wusste nicht, dass man so viel grinsen kann.', 'In den Dünen verläuft man sich. Manche mit Absicht.'] },
      { name: 'Rico', rb: 'Sports_Male_01', x: 6, z: -10, anim: 'dance2', color: '#ff3fb0', lines: ['Ich tanze seit gestern Mittag. Meine Füße haben gekündigt.', 'Der Flitzer ist das beste Strandfahrzeug aller Zeiten.'] },
      { name: 'Dana', rb: 'Sports_Female_01', x: 0, z: -11, anim: 'dance3', color: '#3ee69a', lines: ['Sonnencreme, Wasser, Glitzer. In der Reihenfolge.', 'Heute Abend singen alle mit, auch die, die den Text nicht können.'] },
    ],
    build(k) {
      const sand = k.M(0xf6dfa6, 1), sand2 = k.M(0xeccb86, 1);
      // Dünen im Süden
      for (let i = 0; i < 16; i++) { const x = -36 + k.rnd() * 72, z = 20 + k.rnd() * 26; if (Math.hypot(x, z) > 48) continue; const r = 4 + k.rnd() * 5; k.ball(r, i % 2 ? sand : sand2, x, -r * .55, z, 1.5, .8, 1.1); }
      // Palmen
      for (let i = 0; i < 18; i++) { const a = k.rnd() * 6.28, d = 14 + k.rnd() * 32, x = Math.sin(a) * d, z = Math.cos(a) * d; if (z < -16 && Math.abs(x) < 12) continue; palm(k, x, z, 4 + k.rnd() * 2.5); }
      // Pride-Bühne im Norden
      const black = k.M(0x16161c, .6), truss = k.M(0xb9c0c8, .3, .8);
      k.box(16, 1.2, 8, black, 0, .6, -24); for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.cyl(.18, .18, 8, truss, sx * 7.6, 5.2, -24 + sz * 3.6, 8);
      k.box(15.6, .3, 7.6, truss, 0, 9.2, -24); k.box(11, 4.6, .2, k.G(0xff4fa3, .9), 0, 4.4, -27.6);
      RAINBOW.forEach((c, i) => k.box(1.8, 4.6, .22, k.G(c, .9), -4.5 + i * 1.8, 4.4, -27.5));
      k.sign('PRIDE GALA', '#ffffff', 0, 7.6, -27.3, Math.PI, 10);
      for (const sx of [-1, 1]) { k.box(1.6, 3, 1.6, black, sx * 9.6, 1.5, -21); k.solid(sx * 9.6, -21, 1.3); for (let i = 0; i < 3; i++) k.ball(.28, k.G(RAINBOW[(i * 2 + (sx > 0 ? 1 : 0)) % 6], 1.3), sx * (6 - i * 2), 8.9, -20.4); }
      for (let x = -7; x <= 7; x += 2) k.solid(x, -24, 1.6);
      // Centro Arcoíris: Bars im Halbrund
      const bars: Array<[number, string, string]> = [[0xff3b6b, 'BAR LOLA', '#ff3b6b'], [0x3a7bff, 'MOJITO', '#5ce1ff'], [0xffd23b, 'TAPAS', '#ffd23b'], [0xb56bff, 'CABARET', '#b56bff']];
      bars.forEach(([c, t, n], i) => {
        const z = -4 + i % 2 * 9, sx = i < 2 ? -24 : 24, ry = i < 2 ? Math.PI / 2 : -Math.PI / 2;
        k.box(5, 3.2, 6, k.M(0xfffaf0, .8), sx, 1.6, z); k.box(5.6, .3, 6.6, k.M(c, .5), sx, 3.35, z); k.box(.3, 1.1, 4, k.M(c, .5), sx + (i < 2 ? 2.9 : -2.9), .55, z);
        k.sign(t, n, sx + (i < 2 ? 2.56 : -2.56), 2.6, z, ry, 4.2); k.solid(sx, z - 1.6, 2.6); k.solid(sx, z + 1.6, 2.6);
      });
      // Liegen und Sonnenschirme am Strand
      for (let i = 0; i < 10; i++) {
        const x = -27 + i * 6, z = 15 + (i % 2) * 2.5;
        k.box(.8, .25, 2, k.M(0xffffff, .7), x, .25, z); k.box(.8, .5, .2, k.M(0xffffff, .7), x, .5, z - .9);
        k.cyl(.04, .04, 2.4, truss, x + .9, 1.2, z, 6); k.cyl(.1, 1.5, .5, k.M(RAINBOW[i % 6], .7), x + .9, 2.55, z, 10); k.solid(x, z, .7);
      }
      // Wimpel-Masten
      for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const x = sx * 12, z = -16 + i * 8; k.cyl(.06, .06, 5, truss, x, 2.5, z, 6); RAINBOW.forEach((c, j) => k.box(.02, .22, .8, k.M(c, .6), x, 4.9 - j * .22, z + .45)); }
      // Leuchtturm-Imbiss und Boje als Blickfang
      k.cyl(1.2, 1.5, 6, k.M(0xffffff, .6), -34, 3, -18, 14); k.cyl(1.25, 1.25, 1, k.M(0xff3b3b, .6), -34, 4, -18, 14); k.cyl(0, 1.5, 1.6, k.M(0xff3b3b, .6), -34, 6.8, -18, 14); k.solid(-34, -18, 1.7);
    },
  },
  {
    id: 'cruising', name: 'Lustwäldchen', icon: '🌲', sub: 'Cruising-Welt bei Nacht: Wald, Dünen, Sauna und Blicke im Laternenlicht', adult: true, dim: .42,
    sky: ['#070a22', '#2a1848'], ground: 0x24402c, water: 0x0b1c33, light: 0xb8c8ff, r: 48, music: 'club',
    host: { name: 'Bruno', rb: 'Male_Adult_08', x: 0, z: 8, yaw: Math.PI, anim: 'idle', color: '#3ee69a',
      intro: ['Na, zum ersten Mal im Lustwäldchen? Ich bin Bruno vom Checkpoint, ich mache hier die Nachtschicht.', 'Hier gilt: Nur wer will, nur was beide wollen, und immer mit Gummi. Dafür sorge ich.', 'Blöd nur, dass der Wind meine Safer-Sex-Päckchen im ganzen Wald verteilt hat.'],
      ask1: 'Sammle die acht Päckchen ein, Kondome und Gleitgel für alle. Ein paar hängen oben in den Bäumen, nimm den Flitzer.',
      ask2: 'Jetzt die Runde: Flieg durch die Ringe über dem Wald, dann sehen alle das Licht und wissen, dass der Stand offen ist.',
      finale: ['So voll war mein Stand noch nie. Alle versorgt, alle entspannt.', 'Das ist Cruising, wie es sein soll: frei, freundlich, sicher.', 'Hier, Trinkgeld aus der Spendenbüchse. Und jetzt geh ruhig selber eine Runde drehen.'],
      after: ['Päckchen gibt es bei mir immer gratis. Nimm zwei.', 'Ein Nein ist hier ein ganzer Satz. Merk dir das, dann wirst du gemocht.'] },
    item: { icon: '🎁', name: 'Safer-Sex-Päckchen', color: 0x3ee69a, n: 8 }, pay: [160, 240, 520],
    spots: [
      { id: 'sauna', label: '♨️ Sauna „Dampfbad“', x: -19.5, z: -6, r: 2.4, act: { k: 'do', cost: 12, min: 90, d: { hygiene: 30, fun: 18, social: 14, energy: -8 }, msg: 'Dampf, Handtücher, lange Blicke. Der Rest bleibt in der Sauna. Spaß +18', adult: true } },
      { id: 'duene', label: '🌙 In die Dünen gehen', x: 18, z: 16, r: 2.6, act: { k: 'do', min: 60, d: { fun: 24, social: 16, energy: -12, hygiene: -14 }, msg: 'Ein Nicken, ein Lächeln, ihr verschwindet hinter der Düne. Mit Gummi, versteht sich. Spaß +24', adult: true } },
      { id: 'bank', label: '🪑 Auf der Bank flirten', x: -6, z: -14, r: 2.2, act: { k: 'do', min: 30, d: { social: 18, fun: 8 }, msg: 'Ihr redet eine halbe Stunde über alles und nichts. Nummern getauscht. Kontakte +18' } },
    ],
    folk: [
      { name: 'Der Stille', rb: 'Male_Adult_04', x: -10, z: -2, anim: 'idle', color: '#9fb6ff', lines: ['…', 'Schöne Nacht.', 'Du bist neu hier. Das sieht man. Nicht schlimm.'] },
      { name: 'Ledermann Lutz', rb: 'Security_Male_01', x: 12, z: -4, anim: 'talk', color: '#ff7a3b', lines: ['Früher gab es das nur hier draußen. Heute gibt es Apps. Ich bleibe beim Wald.', 'Regel eins: fragen. Regel zwei: Antwort akzeptieren.'] },
      { name: 'Timo und Deniz', rb: 'Male_Adult_01', x: 5, z: 20, anim: 'talk', color: '#ffd23b', lines: ['Wir haben uns genau hier kennengelernt. Jetzt kommen wir zum Jahrestag her.', 'Die Sauna hat den besten Aufguss der Stadt, ehrlich.'] },
      { name: 'Kalle', rb: 'Male_Adult_06', x: -16, z: 12, anim: 'idle', color: '#b56bff', lines: ['Ich gucke nur. Sage ich seit zehn Jahren.', 'Bruno ist ein Schatz. Ohne den wäre hier nur halb so viel los.'] },
    ],
    build(k) {
      const bark = k.M(0x3a2a20, .95), leaf = [k.M(0x1f4a2c, .95), k.M(0x275c36, .95), k.M(0x183a24, .95)];
      for (let i = 0; i < 44; i++) {
        const a = k.rnd() * 6.28, d = 10 + k.rnd() * 34, x = Math.sin(a) * d, z = Math.cos(a) * d, h = 4 + k.rnd() * 4;
        if (Math.abs(x) < 3.2 && z > -4) continue;
        k.cyl(.18, .28, h, bark, x, h / 2, z, 7); k.cyl(0, 1.9, 3.2, leaf[i % 3], x, h + .6, z, 8); k.cyl(0, 1.5, 2.6, leaf[(i + 1) % 3], x, h + 2.2, z, 8); k.solid(x, z, .45);
      }
      // Büsche und Dünen
      for (let i = 0; i < 26; i++) { const a = k.rnd() * 6.28, d = 8 + k.rnd() * 36; k.ball(.9 + k.rnd() * .8, leaf[i % 3], Math.sin(a) * d, .4, Math.cos(a) * d, 1.3, .8, 1); }
      for (let i = 0; i < 7; i++) { const x = 10 + k.rnd() * 22, z = 8 + k.rnd() * 22, r = 3 + k.rnd() * 3; k.ball(r, k.M(0x6f6650, 1), x, -r * .5, z, 1.5, .8, 1.1); }
      // Wege mit Laternen
      const path = k.M(0x5a4f44, 1), lamp = k.G(0xffd9a0, 1.5), pole = k.M(0x20202a, .5, .5);
      for (let i = 0; i < 12; i++) { k.box(2.4, .05, 3.4, path, Math.sin(i * .55) * 3, .03, 34 - i * 3.3, Math.cos(i * .55) * .5); k.box(3.4, .05, 2.4, path, -20 + i * 3.4, .03, -6 + Math.sin(i * .7) * 2); }
      for (const [x, z] of [[3.5, 30], [-3.5, 20], [3.5, 10], [-8, -8], [8, -8], [-16, -3], [16, 2], [0, -18]]) { k.cyl(.06, .08, 3.4, pole, x, 1.7, z, 6); k.ball(.24, lamp, x, 3.5, z); k.cyl(1.6, 1.6, .02, k.G(0xffd9a0, .5, .22), x, .06, z, 16); k.solid(x, z, .2); }
      // Sauna-Hütte mit rotem Licht
      const wood = k.M(0x6a4428, .8);
      k.box(7, 3.4, 6, wood, -24, 1.7, -6); k.box(7.6, .3, 6.6, k.M(0x2a1c14, .8), -24, 3.55, -6); k.box(.1, 2.3, 1.3, k.G(0xff3b3b, .9), -20.45, 1.15, -6);
      k.sign('DAMPFBAD', '#ff5a5a', -20.44, 2.9, -6, Math.PI / 2, 4); k.solid(-24, -8, 3.2); k.solid(-24, -4, 3.2);
      // Brunos Stand
      k.box(3, 1, 1.2, k.M(0x3ee69a, .5), -3.2, .5, 9.5); k.box(3.4, .12, 1.6, k.M(0xffffff, .5), -3.2, 2.5, 9.5); for (const sx of [-1, 1]) k.cyl(.05, .05, 2.5, pole, -3.2 + sx * 1.5, 1.25, 9.5, 6);
      k.sign('SAFER SEX GRATIS', '#3ee69a', -3.2, 2.05, 10.14, 0, 3); k.solid(-3.2, 9.5, 1.5);
      // Bänke
      for (const [x, z, ry] of [[-6, -15.2, 0], [9, -12, .6], [-14, 6, 1.4]]) { k.box(2, .12, .55, wood, x, .5, z, ry); k.box(2, .5, .1, wood, x, .85, z - .25, ry); k.solid(x, z, .8); }
      // Glühwürmchen
      for (let i = 0; i < 40; i++) { const a = k.rnd() * 6.28, d = 6 + k.rnd() * 38; k.ball(.05, k.G(0xe8ff9a, 1.6), Math.sin(a) * d, .6 + k.rnd() * 3, Math.cos(a) * d); }
    },
  },
  {
    id: 'lindenhof', name: 'Lindenhof', icon: '🍂', sub: 'Ehemaligentreffen an der alten Schule: erste Liebe, zweiter Versuch',
    sky: ['#6fb4ff', '#ffe9c8'], ground: 0x7fbf6a, water: 0x4aa3d8, light: 0xfff2dc, r: 50, music: 'city',
    host: { name: 'Frau Ahmadi', rb: 'Female_Adult_05', x: 0, z: 8, yaw: Math.PI, anim: 'idle', color: '#ffb347',
      intro: ['Da bist du ja! Zehn Jahre nach dem Abschluss, und du siehst aus wie am letzten Schultag. Fast.', 'Ich war eure Kunstlehrerin, falls du es verdrängt hast. Heute ist Ehemaligentreffen.', 'Damals habt ihr euch Zettel geschrieben, die nie angekommen sind. Ich habe sie aufgehoben. Der Wind leider nicht.'],
      ask1: 'Such die acht Liebesbriefe von damals. Sie liegen auf dem Hof, am Sportplatz und in den Baumkronen.',
      ask2: 'Und jetzt das, was ihr euch früher nie getraut habt: einmal über das Schuldach. Flieg durch alle Ringe.',
      finale: ['Alle Briefe sind bei den Richtigen angekommen. Zehn Jahre zu spät, aber angekommen.', 'Schau mal rüber. Jonas und Emre halten Händchen. Auf dem Schulhof! Das hätte es früher nicht gegeben.', 'Für dich gibt es den Ehrenpreis des Fördervereins. Und eine Eins in Mut.'],
      after: ['Nächstes Jahr wieder, ja? Ich backe den Kuchen.', 'Manche Dinge brauchen zehn Jahre. Das ist keine Schande.'] },
    item: { icon: '💌', name: 'Liebesbriefe', color: 0xff6a8a, n: 8 }, pay: [150, 220, 480],
    spots: [
      { id: 'kuchen', label: '🍰 Kuchenbuffet', x: 9, z: 4, r: 2.2, act: { k: 'do', cost: 3, min: 20, d: { hunger: 26, social: 8 }, msg: 'Marmorkuchen wie früher in der großen Pause. Hunger gestillt.' } },
      { id: 'platz', label: '⚽ Kicken wie früher', x: -22, z: 14, r: 3, act: { k: 'do', min: 45, d: { fun: 20, energy: -14, hygiene: -10, social: 10 }, msg: 'Diesmal wirst du nicht als Letzte*r gewählt. Spaß +20' } },
    ],
    folk: [
      { name: 'Jonas', rb: 'Male_Adult_09', x: -5, z: -3, anim: 'talk', color: '#5ce1ff', lines: ['Ich saß sechs Jahre neben Emre und habe kein Wort rausgebracht.', 'Heute frage ich ihn. Wirklich. Gleich. Nach dem Kuchen.'] },
      { name: 'Emre', rb: 'Male_Adult_03', x: -3.6, z: -3.4, yaw: -1.2, anim: 'idle', color: '#ffd23b', lines: ['Jonas hat mir in der Neunten einen Stift geliehen. Ich habe ihn noch.', 'Meinst du, er merkt, dass ich seit einer Stunde neben ihm stehe?'] },
      { name: 'Svenja', rb: 'Female_Adult_02', x: 8, z: -6, anim: 'cheer', color: '#ff6ad5', lines: ['Ich war die Erste an der Schule, die sich geoutet hat. Es war die Hölle. Heute hängt hier eine Regenbogenfahne.', 'Meine Frau findet das Schulklo immer noch gruselig.'] },
      { name: 'Hausmeister Kowalski', rb: 'Male_Adult_06', x: 14, z: 10, anim: 'idle', color: '#b9c0c8', lines: ['Ich habe alles gesehen. Ich sage nichts. So bleibt man vierzig Jahre Hausmeister.', 'Aufs Dach fliegen ist verboten. Ich schaue heute woandershin.'] },
    ],
    build(k) {
      const brick = k.M(0xa5553f, .9), stone = k.M(0xe7dcc8, .8), roof = k.M(0x4a4f5a, .8), glass = k.G(0xbfe6ff, .8);
      // Schulgebäude mit Uhrturm
      k.box(34, 8, 9, brick, 0, 4, -30); k.box(35, .6, 10, stone, 0, 8.3, -30); k.box(8, 12, 9.4, brick, 0, 6, -30); k.cyl(0, 6.2, 3.4, roof, 0, 13.7, -30, 4);
      k.cyl(1.2, 1.2, .2, stone, 0, 10, -25.2, 20).rotation.x = Math.PI / 2;
      for (let x = -15; x <= 15; x += 3) { if (Math.abs(x) < 4) continue; for (const y of [2.2, 5.8]) k.box(1.6, 2, .12, glass, x, y, -25.46); }
      k.box(2.6, 3.4, .14, k.M(0x3a5f8a, .5), 0, 1.7, -25.26); k.sign('LINDENHOF', '#ffe9a8', 0, 5.2, -25.2, Math.PI, 6);
      for (let x = -15; x <= 15; x += 5) k.solid(x, -30, 5);
      // Regenbogenfahne am Mast
      k.cyl(.07, .07, 9, k.M(0xd8d8e0, .3, .7), 8, 4.5, -22, 6); [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff].forEach((c, i) => k.box(2.4, .3, .04, k.M(c, .6), 9.25, 8.6 - i * .3, -22)); k.solid(8, -22, .3);
      // Linden im Herbst
      const herbst = [0xe8912a, 0xd9542a, 0xf0c13a, 0xb8482a];
      for (let i = 0; i < 24; i++) {
        const a = k.rnd() * 6.28, d = 14 + k.rnd() * 32, x = Math.sin(a) * d, z = Math.cos(a) * d; if (z < -18 && Math.abs(x) < 20) continue; if (x < -12 && x > -34 && z > 6 && z < 24) continue;
        const h = 3 + k.rnd() * 2; k.cyl(.2, .3, h, k.M(0x5a3d28, .9), x, h / 2, z, 7); k.ball(2 + k.rnd(), k.M(herbst[i % 4], .95), x, h + 1.4, z, 1, .85, 1); k.solid(x, z, .5);
      }
      for (let i = 0; i < 50; i++) { const a = k.rnd() * 6.28, d = k.rnd() * 44; k.box(.3, .02, .2, k.M(herbst[i % 4], .9), Math.sin(a) * d, .03, Math.cos(a) * d, k.rnd() * 3); }
      // Sportplatz mit Toren
      k.box(20, .04, 14, k.M(0x5aa64a, 1), -23, .03, 15); const line = k.M(0xffffff, .8);
      k.box(20, .05, .12, line, -23, .05, 8); k.box(20, .05, .12, line, -23, .05, 22); k.box(.12, .05, 14, line, -23, .05, 15);
      for (const gx of [-32.6, -13.4]) { for (const gz of [13, 17]) k.cyl(.07, .07, 2.2, line, gx, 1.1, gz, 6); k.box(.1, .1, 4.1, line, gx, 2.2, 15); }
      // Hof: Bänke, Fahrradständer, Tischtennisplatte, Kuchenbuffet
      const wood = k.M(0x8a5a35, .8);
      for (const [x, z] of [[-8, 2], [-8, 12], [6, 14]]) { k.box(2.2, .12, .6, wood, x, .5, z); k.box(.12, .5, .5, wood, x - .9, .25, z); k.box(.12, .5, .5, wood, x + .9, .25, z); k.solid(x, z, .9); }
      for (let i = 0; i < 6; i++) k.arc(.45, .03, k.M(0xb9c0c8, .3, .8), 18 + i * .7, 0, -14, Math.PI / 2);
      k.box(2.7, .08, 1.5, k.M(0x2a6f5a, .6), 16, .78, 0); k.box(.04, .2, 1.5, line, 16, .9, 0); for (const sx of [-1, 1]) k.box(.1, .78, 1.2, k.M(0x33333a, .6), 16 + sx, .39, 0); k.solid(16, 0, 1.2);
      k.box(3.4, .9, 1, k.M(0xffffff, .7), 9, .45, 5.6); for (let i = 0; i < 4; i++) k.cyl(.3, .3, .16, k.M([0x8a5a35, 0xffd9a0, 0xff9ad5, 0xffffff][i], .7), 7.8 + i * .8, .98, 5.6, 14); k.solid(9, 5.6, 1.5);
      k.sign('10 JAHRE ABSCHLUSS', '#ffffff', 0, 3.6, 2, 0, 7); for (const sx of [-1, 1]) { k.cyl(.06, .06, 3.2, k.M(0xd8d8e0, .3, .7), sx * 3.8, 1.6, 2, 6); k.solid(sx * 3.8, 2, .2); }
    },
  },
  {
    id: 'rummel', name: 'Sternwerder Rummel', icon: '🎡', sub: 'Sommerrummel am See: Riesenrad, Zuckerwatte und der Mut zur ersten Frage',
    sky: ['#2b2f7a', '#ff9a6b'], ground: 0x6f7a8a, water: 0x2a4f8a, light: 0xffe0c8, r: 48, music: 'show', dim: .8,
    host: { name: 'Mika', rb: 'Male_Adult_10', x: 0, z: 8, yaw: Math.PI, anim: 'idle', color: '#5ce1ff',
      intro: ['Hey. Du kommst wie gerufen. Ich arbeite am Riesenrad und habe ein Problem.', 'Seit drei Wochen kauft Ben jeden Abend eine Fahrkarte und fährt allein. Ich würde so gern mitfahren.', 'Ich habe mir geschworen: Wenn ich alle Fahrchips zusammenhabe, frage ich ihn. Dann sind sie mir aus der Tasche gefallen. Alle.'],
      ask1: 'Hilf mir, die acht Fahrchips zu finden. Sie liegen zwischen den Buden, ein paar hat der Wind aufs Karusselldach geweht.',
      ask2: 'Jetzt brauche ich noch ein Zeichen. Flieg durch die Ringe über dem Rummel, das ist mein Feuerwerk.',
      finale: ['Ich habe ihn gefragt. Er hat Ja gesagt, bevor ich fertig war.', 'Wir fahren gleich die letzte Runde. Ganz oben hält das Rad immer kurz an. Du weißt schon.', 'Das hier ist für dich. Ohne dich würde ich immer noch Chips zählen.'],
      after: ['Ben und ich haben jetzt eine Dauerkarte.', 'Ganz oben sieht man bis nach Rainbow City. Fahr mal mit.'] },
    item: { icon: '🎟️', name: 'Fahrchips', color: 0xffd23b, n: 8 }, pay: [150, 220, 480],
    spots: [
      { id: 'rad', label: '🎡 Riesenrad fahren', x: 0, z: -15.5, r: 3, act: { k: 'do', cost: 5, min: 20, d: { fun: 26, social: 6 }, msg: 'Ganz oben hält das Rad kurz an. Die Lichter, der See, die Stadt in der Ferne. Spaß +26' } },
      { id: 'watte', label: '🍭 Zuckerwatte', x: 14, z: 2, r: 2.2, act: { k: 'do', cost: 3, min: 10, d: { hunger: 12, fun: 8 }, msg: 'Rosa, klebrig, perfekt. Hunger +12' } },
      { id: 'dosen', label: '🥫 Dosenwerfen', x: -14, z: 2, r: 2.2, act: { k: 'do', cost: 2, min: 15, d: { fun: 16 }, msg: 'Neun von zehn Dosen. Du gewinnst ein Regenbogen-Einhorn aus Plüsch. Spaß +16' } },
    ],
    folk: [
      { name: 'Ben', rb: 'Male_Adult_07', x: 4.5, z: -11, anim: 'idle', color: '#ffd23b', lines: ['Ich fahre jeden Abend. Die Aussicht ist schön. Ja, die Aussicht.', 'Meinst du, der Typ vom Riesenrad heißt Mika? Auf seinem Schild steht Mika.'] },
      { name: 'Oma Gerda', rb: 'Female_Adult_06', x: -9, z: -4, anim: 'cheer', color: '#ff9ad5', lines: ['Mein Enkel hat mir seinen Freund vorgestellt. Ich habe gesagt: Endlich einer, der Skat kann.', 'Früher hätten die zwei sich das nicht getraut. Gut, dass früher vorbei ist.'] },
      { name: 'Leyla', rb: 'Female_Adult_09', x: 10, z: 8, anim: 'dance1', color: '#b56bff', lines: ['Ich habe meine Freundin auf dem Autoscooter kennengelernt. Sie hat mich gerammt.', 'Die Zuckerwatte ist heute doppelt so groß. Sagt nichts dem Chef.'] },
      { name: 'Budenchef Paule', rb: 'Male_Adult_05', x: -14, z: 4.4, yaw: 0, anim: 'talk', color: '#ff7a3b', lines: ['Drei Wurf, zwei Euro. Für Verliebte gratis, aber das sage ich keinem.', 'Der Mika guckt seit Wochen nur auf Gondel sieben. Ich bin nicht blind.'] },
    ],
    build(k) {
      const steel = k.M(0xd8dde6, .3, .8), RB = [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff];
      // Riesenrad
      const hub = 11.5, R = 9.5;
      for (const dz of [-.7, .7]) { const rim = k.arc(R, .14, steel, 0, hub, -20 + dz); rim.rotation.set(0, 0, 0); rim.rotation.x = Math.PI / 2; }
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2, x = Math.sin(a) * R, y = hub + Math.cos(a) * R;
        const sp = k.box(.1, R, .1, steel, Math.sin(a) * R / 2, hub + Math.cos(a) * R / 2, -20); sp.rotation.z = -a;
        k.box(1.5, 1.3, 1.5, k.M(RB[i % 6], .5), x, y - .9, -20); k.box(1.7, .12, 1.7, k.M(0xffffff, .5), x, y - .2, -20); k.ball(.16, k.G(RB[(i + 3) % 6], 1.5), x, y, -20.9);
      }
      for (const sx of [-1, 1]) for (const dz of [-1.6, 1.6]) { const leg = k.box(.3, 13, .3, steel, sx * 3.2, 5.8, -20 + dz); leg.rotation.z = sx * .27; }
      k.cyl(.5, .5, 3.6, steel, 0, hub, -20, 12).rotation.x = Math.PI / 2; k.box(8, .5, 5, k.M(0x3a3f4a, .7), 0, .25, -20); k.sign('RIESENRAD', '#ffd23b', 0, 2.2, -17.4, 0, 6);
      for (const x of [-3, 0, 3]) k.solid(x, -20, 2.6);
      // Buden in zwei Reihen
      const booth = (x: number, z: number, c: number, name: string, col2: string, ry: number) => {
        k.box(4, 2.6, 3, k.M(0xfffaf0, .8), x, 1.3, z); k.cyl(0, 3.2, 1.6, k.M(c, .6), x, 3.4, z, 4).rotation.y = Math.PI / 4; k.box(4.2, .9, .3, k.M(c, .6), x + Math.sin(ry) * 1.6, .45, z + Math.cos(ry) * 1.6, ry);
        k.sign(name, col2, x + Math.sin(ry) * 1.56, 2.2, z + Math.cos(ry) * 1.56, ry, 3.4); for (let i = 0; i < 5; i++) k.ball(.12, k.G(RB[i], 1.5), x - 1.6 + i * .8, 2.75, z + Math.cos(ry) * 1.62 + Math.sin(ry) * 0); k.solid(x - 1, z, 1.8); k.solid(x + 1, z, 1.8);
      };
      booth(-16, 2, 0xff3b6b, 'DOSENWERFEN', '#ff8aa0', Math.PI / 2); booth(16, 2, 0xff9ad5, 'ZUCKERWATTE', '#ff9ad5', -Math.PI / 2); booth(-16, -8, 0x3a7bff, 'LOSE', '#7fb0ff', Math.PI / 2); booth(16, -8, 0xffd23b, 'WAFFELN', '#ffd23b', -Math.PI / 2); booth(-16, 12, 0x3ee69a, 'ENTENANGELN', '#3ee69a', Math.PI / 2); booth(16, 12, 0xb56bff, 'FOTOBOX', '#c99aff', -Math.PI / 2);
      // Karussell
      k.cyl(4.2, 4.2, .4, k.M(0xff4fa3, .5), -26, .2, -22, 20); k.cyl(0, 4.8, 2.2, k.M(0xffd23b, .5), -26, 5.3, -22, 12); k.cyl(.3, .3, 4.4, steel, -26, 2.4, -22, 10);
      for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; k.cyl(.04, .04, 3.8, steel, -26 + Math.sin(a) * 3.2, 2.3, -22 + Math.cos(a) * 3.2, 6); k.ball(.5, k.M(RB[i % 6], .5), -26 + Math.sin(a) * 3.2, 1.3, -22 + Math.cos(a) * 3.2, .7, .9, 1.3); }
      k.solid(-26, -22, 4.6);
      // Lichterketten über dem Mittelgang und Wimpel
      for (let i = 0; i < 9; i++) { const z = 22 - i * 4.4; for (const sx of [-1, 1]) { k.cyl(.06, .06, 5, k.M(0x33333a, .5), sx * 7, 2.5, z, 6); k.solid(sx * 7, z, .2); } for (let j = 0; j < 9; j++) k.ball(.13, k.G(RB[(i + j) % 6], 1.6), -7 + j * 1.75, 4.9 - Math.sin(j / 8 * Math.PI) * .7, z); }
      // Bäume am Ufer und Steg-Laternen
      for (let i = 0; i < 16; i++) { const a = k.rnd() * 6.28, d = 34 + k.rnd() * 11, x = Math.sin(a) * d, z = Math.cos(a) * d; if (z < -10 && Math.abs(x) < 14) continue; k.cyl(.2, .3, 3.6, k.M(0x4a3222, .9), x, 1.8, z, 7); k.ball(2.2, k.M(0x2f6f4a, .95), x, 4.6, z, 1, .9, 1); k.solid(x, z, .5); }
    },
  },
];

export const worldDef = (id: string) => WORLDS.find((w) => w.id === id);
/** Stand der Geschichte einer Welt: 0 neu, 1 sammeln, 2 Ringe, 3 Finale offen, 4 geschafft */
export const worldStage = (flags: Record<string, unknown>, id: string) => Number(flags['w_' + id]) || 0;
