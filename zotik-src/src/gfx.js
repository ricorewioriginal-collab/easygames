/* Grafik-Bausteine: glatte, organische Formen, Umgebungslicht und Texturen aus Rauschen (alles erzeugt, nichts zu laden). */
import * as T from 'three';

/* ---------- Rauschen ---------- */
function mul(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
function h3(x, y, z, s) { let n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 19.19) * 43758.5453; return n - Math.floor(n) }
function vn(x, y, z, s) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf), L = (a, b, t) => a + (b - a) * t;
  return L(L(L(h3(xi, yi, zi, s), h3(xi + 1, yi, zi, s), u), L(h3(xi, yi + 1, zi, s), h3(xi + 1, yi + 1, zi, s), u), v),
    L(L(h3(xi, yi, zi + 1, s), h3(xi + 1, yi, zi + 1, s), u), L(h3(xi, yi + 1, zi + 1, s), h3(xi + 1, yi + 1, zi + 1, s), u), v), w);
}
export function fbm(x, y, z, s, o) { let a = .5, f = 1, r = 0; for (let i = 0; i < (o || 3); i++) { r += a * vn(x * f, y * f, z * f, s + i * 7); f *= 2.03; a *= .5 } return r }

/* ---------- Glatte Formen ---------- */
/** Gleiche Ecken zusammenlegen (nur Position), damit computeVertexNormals weiche Übergänge liefert. */
function mergeVertices(g, tol) {
  const p = g.attributes.position, map = new Map(), pos = [], idx = [], q = 1 / tol;
  const src = g.index ? g.index.array : null, n = src ? src.length : p.count;
  for (let i = 0; i < n; i++) {
    const k = src ? src[i] : i, x = p.getX(k), y = p.getY(k), z = p.getZ(k), key = Math.round(x * q) + '_' + Math.round(y * q) + '_' + Math.round(z * q);
    let j = map.get(key); if (j === undefined) { j = pos.length / 3; map.set(key, j); pos.push(x, y, z) } idx.push(j);
  }
  const o = new T.BufferGeometry(); o.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); o.setIndex(idx); return o;
}
/** Kugel mit Rauschen verformt (Felsen, Laubwolken): geteilte Ecken, daher weiche Normalen. */
export function organic(detail, amp, freq, seed, sy) {
  let g = new T.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g, 1e-4);
  const p = g.attributes.position, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const k = 1 + amp * (fbm(v.x * freq + 5, v.y * freq + 5, v.z * freq + 5, seed, 3) - .5) * 2;
    p.setXYZ(i, v.x * k, v.y * k * (sy || 1), v.z * k);
  }
  g.computeVertexNormals();
  return g;
}
/** Kegel mit welligem Rand und mehreren Höhenringen (Tannenlagen). */
export function ruffleCone(radial, rings, wave) {
  let g = new T.ConeGeometry(1, 1, radial, rings);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g, 1e-4);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = .5 - y, a = Math.atan2(z, x);
    const k = 1 + wave * Math.sin(a * 7 + t * 5) * t * (.6 + .4 * Math.sin(a * 3));
    p.setXYZ(i, x * k, y - wave * .25 * t * t * (1 + Math.sin(a * 5)), z * k);
  }
  g.computeVertexNormals();
  return g;
}
/** Sechskant-Kristall mit Spitzen oben und unten (Höhe -1..1, Radius 1). */
export function crystal() {
  const pts = [[0, -1], [.5, -.62], [.6, .45], [0, 1]].map(a => new T.Vector2(a[0], a[1]));
  const g = new T.LatheGeometry(pts, 6).toNonIndexed();
  g.computeVertexNormals();
  return g;
}
/** Hohe Auflösung spart Kanten: Standard-Formen für alle Teile des Spiels (weniger eckig als zuvor). */
export function geoSet(low) {
  const k = low ? .72 : 1, s = n => Math.max(5, Math.round(n * k));
  return {
    sph: new T.SphereGeometry(1, s(24), s(16)), sph0: new T.SphereGeometry(1, s(12), s(9)), sphHi: new T.SphereGeometry(1, s(40), s(28)),
    cone: new T.ConeGeometry(1, 1, s(24), 1), cone0: new T.ConeGeometry(1, 1, s(12), 1),
    cyl: new T.CylinderGeometry(1, 1, 1, s(24), 1), cyl0: new T.CylinderGeometry(1, 1, 1, s(12), 1),
    box: new T.BoxGeometry(1, 1, 1), oct: new T.OctahedronGeometry(1), ico: organic(low ? 1 : 2, .12, 1.8, 3),
    tor: new T.TorusGeometry(1, .3, s(10), s(28))
  };
}
export function propSet(low) {
  return {
    trunk: new T.CylinderGeometry(.5, .8, 1, low ? 8 : 12, 1), canopy: organic(2, .26, 2.1, 11), pine: ruffleCone(low ? 14 : 20, 2, .16),
    grass: new T.ConeGeometry(.09, .6, 4, 1), rock: organic(low ? 1 : 2, .34, 1.5, 23, .8), pave: organic(1, .2, 1.4, 5, .5),
    cap: new T.SphereGeometry(1, low ? 10 : 14, low ? 6 : 8, 0, 6.283, 0, 1.6), stem: new T.CylinderGeometry(.18, .25, 1, 8, 1),
    flower: new T.SphereGeometry(1, 8, 6), crystal: crystal()
  };
}

