/* Welten jenseits von Rainbow City: eigene Inseln im selben Stil, erreichbar durch das Weltentor am Hafen (hinlaufen)
   oder per Schnellreise im Handy. Jede Welt hat eine Gastgeberin oder einen Gastgeber, eine kleine Geschichte in drei
   Aufgaben (sammeln, Ringe fliegen, Finale) und Leute zum Reden. Alles hier ist eigene Erfindung von Pride City. */
import type { Mesh, PBRMaterial, Scene } from '../engine/bjs';

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
];

export const worldDef = (id: string) => WORLDS.find((w) => w.id === id);
/** Stand der Geschichte einer Welt: 0 neu, 1 sammeln, 2 Ringe, 3 Finale offen, 4 geschafft */
export const worldStage = (flags: Record<string, unknown>, id: string) => Number(flags['w_' + id]) || 0;
