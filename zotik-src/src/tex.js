// Hochwertige Oberflächen: CC0-Texturen von Poly Haven (public/tex, 512 px) mit Dreiseiten-Projektion (triplanar) in Weltkoordinaten.
// Dadurch braucht keine Form UV-Koordinaten, und skalierte Kästen/Zylinder/Felsen werden nicht verzerrt.
// Farbe und Normalen kommen aus der Textur; die Grundfarbe tönt nur. Ohne geladene Textur bleibt die Fläche einfach einfarbig.
export function createTex({ T, renderer, hi }) {
  const L = new T.TextureLoader(), cache = {}, mats = new Map(), aniso = Math.min(hi ? 16 : 8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4);
  const tex = (k, srgb) => { const id = k + (srgb ? 'd' : 'n'); if (cache[id]) return cache[id];
    const t = L.load('tex/' + k + '_' + (srgb ? 'd' : 'n') + (hi ? '1k' : '') + '.jpg');   /* PC/TV: 1024 px für scharfe Oberflächen, Handy: 512 px */ t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = aniso; if (srgb) t.encoding = T.sRGBEncoding; return cache[id] = t; };
  // Kopien (z. B. zum Einfärben von Gegnern) behalten die Texturprojektion
  function cloneTri() { const c = T.MeshStandardMaterial.prototype.clone.call(this); c.onBeforeCompile = this.onBeforeCompile; c.customProgramCacheKey = this.customProgramCacheKey; c.clone = cloneTri; return c; }
  // Material mit Dreiseiten-Projektion; o: { s: Maßstab (Wiederholungen je Meter), gain: Helligkeit, n: Normalenstärke, r, m, e, ei, vc: Vertexfarben }
  function tri(key, color, o = {}) {
    const id = key + '|' + color + '|' + JSON.stringify(o); if (!o.fresh && mats.has(id)) return mats.get(id);
    const m = new T.MeshStandardMaterial({ color, roughness: o.r ?? .9, metalness: o.m ?? 0, vertexColors: !!o.vc });
    if (o.e !== undefined) { m.emissive = new T.Color(o.e); m.emissiveIntensity = o.ei ?? 1; }
    const U = { triD: { value: tex(key, 1) }, triN: { value: tex(key, 0) }, triS: { value: o.s ?? .35 }, triG: { value: o.gain ?? 1.6 }, triNS: { value: o.n ?? 1 } };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'varying vec3 vTriP; varying vec3 vTriN;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
  { vec4 tp = vec4(transformed, 1.0); vec3 tn = objectNormal;
  #ifdef USE_INSTANCING
    tp = instanceMatrix * tp; tn = mat3(instanceMatrix) * tn;
  #endif
    vTriP = ${o.obj ? 'tp.xyz' : '(modelMatrix * tp).xyz'}; vTriN = normalize(${o.obj ? 'tn' : 'mat3(modelMatrix) * tn'}); }`);
      sh.fragmentShader = 'uniform sampler2D triD; uniform sampler2D triN; uniform float triS; uniform float triG; uniform float triNS; varying vec3 vTriP; varying vec3 vTriN;\n' + sh.fragmentShader
        .replace('#include <map_fragment>', `#include <map_fragment>
  vec3 triW = pow(abs(vTriN), vec3(4.0)); triW /= (triW.x + triW.y + triW.z + 1e-4);
  vec3 triPp = vTriP * triS;
  vec4 triC = sRGBToLinear(texture2D(triD, triPp.zy)) * triW.x + sRGBToLinear(texture2D(triD, triPp.xz)) * triW.y + sRGBToLinear(texture2D(triD, triPp.xy)) * triW.z;
  diffuseColor.rgb *= triC.rgb * triG;`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  { vec3 nX = texture2D(triN, triPp.zy).xyz * 2.0 - 1.0, nY = texture2D(triN, triPp.xz).xyz * 2.0 - 1.0, nZ = texture2D(triN, triPp.xy).xyz * 2.0 - 1.0;
    nX.xy *= triNS; nY.xy *= triNS; nZ.xy *= triNS; vec3 wn = normalize(vTriN);
    nX = vec3(nX.xy + wn.zy, abs(nX.z) * wn.x); nY = vec3(nY.xy + wn.xz, abs(nY.z) * wn.y); nZ = vec3(nZ.xy + wn.xy, abs(nZ.z) * wn.z);
    vec3 wN = normalize(nX.zyx * triW.x + nY.xzy * triW.y + nZ.xyz * triW.z);
    normal = normalize((viewMatrix * vec4(wN, 0.0)).xyz); }`);
    };
    m.customProgramCacheKey = () => o.obj ? 'trio' : 'tri'; m.clone = cloneTri;
    if (!o.fresh) mats.set(id, m); return m;
  }
  // Feine Haut/Fell-Struktur für Figuren und Gegner: Projektion im Objektraum (wandert beim Laufen nicht mit), schwache Normalen
  const skin = (color, o = {}) => tri(o.k || 'plaster', color, { s: 1.6, gain: 1.3, n: .45, r: o.r ?? .75, obj: 1 });
  return { tri, skin, tex };
}
