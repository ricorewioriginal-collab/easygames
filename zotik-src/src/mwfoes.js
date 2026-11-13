import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
let _rb = null; const RBOX = () => _rb || (_rb = new RoundedBoxGeometry(1, 1, 1, 3, .16));
// Gegner der Märchenwelten – eigene Körperformen nach den Vorlagen (Grimm, Kipling, Hugo, Mythen, Andersen, Mulan-Ballade, Artussage).
// Gleiche Bauweise wie creatures.js: Schwebende {root, body, sh}, Läufer {root, body, head, legs[4+], tail}
// (die Animation schwingt legs[0]/[3] gegen legs[1]/[2]; bei Zweibeinern sind legs[2]/[3] die Arme).
export function createMwFoes({ T, mk, G, M, glow, mergeStatic, SK }) {
  // Weichere Formen: abgerundete Kästen und fein unterteilte Kugeln/Kegel statt kantiger Grundkörper
  G = Object.assign({}, G, { box: RBOX(), sph0: G.sph, cone0: G.cone, cyl0: G.cyl });
  const C = (h, o) => (SK && !(o && (o.e !== undefined || o.t || o.m))) ? SK(h, o) : M(h, o), E = (h, i) => M(h, { e: h, ei: i ?? 1.6 });
  const dim = (h, k) => { const c = new T.Color(h); c.multiplyScalar(k); return c.getHex(); };
  const eyes = (g, y, z, sx, col, s) => { for (const k of [-1, 1]) g.add(mk(G.sph0, E(col || 0xffffff, 2.2), k * sx, y, z, .06 * (s || 1), .07 * (s || 1), .04, false)); };
  const fin = r => { mergeStatic(r.body, new Set([r.head, ...(r.legs || []), r.tail, ...(r.sh || [])].filter(Boolean))); return r; };
  const HOVER = new Set(['scherbe', 'fledermaus', 'steinfratze', 'stymphal', 'hai', 'falke', 'rabe']);

  function hover(kind, col) {
    const root = new T.Group(), b = new T.Group(); root.add(b); const sh = [];
    const wings = (w, mat, y, flat) => { for (const s of [-1, 1]) { const g = mk(G.sph0, mat, s * w * .55, y, 0, w * .55, flat || .05, w * .3); g.rotation.z = s * .25; b.add(g); sh.push(g); } };
    switch (kind) {
      case 'scherbe':   // Spiegelsplitter: Schwarm scharfer Spiegelscherben um ein Auge
        b.add(mk(G.oct, C(0xf0f4ff, { m: 1, r: .05, e: col, ei: .7 }), 0, 0, 0, .3, .52, .3)); eyes(b, .05, .22, .0, 0x9a6aff, 1.6);
        for (let i = 0; i < 6; i++) { const m = mk(G.box, C(0xffffff, { m: 1, r: .04, e: col, ei: .9 }), 0, 0, 0, .05, .5, .22, false); m.rotation.set(i, i * 2, i * .5); b.add(m); sh.push(m); }
        b.add(glow(col, 2.4, 0, 0, 0, .5)); break;
      case 'fledermaus':   // Mang die Fledermaus: Körper, große Hautflügel, Ohren
        b.add(mk(G.sph, C(col, { r: .8 }), 0, 0, 0, .3, .34, .3)); for (const s of [-1, 1]) b.add(mk(G.cone0, C(col), s * .14, .36, 0, .07, .2, .05));
        eyes(b, .08, .25, .1, 0xffd040); wings(1.7, C(dim(col, .7), { r: .9 }), .05, .04); b.add(mk(G.cone0, C(0xf0f0e0), .05, -.08, .28, .02, .08, .02, false)); break;
      case 'steinfratze':   // fliegende Steinfratze von Notre-Dame: Kopf mit Hörnern, Fratze, kleine Flügel
        b.add(mk(G.sph, C(col, { r: 1 }), 0, 0, 0, .42, .4, .42)); for (const s of [-1, 1]) { const h = mk(G.cone0, C(dim(col, .7)), s * .22, .38, -.05, .07, .3, .07); h.rotation.z = -s * .4; b.add(h); }
        b.add(mk(G.box, C(0x2a2228), 0, -.12, .36, .26, .1, .08, false)); for (let i = 0; i < 4; i++) b.add(mk(G.cone0, C(0xe8e0d0), -.09 + i * .06, -.07, .38, .02, .06, .02, false));
        eyes(b, .1, .38, .14, 0xffa040); wings(1.2, C(dim(col, .8), { r: 1 }), .1, .05); break;
      case 'stymphal':   // Stymphalischer Vogel: Bronzegefieder, Federn wie Pfeile
        { const br = C(col, { m: .85, r: .3 }); b.add(mk(G.sph, br, 0, 0, 0, .3, .32, .55)); b.add(mk(G.sph, br, 0, .22, .45, .2, .2, .22));
          const bk = mk(G.cone0, C(0x5a4a2a, { m: .7 }), 0, .2, .75, .06, .3, .06); bk.rotation.x = Math.PI / 2; b.add(bk); eyes(b, .28, .58, .09, 0xff4020);
          wings(1.8, br, .05, .06); for (let i = 0; i < 4; i++) { const f = mk(G.cone0, C(0xd8b060, { m: .9 }), (i - 1.5) * .12, 0, -.6, .03, .4, .03); f.rotation.x = -Math.PI / 2; b.add(f); } } break;
      case 'hai':   // Raubhai: Torpedokörper, Rückenflosse, Schwanzflosse, Zähne
        { const sk = C(col, { r: .5 }); b.add(mk(G.sph, sk, 0, 0, 0, .38, .4, 1.1)); b.add(mk(G.sph, C(0xe8eef0), 0, -.14, .1, .3, .22, .9));
          const df = mk(G.cone0, sk, 0, .5, -.1, .08, .55, .3); df.rotation.x = -.3; b.add(df); for (const s of [-1, 1]) { const pf = mk(G.cone0, sk, s * .4, -.15, .25, .3, .05, .2); pf.rotation.z = s * 1.2; b.add(pf); }
          const tf = mk(G.cone0, sk, 0, .1, -1.2, .06, .7, .3); tf.rotation.x = .5; b.add(tf); sh.push(tf); eyes(b, .1, .75, .22, 0x111111);
          for (let i = 0; i < 6; i++) b.add(mk(G.cone0, C(0xffffff), -.15 + i * .06, -.1, .95, .02, .07, .02, false)); } break;
      case 'falke':   // Steppenfalke
        { const fe = C(col, { r: .8 }); b.add(mk(G.sph, fe, 0, 0, 0, .26, .28, .5)); b.add(mk(G.sph, C(0xe8dcc0), 0, .18, .38, .18, .18, .2));
          const bk = mk(G.cone0, C(0xffc040), 0, .14, .58, .05, .16, .05); bk.rotation.x = Math.PI / 2; b.add(bk); eyes(b, .22, .5, .08, 0x111111); wings(1.9, fe, .05, .05); } break;
      case 'rabe':   // Morganas Rabe: schwarz, violett glühende Augen
        { const fe = C(col, { r: .4, m: .2 }); b.add(mk(G.sph, fe, 0, 0, 0, .28, .3, .52)); b.add(mk(G.sph, fe, 0, .2, .42, .2, .2, .22));
          const bk = mk(G.cone0, C(0x2a2a30), 0, .17, .7, .06, .28, .06); bk.rotation.x = Math.PI / 2; b.add(bk); eyes(b, .27, .55, .09, 0xc070ff); wings(1.9, fe, .05, .05);
          b.add(glow(0x9a4aff, 1.8, 0, 0, 0, .3)); } break;
      default: return null;
    }
    return Object.assign(fin({ root, body: b, sh }), { flap: kind !== 'scherbe' });
  }

  function walker(kind, col, boss) {
    const root = new T.Group(), b = new T.Group(); root.add(b);
    const head = new T.Group(), tail = new T.Group(), legs = []; b.add(head); b.add(tail);
    const MC = C(col, { r: .75, e: dim(col, .2), ei: 1 }), MD = C(dim(col, .6), { r: .85 });
    const leg = (x, y, z, len, th, mat, foot) => { const l = new T.Group(); l.position.set(x, y, z); l.add(mk(G.cyl, mat || MD, 0, -len / 2, 0, th, len, th)); if (foot) l.add(mk(G.sph0, mat || MD, 0, -len, .04, th * 1.3, th * .8, th * 1.6)); b.add(l); legs.push(l); return l; };
    const arm = (s, y, len, th, mat, x) => { const a = new T.Group(); a.position.set(s * (x || .45), y, 0); a.add(mk(G.cyl, mat, 0, -len / 2, 0, th, len, th)); b.add(a); legs.push(a); return a; };
    const quad = (sc, bodyMat, headMat) => {   // Vierbeiner-Grundkörper
      b.add(mk(G.sph, bodyMat, 0, .8 * sc, -.05, .44 * sc, .4 * sc, .85 * sc)); head.position.set(0, 1.0 * sc, .95 * sc); head.add(mk(G.sph, headMat || bodyMat, 0, 0, 0, .28 * sc, .26 * sc, .3 * sc));
      for (const [x, z] of [[-.24, .55], [.24, .55], [-.24, -.45], [.24, -.45]]) leg(x * sc, .62 * sc, z * sc, .62 * sc, .1 * sc, bodyMat, true);
      tail.position.set(0, .9 * sc, -.85 * sc); tail.rotation.x = -.9; };
    switch (kind) {
      case 'giftapfel': {   // Giftapfel: roter Apfel mit Fratze, dunklen Giftflecken, Blatt; trippelt auf Wurzelfüßchen
        b.add(mk(G.sph, C(col, { r: .25, m: .1 }), 0, .7, 0, .62, .58, .62)); for (let i = 0; i < 5; i++) b.add(mk(G.sph0, E(0x7ad83a, 1.2), Math.cos(i * 1.3) * .5, .6 + (i % 2) * .3, Math.sin(i * 1.3) * .5, .09, .09, .09, false));
        head.position.set(0, .8, .5); head.add(mk(G.box, C(0x1a0a0a), 0, -.1, .08, .38, .1, .08, false)); for (let i = 0; i < 5; i++) head.add(mk(G.cone0, C(0xf0f0e0), -.14 + i * .07, -.06, .12, .025, .08, .025, false)); eyes(head, .1, .1, .14, 0xc0ff40);
        b.add(mk(G.cyl0, C(0x4a3020), 0, 1.35, 0, .04, .2, .04)); { const l = mk(G.sph0, C(0x3a8a2a), .12, 1.4, 0, .16, .04, .08); l.rotation.z = -.4; b.add(l); }
        for (const [x, z] of [[-.25, .2], [.25, .2], [-.25, -.2], [.25, -.2]]) leg(x, .25, z, .25, .05, C(0x4a3020), true); break; }
      case 'jaeger': {   // Jägerschatten: Kapuzengestalt mit Axt (der Jäger, der das Herz bringen sollte)
        const sh = C(col, { r: .9, e: dim(col, .3), ei: 1, t: 1 }); b.add(mk(G.cone0, sh, 0, .95, 0, .45, 1.3, .38)); b.add(mk(G.box, sh, 0, 1.5, 0, .62, .5, .4));
        head.position.set(0, 1.95, 0); head.add(mk(G.cone0, sh, 0, .05, -.05, .3, .55, .32)); eyes(head, -.02, .2, .09, 0xff5040);
        leg(-.15, .7, 0, .7, .1, sh, true); leg(.15, .7, 0, .7, .1, sh, true); arm(-1, 1.65, .7, .09, sh, .38); const a = arm(1, 1.65, .7, .09, sh, .38);
        a.add(mk(G.cyl0, C(0x5a3a22), 0, -.75, .25, .04, .9, .04)); a.add(mk(G.box, C(0xc8c8d0, { m: .9, r: .25 }), .12, -1.1, .5, .05, .3, .26)); break; }
      case 'koenigin_s': {   // Spiegelkönigin: hohe Gestalt in dunklem Mantel, Krone, Zauberspiegel als Schild, Zepter
        const rb = C(col, { r: .5, e: dim(col, .25), ei: 1 }), gd = C(0xd8b040, { m: .9, r: .25 });
        b.add(mk(G.cone0, rb, 0, 1.0, 0, .62, 2.0, .55)); b.add(mk(G.box, rb, 0, 1.95, 0, .6, .6, .38)); b.add(mk(G.cone0, C(0x1a1020), 0, 1.0, -.25, .7, 2.1, .3));
        head.position.set(0, 2.45, 0); head.add(mk(G.sph, C(0xf0e0e8), 0, 0, 0, .22, .27, .22)); eyes(head, .02, .2, .08, 0xc070ff);
        for (let i = 0; i < 7; i++) { const a = i * .9; head.add(mk(G.cone0, gd, Math.cos(a) * .2, .32, Math.sin(a) * .2, .04, .22, .04, false)); } head.add(mk(G.tor, gd, 0, .22, 0, .2, .2, .2, false));
        head.add(mk(G.box, C(0x14101a), 0, .25, -.15, .6, .7, .04, false));   // Stehkragen
        leg(-.15, .4, 0, .4, .1, rb); leg(.15, .4, 0, .4, .1, rb);
        const al = arm(-1, 2.15, .8, .08, rb, .38); al.addm(mk(G.cyl, C(0xffffff, { m: 1, r: .03, e: 0x9a6aff, ei: .9 }), -.05, -.75, .2, .32, .04, .42)).rotation.x = Math.PI / 2; al.add(mk(G.tor, gd, -.05, -.75, .22, .3, .4, .3, false));
        const ar = arm(1, 2.15, .8, .08, rb, .38); ar.add(mk(G.cyl0, gd, 0, -.95, .15, .03, .9, .03)); ar.add(mk(G.oct, E(0xc070ff, 2.2), 0, -.5, .15, .08, .12, .08, false));
        b.add(glow(0xb080ff, 4, 0, 2, 0, .4)); break; }
      case 'affe': {   // Bandar-log: geduckter Affe, lange Arme, Ringelschwanz, helles Gesicht
        const fur = C(col, { r: .95 }); b.add(mk(G.sph, fur, 0, .95, -.05, .38, .45, .32)); head.position.set(0, 1.45, .12); head.add(mk(G.sph, fur, 0, 0, 0, .25, .24, .24));
        head.add(mk(G.sph, C(0xe0c09a), 0, -.04, .16, .17, .15, .1)); for (const s of [-1, 1]) head.add(mk(G.sph0, C(0xe0c09a), s * .24, .02, 0, .08, .1, .04)); eyes(head, .04, .23, .07, 0xffe060);
        leg(-.16, .58, 0, .5, .09, fur, true); leg(.16, .58, 0, .5, .09, fur, true); arm(-1, 1.25, 1, .08, fur, .4); arm(1, 1.25, 1, .08, fur, .4);
        tail.position.set(0, .7, -.3); for (let i = 0; i < 6; i++) tail.add(mk(G.sph0, fur, 0, Math.sin(i * .7) * .3 + i * .05, -i * .14, .06, .06, .06)); break; }
      case 'rothund': {   // Dhole – der Rote Hund aus Kiplings „Red Dog“: rötlich, dunkler buschiger Schwanz
        quad(.9, C(col, { r: .85 })); head.add(mk(G.sph, C(dim(col, .8)), 0, -.06, .26, .14, .11, .22)); for (const s of [-1, 1]) head.add(mk(G.cone0, C(col), s * .14, .24, -.05, .06, .16, .04)); eyes(head, .06, .24, .1, 0xffd040);
        tail.addm(mk(G.cone0, C(0x2a1a14), 0, -.3, 0, .14, .7, .14)).rotation.x = Math.PI; b.add(mk(G.sph0, C(0xe8d8c0), 0, .66, .5, .2, .14, .28, false)); break; }
      case 'pirat': case 'hook': {   // Piraten der Jolly Roger (Barrie): Ringelhemd, Kopftuch, Entermesser; Hook: roter Rock, Dreispitz, eiserne Hand, Locken
        const H = kind === 'hook', s = H ? 1.12 : 1, sk = C(0xe0b090, { e: 0x4a3020, ei: .35, r: .7 }), coat = H ? C(col, { r: .6, e: dim(col, .2), ei: 1 }) : C(0xf0ece4, { r: .9 }), str = C(col, { r: .8 }), pant = C(H ? 0x1a1a24 : 0x3a3a5a, { r: .9 });
        b.add(mk(G.box, coat, 0, 1.3 * s, 0, .62 * s, .74 * s, .4 * s)); if (!H) for (let i = 0; i < 3; i++) b.add(mk(G.box, str, 0, 1.08 + i * .22, 0, .64, .07, .42, false));
        else { b.add(mk(G.cone0, coat, 0, .82, 0, .5, .6, .4)); for (let i = 0; i < 4; i++) b.add(mk(G.sph0, C(0xd8b040, { m: .9, r: .3 }), .12, 1.12 + i * .14, .22, .035, .035, .02, false)); b.add(mk(G.box, C(0xf0ece4), 0, 1.58, .2, .2, .16, .04, false)); }
        b.add(mk(G.box, C(0x2a1a12), 0, .98 * s, 0, .64 * s, .1, .42 * s, false));
        head.position.set(0, 1.92 * s, 0); head.add(mk(G.sph, sk, 0, 0, 0, .24, .26, .23)); eyes(head, .04, .2, .08, H ? 0xff3030 : 0x2a1a12, .9);
        if (H) { const hat = mk(G.cyl, C(0x14101a), 0, .22, 0, .42, .1, .34); head.add(hat); head.add(mk(G.cone0, C(0x14101a), 0, .34, 0, .2, .2, .18)); head.add(mk(G.box, C(0xf0f0f0), .02, .4, .26, .05, .05, .02, false));
          for (const k of [-1, 1]) for (let i = 0; i < 3; i++) head.add(mk(G.sph0, C(0x0a0808), k * .22, -.08 - i * .12, -.04, .08, .1, .08, false)); head.add(mk(G.box, C(0x0a0808), 0, -.06, .21, .16, .03, .03, false)); }
        else { head.add(mk(G.sph, C(col), 0, .12, -.02, .25, .16, .25)); head.add(mk(G.cone0, C(col), -.05, .05, -.27, .06, .2, .04)); head.add(mk(G.tor, C(0xd8b040, { m: .9 }), .23, -.04, 0, .05, .05, .02, false)); }
        leg(-.15, .92 * s, 0, .9 * s, .1, pant, true); leg(.15, .92 * s, 0, .9 * s, .1, pant, true); arm(-1, 1.6 * s, .7, .09, coat, .4 * s); const a = arm(1, 1.6 * s, .7, .09, coat, .4 * s);
        a.add(mk(G.box, C(0xd8dce4, { m: .95, r: .2 }), 0, -1.05, .3, .05, .9, .14)); a.add(mk(G.box, C(0xd8b040, { m: .9 }), 0, -.66, .2, .2, .05, .08));
        if (H) { const l = legs[legs.length - 2]; l.add(mk(G.tor, C(0xc8ccd4, { m: 1, r: .15 }), 0, -.82, .12, .12, .12, .1, false)); b.add(glow(0xff4a3a, 3.6, 0, 1.4, 0, .35)); }
        break; }
      case 'krokodil': {   // Das Tick-Tack-Krokodil: langes Maul, Rückenzacken, im Bauch tickt der verschluckte Wecker
        const sc = 1.1, sk = C(col, { r: .8, e: dim(col, .2), ei: 1 }), bl = C(dim(col, .7));
        b.add(mk(G.sph, sk, 0, .5, -.1, .55, .32, 1.25)); head.position.set(0, .55, 1.15); head.add(mk(G.box, sk, 0, 0, .35, .4, .2, .9)); head.add(mk(G.box, bl, 0, -.13, .35, .38, .08, .86));
        for (let i = 0; i < 6; i++) for (const k of [-1, 1]) head.add(mk(G.cone0, C(0xf4f0e0), k * .17, -.05, .05 + i * .14, .025, .07, .025, false)); for (const k of [-1, 1]) head.add(mk(G.sph0, sk, k * .14, .14, -.02, .09, .09, .09)); eyes(head, .2, .02, .14, 0xffd040);
        for (let i = 0; i < 7; i++) b.add(mk(G.cone0, bl, 0, .82, .7 - i * .26, .08, .2, .1, false));
        for (const [x, z] of [[-.42, .55], [.42, .55], [-.42, -.6], [.42, -.6]]) { const l = leg(x, .35, z, .35, .1, sk, true); l.rotation.z = x > 0 ? -.5 : .5; }
        tail.position.set(0, .45, -1.25); tail.rotation.x = -1.45; tail.addm(mk(G.cone0, sk, 0, -.75, 0, .28, 1.6, .18)).rotation.x = Math.PI;
        const tick = mk(G.sph0, C(0xffe080, { e: 0xffc040, ei: 2 }), 0, .45, .1, .16, .16, .16, false); b.add(tick); b.add(glow(0xffd060, 2.2, 0, .5, .1, .4)); break; }
      case 'karte': {   // Kartensoldat der Herzkönigin (nach Tenniel): flacher Kartenkörper mit Herz oder Pik, Kopf, Arme, Hellebarde
        const wt = C(0xf4f0e6, { r: .7 }), sy = C(col, { r: .6, e: dim(col, .3), ei: 1 }), dk = C(0x1a1414);
        b.add(mk(G.box, wt, 0, 1.3, 0, .9, 1.25, .1)); for (const [x, y] of [[0, 1.35], [-.28, 1.75], [.28, .88]]) { b.add(mk(G.sph0, sy, x - .06, y + .05, .07, .09, .09, .03, false)); b.add(mk(G.sph0, sy, x + .06, y + .05, .07, .09, .09, .03, false)); const c = mk(G.cone0, sy, x, y - .05, .07, .12, .14, .03, false); c.rotation.z = Math.PI; b.add(c); }
        b.add(mk(G.box, sy, 0, 1.3, -.06, .92, 1.27, .02, false)); head.position.set(0, 2.15, 0); head.add(mk(G.sph, C(0xf0d8c0, { e: 0x4a3028, ei: .35, r: .7 }), 0, 0, 0, .2, .22, .2)); head.add(mk(G.cyl, sy, 0, .2, 0, .17, .12, .17)); eyes(head, .02, .18, .07, 0x1a1a1a, .8);
        leg(-.18, .7, 0, .7, .07, dk, true); leg(.18, .7, 0, .7, .07, dk, true); arm(-1, 1.75, .6, .06, wt, .5); const a = arm(1, 1.75, .6, .06, wt, .5);
        a.add(mk(G.cyl0, C(0x6a4a2a), 0, -.6, .1, .03, 2, .03)); a.add(mk(G.cone0, C(0xc8ccd4, { m: .9, r: .25 }), 0, .45, .1, .1, .35, .03)); break; }
      case 'hase': {   // Weißes Kaninchen: aufrecht, lange Ohren, Weste, Taschenuhr
        const fur = C(col, { r: .9 }), vest = C(0xc83a3a, { r: .7 });
        b.add(mk(G.sph, fur, 0, .95, 0, .34, .45, .3)); b.add(mk(G.box, vest, 0, 1.05, .12, .5, .45, .2)); b.add(mk(G.cyl, C(0xd8b040, { m: .9, r: .3 }), .14, 1.05, .24, .07, .02, .07)).rotation.x = 1.57;
        head.position.set(0, 1.55, 0); head.add(mk(G.sph, fur, 0, 0, 0, .22, .22, .22)); head.add(mk(G.sph0, C(0xf0b0b0), 0, -.04, .2, .04, .03, .03, false)); eyes(head, .05, .19, .08, 0xd82a3a, .9);
        for (const k of [-1, 1]) { const e = mk(G.sph, fur, k * .09, .42, -.02, .06, .3, .04); e.rotation.z = -k * .12; head.add(e); head.add(mk(G.sph0, C(0xf0b0b0), k * .09, .42, .0, .035, .24, .02, false)); }
        leg(-.12, .55, 0, .55, .08, fur, true); leg(.12, .55, 0, .55, .08, fur, true); arm(-1, 1.25, .45, .06, fur, .3); arm(1, 1.25, .45, .06, fur, .3); break; }
      case 'herzkoenigin': {   // Herzkönigin: breites Kleid mit Herzen, Krone, Zepter mit Herz; „Kopf ab!“
        const rb = C(col, { r: .55, e: dim(col, .25), ei: 1 }), bk = C(0x1a1414, { r: .6 }), gd = C(0xd8b040, { m: .9, r: .25 });
        b.add(mk(G.cone0, rb, 0, .95, 0, .85, 1.9, .75)); for (let i = 0; i < 6; i++) { const a = i * 1.047; b.add(mk(G.sph0, C(0xf4f0e6), Math.sin(a) * .62, .7, Math.cos(a) * .55, .12, .12, .04, false)); }
        b.add(mk(G.box, bk, 0, 1.95, 0, .66, .55, .42)); b.add(mk(G.box, C(0xf4f0e6), 0, 2.15, .2, .5, .14, .05, false));
        head.position.set(0, 2.55, 0); head.add(mk(G.sph, C(0xf0d8c8, { e: 0x4a3028, ei: .35, r: .7 }), 0, 0, 0, .26, .28, .25)); eyes(head, .03, .22, .09, 0x3a1a1a); head.add(mk(G.cyl, gd, 0, .3, 0, .2, .16, .2)); for (let i = 0; i < 5; i++) head.add(mk(G.cone0, gd, Math.cos(i * 1.26) * .18, .44, Math.sin(i * 1.26) * .18, .04, .12, .04, false));
        leg(-.2, .5, 0, .5, .1, bk, true); leg(.2, .5, 0, .5, .1, bk, true); arm(-1, 2.1, .75, .09, rb, .45); const a = arm(1, 2.1, .75, .09, rb, .45);
        a.add(mk(G.cyl0, gd, 0, -.85, .15, .04, 1.2, .04)); a.add(mk(G.sph0, C(0xd82a3a, { e: 0xa01020, ei: 1.4 }), -.06, -.25, .15, .1, .1, .06, false)); a.add(mk(G.sph0, C(0xd82a3a, { e: 0xa01020, ei: 1.4 }), .06, -.25, .15, .1, .1, .06, false));
        b.add(glow(0xff3a4a, 4, 0, 1.6, 0, .35)); break; }
      case 'tiger': {   // Shere Khan: großer Tiger mit schwarzen Streifen, heller Schnauze, hinkt (Lungri, der Lahme)
        const sc = 1.05, fur = C(col, { r: .7, e: dim(col, .2), ei: 1 }), st = C(0x15100c); quad(sc, fur);
        for (let i = 0; i < 7; i++) for (const s of [-1, 1]) { const r = mk(G.box, st, s * .38, .88, .55 - i * .2, .06, .34, .05, false); r.rotation.z = s * .5; b.add(r); }
        head.add(mk(G.sph, C(0xf4ecdc), 0, -.08, .22, .18, .13, .16)); head.add(mk(G.sph0, C(0x2a1a14), 0, .0, .38, .06, .05, .04, false)); for (const s of [-1, 1]) { head.add(mk(G.sph0, fur, s * .2, .24, -.05, .08, .08, .05)); head.add(mk(G.box, st, s * .12, .12, .2, .03, .14, .04, false)); }
        eyes(head, .08, .26, .13, 0xb8ff40); tail.addm(mk(G.cone0, fur, 0, -.45, 0, .07, .95, .07)).rotation.x = Math.PI; for (let i = 0; i < 3; i++) tail.add(mk(G.tor, st, 0, -.25 - i * .25, 0, .08, .08, .08, false));
        if (boss) b.add(glow(0xff8a2a, 4, 0, 1, 0, .35)); break; }
      case 'ratte': {   // Pariser Kanalratte
        const fur = C(col, { r: .9 }); b.add(mk(G.sph, fur, 0, .35, 0, .26, .22, .45)); head.position.set(0, .4, .45); head.addm(mk(G.cone0, fur, 0, 0, .1, .14, .3, .14)).rotation.x = Math.PI / 2;
        for (const s of [-1, 1]) head.add(mk(G.sph0, C(0xe8a0a8), s * .1, .12, -.02, .07, .07, .02)); eyes(head, .05, .1, .06, 0xff3020);
        for (const [x, z] of [[-.13, .25], [.13, .25], [-.13, -.2], [.13, -.2]]) leg(x, .2, z, .2, .035, C(0xe8a0a8), true);
        tail.position.set(0, .35, -.42); tail.rotation.x = -.3; tail.addm(mk(G.cyl0, C(0xd8909a), 0, 0, -.35, .025, .7, .025)).rotation.x = Math.PI / 2; break; }
      case 'wache': case 'schattenritter': case 'spartoi': case 'riese': {   // Zweibeiner mit Waffe
        const K = kind, ar = K === 'spartoi' ? C(0xe8e0cc, { r: .7 }) : K === 'riese' ? C(col, { r: .95 }) : C(col, { m: .75, r: .3, e: dim(col, .2), ei: 1 }), dk = K === 'spartoi' ? C(0xd8d0bc) : C(dim(col, .5), { m: .4, r: .6 });
        const s = K === 'riese' ? 1.45 : 1;
        if (K === 'spartoi') { for (let i = 0; i < 4; i++) b.add(mk(G.tor, ar, 0, 1.15 + i * .14, 0, .2, .2, .16, false)); b.add(mk(G.cyl0, ar, 0, 1.35, 0, .05, .7, .05)); b.add(mk(G.box, C(0xb08a3a, { m: .8, r: .3 }), 0, .95, 0, .38, .14, .26)); }
        else b.add(mk(G.box, ar, 0, 1.35 * s, 0, .72 * s, .78 * s, .46 * s));
        if (K === 'wache') b.add(mk(G.box, C(0x2a3a8a), 0, 1.35, .24, .4, .55, .02, false));
        if (K === 'riese') { b.add(mk(G.sph, ar, 0, 1.1 * s, .1, .5 * s, .4 * s, .4 * s)); b.add(mk(G.box, C(0x6a4a2a), 0, .95 * s, 0, .8 * s, .3 * s, .5 * s)); }
        head.position.set(0, (K === 'spartoi' ? 1.92 : 1.95 * s), 0);
        if (K === 'spartoi') { head.add(mk(G.sph, ar, 0, 0, 0, .2, .23, .2)); head.add(mk(G.box, C(0x1a1410), 0, -.02, .17, .2, .06, .06, false)); eyes(head, .04, .18, .07, 0x80ffb0);
          head.add(mk(G.sph0, C(0xb08a3a, { m: .85, r: .3 }), 0, .1, 0, .24, .2, .25)); head.add(mk(G.box, C(0xc83a2a), 0, .32, -.02, .05, .2, .42, false)); }
        else if (K === 'riese') { head.add(mk(G.sph, ar, 0, 0, 0, .34 * s, .34 * s, .32 * s)); eyes(head, .05, .3 * s, .12 * s, 0xffd040, 1.4); head.add(mk(G.sph0, C(0x5a3a1a), 0, -.18, .24, .25, .15, .1)); }
        else { head.add(mk(G.sph, ar, 0, 0, 0, .25, .27, .25)); head.add(mk(G.box, C(0x0a0a10), 0, .02, .2, .3, .05, .08, false)); eyes(head, .02, .24, .07, K === 'schattenritter' ? 0xff3030 : 0xffe080);
          if (K === 'wache') { head.add(mk(G.cone0, ar, 0, .22, 0, .32, .25, .32)); head.add(mk(G.box, ar, 0, .14, 0, .62, .04, .2, false)); }
          else { const pl = mk(G.sph0, C(boss ? 0xc8202a : 0x3a2a4a, { e: boss ? 0x6a0a10 : 0x1a0a2a, ei: 1 }), 0, .38, -.12, .06, .25, .3, false); head.add(pl); } }
        leg(-.19 * s, .78 * s, 0, .78 * s, (K === 'spartoi' ? .05 : .14) * s, dk, true); leg(.19 * s, .78 * s, 0, .78 * s, (K === 'spartoi' ? .05 : .14) * s, dk, true);
        const al = arm(-1, 1.62 * s, .72 * s, (K === 'spartoi' ? .04 : .11) * s, ar, .48 * s), ax = arm(1, 1.62 * s, .72 * s, (K === 'spartoi' ? .04 : .11) * s, ar, .48 * s);
        if (K === 'wache') { ax.add(mk(G.cyl0, C(0x5a3a22), 0, -.4, .3, .03, 2.2, .03)); ax.add(mk(G.box, C(0xc8c8d0, { m: .9 }), .1, .62, .3, .25, .3, .03)); }
        if (K === 'schattenritter') { ax.add(mk(G.box, C(0xd0d8e8, { m: 1, r: .2 }), 0, -.8, .5, .06, .08, 1.2)); al.add(mk(G.box, C(dim(col, .9), { m: .6 }), -.1, -.5, .15, .08, .7, .5)); al.add(mk(G.box, E(boss ? 0xc8202a : 0x6a2aa8, 1.2), -.15, -.45, .16, .02, .3, .2, false)); }
        if (K === 'spartoi') { ax.add(mk(G.cyl0, C(0x6a4a2a), 0, -.4, .25, .03, 1.9, .03)); ax.add(mk(G.cone0, C(0xb08a3a, { m: .9 }), 0, .6, .25, .05, .2, .05, false)); const sd = mk(G.cyl, C(0xb08a3a, { m: .8, r: .35 }), -.12, -.45, .1, .4, .06, .4); sd.rotation.z = Math.PI / 2; al.add(sd); }
        if (K === 'riese') { ax.add(mk(G.cyl, C(0x5a3a22), 0, -.95 * s, .25, .12 * s, 1.1 * s, .12 * s)); ax.add(mk(G.sph, C(0x4a2a12), 0, -1.55 * s, .3, .22 * s, .3 * s, .22 * s)); }
        if (kind === 'schattenritter' && !boss) b.add(glow(0x6a2aa8, 2, 0, 1.4, 0, .25));
        break; }
      case 'wasserspeier': {   // Wasserspeier: geduckte Steinfigur mit Flügeln, Hörnern, Schwanz
        const st = C(col, { r: 1 }); b.add(mk(G.sph, st, 0, .95, 0, .5, .55, .45)); head.position.set(0, 1.55, .3); head.add(mk(G.sph, st, 0, 0, 0, .3, .28, .32));
        for (const s of [-1, 1]) { const h = mk(G.cone0, C(dim(col, .7)), s * .16, .28, -.08, .06, .32, .06); h.rotation.set(-.5, 0, -s * .3); head.add(h); }
        head.add(mk(G.box, C(0x1a1418), 0, -.1, .28, .24, .08, .06, false)); eyes(head, .06, .28, .11, 0xffa040, 1.2);
        leg(-.24, .55, .1, .55, .13, st, true); leg(.24, .55, .1, .55, .13, st, true); arm(-1, 1.3, .7, .1, st, .45); arm(1, 1.3, .7, .1, st, .45);
        for (const s of [-1, 1]) { const w = mk(G.sph0, C(dim(col, .85), { r: 1 }), s * .75, 1.45, -.35, .85, .07, .5); w.rotation.set(.4, 0, s * .55); b.add(w); }
        tail.position.set(0, .7, -.4); tail.addm(mk(G.cone0, st, 0, -.35, 0, .08, .8, .08)).rotation.x = Math.PI; break; }
      case 'elefant': {   // Hathi: großer grauer Elefant mit Rüssel, Stoßzähnen und weiten Ohren
        const hide = C(col, { r: .9, e: dim(col, .18), ei: 1 }); b.add(mk(G.sph, hide, 0, 1.55, -.05, .85, .8, 1.15)); head.position.set(0, 1.85, 1.05); head.add(mk(G.sph, hide, 0, 0, 0, .5, .52, .5));
        for (let i = 0; i < 5; i++) { const t = mk(G.cyl0, hide, 0, -.3 - i * .26, .42 + i * .04, .17 - i * .022, .3, .17 - i * .022); t.rotation.x = .25 - i * .08; head.add(t); }
        for (const s of [-1, 1]) { const e = mk(G.sph, C(dim(col, .85), { r: .95 }), s * .52, .02, -.14, .08, .5, .42); e.rotation.y = s * .35; head.add(e); const t = mk(G.cone0, C(0xf4ecd8), s * .2, -.32, .36, .06, .55, .06); t.rotation.set(-1.9, 0, -s * .2); head.add(t); }
        eyes(head, .2, .36, .12, 0x2a1a10);
        for (const [x, z] of [[-.45, .6], [.45, .6], [-.45, -.6], [.45, -.6]]) leg(x, 1.05, z, 1.05, .22, hide, true); tail.position.set(0, 1.4, -1.15); tail.add(mk(G.cyl0, hide, 0, -.3, 0, .03, .6, .03)); break; }
      case 'eber': {   // Erymanthischer Eber: massig, Borsten, Hauer
        const fur = C(col, { r: .95 }); b.add(mk(G.sph, fur, 0, .85, -.05, .55, .55, .9)); head.position.set(0, .95, .85); head.add(mk(G.sph, fur, 0, 0, 0, .34, .32, .36)); head.addm(mk(G.cyl, C(0xc89090), 0, -.06, .36, .14, .1, .14)).rotation.x = Math.PI / 2;
        for (const s of [-1, 1]) { const t = mk(G.cone0, C(0xf4ecd8), s * .18, -.12, .3, .04, .3, .04); t.rotation.set(-1.2, 0, s * .5); head.add(t); } eyes(head, .1, .28, .14, 0xff6020);
        for (let i = 0; i < 8; i++) b.add(mk(G.cone0, C(0x2a1a10), 0, 1.38, .5 - i * .15, .05, .25, .05, false));
        for (const [x, z] of [[-.28, .5], [.28, .5], [-.28, -.45], [.28, -.45]]) leg(x, .5, z, .5, .1, fur, true); tail.position.set(0, .9, -.9); tail.add(mk(G.cyl0, fur, 0, -.2, 0, .03, .3, .03)); break; }
      case 'loewe': {   // Nemeischer Löwe: goldenes Fell, mächtige Mähne
        const fur = C(col, { r: .6, m: .2, e: dim(col, .25), ei: 1 }); quad(1.15, fur);
        head.add(mk(G.sph, C(0x8a4a1a, { r: .95 }), 0, .02, -.1, .5, .5, .38)); head.add(mk(G.sph, fur, 0, 0, .14, .27, .26, .26)); head.add(mk(G.sph, C(0xf0dca0), 0, -.08, .34, .14, .11, .12)); eyes(head, .07, .36, .11, 0xffe040);
        for (let i = 0; i < 10; i++) { const a = i * .63, m = mk(G.cone0, C(0x9a5a20), Math.cos(a) * .42, Math.sin(a) * .42, -.1, .1, .3, .1, false); m.rotation.z = a - Math.PI / 2; head.add(m); }
        tail.add(mk(G.cyl0, fur, 0, -.45, 0, .05, .9, .05)); tail.add(mk(G.sph0, C(0x8a4a1a), 0, -.92, 0, .1, .14, .1)); b.add(glow(0xffd060, 4, 0, 1, 0, .3)); break; }
      case 'hydra': {   // Hydra: schuppiger Leib mit fünf Hälsen und Köpfen
        const sk = C(col, { r: .5, e: dim(col, .25), ei: 1 }); b.add(mk(G.sph, sk, 0, .9, 0, .8, .65, 1)); head.position.set(0, 1.2, .5);
        for (let i = 0; i < 5; i++) { const a = (i - 2) * .38, n = new T.Group(); n.rotation.set(-.5 + Math.abs(i - 2) * .12, a, 0); head.add(n);
          n.add(mk(G.cyl, sk, 0, .7, 0, .13, 1.4, .13)); n.add(mk(G.sph, sk, 0, 1.45, .1, .22, .18, .3)); eyes(n, 1.52, .32, .09, 0xffe040); n.add(mk(G.cone0, C(0xf0f0e0), 0, 1.4, .38, .03, .1, .03, false)); }
        for (const [x, z] of [[-.5, .45], [.5, .45], [-.5, -.5], [.5, -.5]]) leg(x, .55, z, .55, .16, sk, true); tail.position.set(0, .85, -.95); tail.rotation.x = -1.3; tail.addm(mk(G.cone0, sk, 0, -.6, 0, .22, 1.3, .22)).rotation.x = Math.PI;
        for (let i = 0; i < 6; i++) b.add(mk(G.cone0, C(0x2a5a2a), 0, 1.5, .6 - i * .25, .08, .3, .08, false)); b.add(glow(0x6aff8a, 4, 0, 1.4, 0, .3)); break; }
      case 'polyp': case 'meerhexe': {   // Polyp (Krake) und Meerhexe (Oberkörper auf Polypenleib)
        const sk = C(col, { r: .35, e: dim(col, .3), ei: 1 }), K = kind === 'meerhexe';
        b.add(mk(G.sph, sk, 0, K ? .65 : .95, 0, .55, K ? .4 : .6, .55)); for (let i = 0; i < 8; i++) { const a = i * .785; if (i % 2 === 0) continue; const t = mk(G.cyl0, sk, Math.cos(a) * .5, .35, Math.sin(a) * .5, .07, .8, .07); t.rotation.set(Math.sin(a) * .9, 0, -Math.cos(a) * .9); b.add(t); }
        for (const [x, z] of [[-.45, .35], [.45, .35], [-.45, -.35], [.45, -.35]]) { const l = leg(x, .55, z, .7, .08, sk); l.rotation.z = x > 0 ? -.8 : .8; }
        if (K) { const rb = C(0x2a1a3a, { r: .6 }); b.add(mk(G.box, rb, 0, 1.3, 0, .55, .7, .36)); head.position.set(0, 1.9, 0); head.add(mk(G.sph, C(0xb8c8a8), 0, 0, 0, .22, .26, .22)); eyes(head, .03, .2, .08, 0xb0ff60);
          for (let i = 0; i < 8; i++) { const h = mk(G.cyl0, C(0xe8e8f0), Math.cos(i) * .18, -.1, Math.sin(i) * .15 - .1, .03, .7, .03); h.rotation.x = .3; head.add(h); }
          const arm2 = new T.Group(); arm2.position.set(.38, 1.5, 0); arm2.add(mk(G.cyl, rb, 0, -.3, 0, .07, .6, .07)); arm2.add(mk(G.sph, E(0x8aff4a, 2.2), 0, -.65, .15, .12, .12, .12, false)); b.add(arm2); b.add(glow(0x8aff4a, 3.4, .4, .9, .2, .4)); }
        else { head.position.set(0, 1.2, .4); eyes(head, 0, .12, .16, 0xffe040, 1.4); }
        break; }
      case 'reiter': {   // Steppenreiter: Pferd (vier Beine) mit Reiter, Lanze und Wimpel
        const hc = C(col, { r: .8 }), ro = C(boss ? 0x5a1a1a : 0x4a3a2a, { r: .8 }), mt = C(0x8a8a92, { m: .7, r: .35 });
        b.add(mk(G.sph, hc, 0, 1.15, 0, .42, .45, .95)); const nk = mk(G.cyl, hc, 0, 1.6, .75, .17, .7, .2); nk.rotation.x = .6; b.add(nk);
        head.position.set(0, 1.95, 1.05); head.add(mk(G.box, hc, 0, 0, .15, .22, .26, .55)); eyes(head, .08, .2, .11, 0x111111); head.add(mk(G.box, C(0x1a1410), 0, .2, -.15, .06, .25, .45, false));
        for (const [x, z] of [[-.22, .65], [.22, .65], [-.22, -.6], [.22, -.6]]) leg(x, .95, z, .95, .08, hc, true);
        b.add(mk(G.box, ro, 0, 2.05, -.05, .5, .65, .34)); b.add(mk(G.sph, C(0xd8b090), 0, 2.6, 0, .17, .2, .17)); b.add(mk(G.cone0, mt, 0, 2.85, 0, .2, .3, .2));
        const ln = mk(G.cyl0, C(0x5a3a22), .3, 2.2, .7, .03, 2.6, .03); ln.rotation.x = 1.2; b.add(ln); b.add(mk(G.box, C(boss ? 0xc8202a : 0x8a6a2a), .3, 2.85, -.4, .02, .35, .45, false));
        tail.position.set(0, 1.3, -.95); tail.addm(mk(G.cone0, C(0x1a1410), 0, -.3, 0, .1, .7, .1)).rotation.x = Math.PI; break; }
      case 'steppenwolf': {
        quad(.95, C(col, { r: .9 })); head.add(mk(G.sph, C(dim(col, .8)), 0, -.06, .26, .14, .12, .22)); for (const s of [-1, 1]) head.add(mk(G.cone0, C(col), s * .14, .24, -.05, .06, .18, .04)); eyes(head, .06, .24, .1, 0xc8e0ff);
        tail.addm(mk(G.cone0, C(col), 0, -.3, 0, .13, .7, .13)).rotation.x = Math.PI; b.add(mk(G.sph0, C(0xf0f0f4), 0, .7, .5, .22, .16, .3, false)); break; }
      default: return null;
    }
    if (boss) root.add(glow(0xfff0a0, 1.2, 0, .2, 0, .25));
    return fin({ root, body: b, head, legs, tail });
  }

  const make = (kind, col, boss) => HOVER.has(kind) ? hover(kind, col) : walker(kind, col, boss);
  return { make, has: k => HOVER.has(k) || ['karte', 'hase', 'herzkoenigin', 'pirat', 'hook', 'krokodil', 'giftapfel', 'jaeger', 'koenigin_s', 'affe', 'rothund', 'tiger', 'ratte', 'wache', 'schattenritter', 'spartoi', 'riese', 'wasserspeier', 'eber', 'elefant', 'loewe', 'hydra', 'polyp', 'meerhexe', 'reiter', 'steppenwolf'].includes(k), HOVER };
}
