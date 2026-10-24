'use strict';
/* Bunte Insel – Gäste aus anderen easygames 🎮: Figuren aus KIKO, Wolkenhopser, Krawallvögel, Hüpfstraße, Kart Rush, Radio Maze, Winzflitzer,
   Spinwelten, Urwaldlager, Podcast Tycoon und 2048 Deluxe besuchen die Insel (Vorbild: die Kämpferliste von EASYCLASH, easyclash/js/roster.js).
   Sie stehen am easygames-Treff auf der Hauptinsel, laufen dort herum und erzählen von ihrem Spiel; wer 8 von ihnen anspricht, bekommt den Sticker „Gästefreund“.
   Alle Gäste sind auch als Vorlage spielbar (BI.HEROES). Menschen nutzen BI.makeChar, Tiere und Fantasiewesen BI.makeBuddy (runde Trickfilm-Figuren,
   gleiche Knochen und Bewegungen wie makeChar: legL/legR/armL/armR, pose, dance, sit, punch – so funktionieren sie überall, wo eine Figur gebraucht wird). */
BI.GAESTE = [
  { id: 'g_kiko', name: 'Kiko', icon: '⭐', game: 'KIKO – Sterneninseln', o: { buddy: { kind: 'blob', body: 0x29c4c2, belly: 0x9cead8, feet: 0x287e9f, antenna: 0xffd16d } },
    lines: ['ich komme von den Sterneninseln! Dort sammle ich Sternenpuls. ⭐', 'Weißt du, wie man auf Federpilzen hüpft? Hoch, ganz hoch!', 'Deine Insel ist so bunt – fast wie meine Sterneninseln!'] },
  { id: 'g_lumi', name: 'Lumi', icon: '🌸', game: 'KIKO – Sterneninseln', o: { buddy: { kind: 'blob', body: 0xea889e, belly: 0xffd9d6, feet: 0xad627f, wings: 0xffe28d, size: .9 } },
    lines: ['mit meinen kleinen Flügeln schwebe ich über Abgründe! 🌸', 'Kiko und ich sind beste Freunde.', 'Pssst … auf den Sterneninseln gibt es Uhrtore. Die sind magisch!'] },
  { id: 'g_hopsi', name: 'Hopsi', icon: '🐸', game: 'Wolkenhopser', o: { buddy: { kind: 'blob', body: 0x7bdc5a, belly: 0xd9f7b0, feet: 0xffffff, size: .85 } },
    lines: ['ich hüpfe immer höher – bis in den Weltraum! 🚀', 'Trampoline sind das Beste. Boing!', 'Hast du schon mal eine Propellermütze getragen?'] },
  { id: 'g_rudi', name: 'Rudi', icon: '🐦', game: 'Krawallvögel', o: { buddy: { kind: 'bird', body: 0xd92a2a, belly: 0xf4d6b0, legs: 0xffa726, beak: 0xffb300, brows: 1, tuft: 0xa01818 } },
    lines: ['ich bin ein Krawallvogel! Mit der Schleuder fliege ich weit. 🐦', 'Grummel … die Schweine haben unsere Eier gemopst!', 'Bei dir ist es aber schön friedlich.'] },
  { id: 'g_zisch', name: 'Zisch', icon: '⚡', game: 'Krawallvögel', o: { buddy: { kind: 'bird', body: 0xf5d020, belly: 0xfff3b0, legs: 0xffa726, beak: 0xff8f00, brows: 1, tuft: 0x2b2b2b, size: .85 } },
    lines: ['zisch – ich bin der schnellste Vogel! ⚡', 'Fang mich doch, wenn du kannst!', 'Turbo an und ab durch die Mitte!'] },
  { id: 'g_pingu', name: 'Pingu', icon: '🐧', game: 'Hüpfstraße', o: { buddy: { kind: 'bird', body: 0x222831, belly: 0xffffff, legs: 0xff9800, beak: 0xff9800, tall: 1 } },
    lines: ['ich watschle über Straßen und Flüsse. 🐧', 'Baumstämme sind zum Draufhüpfen da!', 'Hier ist es mir fast ein bisschen zu warm. Hast du ein Eis?'] },
  { id: 'g_einhorn', name: 'Einhorn', icon: '🦄', game: 'Hüpfstraße', o: { buddy: { kind: 'beast', body: 0xfafafa, top: 0xfafafa, bottom: 0xfafafa, feet: 0xb39ddb, snout: 0xf8bbd0, ears: 'cat', horn: 0xffd54f, mane: 0xff80ab, tail: 0xb388ff } },
    lines: ['ich glitzere sogar im Regen! 🦄✨', 'Auf der Regenbogeninsel fühle ich mich wie zu Hause.', 'Wünsch dir was – vielleicht geht es in Erfüllung!'] },
  { id: 'g_panda', name: 'Panda', icon: '🐼', game: 'Hüpfstraße', o: { buddy: { kind: 'beast', body: 0xfafafa, top: 0x1b1b1b, bottom: 0x1b1b1b, feet: 0x1b1b1b, snout: 0xffffff, ears: 'bear', earC: 0x1b1b1b, patches: 0x1b1b1b, bulk: 1.15 } },
    lines: ['ich bin gemütlich … aber beim Hüpfen ganz schön schnell! 🐼', 'Bambus ist lecker. Möchtest du probieren?', 'Ein Nickerchen in der Sonne – herrlich.'] },
  { id: 'g_brumm', name: 'Brumm', icon: '🐻', game: 'AnMaCha Kart Rush', o: { buddy: { kind: 'beast', body: 0x8a5a2a, top: 0xe8d8b8, bottom: 0x8a5a2a, feet: 0x5a3a1a, snout: 0xc49a6a, ears: 'bear', bulk: 1.2, helmet: 0xc4453a } },
    lines: ['brumm brumm – ich bin der Bär am Steuer! 🏎️', 'Im Kart Rush fahre ich jede Kurve mit Schwung.', 'Hast du schon die Rennstrecken bei mir gesehen?'] },
  { id: 'g_funke', name: 'Funke', icon: '🐲', game: 'AnMaCha Kart Rush', o: { buddy: { kind: 'beast', body: 0x3da84a, top: 0xffd890, bottom: 0x3da84a, feet: 0x2a7a34, snout: 0xffd890, horns: 0xffd890, tail: 0x3da84a, wings: 0xe8412a, size: .9 } },
    lines: ['ich bin ein kleiner Drache mit großem Feuer! 🔥', 'Die Drachen in den Drachenhöhen sind meine Cousins.', 'Keine Sorge, ich puste nur warme Luft.'] },
  { id: 'g_quak', name: 'Quak', icon: '🐸', game: 'AnMaCha Kart Rush', o: { buddy: { kind: 'blob', body: 0x4cc84a, belly: 0xd8f8c8, feet: 0x2e8a2c, frog: 1, size: .85 } },
    lines: ['quak! Ich springe höher als alle anderen! 🐸', 'Im Teich ist es schön kühl.', 'Mein Kart ist grün – natürlich!'] },
  { id: 'g_rauschi', name: 'Rauschi', icon: '📡', game: 'Radio Maze 3D', o: { buddy: { kind: 'blob', body: 0xff2b2b, belly: 0xff7a7a, feet: 0xc41a1a, eye: 0x1a3cff, antenna: 0xffffff, size: .85 } },
    lines: ['kshhhh … ich bin das Rauschen aus dem Labyrinth! 📻', 'Auf der Radio-Insel höre ich die schönsten Sender.', 'Wenn es knistert, bin ich in der Nähe. Hihi!'] },
  { id: 'g_rico', name: 'Rico', icon: '🎙️', game: '2048 Deluxe & Rico Flap', o: { shirt: 0x8645e0, pants: 0x2c3554, hair: 0x4b2e1a, skin: 0xf2c6a4, style: 'spiky', beard: 4, beardc: 0x5e3b22, eye: 0x5a3216, ctype: 1, nosering: true, earring: 1, shoe: 0x23262d },
    lines: ['hallo, hier ist Rico vom Radio! 🎙️', 'In Rico Flap flattere ich durch die Funktürme.', 'Kennst du schon 2048 Deluxe? Zahlen schieben macht Spaß!'] },
  { id: 'g_marco', name: 'Marco', icon: '🎧', game: 'AnMaCha Podcast Tycoon', o: { shirt: 0x16171c, pants: 0x2b2f3a, hair: 0x6b4528, skin: 0xf0c8a8, style: 'short', beard: 5, beardc: 0x6b4528, logo: 0xff8a1e, hat: 'headphones', build: 2, shoe: 0x1b1b1b },
    lines: ['Kabel sind meine Leidenschaft! 🎧', 'Im Podcast-Studio sorge ich für guten Ton.', 'Kennst du eine gute Serie? Ich schaue alles!'] },
  { id: 'g_andrew', name: 'Andrew', icon: '🎵', game: 'AnMaCha Podcast Tycoon', o: { shirt: 0x16171c, pants: 0x3a4f78, hair: 0xc9844a, skin: 0xf3cdb2, style: 'short', logo: 0xff8a1e, mouth: 'grin', shoe: 0x1b1b1b },
    lines: ['Musik macht einfach glücklich! 🎵', 'Im Podcast lachen wir ganz viel.', 'Sing doch mal mit – lalala!'] },
  { id: 'g_rosa', name: 'Rosa', icon: '🏎️', game: 'Winzflitzer 3D', o: { shirt: 0xe74c3c, pants: 0x2c2c3a, hair: 0x7a2a1a, skin: 0xf2c6a4, style: 'ponytail', hat: 'cap', shoe: 0xffffff },
    lines: ['ich bin Küchentisch-Meisterin im Winzflitzer-Rennen! 🏎️', 'Mit winzigen Autos über riesige Tische – das ist mein Ding!', 'Wer fährt mit mir um die Wette?'] },
  { id: 'g_lotte', name: 'Lotte', icon: '🏁', game: 'Winzflitzer 3D', o: { shirt: 0xff3b6b, pants: 0x2c3554, hair: 0xe8c25a, skin: 0xf5d0b5, style: 'bob', glassT: 1, glassC: 0x333333, shoe: 0xff3b6b },
    lines: ['ich fahre immer die Ideallinie. 🏁', 'Der Billardtisch ist meine Lieblingsstrecke.', 'Schön ordentlich lenken – dann klappt es!'] },
  { id: 'g_suki', name: 'Suki', icon: '✨', game: 'Spinwelten 3D', o: { shirt: 0x7c4dff, pants: 0x311b92, hair: 0xb388ff, skin: 0xf5d0b5, style: 'long', shoe: 0xffd23f, earring: 1, eyeS: 1 },
    lines: ['ich funkle wie Sternenstaub! ✨', 'In den Spinwelten baue ich schwebende Inseln wieder auf.', 'Dreh die Runenmaschine – vielleicht gewinnst du was!'] },
  { id: 'g_zoe', name: 'Tüftlerin Zoe', icon: '⚙️', game: 'Spinwelten 3D', o: { shirt: 0xff8f00, pants: 0x37474f, hair: 0x3b2314, skin: 0xe0a47a, style: 'bun', glassT: 1, glassC: 0xffb300, overall: true, shoe: 0x212121 },
    lines: ['ich tüftle an allem, was sich dreht! ⚙️', 'Zahnräder, Schrauben, Federn – ich liebe Werkzeug.', 'Im Bauland gibt es tolle Sachen zum Bauen!'] },
  { id: 'g_gisela', name: 'Gisela Glanz', icon: '🎤', game: 'Urwaldlager', o: { shirt: 0xf4a300, pants: 0x7a4a10, hair: 0xe9e9e9, skin: 0xf2cfb3, style: 'bun', dress: true, necklace: 0xffffff, earring: 1, wrink: 1, lip: 0xd0403a, shoe: 0xf4a300 },
    lines: ['ich bin Schlagersängerin! Lalaaa! 🎤', 'Im Urwaldlager habe ich am Lagerfeuer gesungen.', 'Applaus, Applaus – du bist mein Lieblingspublikum!'] }
];
BI.GAESTE_TREFF = { x: 34, z: 76 }; /* freie Wiese auf der Hauptinsel (östlich vom Startplatz) */
BI.GAESTE.forEach(g => { BI.DLG_LOOKS = BI.DLG_LOOKS || {}; BI.DLG_LOOKS[g.name] = g.o; });
/* Alle Gäste auch als spielbare Vorlage (vor „Eigener Held“) */
(function () { const H = BI.HEROES, i = H.findIndex(h => h.id === 'custom'), add = BI.GAESTE.filter(g => !H.some(h => h.id === g.id)).map(g => ({ id: g.id, name: g.name, icon: g.icon, game: g.game, o: g.o })); H.splice(i < 0 ? H.length : i, 0, ...add); })();