/* ---------- Umgebungslicht (Spiegelungen auf Metall, Kristall, Glas) ---------- */
export function makeEnv(renderer) {
  const pm = new T.PMREMGenerator(renderer), es = new T.Scene();
  const g = new T.SphereGeometry(10, 24, 16), p = g.attributes.position, col = new Float32Array(p.count * 3), c = new T.Color(), top = new T.Color(.30, .40, .95), hor = new T.Color(.10, .16, .34), low = new T.Color(.05, .16, .14);
  for (let i = 0; i < p.count; i++) { const h = p.getY(i) / 10; if (h > 0) c.copy(hor).lerp(top, Math.min(1, h * 1.1)); else c.copy(hor).lerp(low, Math.min(1, -h * 2)); col.set([c.r, c.g, c.b], i * 3) }
  g.setAttribute('color', new T.BufferAttribute(col, 3));
  es.add(new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
  const moon = new T.Mesh(new T.SphereGeometry(1.6, 12, 8), new T.MeshBasicMaterial({ color: new T.Color(3, 3.3, 4.2) }));
  moon.position.set(-.42, .5, -.76).normalize().multiplyScalar(8); es.add(moon);
  const t = pm.fromScene(es, .02).texture; pm.dispose(); return t;
}

/* ---------- Texturen ---------- */
function cv(n) { const c = document.createElement('canvas'); c.width = c.height = n; return c }
function tex(c, rep, aniso) { const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = aniso || 4; return t }
/** Kachelbares Pixel-Rauschen: f(x,y,wrapped) liefert Helligkeit 0..1. */
function noiseTile(n, seed, f) {
  const c = cv(n), x = c.getContext('2d'), im = x.createImageData(n, n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const v = Math.max(0, Math.min(1, f(i / n, j / n, seed))), o = (j * n + i) * 4, b = v * 255 | 0;
    im.data[o] = im.data[o + 1] = im.data[o + 2] = b; im.data[o + 3] = 255
  }
  x.putImageData(im, 0, 0); return c;
}
/** Periodisches Rauschen (nahtlos kachelbar): f = Wiederholungen in u, g = in v. */
function pn(x, y, P, Q, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, wx = i => ((i % P) + P) % P, wy = i => ((i % Q) + Q) % Q;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), a = h3(wx(xi), wy(yi), 0, s), b = h3(wx(xi + 1), wy(yi), 0, s), c = h3(wx(xi), wy(yi + 1), 0, s), d = h3(wx(xi + 1), wy(yi + 1), 0, s);
  const t = a + (b - a) * u; return t + (c + (d - c) * u - t) * v;
}
function tn(u, v, s, f, g) { let a = .5, r = 0, P = f | 0, Q = (g || f) | 0; for (let i = 0; i < 4; i++) { r += a * pn(u * P, v * Q, P, Q, s + i * 5); P *= 2; Q *= 2; a *= .5 } return r }

