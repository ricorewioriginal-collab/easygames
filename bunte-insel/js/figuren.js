'use strict';
/* Bunte Insel – KayKit-Figuren 🧍 (KayKit Adventurers 2.0 von Kay Lousberg, CC0): Körper, Arme und Beine aller Figuren kommen aus den echten
   KayKit-Modellen (models/figuren.bin, gebacken von bunte-insel-src/bake-models.mjs), aber angepasst: jede Figur bekommt ihre eigenen Farben
   (Hemd, Hose, Schuhe, Haut, Handschuhe, Regenbogen-Streifen) und behält Kopf, Gesicht, Frisur, Hut und Zubehör aus BI.makeChar – so bleiben
   Rosi, Heinz & Co. erkennbar. Sechs Schnitte: Abenteurer (ro), Waldläufer (ra), Ritter (kn), Recke (ba), Magier-Robe (ma), Kapuze (rh) –
   gewählt aus dem Aussehen (Kleid, Statur, Rüstung, Kapuzenpulli …) oder fest mit kk: 'ro' usw.
   Ohne Datei (offline beim ersten Start) bleiben die bisherigen Figuren; kommt die Datei später, werden schon gebaute Figuren an Ort und Stelle umgebaut.
   Abschalten zum Vergleichen: ?kk=0 */
