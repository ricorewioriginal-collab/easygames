'use strict';
/* Bunte Insel – Taschi-Land 🔴 (Daten): Typen, Attacken, Taschis (Taschenmonster, ALLES SELBST ERFUNDEN – nur „inspiriert“ von klassischen Sammel-Rollenspielen),
   Trainer, Orden, Items. Taschis sind Freunde: man fängt sie mit Taschibällen und kämpft rundenweise mit ihnen. */
BI.TTYPES = {
  normal: { n: 'Normal', i: '⭐', c: '#b8b8c8' }, feuer: { n: 'Feuer', i: '🔥', c: '#ff7a3a' }, wasser: { n: 'Wasser', i: '💧', c: '#3f9cff' }, pflanze: { n: 'Pflanze', i: '🌿', c: '#4cc05a' },
  elektro: { n: 'Blitz', i: '⚡', c: '#ffd23f' }, gestein: { n: 'Fels', i: '🪨', c: '#a89878' }, flug: { n: 'Flug', i: '🕊️', c: '#8ab8ff' }, geist: { n: 'Geist', i: '👻', c: '#9a7ad8' }
};
/* Typ-Tabelle: Angreifer → Verteidiger: 2 = sehr effektiv, .5 = wenig effektiv, 0 = wirkt nicht */
BI.TCHART = {
  feuer: { pflanze: 2, wasser: .5, feuer: .5, gestein: .5 }, wasser: { feuer: 2, gestein: 2, pflanze: .5, wasser: .5 }, pflanze: { wasser: 2, gestein: 2, feuer: .5, pflanze: .5, flug: .5 },
  elektro: { wasser: 2, flug: 2, pflanze: .5, elektro: .5 }, gestein: { feuer: 2, flug: 2 }, flug: { pflanze: 2, elektro: .5, gestein: .5 }, normal: { gestein: .5, geist: 0 }, geist: { geist: 2, normal: 0 }
};
BI.TMOVES = {
  tackler: { n: 'Tackler', t: 'normal', p: 40 }, kratzer: { n: 'Kratzer', t: 'normal', p: 45 }, rammbock: { n: 'Rammbock', t: 'normal', p: 70 }, kuschel: { n: 'Wirbel-Hieb', t: 'normal', p: 60 },
  glut: { n: 'Glutfunken', t: 'feuer', p: 40 }, feuerwirbel: { n: 'Feuerwirbel', t: 'feuer', p: 70 }, flammenstoss: { n: 'Flammenstoß', t: 'feuer', p: 95 },
  spritzer: { n: 'Spritzer', t: 'wasser', p: 40 }, blubber: { n: 'Blubberwelle', t: 'wasser', p: 70 }, flut: { n: 'Flutwelle', t: 'wasser', p: 95 },
  ranke: { n: 'Rankenhieb', t: 'pflanze', p: 40 }, blaetter: { n: 'Blättersturm', t: 'pflanze', p: 70 }, solar: { n: 'Sonnenstrahl', t: 'pflanze', p: 95 },
  funken: { n: 'Funkenschlag', t: 'elektro', p: 40 }, donner: { n: 'Donnerschock', t: 'elektro', p: 70 }, blitz: { n: 'Mega-Blitz', t: 'elektro', p: 95 },
  stein: { n: 'Steinwurf', t: 'gestein', p: 40 }, brocken: { n: 'Felsbrocken', t: 'gestein', p: 70 }, lawine: { n: 'Lawine', t: 'gestein', p: 95 },
  fluegel: { n: 'Flügelschlag', t: 'flug', p: 40 }, sturz: { n: 'Sturzflug', t: 'flug', p: 70 }, sturm: { n: 'Windhose', t: 'flug', p: 95 },
  spuk: { n: 'Spukhauch', t: 'geist', p: 40 }, schatten: { n: 'Schattenball', t: 'geist', p: 70 }, albtraum: { n: 'Gruselwelle', t: 'geist', p: 95 }
};
/* Arten: t Typ · hp/at/df/sp Basiswerte · cr Fangrate (0–1) · shape + c1/c2/c3 Farben fürs 3D-Modell · evo {lv,to} (Stufe) oder st (Stein) · mv Attacken [Stufe, id] · dex Pokédex-Text */
BI.TSPECIES = {
  blitzi: { n: 'Blitzi', t: 'elektro', hp: 40, at: 55, df: 40, sp: 90, cr: .5, shape: 'mouse', c1: 0xffd83a, c2: 0xfff0a0, c3: 0xff8a3a, evo: { lv: 18, to: 'blitzor' }, mv: [[1, 'tackler'], [1, 'funken'], [10, 'kratzer'], [16, 'donner']], dex: 'Speichert Strom in den roten Backen. Sehr freundlich – und blitzschnell!' },
  blitzor: { n: 'Blitzor', t: 'elektro', hp: 65, at: 90, df: 55, sp: 110, cr: .25, shape: 'mouse', c1: 0xffa51f, c2: 0xffe08a, c3: 0xff5a1a, big: 1.3, mv: [[1, 'funken'], [1, 'donner'], [20, 'blitz'], [24, 'kuschel']], dex: 'Wenn es sich freut, knistern ihm die Haare.' },
  fellino: { n: 'Fellino', t: 'normal', hp: 55, at: 55, df: 50, sp: 55, cr: .4, shape: 'fox', c1: 0xb87a45, c2: 0xf5e2b8, c3: 0x8a5a2a, st: ['wellino', 'flamino', 'blitzino', 'laubino'], mv: [[1, 'tackler'], [1, 'kratzer'], [12, 'kuschel']], dex: 'Sein Körper ist wandelbar: Mit einem Stein verwandelt es sich in eine neue Form!' },
  wellino: { n: 'Wellino', t: 'wasser', hp: 90, at: 60, df: 60, sp: 60, cr: .2, shape: 'fox', c1: 0x4a9ae8, c2: 0xbfe6ff, c3: 0x2a6ab8, fin: 1, big: 1.15, mv: [[1, 'spritzer'], [1, 'tackler'], [1, 'blubber'], [20, 'flut']], dex: 'Lebt gern am Wasser. Sein Fell ist glitschig und glänzt.' },
  flamino: { n: 'Flamino', t: 'feuer', hp: 70, at: 90, df: 55, sp: 65, cr: .2, shape: 'fox', c1: 0xf0662a, c2: 0xffd36a, c3: 0xc03a1a, flame: 1, big: 1.15, mv: [[1, 'glut'], [1, 'tackler'], [1, 'feuerwirbel'], [20, 'flammenstoss']], dex: 'Sein Fell ist warm wie ein Kamin. Im Winter ein toller Freund!' },
  blitzino: { n: 'Blitzino', t: 'elektro', hp: 60, at: 80, df: 55, sp: 100, cr: .2, shape: 'fox', c1: 0xf2d03a, c2: 0xfff6c0, c3: 0xc8a820, spiky: 1, big: 1.15, mv: [[1, 'funken'], [1, 'tackler'], [1, 'donner'], [20, 'blitz']], dex: 'Sein Fell stellt sich bei Gewitter auf wie Nadeln.' },
  laubino: { n: 'Laubino', t: 'pflanze', hp: 65, at: 75, df: 80, sp: 60, cr: .2, shape: 'fox', c1: 0x6cc35a, c2: 0xe8f7b0, c3: 0x3a8a3a, leaf: 1, big: 1.15, mv: [[1, 'ranke'], [1, 'tackler'], [1, 'blaetter'], [20, 'solar']], dex: 'Sonnt sich gern. Auf dem Kopf wachsen ihm frische Blätter.' },
  glutzahn: { n: 'Glutzahn', t: 'feuer', hp: 44, at: 52, df: 43, sp: 65, cr: .4, shape: 'lizard', c1: 0xf08a3a, c2: 0xffe0a0, c3: 0xff5a1a, flame: 1, evo: { lv: 16, to: 'glutdrach' }, mv: [[1, 'kratzer'], [1, 'glut'], [9, 'feuerwirbel'], [18, 'tackler']], dex: 'Die Flamme an seinem Schwanz zeigt, wie gut es ihm geht.' },
  glutdrach: { n: 'Glutdrach', t: 'feuer', hp: 78, at: 84, df: 78, sp: 100, cr: .2, shape: 'lizard', c1: 0xe0482a, c2: 0xffd090, c3: 0xff8a1a, flame: 1, wings: 1, big: 1.35, mv: [[1, 'feuerwirbel'], [1, 'sturz'], [24, 'flammenstoss']], dex: 'Mit seinen kleinen Flügeln hüpft es hoch in die Luft.' },
  samenling: { n: 'Samenling', t: 'pflanze', hp: 45, at: 49, df: 49, sp: 45, cr: .4, shape: 'frog', c1: 0x55b8a0, c2: 0xbfe8d8, c3: 0x3ea03a, bulb: 1, evo: { lv: 16, to: 'bluetling' }, mv: [[1, 'tackler'], [1, 'ranke'], [9, 'blaetter'], [18, 'rammbock']], dex: 'Auf seinem Rücken wächst eine Knolle – sie wird immer größer.' },
  bluetling: { n: 'Blütling', t: 'pflanze', hp: 80, at: 82, df: 83, sp: 80, cr: .2, shape: 'frog', c1: 0x3ea890, c2: 0xd8f2e8, c3: 0xff7ac0, bulb: 2, big: 1.35, mv: [[1, 'blaetter'], [1, 'rammbock'], [24, 'solar']], dex: 'Seine Blüte duftet so gut, dass alle Taschis näherkommen.' },
  plaetscher: { n: 'Plätscherchen', t: 'wasser', hp: 44, at: 48, df: 65, sp: 43, cr: .4, shape: 'turtle', c1: 0x5aaeea, c2: 0xf3e6b8, c3: 0x8a5a33, evo: { lv: 16, to: 'panzerlon' }, mv: [[1, 'tackler'], [1, 'spritzer'], [9, 'blubber'], [18, 'rammbock']], dex: 'Zieht sich bei Gefahr in den Panzer zurück und spritzt los.' },
  panzerlon: { n: 'Panzerlon', t: 'wasser', hp: 79, at: 83, df: 100, sp: 78, cr: .2, shape: 'turtle', c1: 0x3a8ad8, c2: 0xf3e6b8, c3: 0x6a4a28, big: 1.35, cannons: 1, mv: [[1, 'blubber'], [1, 'rammbock'], [24, 'flut']], dex: 'Aus den Rohren auf dem Panzer spritzt es Wasser – ganz ohne Gefahr.' },
  flatterling: { n: 'Flatterling', t: 'flug', hp: 40, at: 45, df: 40, sp: 56, cr: .65, shape: 'bird', c1: 0xc89a6a, c2: 0xfff0d8, c3: 0xe8a030, evo: { lv: 18, to: 'falkera' }, mv: [[1, 'tackler'], [1, 'fluegel'], [12, 'kratzer'], [16, 'sturz']], dex: 'Singt morgens als Erster. Wer es hört, hat gute Laune.' },
  falkera: { n: 'Falkera', t: 'flug', hp: 70, at: 80, df: 65, sp: 100, cr: .3, shape: 'bird', c1: 0xa8703a, c2: 0xfff0d8, c3: 0xe83a3a, big: 1.3, crest: 1, mv: [[1, 'sturz'], [1, 'kratzer'], [26, 'sturm']], dex: 'Segelt stundenlang hoch über der Insel und sieht jeden Krümel.' },
  zwackel: { n: 'Zwackel', t: 'normal', hp: 35, at: 56, df: 35, sp: 72, cr: .75, shape: 'mouse', c1: 0xa07acc, c2: 0xf0e0f8, c3: 0xf0e0f8, nocheek: 1, evo: { lv: 20, to: 'zwackler' }, mv: [[1, 'tackler'], [1, 'kratzer'], [10, 'kuschel']], dex: 'Knabbert an allem. Seine Zähne wachsen ein Leben lang.' },
  zwackler: { n: 'Zwackler', t: 'normal', hp: 55, at: 81, df: 60, sp: 97, cr: .4, shape: 'mouse', c1: 0x8a5ab8, c2: 0xf0e0f8, c3: 0xf0e0f8, nocheek: 1, big: 1.25, mv: [[1, 'kuschel'], [1, 'rammbock'], [28, 'lawine']], dex: 'Ein flinker Läufer, der überall mal kurz vorbeischaut.' },
  felsling: { n: 'Felsling', t: 'gestein', hp: 40, at: 80, df: 100, sp: 20, cr: .6, shape: 'rock', c1: 0x9a9aa6, c2: 0xc8c8d0, c3: 0x6a6a76, evo: { lv: 22, to: 'brockos' }, mv: [[1, 'tackler'], [1, 'stein'], [14, 'brocken']], dex: 'Sieht aus wie ein Stein, bis er blinzelt. Mag Sonnenbäder.' },
  brockos: { n: 'Brockos', t: 'gestein', hp: 70, at: 110, df: 130, sp: 35, cr: .3, shape: 'rock', c1: 0x8a8a96, c2: 0xb8b8c0, c3: 0x5a5a66, big: 1.45, mv: [[1, 'brocken'], [1, 'rammbock'], [30, 'lawine']], dex: 'Wenn es rollt, bebt der Boden. Es ist aber ganz lieb!' },
  geisterchen: { n: 'Geisterchen', t: 'geist', hp: 30, at: 50, df: 35, sp: 80, cr: .55, shape: 'ghost', c1: 0x9a7ad8, c2: 0xe8dcff, c3: 0xfff08a, evo: { lv: 24, to: 'spuki' }, mv: [[1, 'spuk'], [1, 'tackler'], [14, 'schatten']], dex: 'Schwebt nachts durch die Gassen und kichert leise.' },
  spuki: { n: 'Spuki', t: 'geist', hp: 55, at: 75, df: 65, sp: 105, cr: .3, shape: 'ghost', c1: 0x7a58b8, c2: 0xe0d0ff, c3: 0xfff08a, big: 1.35, mv: [[1, 'schatten'], [1, 'spuk'], [32, 'albtraum']], dex: 'Erzählt die gruseligsten Geschichten – mit einem Augenzwinkern.' },
  quappi: { n: 'Quappi', t: 'wasser', hp: 40, at: 50, df: 40, sp: 90, cr: .65, shape: 'tadpole', c1: 0x4aa0e8, c2: 0xe0f2ff, c3: 0x2a6ab8, evo: { lv: 20, to: 'quappro' }, mv: [[1, 'spritzer'], [1, 'tackler'], [12, 'blubber']], dex: 'Der Wirbel auf dem Bauch dreht sich, wenn es nachdenkt.' },
  quappro: { n: 'Quappro', t: 'wasser', hp: 65, at: 75, df: 65, sp: 90, cr: .35, shape: 'tadpole', c1: 0x3a88d8, c2: 0xe0f2ff, c3: 0x2a6ab8, legs: 1, big: 1.3, mv: [[1, 'blubber'], [1, 'rammbock'], [26, 'flut']], dex: 'Hat Beine bekommen und springt gern über Pfützen.' },
  kaeferli: { n: 'Käferli', t: 'pflanze', hp: 40, at: 45, df: 55, sp: 40, cr: .7, shape: 'bug', c1: 0x7ad84a, c2: 0xe8ffc0, c3: 0xff9a3a, mv: [[1, 'tackler'], [1, 'ranke'], [10, 'blaetter']], dex: 'Putzt jedes Blatt, auf dem es sitzt. Ein richtiger Gärtner!' },
  knister: { n: 'Knister', t: 'elektro', hp: 35, at: 60, df: 40, sp: 75, cr: .6, shape: 'bug', c1: 0xffe34a, c2: 0xfff6c0, c3: 0x3a7ae8, spiky: 1, mv: [[1, 'funken'], [1, 'tackler'], [12, 'donner']], dex: 'Wenn es aufgeregt ist, knistert es wie ein Lagerfeuer.' },
  funkli: { n: 'Funkli', t: 'feuer', hp: 38, at: 58, df: 38, sp: 70, cr: .6, shape: 'ghost', c1: 0xff7a3a, c2: 0xffe08a, c3: 0xffffff, flame: 1, mv: [[1, 'glut'], [1, 'tackler'], [12, 'feuerwirbel']], dex: 'Ein kleines Flämmchen mit Gesicht. Pusten ist verboten!' },
  schlummi: { n: 'Schlummi', t: 'normal', hp: 110, at: 85, df: 70, sp: 25, cr: .2, shape: 'bear', c1: 0x8a6a4a, c2: 0xf3e0c0, c3: 0x5a4028, mv: [[1, 'tackler'], [1, 'rammbock'], [20, 'lawine']], dex: 'Schläft fast immer. Wenn es aufwacht, hat es Riesenhunger.' },
  mauzi: { n: 'Mauzi', t: 'normal', hp: 70, at: 70, df: 55, sp: 80, cr: .1, shape: 'cat', c1: 0xf4e6c0, c2: 0xffffff, c3: 0xe8c060, mv: [[1, 'kratzer'], [1, 'kuschel'], [10, 'rammbock'], [14, 'schatten']], dex: 'Die sprechende Katze von Team Funke – frech, aber nicht böse.' }
};
BI.TWILD = { /* Gras-Zonen: Arten + Gewicht */
  wiese: [['flatterling', 5], ['zwackel', 5], ['kaeferli', 4], ['samenling', 1], ['fellino', 1]],
  teich: [['quappi', 5], ['kaeferli', 3], ['plaetscher', 1], ['flatterling', 2], ['fellino', 1]],
  fels: [['felsling', 5], ['geisterchen', 3], ['knister', 4], ['zwackel', 2], ['schlummi', 1]],
  huegel: [['funkli', 4], ['glutzahn', 1], ['flatterling', 3], ['knister', 3], ['blitzi', 1], ['schlummi', 1]]
};
/* Trainer: Leiter der Arena, Team Funke, Rivale. team = [Art, Stufe] */
BI.TTRAINERS = {
  kai: { n: 'Kai', icon: '🧢', win: 'Starker Kampf! Blitzi und ich trainieren weiter!', team: [['blitzi', 8], ['flatterling', 7]], star: 3 },
  fiete: { n: 'Fels-Fiete', icon: '🪨', orden: 'fels', win: 'Du hast mich umgehauen! Hier – dein Fels-Orden!', team: [['felsling', 7], ['felsling', 9]], star: 5 },
  perla: { n: 'Perla', icon: '💧', orden: 'perle', win: 'Wunderbar gekämpft! Nimm den Perlen-Orden!', team: [['quappi', 10], ['plaetscher', 12]], star: 5 },
  volt: { n: "Käpt'n Volt", icon: '⚡', orden: 'funke', win: 'Das war ein Gewitter! Der Funken-Orden gehört dir!', team: [['knister', 13], ['blitzi', 15]], star: 5 },
  bluete: { n: 'Blüte', icon: '🌿', orden: 'bluete', win: 'Wie schön du gekämpft hast! Hier ist der Blüten-Orden.', team: [['kaeferli', 15], ['samenling', 17], ['laubino', 18]], star: 5 },
  jette: { n: 'Jette (Team Funke)', icon: '🎈', win: 'Wir verlieren! Wieder! Aber wir kommen wieder… vielleicht…', team: [['zwackel', 12], ['geisterchen', 13]], star: 3 },
  jim: { n: 'Jim (Team Funke)', icon: '🎈', win: 'Ich hab doch nur Spaß gemacht! Aua!', team: [['knister', 13], ['quappi', 14]], star: 3 },
  mauzi: { n: 'Mauzi (Team Funke)', icon: '🐱', orden: 'team', win: 'Mauzi: „Na gut, du bist stärker. Der Ballon gehört dir – wir laufen zu Fuß!“', team: [['mauzi', 18]], star: 8 },
  aurelia: { n: 'Meisterin Aurelia', icon: '👑', orden: 'meister', win: 'Du bist die neue Meisterin der Insel! Der Meister-Orden gehört dir!', team: [['falkera', 22], ['flamino', 23], ['blitzor', 24]], star: 15 }
};
BI.TORDEN = [
  { key: 'fang', icon: '🔴', n: 'Fang-Orden', t: 'Fang dein erstes wildes Taschi im hohen Gras.' },
  { key: 'fels', icon: '🪨', n: 'Fels-Orden', t: 'Besiege Fels-Fiete in der Arena.' },
  { key: 'perle', icon: '💧', n: 'Perlen-Orden', t: 'Besiege Perla in der Arena.' },
  { key: 'funke', icon: '⚡', n: 'Funken-Orden', t: "Besiege Käpt'n Volt in der Arena." },
  { key: 'bluete', icon: '🌿', n: 'Blüten-Orden', t: 'Besiege Blüte in der Arena.' },
  { key: 'forscher', icon: '📘', n: 'Forscher-Orden', t: 'Fange 8 verschiedene Taschis – dann zeigt dir Professor Ulme den Orden.' },
  { key: 'team', icon: '🎈', n: 'Ballon-Orden', t: 'Besiege Team Funke (Jette, Jim und Mauzi) bei ihrem Heißluftballon.' },
  { key: 'meister', icon: '👑', n: 'Meister-Orden', t: 'Hol erst alle anderen 7 Orden – dann fordere Meisterin Aurelia heraus.' }
];
BI.TITEMS = {
  ball: { n: 'Taschiball', i: '🔴', price: 3, d: 'Zum Fangen wilder Taschis.', mul: 1 }, super: { n: 'Superball', i: '🔵', price: 8, d: 'Fängt viel besser.', mul: 1.8 }, meister: { n: 'Meisterball', i: '🟣', price: 0, d: 'Fängt immer! (Geschenk)', mul: 99 },
  trank: { n: 'Trank', i: '🧪', price: 3, d: 'Heilt 30 Punkte.', heal: 30 }, supertrank: { n: 'Supertrank', i: '💊', price: 7, d: 'Heilt 80 Punkte.', heal: 80 }, beleber: { n: 'Beleber', i: '✨', price: 10, d: 'Weckt ein ohnmächtiges Taschi auf.', revive: 1 },
  stein_w: { n: 'Wasserstein', i: '💎', price: 20, d: 'Fellino wird zu Wellino.', stone: 'wellino' }, stein_f: { n: 'Feuerstein', i: '🔶', price: 20, d: 'Fellino wird zu Flamino.', stone: 'flamino' },
  stein_d: { n: 'Donnerstein', i: '🔷', price: 20, d: 'Fellino wird zu Blitzino.', stone: 'blitzino' }, stein_b: { n: 'Blattstein', i: '🟢', price: 20, d: 'Fellino wird zu Laubino.', stone: 'laubino' }
};