export function groundTextures(TW, TD) {
  const n = 256, rnd = mul(71042), c = cv(n), x = c.getContext('2d');
  x.fillStyle = '#f4f4ee'; x.fillRect(0, 0, n, n);
  const m = noiseTile(n, 3, (u, v, s) => .75 + tn(u, v, s, 7) * .5);
  x.globalCompositeOperation = 'multiply'; x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 2600; i++) { // Halme und Erdkörner
    const px = rnd() * n, py = rnd() * n, a = -1.57 + (rnd() - .5) * 1.1, l = 2 + rnd() * 5, g = rnd();
    x.strokeStyle = g < .4 ? 'rgba(210,235,190,.20)' : g < .75 ? 'rgba(40,70,50,.16)' : 'rgba(110,90,70,.14)';
    x.lineWidth = .7 + rnd() * .8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  const map = tex(c, [TW / 9, TD / 9], 8);
  const bump = tex(noiseTile(n, 8, (u, v, s) => tn(u, v, s, 4) * .7 + tn(u, v, s + 3, 12) * .3), [TW / 9, TD / 9], 4);
  return { map, bump };
}
/** Putz: feine Körnung + leichte Flecken. */
export function plasterMap() { return tex(noiseTile(128, 5, (u, v, s) => .86 + (tn(u, v, s, 10) - .5) * .3 + (tn(u, v, s + 1, 48) - .5) * .12), null, 8) }
/** Holzmaserung (Längsrichtung = u). */
export function woodMap() { return tex(noiseTile(128, 9, (u, v, s) => .74 + (tn(u, v, s, 1, 3) - .5) * .5 + Math.sin((v + tn(u, v, s, 4) * .2) * 56) * .06), null, 8) }
/** Dachschindeln: Reihen versetzter Bogen-Kacheln. */
export function shingleMap() {
  const n = 128, c = cv(n), x = c.getContext('2d'); x.fillStyle = '#e8e8e8'; x.fillRect(0, 0, n, n);
  const R = 8, w = n / 8;
  for (let r = 0; r < R; r++) for (let i = -1; i < 9; i++) {
    const cx = i * w + (r % 2 ? w / 2 : 0), y = r * (n / R);
    x.fillStyle = `rgba(0,0,0,${.05 + ((r * 7 + i * 3) % 5) * .018})`; x.beginPath(); x.arc(cx, y, w * .52, 0, Math.PI); x.fill();
    x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = 1.4; x.beginPath(); x.arc(cx, y, w * .52, .05, Math.PI - .05); x.stroke();
  }
  return tex(c, null, 8);
}
/** Gepflasterter Stein / Felsen (weiche Adern). */
export function stoneMap() { return tex(noiseTile(128, 14, (u, v, s) => .78 + (tn(u, v, s, 6) - .5) * .42 + (Math.abs(tn(u, v, s + 4, 12) - .5) < .03 ? -.18 : 0)), null, 8) }
/** Rinde mit senkrechten Furchen (für Stämme). */
export function barkMap() { return tex(noiseTile(128, 17, (u, v, s) => .7 + (tn(u, v, s, 8, 1) - .5) * .7 + Math.sin(u * 6.2832 * 6 + tn(u, v, s, 5) * 3) * .1), [1, 2], 8) }

