/* Echtes Himmels-Umgebungslicht (Poly Haven HDRIs, CC0): weiches, farbiges Licht und Spiegelungen statt eines einfachen Farbverlaufs.
   Je Welt wird das passende HDRI geladen (nur bei Bedarf), mit den Himmelsfarben der Welt eingefärbt und zu einer Umgebungskarte gerechnet. */
import * as T from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export function createHdri(renderer, scene, fallback) {
  const pm = new T.PMREMGenerator(renderer), tex = {}, cache = new Map(); let want = '', cur = null;
  const load = k => tex[k] || (tex[k] = new Promise((res, rej) => new RGBELoader().setDataType(T.UnsignedByteType).load('hdr/' + k + '.hdr', t => { t.mapping = T.EquirectangularReflectionMapping; res(t) }, null, rej)));
  const avg = v => (v[0] + v[1] + v[2]) / 3;
  function pick(a) {
    const L = avg(a.mid) + avg(a.hor);
    if (L < .2) return null;                                  /* Innenräume, Höhlen, Dungeons: bei der einfachen Umgebung bleiben */
    if (a.stars > .5 || avg(a.top) < .08) return 'nacht';
    if (a.hor[0] > a.hor[2] + .12) return 'abend';
    if (L > 1.1 && !a.sun) return 'dunst';
    return 'tag';
  }
  function build(k, a, t) {
    const hr = a.hor, mx = Math.max(hr[0], hr[1], hr[2], .05), s = k === 'nacht' ? .6 : k === 'abend' ? .85 : .9;
    const tint = new T.Color(Math.min(1.4, (.55 + .6 * hr[0] / mx * .8) * s), Math.min(1.4, (.55 + .6 * hr[1] / mx * .8) * s), Math.min(1.4, (.55 + .6 * hr[2] / mx * .8) * s));
    const es = new T.Scene(), m = new T.Mesh(new T.SphereGeometry(10, 32, 16), new T.MeshBasicMaterial({ map: t, color: tint, side: T.BackSide }));
    m.scale.x = -1; es.add(m);                                 /* Blickrichtung wie bei einer Umgebungskarte */
    const r = pm.fromScene(es, 0, .1, 30).texture; m.material.dispose(); m.geometry.dispose(); return r;
  }
  return {
    apply(a, q) {
      const k = q === 0 ? null : pick(a); want = k ? k + '|' + a.hor.map(v => v.toFixed(2)).join() : '';
      if (!k) { if (cur !== fallback) { scene.environment = cur = fallback } return }
      const ck = want, hit = cache.get(ck); if (hit) { scene.environment = cur = hit; return }
      load(k).then(t => { if (!cache.has(ck)) { if (cache.size > 6) { const f = cache.keys().next().value; cache.get(f).dispose(); cache.delete(f) } cache.set(ck, build(k, a, t)) } if (want === ck) scene.environment = cur = cache.get(ck) }).catch(() => { })
    }
  };
}
