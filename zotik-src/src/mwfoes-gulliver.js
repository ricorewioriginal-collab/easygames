// Gegner von „Gullivers Inseln“ (eigene Erfindungen für Zotik): Rissnadler, Riesenwespe, Hofkatze, Magnetbrocken.
// Gleiche Bauweise wie mwfoes.js: Schwebende {root, body, sh}, Läufer {root, body, head, legs, tail}.
export function createGulliverFoes({ T, mk, G, glow, C, E, M, dim, eyes, fin }) {
  function hover(kind, col) {
    const root = new T.Group(), b = new T.Group(); root.add(b); const sh = [];
    switch (kind) {
      case 'wespe': {   // Riesenwespe: gestreifter Hinterleib mit Stachel, kräftiger Brustpanzer, Facettenaugen, vier Glasflügel
        const yl = C(col, { r: .5, e: dim(col, .25), ei: 1 }), bk = C(0x1a1410, { r: .5 });
        b.add(mk(G.sph, yl, 0, -.05, -.55, .3, .28, .62)); for (let i = 0; i < 3; i++) b.add(mk(G.tor, bk, 0, -.05, -.35 - i * .27, .3 - i * .04, .3 - i * .04, .1, false));
        const st = mk(G.cone0, C(0x3a2a20), 0, -.05, -1.25, .06, .4, .06); st.rotation.x = -Math.PI / 2; b.add(st);
        b.add(mk(G.sph, bk, 0, 0, .1, .3, .28, .32)); b.add(mk(G.sph, yl, 0, .02, .48, .22, .2, .22)); eyes(b, .08, .6, .13, 0xff3020, 1.4);
        for (const s of [-1, 1]) { const md = mk(G.cone0, bk, s * .07, -.1, .68, .03, .14, .03, false); md.rotation.z = -s * .5; b.add(md); const an = mk(G.cyl0, bk, s * .1, .2, .62, .012, .35, .012, false); an.rotation.z = -s * .6; an.rotation.x = .6; b.add(an); }
        for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const l = mk(G.cyl0, bk, s * .16, -.3, .2 - i * .15, .018, .42, .018, false); l.rotation.z = s * .4; b.add(l); }
        const gl = M(0xe8f4ff, { e: 0xb0d0ff, ei: .5, r: .1 }); for (const [s, z, w] of [[-1, .2, 1.4], [1, .2, 1.4], [-1, -.1, 1], [1, -.1, 1]]) { const g = mk(G.sph0, gl, s * w * .55, .2, z, w * .55, .03, w * .22); g.rotation.z = s * .22; b.add(g); sh.push(g); }
        b.add(glow(0xffc040, 1.6, 0, 0, -.3, .2)); return Object.assign(fin({ root, body: b, sh }), { flap: true }); }
      case 'magnet': {   // Magnetbrocken: schwebender Metallkristall, eine Hälfte rot, eine blau, umkreist von Eisensplittern
        const mt = C(0x5a6a8a, { m: .8, r: .3, e: dim(col, .3), ei: .8 }), rd = C(0xd83a3a, { m: .6, r: .3, e: 0x8a1a1a, ei: 1 }), bl = C(0x3a6ad8, { m: .6, r: .3, e: 0x1a3a8a, ei: 1 });
        b.add(mk(G.oct, mt, 0, 0, 0, .46, .46, .46)); const up = mk(G.cone0, rd, 0, .5, 0, .24, .5, .24); b.add(up); const dn = mk(G.cone0, bl, 0, -.5, 0, .24, .5, .24); dn.rotation.x = Math.PI; b.add(dn);
        eyes(b, .05, .4, .14, 0xffffff, 1.3); b.add(mk(G.box, C(0x1a1a24), 0, -.08, .42, .24, .05, .05, false));
        for (let i = 0; i < 6; i++) { const a = i * 1.047, s = mk(G.box, C(0xb8c0d0, { m: .9, r: .25 }), Math.cos(a) * .95, (i % 3 - 1) * .3, Math.sin(a) * .95, .08, .34, .06, false); s.rotation.set(i, i * 1.3, 0); b.add(s); sh.push(s); }
        b.add(glow(col, 3, 0, 0, 0, .5)); return Object.assign(fin({ root, body: b, sh }), { flap: false }); }
    }
    return null;
  }
  // Läufer: X = { root, b, head, tail, legs, leg, quad, boss, col }
  function walk(kind, X) {
    const { b, head, tail, leg, quad, boss, col } = X;
    switch (kind) {
      case 'nadler': {   // Rissnadler: lebendes Nadelkissen auf Stecknadelbeinen, Rücken voller Nadeln mit bunten Köpfen
        const cu = C(col, { r: .95, e: dim(col, .2), ei: 1 }), ms = C(0xd8d8e4, { m: .9, r: .25 });
        b.add(mk(G.sph, cu, 0, .6, 0, .5, .42, .5)); b.add(mk(G.box, C(dim(col, .6)), 0, .6, 0, 1.0, .06, 1.0, false));   // Kissenrand wie eine Naht
        for (let i = 0; i < 16; i++) { const a = i * 2.4, y = .8 + (i % 4) * .08, x = Math.cos(a) * (.1 + (i % 5) * .08), z = Math.sin(a) * (.1 + (i % 5) * .08) - .05, pn = mk(G.cyl0, ms, x, y + .3, z, .014, .6, .014, false); pn.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); b.add(pn);
          b.add(mk(G.sph0, C([0xff4a6a, 0xffd040, 0x4ac8ff, 0x6aff8a][i % 4], { e: [0xff4a6a, 0xffd040, 0x4ac8ff, 0x6aff8a][i % 4], ei: .8 }), x + Math.sin(a) * .3, y + .6, z - Math.cos(a) * .3, .045, .045, .045, false)); }
        head.position.set(0, .66, .46); head.add(mk(G.sph, C(dim(col, 1.2), { r: .9 }), 0, 0, 0, .22, .2, .2)); head.add(mk(G.box, C(0x1a0a0a), 0, -.07, .17, .18, .05, .04, false)); eyes(head, .06, .17, .08, 0xfff0a0, 1.1);
        for (const s of [-1, 1]) { const br = mk(G.box, C(0x1a0a0a), s * .08, .13, .17, .1, .03, .03, false); br.rotation.z = s * .5; head.add(br); }
        for (const [x, z] of [[-.2, .25], [.2, .25], [-.2, -.25], [.2, -.25]]) leg(x, .35, z, .42, .03, ms, true);
        tail.position.set(0, .55, -.5); tail.rotation.x = -.5; tail.add(mk(G.cone0, ms, 0, -.3, 0, .03, .7, .03)); tail.add(mk(G.sph0, C(0xffd040, { e: 0xffd040, ei: .8 }), 0, -.65, 0, .06, .06, .06, false));
        if (boss) b.add(glow(0xff4a6a, 3, 0, .8, 0, .4)); break; }
      case 'katze': {   // Hofkatze: riesiger getigerter Kater, Schnurrhaare, gelbe Schlitzaugen, peitschender Schwanz
        const fur = C(col, { r: .9, e: dim(col, .2), ei: 1 }), st = C(dim(col, .45)); quad(1.55, fur);
        for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const r = mk(G.box, st, s * .55, 1.1, .8 - i * .28, .05, .4, .06, false); r.rotation.z = s * .4; b.add(r); }
        for (const s of [-1, 1]) { head.add(mk(G.cone0, fur, s * .2, .3, -.05, .1, .22, .08)); head.add(mk(G.cone0, C(0xe8a8a0), s * .2, .3, -.02, .05, .15, .04, false)); for (let k = 0; k < 3; k++) { const wh = mk(G.cyl0, C(0xf0ecdc), s * .2, -.02 - k * .03, .34, .004, .4, .004, false); wh.rotation.z = s * (1.3 + k * .08); head.add(wh); } }
        head.add(mk(G.sph, C(0xf0e4d0), 0, -.1, .3, .17, .13, .14)); head.add(mk(G.sph0, C(0xe8808a), 0, -.02, .42, .05, .035, .03, false)); eyes(head, .08, .3, .12, 0xffe040, 1.3);
        tail.position.set(0, 1.1, -1.3); tail.rotation.x = -1.1; tail.addm(mk(G.cone0, fur, 0, -.55, 0, .1, 1.4, .1)).rotation.x = Math.PI; for (let i = 0; i < 4; i++) tail.add(mk(G.tor, st, 0, -.3 - i * .3, 0, .1, .1, .1, false));
        if (boss) b.add(glow(0xffa040, 4, 0, 1.2, 0, .4)); break; }
      default: return false;
    }
    return true;
  }
  return { hover, walk };
}