BI.Figuren = (function () {
  const K = { ready: false, failed: false, G: {}, wait: [] }, T = THREE;
  const off = typeof location !== 'undefined' && /[?&]kk=0/.test(location.search);
  /* gleiche Datei-Art wie deko.bin; hier ohne Index (Figuren-Batches sind Dreieckslisten) und mit den Original-Koordinaten des Modells */
  function parse(buf) {
    const dv = new DataView(buf); if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== 'BIM1') throw new Error('figuren.bin ungültig');
    const jl = dv.getUint32(4, true), meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, jl))), base = 8 + jl + ((4 - ((8 + jl) % 4)) % 4);
    for (const [name, m] of Object.entries(meta.models)) {
      const qp = new Int16Array(buf, base + m.p, m.vc * 3), qn = new Int8Array(buf, base + m.n, m.vc * 3), qc = new Uint8Array(buf, base + m.c, m.vc * 3), ix = new Uint16Array(buf.slice(base + m.i, base + m.i + m.ic * 2));
      const p = new Float32Array(m.ic * 3), n = new Float32Array(m.ic * 3), c = new Float32Array(m.ic * 3), span = [0, 1, 2].map(k => m.max[k] - m.min[k]);
      for (let t = 0; t < m.ic; t++) { const v = ix[t] * 3; for (let a = 0; a < 3; a++) { p[t * 3 + a] = ((qp[v + a] + 32768) / 65535) * span[a] + m.min[a]; n[t * 3 + a] = qn[v + a] / 127; c[t * 3 + a] = qc[v + a] / 255; } }
      K.G[name] = { p, n, c, min: m.min, max: m.max };
    }
  }
  K.load = function () {
    if (off || K.ready || K.loading || K.failed || typeof fetch === 'undefined') { if (off) K.failed = true; return; } K.loading = true;
    fetch('models/figuren.bin').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(b => { parse(b); K.ready = true; K.loading = false; swapAll(); })
      .catch(e => { console.warn('KayKit-Figuren nicht geladen', e); K.loading = false; K.failed = true; K.wait.length = 0; });
  };
  /* Farbklassen wie beim Umfärben im Taschi-Spiel: Haut, Grau/Metall/Stoff (Hauptfarbe), kräftige Farben (Akzent); Braun, Gold, Weiß, Schwarz bleiben,
     außer sie sind die größte Fläche des Teils (dann sind sie das Kleidungsstück selbst). */
  const hsl = {}, col = new T.Color(), lum = (r, g, b) => .3 * r + .59 * g + .11 * b;
  function kindOf(r, g, b) {
    col.setRGB(r, g, b).getHSL(hsl); const h = hsl.h, s = hsl.s, l = hsl.l;
    if (h > .02 && h < .12 && s > .4 && l > .66) return 'skin';
    if (l < .1) return 'dark';
    if (s < .16) return 'grey';
    return 'h' + Math.round(h * 10) % 10 + (s > .5 ? 'S' : 's');
  }
  /* je Teil (einmal): Klasse je Vertex, Rangfolge der Klassen nach Fläche, hellster Wert je Klasse (für den Verlauf) */
  const info = new Map();
  function classes(name) {
    if (info.has(name)) return info.get(name);
    const g = K.G[name], cnt = {}, top = {}, kinds = [];
    for (let i = 0; i < g.c.length; i += 3) { const k = kindOf(g.c[i], g.c[i + 1], g.c[i + 2]), L = lum(g.c[i], g.c[i + 1], g.c[i + 2]); kinds.push(k); cnt[k] = (cnt[k] || 0) + 1; (top[k] || (top[k] = [])).push(L); }
    for (const k in top) { const a = top[k].sort((x, y) => x - y); top[k] = Math.max(.08, a[Math.floor(a.length * .9)]); }
    const rank = Object.keys(cnt).filter(k => k !== 'skin' && k !== 'dark').sort((a, b) => cnt[b] - cnt[a]);
    const r = { kinds, rank, top }; info.set(name, r); return r;
  }
  const skinRef = lum(.93, .73, .6);
  /* Teil in ein CharacterBatch übernehmen. map(x,y,z) → [x,y,z] in Figuren-Koordinaten (mit Spiegeln), pick(kind, rank, y) → Zielfarbe (Zahl) oder null = Originalfarbe */
  function put(b, name, map, nmap, pick, skin) {
    const g = K.G[name]; if (!g) return false; const C = classes(name), sk = new T.Color(skin), tc = new T.Color(), P = b.p, N = b.n, CC = b.c;
    const flip = map.flip;
    for (let t = 0; t < g.p.length; t += 9) {
      const order = flip ? [0, 6, 3] : [0, 3, 6];
      for (const o of order) {
        const i = t + o, v = i / 3, x = g.p[i], y = g.p[i + 1], z = g.p[i + 2], q = map(x, y, z), nn = nmap(g.n[i], g.n[i + 1], g.n[i + 2]), l = Math.hypot(nn[0], nn[1], nn[2]) || 1;
        P.push(q[0], q[1], q[2]); N.push(nn[0] / l, nn[1] / l, nn[2] / l);
        const r = g.c[i], gg = g.c[i + 1], bb = g.c[i + 2], k = C.kinds[v];
        if (k === 'skin') { const f = Math.min(1.12, lum(r, gg, bb) / skinRef); CC.push(Math.min(1, sk.r * f), Math.min(1, sk.g * f), Math.min(1, sk.b * f)); continue; }
        const want = k === 'dark' ? null : pick(k, C.rank.indexOf(k), y);
        if (want == null) { CC.push(r, gg, bb); continue; }
        tc.set(want); const f = Math.min(1.15, Math.max(.35, lum(r, gg, bb) / C.top[k]));
        CC.push(Math.min(1, tc.r * f), Math.min(1, tc.g * f), Math.min(1, tc.b * f));
      }
    }
    return true;
  }
  const dark = (c, k) => new T.Color(c).multiplyScalar(k).getHex(), mix = (a, c, t) => new T.Color(a).lerp(new T.Color(c), t).getHex();
  const RB = [0xe8453c, 0xff8a1f, 0xffd23f, 0x4cd07d, 0x3f8cff, 0x9b4de0];
  K.variant = function (o) {
    if (o.kk && K.G[o.kk + '_body']) return o.kk; const hat = o.hat || 'none', ct = o.ctype | 0;
    if (o.dress) return 'ma'; if ((o.build | 0) >= 2) return 'ba'; if (o.harness || o.cape || hat === 'helmet' || hat === 'viking') return 'kn';
    if (ct === 1) return 'rh'; if (ct === 3 || ct === 5 || o.pack) return 'ra'; return 'ro';
  };
  /* Körper (Rumpf mit Gürtel, Kragen, Schultern): KayKit-Rumpf y .38–1.30 → Figur y .5–1.2, schmaler und flacher, damit Kopf, Arme und Zubehör passen */
  K.body = function (b, o, v, shirt, pants, skin) {
    const nm = v + '_body', g = K.G[nm]; if (!g) return false;
    const sy = .74, sx = .6, sz = .46, map = (x, y, z) => [x * sx, .5 + (y - .38) * sy, z * sz], nmap = (a, c, d) => [a / sx, c / sy, d / sz];
    const acc = o.logo != null ? o.logo : mix(shirt, 0xffffff, .55);
    return put(b, nm, map, nmap, (k, r, y) => {
      if (o.rainbow && r === 0) return RB[Math.max(0, Math.min(5, Math.floor((1.3 - y) / .92 * 6)))];
      if (r === 0) return shirt; if (r === 1) return o.overall ? pants : dark(shirt, .72); if (k.endsWith('S')) return acc; return null;
    }, skin);
  };
  /* Arm: KayKit-Arm im T-Pose (entlang −x) wird nach unten gedreht, Schulter = Drehpunkt; rechts gespiegelt */
  K.arm = function (b, o, v, side, shirt, skin) {
    const nm = (v === 'rh' ? 'ro' : v) + '_arm', g = K.G[nm]; if (!g) return false;
    const L = .6, W = .62, sh = g.max[0], cy = (g.min[1] + g.max[1]) / 2, m = side > 0 ? -1 : 1;
    const map = (x, y, z) => [m * -(y - cy) * W, (x - sh) * L, z * W], nmap = (a, c, d) => [m * -c / W, a / L, d / W]; map.flip = side > 0;
    const sl = o.sleeve | 0, glove = o.gloves != null ? o.gloves : dark(shirt, .7);
    return put(b, nm, map, nmap, (k, r) => r === 0 ? (sl === 2 ? skin : shirt) : r === 1 ? glove : k.endsWith('S') ? mix(shirt, 0xffffff, .5) : null, skin);
  };
  /* Bein: Hüfte = Drehpunkt (0), Fuß unten bei −.66; unterhalb des Knöchels Schuhfarbe */
  K.leg = function (b, o, v, side, pants, shoe, skin) {
    const nm = (v === 'rh' || v === 'ma' ? 'ro' : v) + '_leg', g = K.G[nm]; if (!g) return false;
    const cx = (g.min[0] + g.max[0]) / 2, sy = .66 / g.max[1], s = .78, m = side > 0 ? -1 : 1;
    const map = (x, y, z) => [m * (x - cx) * s, (y - g.max[1]) * sy, z * s], nmap = (a, c, d) => [m * a / s, c / sy, d / s]; map.flip = side > 0;
    const bt = o.bot | 0, st = o.shoeT | 0, foot = st === 2 || st === 3 ? skin : shoe, knee = bt >= 2 ? skin : pants;
    return put(b, nm, map, nmap, (k, r, y) => y < .16 ? foot : r === 0 ? (y < .3 && bt >= 1 ? skin : knee) : r === 1 ? dark(pants, .75) : null, skin);
  };
  K.use = o => !off && !o.classic && !o.buddy && K.ready;
  /* Figuren, die vor dem Laden gebaut wurden, merken – danach an Ort und Stelle auf KayKit umbauen (gleiche Gruppen, nur neue Meshes) */
  K.later = h => { if (!off && !K.failed && !h.group.userData.opts.classic) K.wait.push(h); };
  function swapAll() {
    const L = K.wait.splice(0);
    for (const h of L) try {
      const o0 = h.group.userData.opts, n = BI.makeChar(Object.assign({}, o0, { name: '' })), a = h._own, b = n._own; if (!a || !b) continue;
      for (const m of a.root) { h.group.remove(m); if (m.geometry) m.geometry.dispose(); }
      for (const m of b.root) h.group.add(m);
      for (const k of ['legL', 'legR', 'armL', 'armR']) { const og = h[k], ng = n[k], om = a[k], nm = b[k]; if (!og || !ng || !om || !nm) continue; og.remove(om); om.geometry.dispose(); og.add(nm); og.position.copy(ng.position); og.scale.copy(ng.scale); }
      h._own = b;
    } catch (e) { console.warn(e); }
  }
  K.parse = b => { parse(b); K.ready = true; swapAll(); }; /* für Tests ohne Netz */
  K.load();
  return K;
})();
