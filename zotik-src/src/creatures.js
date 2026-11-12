// Eigene Gegner je Welt: jede Welt hat eigene Körperformen statt umgefärbter Riftlinge/Wölfe.
// Schwebende Fernkämpfer (base 'rift') liefern {root, body, sh}, Nahkämpfer (base 'wolf') {root, body, head, legs[4], tail} –
// genau das, was die Animation in main.js bewegt (sh kreisen, legs[0]/[3] gegen legs[1]/[2], tail, head).
export function createCreatures({ T, mk, G, M, glow, mergeStatic }) {
  const C = (h, o) => M(h, o), E = (h, i) => M(h, { e: h, ei: i ?? 1.6 });
  const dim = (h, k) => { const c = new T.Color(h); c.multiplyScalar(k); return c.getHex(); };
  const eyes = (g, y, z, sx, col) => { for (const s of [-1, 1]) g.add(mk(G.sph0, E(col || 0xffffff, 2.2), s * sx, y, z, .06, .07, .04, false)); };
  const fin = (r) => { mergeStatic(r.body, new Set([r.head, ...(r.legs || []), r.tail, ...(r.sh || [])].filter(Boolean))); return r; };

  // ---------- schwebende Fernkämpfer ----------
  function hover(kind, col) {
    const root = new T.Group(), b = new T.Group(); root.add(b); const sh = [];
    const orb = (n, g, mat, s) => { for (let i = 0; i < n; i++) { const m = mk(g, mat, 0, 0, 0, s[0], s[1], s[2], false); b.add(m); sh.push(m); } };
    switch (kind) {
      case 'pilz':   // Pilzling: Hut mit Punkten, Stiel, Sporen
        b.add(mk(G.cyl, C(0xf0e6d0), 0, -.25, 0, .2, .55, .2)); b.add(mk(G.sph, C(col, { r: .6 }), 0, .1, 0, .6, .32, .6));
        for (let i = 0; i < 6; i++) { const a = i * 1.05; b.add(mk(G.sph0, C(0xffffff), Math.cos(a) * .38, .25, Math.sin(a) * .38, .08, .05, .08, false)); }
        eyes(b, -.15, .2, .09, 0x222222); orb(3, G.sph0, E(dim(col, 1.2), 2), [.08, .08, .08]); b.add(glow(col, 1.6, 0, 0, 0, .4)); break;
      case 'schleim':   // Kanalschleim: Tropfen mit Kern
        b.add(mk(G.sph, C(col, { r: .25, t: 1 }), 0, 0, 0, .62, .5, .62)); b.add(mk(G.oct, E(0xd8ffb0, 2), 0, 0, 0, .18, .22, .18, false));
        eyes(b, .12, .5, .16); orb(4, G.sph0, C(col, { r: .2 }), [.12, .12, .12]); b.add(glow(col, 2, 0, 0, 0, .45)); break;
      case 'geist':   // Sand-/Eisgeist: Schleier-Kegel mit Kopf
        { const k = mk(G.cone0, C(col, { r: .9, e: dim(col, .4), ei: 1 }), 0, -.2, 0, .5, 1.2, .5); k.rotation.x = Math.PI; b.add(k); }
        b.add(mk(G.sph, C(col, { e: dim(col, .5), ei: 1 }), 0, .45, 0, .32, .34, .32)); eyes(b, .5, .27, .11, 0x111111);
        orb(4, kind === 'geist' && col > 0xa0a0a0 ? G.oct : G.box, E(dim(col, 1.1), 1.4), [.1, .16, .1]); b.add(glow(col, 2.2, 0, .2, 0, .4)); break;
      case 'qualle':   // Leuchtqualle: Schirm und Tentakel
        b.add(mk(G.sph, C(col, { r: .2, e: col, ei: .8, t: 1 }), 0, .2, 0, .6, .38, .6));
        for (let i = 0; i < 7; i++) { const a = i * .9; b.add(mk(G.cyl0, E(col, 1.2), Math.cos(a) * .32, -.35, Math.sin(a) * .32, .03, .8, .03, false)); }
        orb(4, G.sph0, E(0xffffff, 2.4), [.07, .07, .07]); b.add(glow(col, 2.6, 0, 0, 0, .55)); break;
      case 'funke':   // Funkengeist: glühender Kern mit Funken
        b.add(mk(G.ico, E(col, 2.4), 0, 0, 0, .45, .45, .45)); b.add(mk(G.sph0, E(0xfff0a0, 3), 0, 0, 0, .22, .22, .22, false));
        orb(5, G.oct, E(0xffd040, 3), [.08, .14, .08]); b.add(glow(col, 3, 0, 0, 0, .7)); break;
      case 'falter':   // Schattenfalter: Körper mit großen Flügeln
        b.add(mk(G.cyl, C(0x1a1430), 0, 0, 0, .1, .7, .1));
        for (const s of [-1, 1]) { const w = mk(G.sph0, C(col, { e: dim(col, .6), ei: 1.2, t: 1 }), s * .45, .1, 0, .45, .55, .04); w.rotation.z = s * .3; b.add(w);
          const w2 = mk(G.sph0, C(dim(col, .7), { e: dim(col, .5), ei: 1 }), s * .35, -.3, 0, .28, .3, .04); w2.rotation.z = -s * .4; b.add(w2); }
        eyes(b, .3, .08, .05, 0xfff0ff); orb(3, G.sph0, E(col, 2), [.05, .05, .05]); b.add(glow(col, 2, 0, 0, 0, .4)); break;
      case 'stern':   // Sternenwächter: Stern mit Strahlen
        b.add(mk(G.oct, E(col, 1.8), 0, 0, 0, .35, .5, .35));
        for (let i = 0; i < 6; i++) { const r = mk(G.cone0, E(0xfff6d0, 2), 0, 0, 0, .1, .55, .1, false); r.rotation.z = i * 1.047; r.position.set(Math.sin(i * 1.047) * -.45, Math.cos(i * 1.047) * .45, 0); b.add(r); }
        orb(4, G.oct, E(0xfff0b0, 2.6), [.07, .1, .07]); b.add(glow(col, 2.8, 0, 0, 0, .6)); break;
      case 'spiegel':   // Spiegelspinne: Prisma mit Spiegelsplittern und Beinchen
        b.add(mk(G.oct, C(0xe8f0ff, { m: .9, r: .1, e: col, ei: .6 }), 0, 0, 0, .35, .55, .35));
        for (let i = 0; i < 8; i++) { const a = i * .785, l = mk(G.cyl0, C(0xc8d0e8, { m: .8, r: .2 }), Math.cos(a) * .42, -.2, Math.sin(a) * .42, .025, .5, .025, false); l.rotation.set(Math.sin(a) * .7, 0, -Math.cos(a) * .7); b.add(l); }
        orb(4, G.box, C(0xffffff, { m: 1, r: .05, e: col, ei: .8 }), [.22, .3, .02]); b.add(glow(col, 2, 0, 0, 0, .4)); break;
      default: return null;
    }
    return fin({ root, body: b, sh });
  }

  // ---------- Läufer (Vierbeiner, Zweibeiner, Krabben …) ----------
  function walker(kind, col, boss) {
    const root = new T.Group(), b = new T.Group(); root.add(b);
    const head = new T.Group(), tail = new T.Group(), legs = []; b.add(head); b.add(tail);
    const MC = C(col, { r: .7, e: dim(col, .25), ei: 1 }), MD = C(dim(col, .6), { r: .8 }), AC = E(boss ? 0xfff0a0 : 0xffffff, boss ? 2.6 : 2);
    const leg = (x, y, z, len, th, mat, foot) => { const l = new T.Group(); l.position.set(x, y, z); l.add(mk(G.cyl, mat || MD, 0, -len / 2, 0, th, len, th)); if (foot) l.add(mk(G.sph0, mat || MD, 0, -len, .04, th * 1.3, th * .8, th * 1.6)); b.add(l); legs.push(l); return l; };
    // Flügel, die mit legs[2]/[3] auf und ab schlagen (Drehung um die Längsachse)
    const wing = (s, y, z, w, mat) => { const p = new T.Group(); p.position.set(s * .3, y, z); p.rotation.y = Math.PI / 2; b.add(p); const l = new T.Group(); p.add(l);
      const m = mk(G.sph0, mat, 0, 0, s * w * .5, w * .3, .06, w * .55); l.add(m); legs.push(l); return l; };
    switch (kind) {
      case 'thornwolf': case 'frostwolf': case 'sphinx': {   // Vierbeiner mit Kopf und Schwanz
        b.add(mk(G.sph, MC, 0, .8, -.05, .42, .38, .8)); b.add(mk(G.sph, MD, 0, .82, .55, .36, .36, .4));
        head.position.set(0, 1.0, .95); head.add(mk(G.sph, MC, 0, 0, 0, .26, .24, .3)); head.add(mk(G.sph, MD, 0, -.07, .27, .13, .11, .24)); eyes(head, .07, .24, .12, kind === 'frostwolf' ? 0x80e0ff : 0xffd040);
        for (const [x, z] of [[-.22, .55], [.22, .55], [-.22, -.4], [.22, -.4]]) leg(x, .62, z, .62, .09, MC, true);
        tail.position.set(0, .88, -.8); tail.rotation.x = -.9; tail.addm(mk(G.cone0, MC, 0, -.3, 0, .12, .7, .12)).rotation.x = Math.PI;
        if (kind === 'thornwolf') for (let i = 0; i < 7; i++) { const t = mk(G.cone0, C(0x3a6a2a), 0, 1.15, .45 - i * .17, .07, .32, .07); t.rotation.x = -.4; b.add(t); }
        if (kind === 'frostwolf') for (let i = 0; i < 6; i++) { const t = mk(G.oct, E(0xc8f0ff, 1.4), (i % 2 ? .12 : -.12), 1.18, .4 - i * .18, .07, .2, .07); b.add(t); }
        if (kind === 'sphinx') { head.add(mk(G.box, C(0xe8c050, { m: .6, r: .3 }), 0, .12, -.12, .62, .5, .3)); head.add(mk(G.box, C(0x2a3a8a), 0, .38, -.1, .4, .12, .32)); head.add(mk(G.cone0, E(0xffd040, 2), 0, .5, 0, .1, .3, .1, false)); for (const s of [-1, 1]) { const w = mk(G.sph0, C(0xd8b060, { r: .6 }), s * .55, 1.15, -.1, .06, .3, .6); w.rotation.z = s * .5; b.add(w); } }
        break; }
      case 'krabbe': {   // Schleusen-/Riffkrabbe: breiter Panzer, Scheren, 4 Beinpaare
        b.add(mk(G.sph, MC, 0, .55, 0, .75, .32, .58)); b.add(mk(G.sph0, MD, 0, .48, 0, .6, .18, .48, false));
        head.position.set(0, .7, .52); eyes(head, .2, .02, .14, 0x111111); for (const s of [-1, 1]) { head.add(mk(G.cyl0, MD, s * .14, .1, 0, .03, .22, .03, false));
          const cl = new T.Group(); cl.position.set(s * .55, -.1, .25); cl.add(mk(G.sph, MC, 0, 0, .2, .2, .17, .28)); const p = mk(G.cone0, MC, s * .06, .02, .48, .08, .3, .06); p.rotation.x = Math.PI / 2; cl.add(p); head.add(cl); }
        for (const [x, z] of [[-.5, .2], [.5, .2], [-.5, -.25], [.5, -.25]]) { const l = leg(x, .55, z, .55, .05, MC); l.rotation.z = x > 0 ? -.6 : .6; l.add(mk(G.cyl0, MC, x > 0 ? .1 : -.1, -.25, .18, .045, .5, .045)); }
        if (col === 0xff6a4a || col > 0xe00000) for (let i = 0; i < 5; i++) b.add(mk(G.cone0, C(0xff9ac8, { e: 0xff4a8a, ei: .6 }), (i - 2) * .2, .85, -.1 + (i % 2) * .15, .06, .25, .06, false));
        break; }
      case 'skorpion': {   // Sandskorpion: Segmente, Scheren, Stachel-Schwanz
        for (let i = 0; i < 4; i++) b.add(mk(G.sph, MC, 0, .45, .35 - i * .28, .38 - i * .04, .2, .2));
        head.position.set(0, .48, .55); eyes(head, .08, .08, .08, 0xff4020); for (const s of [-1, 1]) { const cl = new T.Group(); cl.position.set(s * .32, 0, .25); cl.add(mk(G.cyl0, MC, 0, 0, .15, .05, .3, .05)); cl.add(mk(G.sph, MC, 0, 0, .38, .14, .1, .2)); head.add(cl); }
        for (const [x, z] of [[-.38, .2], [.38, .2], [-.38, -.25], [.38, -.25]]) { const l = leg(x, .45, z, .45, .04, MD); l.rotation.z = x > 0 ? -.7 : .7; }
        tail.position.set(0, .5, -.75); for (let i = 0; i < 5; i++) tail.add(mk(G.sph0, MC, 0, i * .2, -i * .08 + (i > 2 ? (i - 2) * .12 : 0), .12 - i * .01, .12, .12));
        tail.add(mk(G.cone0, E(0xff7020, 1.6), 0, 1.05, .25, .07, .25, .07, false)); break; }
      case 'kaefer': {   // Aschekäfer: glänzender Panzer mit Horn und Glutstreifen
        b.add(mk(G.sph, C(col, { m: .5, r: .3 }), 0, .55, -.05, .5, .38, .7)); b.add(mk(G.box, E(0xff6020, 2), 0, .7, -.05, .04, .26, 1.1, false));
        head.position.set(0, .55, .65); head.add(mk(G.sph, MD, 0, 0, 0, .25, .2, .22)); const hn = mk(G.cone0, C(0x2a2020), 0, .18, .2, .07, .45, .07); hn.rotation.x = .6; head.add(hn); eyes(head, .05, .2, .12, 0xffa040);
        for (const [x, z] of [[-.4, .3], [.4, .3], [-.4, -.35], [.4, -.35]]) { const l = leg(x, .45, z, .48, .045, MD); l.rotation.z = x > 0 ? -.5 : .5; }
        break; }
      case 'golem': case 'eisgolem': case 'schmiede': case 'nullgolem': case 'kristall': case 'rost': case 'sand': {   // Zweibeiner aus Stein/Metall/Eis: legs = Beine + Arme
        const st = kind === 'eisgolem' || kind === 'kristall' ? C(col, { r: .15, m: .2, e: dim(col, .3), ei: 1, t: 1 }) : kind === 'rost' ? C(col, { r: .9, m: .6 }) : C(col, { r: .85 });
        b.add(mk(G.box, st, 0, 1.45, 0, .95, .85, .6)); b.add(mk(G.box, st, 0, .95, 0, .7, .4, .5));
        head.position.set(0, 2.05, .05); head.add(mk(G.box, st, 0, 0, 0, .45, .4, .42)); eyes(head, .02, .22, .11, kind === 'schmiede' ? 0xff7a20 : kind === 'nullgolem' ? 0xb080ff : 0x80f0ff);
        leg(-.25, .8, 0, .8, .2, st, true); leg(.25, .8, 0, .8, .2, st, true);
        for (const s of [-1, 1]) { const a = new T.Group(); a.position.set(s * .62, 1.75, 0); a.add(mk(G.box, st, 0, -.45, 0, .28, .95, .3)); a.add(mk(G.sph0, st, 0, -1, .05, .22, .2, .22)); b.add(a); legs.push(a); }
        if (kind === 'schmiede') { b.add(mk(G.sph0, E(0xff6a1a, 2.6), 0, 1.5, .31, .2, .2, .05, false)); b.add(glow(0xff7a20, 2.4, 0, 1.5, .5, .6)); }
        if (kind === 'eisgolem' || kind === 'kristall') for (let i = 0; i < 5; i++) { const c = mk(G.oct, E(kind === 'kristall' ? 0xffe8ff : 0xd0f0ff, 1.6), (i - 2) * .2, 2.1 + (i % 2) * .15, -.25, .08, .3, .08, false); b.add(c); }
        if (kind === 'nullgolem') { b.add(mk(G.tor, E(0x9a6aff, 2), 0, 1.45, .32, .25, .25, .25, false)); b.add(glow(0x8a5aff, 2.6, 0, 1.45, .4, .5)); }
        if (kind === 'sand') { head.add(mk(G.cone0, C(0xe0c070), 0, .45, 0, .2, .5, .2)); b.add(mk(G.box, E(0x60c8ff, 1.4), 0, 1.45, .31, .3, .3, .02, false)); }
        if (kind === 'rost') for (const s of [-1, 1]) b.add(mk(G.cyl0, C(0x5a5048, { m: .7 }), s * .3, 1.95, -.2, .08, .5, .08));
        break; }
      case 'ritter': case 'echo': case 'tempel': case 'vergessen': case 'archiv': {   // gerüstete Zweibeiner mit Waffe
        const ar = C(col, { m: .7, r: .35, e: dim(col, .2), ei: 1 }), dk = C(dim(col, .45), { m: .5, r: .5 });
        b.add(mk(G.box, ar, 0, 1.35, 0, .7, .75, .45)); b.add(mk(G.cyl, dk, 0, .9, 0, .38, .3, .3));
        head.position.set(0, 1.95, 0); head.add(mk(G.sph, ar, 0, 0, 0, .25, .28, .25)); head.add(mk(G.box, C(0x101018), 0, .02, .2, .32, .06, .08, false));
        head.add(mk(G.box, E(kind === 'vergessen' ? 0x9a7aff : kind === 'echo' ? 0x7af0ff : 0xffe080, 2.2), 0, .02, .24, .26, .03, .02, false));
        if (kind === 'tempel' || kind === 'ritter') head.add(mk(G.cone0, E(0xffd060, 1), 0, .33, -.05, .1, .3, .1, false));
        leg(-.18, .78, 0, .78, .14, dk, true); leg(.18, .78, 0, .78, .14, dk, true);
        for (const s of [-1, 1]) { const a = new T.Group(); a.position.set(s * .48, 1.6, 0); a.add(mk(G.cyl, ar, 0, -.35, 0, .11, .7, .11)); b.add(a); legs.push(a);
          if (s > 0) { const sw = mk(G.box, C(0xe0e8ff, { m: 1, r: .15, e: kind === 'echo' ? 0x60e0ff : 0, ei: 1 }), 0, -.75, .45, .06, .08, 1.1); a.add(sw); }
          else { const sd = mk(G.cyl, C(dim(col, .8), { m: .6, e: dim(col, .3), ei: 1 }), -.1, -.45, .12, .34, .06, .34); sd.rotation.z = Math.PI / 2; a.add(sd); } }
        if (kind === 'vergessen') { b.add(mk(G.cone0, C(0x2a2040, { t: 1 }), 0, .6, 0, .5, 1.2, .5)); b.add(glow(0x7a5aff, 2.4, 0, 1.4, 0, .4)); }
        if (kind === 'echo') b.add(glow(0x7af0ff, 2.2, 0, 1.4, 0, .5));
        break; }
      case 'kriecher': case 'schlange': {   // Wurzelkriecher / Seeschlange: langer Segmentkörper
        const n = kind === 'schlange' ? 7 : 6;
        for (let i = 0; i < n; i++) { const s = 1 - i * .07; b.add(mk(G.sph, i % 2 ? MD : MC, 0, .5 + Math.sin(i * .9) * .08, .5 - i * .32, .34 * s, .3 * s, .3)); }
        head.position.set(0, .62, .8); head.add(mk(G.sph, MC, 0, 0, 0, .3, .25, .32)); eyes(head, .1, .22, .12, kind === 'schlange' ? 0x60ffd0 : 0xffe060);
        if (kind === 'schlange') { for (const s of [-1, 1]) { const f = mk(G.cone0, E(0x40e0d0, 1), s * .3, .1, -.1, .05, .35, .25); f.rotation.z = -s * 1.2; head.add(f); } for (let i = 0; i < 6; i++) b.add(mk(G.cone0, E(0x60ffe0, 1.2), 0, .85, .2 - i * .32, .05, .3, .14, false)); }
        else for (let i = 0; i < 6; i++) { const r = mk(G.cyl0, C(0x5a3a1a), (i % 2 ? .25 : -.25), .75, .3 - i * .3, .04, .5, .04); r.rotation.z = (i % 2 ? -.6 : .6); b.add(r); }
        for (const [x, z] of [[-.3, .3], [.3, .3], [-.3, -.6], [.3, -.6]]) leg(x, .45, z, .42, .06, MD, true);
        tail.position.set(0, .5, -.5 - n * .32); tail.add(mk(G.cone0, MC, 0, 0, -.25, .14, .5, .14)).rotation.x = -Math.PI / 2; break; }
      case 'vogel': case 'eisvogel': case 'sonne': {   // Wolkenschwinge / Avarn / Solyra: Vogel mit schlagenden Flügeln
        const fe = kind === 'eisvogel' ? C(col, { r: .3, e: 0x60c0ff, ei: .8 }) : kind === 'sonne' ? E(col, 1.2) : C(col, { r: .8 });
        b.add(mk(G.sph, fe, 0, 1.0, 0, .38, .42, .62)); head.position.set(0, 1.45, .55); head.add(mk(G.sph, fe, 0, 0, 0, .24, .24, .26));
        head.addm(mk(G.cone0, C(0xffc040), 0, -.03, .3, .07, .25, .07)).rotation.x = Math.PI / 2; eyes(head, .07, .18, .12, kind === 'eisvogel' ? 0x80e0ff : 0x111111);
        leg(-.15, .65, 0, .6, .04, C(0xe0a030), true); leg(.15, .65, 0, .6, .04, C(0xe0a030), true);
        wing(-1, 1.15, 0, 1.6, fe); wing(1, 1.15, 0, 1.6, fe);
        tail.position.set(0, 1.0, -.6); for (let i = 0; i < 3; i++) { const f = mk(G.sph0, fe, (i - 1) * .15, 0, -.35, .08, .05, .45); f.rotation.y = (i - 1) * .3; tail.add(f); }
        if (kind === 'sonne') { head.add(mk(G.tor, E(0xffe060, 2.6), 0, .1, -.2, .45, .45, .45, false)); b.add(glow(0xffd040, 5, 0, 1.3, 0, .7)); }
        if (kind === 'eisvogel') for (let i = 0; i < 4; i++) head.add(mk(G.oct, E(0xd0f4ff, 1.8), (i - 1.5) * .1, .3, -.1, .05, .2, .05, false));
        break; }
      case 'drache': case 'kristalldrache': {   // Magmarion / Elyon: Drache mit Hals, Flügeln, Stacheln
        const sk = kind === 'drache' ? C(col, { r: .6, e: 0xff4010, ei: .6 }) : C(col, { r: .2, m: .4, e: dim(col, .4), ei: 1, t: 1 });
        b.add(mk(G.sph, sk, 0, 1.0, -.1, .55, .48, .95)); const nk = mk(G.cyl, sk, 0, 1.45, .75, .18, .7, .18); nk.rotation.x = .7; b.add(nk);
        head.position.set(0, 1.75, 1.05); head.add(mk(G.box, sk, 0, 0, .12, .32, .26, .5)); eyes(head, .1, .25, .12, kind === 'drache' ? 0xffe040 : 0xd0a0ff);
        for (const s of [-1, 1]) { const hn = mk(G.cone0, C(0x2a2028), s * .12, .22, -.1, .05, .35, .05); hn.rotation.x = -.8; head.add(hn); }
        for (const [x, z] of [[-.32, .55], [.32, .55], [-.32, -.55], [.32, -.55]]) leg(x, .75, z, .75, .13, sk, true);
        for (const s of [-1, 1]) { const w = mk(G.sph0, C(dim(col, .7), { e: kind === 'drache' ? 0xff3010 : dim(col, .5), ei: .7, t: 1 }), s * .9, 1.6, -.2, .9, .06, .6); w.rotation.z = s * .35; b.add(w); }
        for (let i = 0; i < 6; i++) b.add(mk(G.cone0, kind === 'drache' ? E(0xff7020, 1.6) : E(0xffe0ff, 1.6), 0, 1.5, .5 - i * .28, .07, .3, .07, false));
        tail.position.set(0, .95, -.95); tail.rotation.x = -1.2; tail.add(mk(G.cone0, sk, 0, -.55, 0, .2, 1.2, .2)).rotation.x = Math.PI;
        if (kind === 'drache') b.add(glow(0xff5010, 4, 0, 1.0, 0, .5)); else b.add(glow(col, 4, 0, 1.1, 0, .5));
        break; }
      case 'koenigin': {   // Wurzelkönigin: Baumriesin mit Ästen und Blätterkrone
        const bark = C(0x5a3a22, { r: .95 }), lf = C(col, { e: dim(col, .4), ei: 1 });
        b.add(mk(G.cyl, bark, 0, 1.4, 0, .45, 1.4, .4)); head.position.set(0, 2.35, .05); head.add(mk(G.sph, bark, 0, 0, 0, .3, .32, .28)); eyes(head, .02, .24, .11, 0x80ffb0);
        for (let i = 0; i < 6; i++) head.add(mk(G.ico, lf, Math.cos(i) * .45, .45 + (i % 2) * .15, Math.sin(i) * .35, .3, .26, .3, false));
        head.add(mk(G.tor, E(0x80ffa0, 2), 0, .35, 0, .3, .3, .3, false));
        leg(-.22, .75, 0, .75, .16, bark, true); leg(.22, .75, 0, .75, .16, bark, true);
        for (const s of [-1, 1]) { const a = new T.Group(); a.position.set(s * .5, 1.85, 0); a.add(mk(G.cyl, bark, 0, -.5, 0, .1, 1, .1)); for (let k = 0; k < 3; k++) { const t = mk(G.cyl0, bark, s * .1, -1 - k * .05, .1, .03, .35, .03); t.rotation.z = (k - 1) * .6; a.add(t); } a.add(mk(G.ico, lf, 0, -.1, 0, .22, .2, .22, false)); b.add(a); legs.push(a); }
        b.add(glow(col, 3.5, 0, 2.4, 0, .45)); break; }
      case 'uhr': {   // Erinnerungshüter: Spinne mit Uhren-Leib
        b.add(mk(G.sph, C(0x2a2048, { m: .4 }), 0, 1.1, -.1, .7, .55, .7)); const fc = mk(G.cyl, E(0xe8e0ff, 1), 0, 1.25, .35, .45, .05, .45, false); fc.rotation.x = Math.PI / 2; b.add(fc);
        for (let i = 0; i < 2; i++) { const z = mk(G.box, C(0x1a1430), 0, 1.25 + (i ? .14 : .1), .41, .03, i ? .28 : .2, .02, false); z.rotation.z = i ? .3 : -1.2; b.add(z); }
        head.position.set(0, 1.0, .7); eyes(head, .05, .05, .15, 0xb080ff); eyes(head, .18, .02, .07, 0xb080ff);
        for (const [x, z] of [[-.55, .3], [.55, .3], [-.55, -.35], [.55, -.35]]) { const l = leg(x, 1.0, z, 1.0, .05, C(0x3a3060, { m: .5 })); l.rotation.z = x > 0 ? -.7 : .7; l.add(mk(G.cyl0, C(0x3a3060), x > 0 ? .25 : -.25, -.2, .35, .04, .9, .04)); }
        tail.position.set(0, 1.4, -.6); tail.add(mk(G.tor, E(0x9a7aff, 2), 0, 0, 0, .3, .3, .3, false)); b.add(glow(0x9a6aff, 3, 0, 1.2, 0, .5)); break; }
      default: return null;
    }
    if (boss) { const cr = head.addm(mk(G.tor, E(0xffe070, 2.4), 0, .45, 0, .22, .22, .22, false)); cr.rotation.x = Math.PI / 2; for (let i = 0; i < 5; i++) head.add(mk(G.cone0, E(0xffe070, 2.4), Math.cos(i * 1.256) * .22, .58, Math.sin(i * 1.256) * .22, .05, .18, .05, false)); b.add(glow(col, 2.4, 0, 1.2, 0, col > 0xc0c0c0 ? .12 : .25)); }
    while (legs.length < 4) { const l = new T.Group(); b.add(l); legs.push(l); }
    return fin({ root, body: b, head, legs, tail });
  }

  // Welt → [A schwebend, B Läufer, M Mini-Boss, X Endboss]
  const PLAN = {
    2: ['pilz', 'thornwolf', 'kriecher', 'koenigin'],
    3: ['schleim', 'krabbe', 'rost', 'ritter'],
    4: ['geist', 'skorpion', 'sand', 'sphinx'],
    5: ['qualle', 'krabbe', 'archiv', 'schlange'],
    6: ['geist', 'frostwolf', 'eisgolem', 'eisvogel'],
    7: ['funke', 'kaefer', 'schmiede', 'drache'],
    8: ['falter', 'vergessen', 'nullgolem', 'uhr'],
    9: ['stern', 'vogel', 'tempel', 'sonne'],
    10: ['spiegel', 'echo', 'kristall', 'kristalldrache']
  };
  // Weitere Arten je Welt (Fernkämpfer C, Nahkämpfer D) – eigene Namen und Farben, damit jede Welt mehr Vielfalt hat
  const PLAN2 = {
    1: [['falter', 'Mondfalter', 0x9ab0ff], ['golem', 'Moosgolem', 0x5a9a5a]],
    2: [['falter', 'Blütenfalter', 0xff8ad0], ['kaefer', 'Borkenkäfer', 0x7a5a3a]],
    3: [['funke', 'Laternengeist', 0xffd060], ['golem', 'Pflastergolem', 0x8a8a96]],
    4: [['stern', 'Sonnenfunke', 0xffa040], ['kaefer', 'Skarabäus', 0x3aa08a]],
    5: [['schleim', 'Perlschleim', 0xd8f0ff], ['kriecher', 'Muräne', 0x6a4ac8]],
    6: [['stern', 'Schneekristall', 0xc8f0ff], ['sphinx', 'Schneeluchs', 0xe8f0ff]],
    7: [['geist', 'Rauchgeist', 0x8a8a8a], ['skorpion', 'Lavaskorpion', 0xff4a2a]],
    8: [['spiegel', 'Traumspinne', 0xc08aff], ['thornwolf', 'Schattenwolf', 0x4a3a6a]],
    9: [['falter', 'Nebelfalter', 0xaad8ff], ['echo', 'Sternenritter', 0xffd870]],
    10: [['qualle', 'Prismenqualle', 0xffe0ff], ['vergessen', 'Splitterwandler', 0xf0f0ff]],
    11: [['spiegel', 'Risswirbel', 0xff9af0], ['echo', 'Rissritter', 0xc8a0ff]]
  };
  function makeExtra(n, i) { const q = PLAN2[n]; if (!q) return null; const [kind, name, col] = q[i]; return { name, col, make: () => i === 0 ? hover(kind, col) : walker(kind, col, false) }; }
  function makeCreature(n, slot, col) {
    const p = PLAN[n]; if (!p) return null;
    const i = 'ABMX'.indexOf(slot), kind = p[i];
    return i === 0 ? hover(kind, col) : walker(kind, col, i === 3);
  }
  // Beliebige Art mit eigener Farbe (Märchenwelten): schwebende Arten über hover(), alle anderen als Läufer
  const HOV = new Set(['pilz', 'schleim', 'geist', 'qualle', 'funke', 'falter', 'stern', 'spiegel']);
  const makeKind = (kind, col, boss) => HOV.has(kind) ? hover(kind, col) : walker(kind, col, !!boss);
  return { makeCreature, makeExtra, makeKind, HOV, PLAN };
}