/* ---------- Oberflächenstruktur ohne UV: dreiseitig projiziertes Rauschen im Objektraum ---------- */
let DET = null;
function detTex() { return DET || (DET = tex(noiseTile(128, 31, (u, v, s) => .5 + (tn(u, v, s, 4) - .5) * 1.5 + (tn(u, v, s + 2, 16) - .5) * .5), null, 8)) }
export function addDetail(m, o) {
  o = o || {};
  const sc = o.scale ?? .8, amp = o.amp ?? .09, rg = o.rough ?? .25, stretch = o.stretch || [1, 1, 1];
  m.userData.det = { sc, amp, rg };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.tDet = { value: detTex() }; sh.uniforms.dS = { value: new T.Vector4(sc * stretch[0], sc * stretch[1], sc * stretch[2], 0) }; sh.uniforms.dA = { value: new T.Vector2(amp, rg) };
    sh.vertexShader = 'varying vec3 vObjP;varying vec3 vObjN;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjP=position;vObjN=normal;');
    sh.fragmentShader = 'varying vec3 vObjP;varying vec3 vObjN;uniform sampler2D tDet;uniform vec4 dS;uniform vec2 dA;\n' + sh.fragmentShader
      .replace('#include <color_fragment>', '#include <color_fragment>\nvec3 dw=pow(abs(normalize(vObjN)),vec3(4.));dw/=dw.x+dw.y+dw.z;float dn=texture2D(tDet,vObjP.yz*dS.xy).r*dw.x+texture2D(tDet,vObjP.xz*dS.zy).r*dw.y+texture2D(tDet,vObjP.xy*dS.xz).r*dw.z;diffuseColor.rgb*=1.-dA.x+dA.x*2.*dn;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor*(1.-dA.y+dA.y*2.*dn),.04,1.);');
  };
  m.customProgramCacheKey = () => 'det';
  return m;
}
/** THREE-Kopie, deren Standardmaterial automatisch Umgebungslicht und Oberflächenstruktur bekommt. */
export function makeT(THREE, envIntensity) {
  class SM extends THREE.MeshStandardMaterial { constructor(p) { super(p); this.envMapIntensity = envIntensity; addDetail(this) } }
  class PM extends THREE.MeshPhysicalMaterial { constructor(p) { super(p); this.envMapIntensity = envIntensity * 1.4 } }
  return Object.assign({}, THREE, { MeshStandardMaterial: SM, MeshPhysicalMaterial: PM });
}

/* ---------- Fell (Schalen-Technik): mehrere aufgeblähte Kopien einer Form, Fellhaare per Rauschen ausgestanzt ---------- */
export const FURS = [];
/** len = Haarlänge, dens = Haare pro Meter, cut = wie viele Haare vor der Spitze enden, root/tip = Helligkeit an Wurzel/Spitze. */
export function furMat(T_, hex, o) {
  o = Object.assign({ len: .035, dens: 40, cut: .8, root: .74, tip: 1.02, droop: .25 }, o || {});
  const m = new T_.MeshStandardMaterial({ color: hex, roughness: .96 }); m.envMapIntensity = .1;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uFur = { value: new T.Vector4(o.len, o.dens, o.cut, o.droop) }; sh.uniforms.uFurC = { value: new T.Vector2(o.root, o.tip) };
    sh.vertexShader = 'attribute float aShell;varying float vShell;varying vec3 vFP;uniform vec4 uFur;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nvShell=aShell;vFP=position;transformed+=normalize(objectNormal)*aShell*uFur.x;transformed.y-=aShell*aShell*uFur.x*uFur.w;');
    sh.fragmentShader = 'varying float vShell;varying vec3 vFP;uniform vec4 uFur;uniform vec2 uFurC;float fh(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}\n' + sh.fragmentShader
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n{vec3 q=vFP*uFur.y;float rn=fh(floor(q));vec3 fr=fract(q)-.5;if(rn<vShell*uFur.z||length(fr)>.56-.42*vShell*(.45+rn))discard;}')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb*=mix(uFurC.x,uFurC.y,vShell);');
  };
  m.customProgramCacheKey = () => 'fur';
  m.userData.furOpt = o;
  m.clone = function () { const c = furMat(T_, this.color.getHex(), this.userData.furOpt); c.color.copy(this.color); return c };
  return m;
}
/** Schalen-Netz für eine Geometrie (teilt deren Daten): n Instanzen, jede mit eigener Schalenhöhe 0..1. */
export function furShells(T_, geo, mat, n) {
  const g = new T_.BufferGeometry(); if (geo.index) g.index = geo.index;
  for (const k in geo.attributes) g.setAttribute(k, geo.attributes[k]);
  const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = (i + 1) / n;
  g.setAttribute('aShell', new T_.InstancedBufferAttribute(a, 1));
  const im = new T_.InstancedMesh(g, mat, n), I = new T_.Matrix4();
  for (let i = 0; i < n; i++) im.setMatrixAt(i, I);
  im.frustumCulled = false; im.userData.fur = n; FURS.push(im);
  return im;
}
/** Fell-Stufe setzen: 1 = alle Schalen, kleiner = kürzeres Fell, 0 = aus. */
export function setFurLevel(k) { for (const im of FURS) { im.count = Math.round(im.userData.fur * k); im.visible = im.count > 0 } }