/* ---- Runde Tier- und Fantasiefiguren (Kugel-Wesen, Vögel, Tiere auf zwei Beinen) ---- */
BI.makeBuddy = function (o) {
  const B = o.buddy || {}, kind = B.kind || 'blob', T = THREE, mat = BI.charMat ? BI.charMat() : BI.mat(), root = new T.Group(), b = new BI.CharacterBatch(); root.userData.opts = o;
  const body = B.body != null ? B.body : 0x7bdc5a, belly = B.belly != null ? B.belly : 0xffffff, feet = B.feet != null ? B.feet : body, eyeC = B.eye != null ? B.eye : 0x3a2a1a;
  const shade = (c, k) => new T.Color(c).multiplyScalar(k).getHex(), mix = (a, c, t) => new T.Color(a).lerp(new T.Color(c), t).getHex();
  /* Punkt auf einer (gestauchten) Kugel: z vorne auf der Oberfläche */
  const surf = (cx, cy, cz, r, sx, sy, sz, x, y) => cz + r * sz * Math.sqrt(Math.max(.04, 1 - ((x - cx) / (r * sx)) ** 2 - ((y - cy) / (r * sy)) ** 2));
  function eyes(cx, cy, cz, r, sx, sy, sz, ey, ex, es) { for (const s of [-1, 1]) { const x = s * ex, z = surf(cx, cy, cz, r, sx, sy, sz, x, ey) - es * .1;
    b.sph(x, ey, z, es, 0xfffbef, 3, 1, 1.2, .42); b.sph(x, ey - es * .05, z + es * .3, es * .72, eyeC, 3, .92, 1.15, .36); b.sph(x, ey - es * .08, z + es * .45, es * .4, 0x1d2433, 0, .86, 1.1, .36);
    b.sph(x - es * .3, ey + es * .35, z + es * .6, es * .2, 0xffffff, 0, 1, 1, .5); b.sph(x + es * .22, ey - es * .3, z + es * .58, es * .1, 0xffffff, 0, 1, 1, .5); } }
  function smile(cx, cy, cz, r, sx, sy, sz, my, w) { const z = surf(cx, cy, cz, r, sx, sy, sz, 0, my) + .006; b.arc(0, my + w * .45, z, w, w * .5, .014, shade(body, .45), Math.PI * 1.1, Math.PI * 1.9, 10); }
  function cheeks(cx, cy, cz, r, sx, sy, sz, y, x0) { for (const s of [-1, 1]) b.sph(s * x0, y, surf(cx, cy, cz, r, sx, sy, sz, s * x0, y) - .01, .06, mix(body, 0xff7f8a, .45), 3, 1, .6, .2); }
  const limb = (x, y, draw) => { const g = new T.Group(), lb = new BI.CharacterBatch(); draw(lb); g.add(lb.mesh(mat)); g.position.set(x, y, 0); root.add(g); return g; };
  let armL, armR, legL, legR;
  if (kind === 'blob' || kind === 'bird') {
    /* ein runder Körper ist zugleich Kopf: große Augen oben, Bauch vorne */
    const bird = kind === 'bird', tall = !!B.tall, R = .6, cy = .98, sx = 1, sy = tall ? 1.18 : .96, sz = .95;
    b.sph(0, cy, 0, R, body, 2, sx, sy, sz);
    b.sph(0, cy - .2, .2, R * .72, belly, 2, .95, tall ? 1.15 : .85, .6);
    const ey = cy + (tall ? .3 : .16); eyes(0, cy, 0, R, sx, sy, sz, ey, .19, .105);
    if (bird) {
      const bz = surf(0, cy, 0, R, sx, sy, sz, 0, cy) ; b.cyl(0, cy - .08 - .13, bz + .04, 0, .1, .26, B.beak != null ? B.beak : 0xffb300, 12, Math.PI / 2); b.cyl(0, cy - .14 - .08, bz, 0, .07, .16, shade(B.beak != null ? B.beak : 0xffb300, .8), 12, Math.PI / 2);
      if (B.brows) for (const s of [-1, 1]) b.box(s * .19, ey + .1, surf(0, cy, 0, R, sx, sy, sz, s * .19, ey + .12) - .02, .2, .05, .05, 0x1b1b1b, 0, 0, s * -.35);
      if (B.tuft != null) for (let k = 0; k < 3; k++) b.sph(0, cy + R * sy - .02 + k * .04, -.08 - k * .1, .1 - k * .015, B.tuft, 1, .55, 1.3, 1);
      b.sph(0, cy - .1, -R * sz + .02, .16, shade(body, .85), 1, 1.2, .5, 1); /* Schwanzfedern */
    } else {
      smile(0, cy, 0, R, sx, sy, sz, cy - .06, .07); cheeks(0, cy, 0, R, sx, sy, sz, cy - .02, .3);
      if (B.frog) for (const s of [-1, 1]) b.sph(s * .2, cy + R * sy - .04, .12, .16, body, 1); /* Froschaugen-Hügel */
    }
    if (B.antenna != null) { b.cyl(0, cy + R * sy - .05, 0, .02, .025, .3, shade(body, .8), 12); b.sph(0, cy + R * sy + .27, 0, .08, B.antenna, 1); }
    if (B.wings != null) for (const s of [-1, 1]) b.sph(s * .32, cy + .1, -.42, .24, B.wings, 1, .45, 1, .8);
    const armC = bird ? body : body, wing = bird;
    armL = limb(-R * .95, cy - .02, lb => wing ? lb.sph(-.04, -.16, 0, .22, shade(armC, .9), 1, .38, 1, .85) : lb.sph(0, -.13, .02, .13, armC, 1, .9, 1.1, .9));
    armR = limb(R * .95, cy - .02, lb => wing ? lb.sph(.04, -.16, 0, .22, shade(armC, .9), 1, .38, 1, .85) : lb.sph(0, -.13, .02, .13, armC, 1, .9, 1.1, .9));
    const legC = bird ? (B.legs != null ? B.legs : 0xffa726) : feet, lx = .24, ly = .48;
    const leg = lb => { if (bird) { lb.cyl(0, -.42, 0, .035, .035, .4, legC, 12); for (const a of [-.45, 0, .45]) lb.sph(Math.sin(a) * .08, -.44, .05 + Math.cos(a) * .08, .05, legC, 3, .8, .5, 1.6); } else { lb.cyl(0, -.3, 0, .1, .1, .3, shade(body, .95), 12); lb.sph(0, -.38, .07, .15, legC, 1, 1, .6, 1.35); } };
    legL = limb(-lx, ly, leg); legR = limb(lx, ly, leg);
  } else {
    /* Tier auf zwei Beinen: eiförmiger Körper, großer runder Kopf mit Schnauze */
    const bulk = B.bulk || 1, top = B.top != null ? B.top : body, bottom = B.bottom != null ? B.bottom : body, hy = 1.45, HR = .38;
    b.sph(0, .82, 0, .36, top, 2, bulk, 1.15, .9 * bulk);
    if (top !== body) b.sph(0, .8, .14, .26, mix(top, 0xffffff, .12), 1, bulk * .95, 1.05, .55);
    b.sph(0, hy, 0, HR, body, 2, 1.05, 1, 1);
    if (B.patches != null) for (const s of [-1, 1]) b.sph(s * .12, hy + .04, surf(0, hy, 0, HR, 1.05, 1, 1, s * .12, hy + .04) - .05, .1, B.patches, 3, 1, 1.25, .4);
    eyes(0, hy, 0, HR, 1.05, 1, 1, hy + .05, .135, .075);
    const sn = B.snout != null ? B.snout : mix(body, 0xffffff, .5), snz = surf(0, hy, 0, HR, 1.05, 1, 1, 0, hy - .12) - .06;
    b.sph(0, hy - .12, snz, .15, sn, 1, 1.15, .8, .7); b.sph(0, hy - .07, snz + .1, .045, 0x2a1a14, 3, 1.2, .9, .8);
    b.arc(0, hy - .17, snz + .095, .045, .025, .011, 0x5a2a24, Math.PI * 1.1, Math.PI * 1.9, 8);
    cheeks(0, hy, 0, HR, 1.05, 1, 1, hy - .08, .22);
    const ec = B.earC != null ? B.earC : body, ears = B.ears;
    for (const s of [-1, 1]) {
      if (ears === 'bear') { b.sph(s * .27, hy + .3, -.02, .11, ec, 1, 1, 1, .7); b.sph(s * .27, hy + .3, .03, .06, mix(ec, 0xffc9a0, .5), 3, 1, 1, .4); }
      else if (ears === 'cat' || ears === 'fox') { b.cone(s * .2, hy + .26, -.02, .1, .2, ec, 12); b.cone(s * .2, hy + .27, .03, .055, .13, mix(ec, 0xffc0d0, .5), 12); }
      else if (ears === 'bunny') b.sph(s * .12, hy + .5, -.02, .09, ec, 1, .8, 2.6, .55);
    }
    if (B.horn != null) b.cone(0, hy + .3, .14, .06, .3, B.horn, 12);
    if (B.horns != null) for (const s of [-1, 1]) b.cone(s * .17, hy + .27, -.06, .05, .16, B.horns, 12);
    if (B.mane != null) for (let k = 0; k < 4; k++) b.sph(0, hy + .3 - k * .14, -.24 - k * .05, .1, B.mane, 1, .7, 1.2, 1);
    if (B.helmet != null) { b.sph(0, hy + .1, -.02, HR + .02, B.helmet, 2, 1.08, .78, 1.04); b.box(0, hy + .02, .24, .44, .05, .2, shade(B.helmet, .8)); }
    if (B.tail != null) { b.sph(0, .62, -.38, .12, B.tail, 1, 1, 1, 1.3); b.sph(0, .75, -.52, .1, B.tail, 1); }
    if (B.wings != null) for (const s of [-1, 1]) b.sph(s * .3, 1.05, -.3, .26, B.wings, 1, .9, .55, .2);
    const hand = B.hand != null ? B.hand : body, shoe = feet;
    const arm = lb => { lb.cyl(0, -.3, 0, .09, .08, .3, top, 12); lb.sph(0, -.36, .01, .1, hand, 1, 1, 1.05, .95); };
    armL = limb(-.36 * bulk, 1.14, arm); armR = limb(.36 * bulk, 1.14, arm);
    const leg = lb => { lb.cyl(0, -.4, 0, .11, .1, .4, bottom, 12); lb.sph(0, -.46, .06, .13, shoe, 1, 1, .62, 1.3); };
    legL = limb(-.15 * bulk, .55, leg); legR = limb(.15 * bulk, .55, leg);
  }
  root.add(b.mesh(mat));
  if (o.name) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const cx = cv.getContext('2d'); cx.scale(2, 2); cx.font = 'bold 40px Fredoka, system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineWidth = 8; cx.strokeStyle = '#16335e'; cx.strokeText(o.name, 128, 34); cx.fillStyle = '#fff'; cx.fillText(o.name, 128, 34);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: BI.labelTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(1.5, .38, 1); sp.position.y = 2.25; root.add(sp);
  }
  root.scale.setScalar((o.scale || .95) * (B.size || 1));
  return {
    group: root, legL, legR, armL, armR, remote: null,
    dispose() { root.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.isSprite) { if (m.material.map) m.material.map.dispose(); m.material.dispose(); } }); if (root.parent) root.parent.remove(root); },
    pose(phase, amp, wave) { const s = Math.sin(phase) * amp; legL.rotation.x = s; legR.rotation.x = -s; armL.rotation.x = -s * .9; armR.rotation.x = s * .9; armL.rotation.z = 0; armR.rotation.z = wave ? -2.6 + Math.sin(phase * 2) * .4 : 0; },
    punch(k) { const w = Math.sin(Math.min(1, Math.max(0, k)) * Math.PI); armR.rotation.set(-1.75 * w, 0, -.15 * w); armL.rotation.set(.7 * w, 0, .2 * w); legL.rotation.x = .35 * w; legR.rotation.x = -.35 * w; },
    dance(t, style) { const s = Math.sin(t * 8), st = style % 3;
      if (st === 0) { armL.rotation.set(0, 0, 2.4 + s * .35); armR.rotation.set(0, 0, -2.4 - s * .35); legL.rotation.x = s * .55; legR.rotation.x = -s * .55; }
      else if (st === 1) { armR.rotation.set(0, 0, -2.6 + s * .25); armL.rotation.set(s * .7, 0, .15); legL.rotation.x = s * .7; legR.rotation.x = 0; }
      else { armL.rotation.set(-1.5 + s * .5, 0, 0); armR.rotation.set(-1.5 - s * .5, 0, 0); legL.rotation.x = Math.abs(s) * .5; legR.rotation.x = Math.abs(s) * .5; } },
    sit() { legL.rotation.x = legR.rotation.x = -1.35; armL.rotation.x = armR.rotation.x = -1.0; armR.rotation.z = 0; }
  };
};
