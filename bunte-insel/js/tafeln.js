'use strict';
/* Bunte Insel – Bild-Tafeln 🪧 (für Kinder, die noch nicht lesen können): kleine Holztafeln an den Eingängen aller Welten.
   Jede Tafel zeigt große Bilder (Emojis) und höchstens drei Wörter. Beim Hinlaufen (einmal) oder Antippen des Hauptknopfs „🔊 Vorlesen“
   wird der Text laut vorgelesen (A.speak). Sparsam: alle Pfosten in einem Mesh, pro Tafel eine Fläche, weit entfernte Tafeln sind unsichtbar. */
BI.TAFELN = {
  /* Welt-ID (wie in „Wohin?“) → [Bilder, kurzer Text, vorgelesener Satz] */
  bade: ['🏖️🛝', 'Badestrand', 'Willkommen am Badestrand! Schwimm im Meer und rutsch von der Wasserrutsche ins Wasser.'],
  home: ['🏠🛏️', 'Mein Zuhause', 'Das ist dein Zuhause. Hier kannst du schlafen und umziehen.'],
  garden: ['🌻🥕', 'Mein Garten', 'Das ist dein Garten. Pflanze Blumen und Gemüse.'],
  shop: ['🧸⭐', 'Spielzeug kaufen', 'Im Spielzeugladen kaufst du Sachen mit Sternen.'],
  range: ['🎯🔫', 'Zielschießen', 'Hier kannst du auf Ziele schießen.'],
  hof: ['🥕🍎', 'Hof-Laden', 'Im Hofladen gibt es Obst und Gemüse.'],
  fields: ['🌾🚜', 'Felder', 'Hier arbeiten die Traktoren auf dem Feld.'],
  city: ['🏙️🚓', 'Stadt', 'Willkommen in der Stadt! Hier gibt es Polizei und Feuerwehr.'],
  shops: ['🛒🍕', 'Geschäfte', 'Hier kannst du einkaufen gehen.'],
  arena: ['🥊🛡️', 'Kampf-Arena', 'In der Arena kannst du kämpfen. Ganz vorsichtig!'],
  forest: ['🌲👻', 'Dunkler Wald', 'Vorsicht, im Wald ist es dunkel und gruselig.'],
  obby: ['🏁🏃', 'Parcours', 'Spring über die Hindernisse bis ins Ziel.'],
  park: ['🎡🎢', 'Freizeitpark', 'Willkommen im Freizeitpark! Fahre Karussell und Achterbahn.'],
  lighthouse: ['💡🌊', 'Leuchtturm', 'Der Leuchtturm zeigt den Schiffen den Weg.'],
  dampf: ['🎬🚢', 'Kino-Schiff', 'Im Dampfer-Hafen gibt es Filme.'],
  drachen: ['🐉🔥', 'Drachen', 'Hier wohnen die Drachen. Sie sind freundlich.'],
  zotik: ['⭐🏰', 'Lunaris', 'Willkommen in Lunaris! Sammle bunte Splitter.'],
  radio: ['📻🎵', 'Radio-Welt', 'In der Funkwelle spielt Musik von vielen Radiosendern.'],
  schluessel: ['🗝️💛', 'Schlüsselreich', 'Willkommen im Schlüsselreich! Vertreibe Dunkelwichtel und öffne fünf Schlüssellöcher.'],
  statue_s: ['🗽🗝️', 'Lichtwanderer Lio', 'Die große Statue zeigt Lio. Er hat alle Welten mit dem Lichtschlüssel gerettet.'],
  strand_s: ['🌴🌟', 'Strand der Freunde', 'Am krummen Baum wachsen fünf Sternfrüchte. Sammle sie alle!'],
  stadt_s: ['🕰️🍦', 'Dämmerstadt', 'Hol ein Meersalz-Eis für den Uhrmacher und läute die Glocke.'],
  burg_s: ['🏰💡', 'Kristall-Burg', 'Im Hof leuchten vier Platten. Merk dir die Reihenfolge!'],
  wald_s: ['🌲🌑', 'Wald der Schatten', 'Hier springen Dunkelwichtel. Besiege acht mit dem Lichtschlüssel!'],
  turm_s: ['🗼💠', 'Schleier-Turm', 'Steig die Stufen hinauf und sammle drei Licht-Splitter.'],
  hafen_s: ['🚀🗝️', 'Sternen-Hafen', 'Hier steht das Sternenschiff. Und das Schlüsselschwert-Mobil kann fliegen!'],
  maerchen: ['🏰✨', 'Märchenland', 'Willkommen im Märchenland! Hier wohnen Prinzessinnen, Piraten und ein Löwenkönig.'],
  fussball: ['⚽🥅', 'Fußball', 'Willkommen beim Fußball! Lauf in den Ball und schieße Tore.'],
  bauland: ['🏗️🧱', 'Bauen', 'Im Bauland darfst du alles bauen, was du willst.'],
  pups: ['🐶🚒', 'Fellretter', 'Die Fellretter helfen Tieren in Not.'],
  rainbow: ['🌈🦄', 'Regenbogen', 'Willkommen in der Regenbogenwelt! Hier ist alles bunt.'],
  camp: ['⛺🔥', 'Camping', 'Hier kannst du zelten und am Feuer sitzen.'],
  zoo: ['🐮🐑', 'Streichel-Zoo', 'Du darfst die Tiere streicheln.'],
  pool: ['🏊💦', 'Schwimmbad', 'Im Freibad kannst du schwimmen und rutschen.'],
  station: ['🚂🎫', 'Bahnhof', 'Hier fährt der Zug ab. Steig ein!'],
  hospital: ['🏥❤️', 'Krankenhaus', 'Im Krankenhaus helfen Ärzte kranken Menschen.'],
  pier: ['⛵⚓', 'Boot', 'Hier liegt das Boot. Du kannst damit fahren.']
};
BI.createTafeln = function (G) {
  const { scene, W, A, P, say } = G, K = {}, list = [], post = new BI.Batch(), cache = new Map(); let sheen = 0, said = {}, pending = [];
  const face = (icons, txt) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 352; const c = cv.getContext('2d');
    c.fillStyle = '#8a5a33'; c.fillRect(0, 0, 512, 352); c.fillStyle = '#fff3d6'; c.fillRect(14, 14, 484, 324); c.strokeStyle = '#c8803c'; c.lineWidth = 6; c.strokeRect(24, 24, 464, 304);
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '150px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; c.fillText(icons, 256, 130);
    let f = 70; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 440) { f = Math.floor(f * 440 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; }
    c.fillStyle = '#4a2a10'; c.fillText(txt, 256, 262); c.font = '40px system-ui, "Apple Color Emoji", sans-serif'; c.fillText('🔊', 440, 300); return new THREE.CanvasTexture(cv); };
  const mat = id => { let m = cache.get(id); if (!m) { const d = BI.TAFELN[id]; m = new THREE.MeshBasicMaterial({ map: face(d[0], d[1]), side: THREE.DoubleSide }); cache.set(id, m); } return m; };
  /* Eine Tafel aufstellen: (x,z) = Standort, (fx,fz) = Blickpunkt (dorthin schaut die Tafel) */
  K.add = function (id, x, z, fx, fz) {
    const d = BI.TAFELN[id]; if (!d) return null; const ry = Math.atan2(fx - x, fz - z);
    post.cyl(x, 0, z, .09, .11, 2.1, 0x6b4a2a, 6); post.box(x, 2.0, z, 2.5, .12, .22, 0x8a5a33, ry); post.prism && post.prism(x, 2.9, z, 2.6, .5, .5, 0xc9524a, ry + Math.PI / 2);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), mat(id)); m.position.set(x + Math.sin(ry) * .13, 2.12 + .72 - .1, z + Math.cos(ry) * .13); m.rotation.y = ry; scene.add(m);
    W.addCircle(x, z, .35, false, 2); const t = { id, x, z, m, said: -99 }; list.push(t); return t;
  };
  /* An allen „Wohin?“-Zielen: seitlich vom Ankunftspunkt, wo noch Platz ist */
  K.placeAll = function (DEST) {
    for (const dd of DEST) { if (!BI.TAFELN[dd.id]) continue; let a; try { a = dd.at(); } catch (e) { continue; } if (!a || !isFinite(a.x + a.z)) continue;
      for (const [ox, oz] of [[3.4, 0], [-3.4, 0], [0, 3.4], [0, -3.4], [3, 3], [-3, -3], [-3, 3], [3, -3], [5, 0], [-5, 0]]) { const x = a.x + ox, z = a.z + oz, r = W.resolve(x, z, 1.1, {}); if (!r.hit && Math.abs(r.x - x) < .01) { K.add(dd.id, x, z, a.x, a.z); break; } } }
    if (!post.empty) scene.add(post.mesh(BI.mat()));
  };
  const nearest = (r) => { let b = null, bd = r * r; for (const t of list) { const d = (P.x - t.x) ** 2 + (P.z - t.z) ** 2; if (d < bd) { bd = d; b = t; } } return b; };
  K.near = function () { if (P.veh || P.y > 1.5) return null; const t = nearest(3.2); return t ? { k: 'tafel', id: t.id } : null; };
  K.act = function (n) { if (!n || !BI.TAFELN[n.id]) return; const d = BI.TAFELN[n.id]; A.speak && A.speak(d[2]); say(d[0] + '  ' + d[1], 2600); };
  /* Automatisch einmal vorlesen, wenn man ankommt (danach erst nach ~2 Minuten wieder); weit entfernte Tafeln werden ausgeblendet */
  K.update = function (dt) { sheen -= dt; if (sheen > 0) return; sheen = .5; const now = performance.now() / 1000;
    for (const t of list) { const d2 = (P.x - t.x) ** 2 + (P.z - t.z) ** 2; t.m.visible = d2 < 140 * 140; if (d2 < 3.8 * 3.8 && !P.veh && now - t.said > 150) { t.said = now; K.act({ k: 'tafel', id: t.id }); break; } } };
  K.list = () => list;
  return K;
};
