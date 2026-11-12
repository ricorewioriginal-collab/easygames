// Shared materials. Environment uses Lambert (cheap, mobile friendly) with a
// world-space detail texture; characters and creatures use toon shading.
import { THREE } from './three.js';
import { detailTexture, toonGradient, photoDetail } from './textures.js';

export const globalUniforms = { uTime: { value: 0 }, uWind: { value: 1 } };
const cache = new Map();
function shared(key, make) { if (!cache.has(key)) { const m = make(); m.userData.shared = true; cache.set(key, m); } return cache.get(key); }

// Detail auf der Oberfläche, in Weltkoordinaten (keine UVs nötig). kind:
//  'noise'   – gemaltes Rauschen (Gebäude, Requisiten)
//  'terrain' – Fototexturen Gras / Erde / Pflaster, gewählt nach der Bodenfarbe
//  'rock'    – Felstextur, von oben und von der Seite
//  'foliage' – Rinde an braunen Stämmen, sonst Rauschen
const PHOTO = { terrain: ['grass', 'ground', 'paving'], rock: ['rock'], foliage: ['bark'] };
const DETAIL_GLSL = {
  noise: 'float dtl = texture2D(tDetail, vWorldPosD.xz * uDetailScale).r * 0.6 + texture2D(tDetail, vWorldPosD.xz * uDetailScale * 0.23 + vWorldPosD.y * 0.05).r * 0.4;\ndiffuseColor.rgb *= mix(1.0, dtl * 1.28, uDetailStrength);',
  terrain: `vec3 pc = diffuseColor.rgb; float pmx = max(pc.r, max(pc.g, pc.b)), pmn = min(pc.r, min(pc.g, pc.b));
float wG = smoothstep(0.0, 0.05, pc.g - max(pc.r, pc.b));
float wP = (1.0 - wG) * (1.0 - smoothstep(0.1, 0.24, (pmx - pmn) / max(pmx, 0.02)));
float wD = max(0.0, 1.0 - wG - wP);
vec2 wq = vWorldPosD.xz;
float ph = texture2D(tPhoto0, wq * 0.42).r * wG + texture2D(tPhoto1, wq * 0.3).r * wD + texture2D(tPhoto2, wq * 0.36).r * wP;
float macro = texture2D(tDetail, wq * uDetailScale * 0.23).r;
diffuseColor.rgb *= mix(1.0, ph * 2.0, uDetailStrength * mix(0.85, 1.3, wP)) * mix(1.0, macro * 1.28, 0.35);`,
  rock: `float ra = texture2D(tPhoto0, vWorldPosD.xz * 0.35).r, rb = texture2D(tPhoto0, vec2(vWorldPosD.x + vWorldPosD.z, vWorldPosD.y) * 0.35).r;
diffuseColor.rgb *= mix(1.0, (ra * 0.5 + rb * 0.5) * 2.0, uDetailStrength * 1.6);`,
  foliage: `vec3 fc = diffuseColor.rgb;
float wB = smoothstep(1.08, 1.3, fc.r / max(fc.g, 0.02)) * smoothstep(1.1, 1.4, fc.r / max(fc.b, 0.02));
float dtl = texture2D(tDetail, vWorldPosD.xz * uDetailScale).r * 0.6 + texture2D(tDetail, vWorldPosD.xz * uDetailScale * 0.23 + vWorldPosD.y * 0.05).r * 0.4;
float bk = texture2D(tPhoto0, vec2((vWorldPosD.x + vWorldPosD.z) * 1.1, vWorldPosD.y * 0.5)).r;
diffuseColor.rgb *= mix(mix(1.0, dtl * 1.28, uDetailStrength), mix(1.0, bk * 2.0, 0.75), wB);`
};
function addDetail(shader, scale = 0.35, strength = 0.55, kind = 'noise') {
  shader.uniforms.tDetail = { value: detailTexture() };
  shader.uniforms.uDetailScale = { value: scale };
  shader.uniforms.uDetailStrength = { value: strength };
  const photos = PHOTO[kind] || [];
  photos.forEach((n, i) => { shader.uniforms['tPhoto' + i] = photoDetail(n); });
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPosD;')
    .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvec4 wpd = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nwpd = instanceMatrix * wpd;\n#endif\nvWorldPosD = (modelMatrix * wpd).xyz;');
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPosD;\nuniform sampler2D tDetail;\nuniform float uDetailScale;\nuniform float uDetailStrength;' + photos.map((_, i) => '\nuniform sampler2D tPhoto' + i + ';').join(''))
    .replace('#include <color_fragment>', '#include <color_fragment>\n' + DETAIL_GLSL[kind]);
}

// Vertex-coloured environment material (buildings, props, rocks).
export function envMaterial({ detail = true, scale = 0.6, strength = 0.35, side = THREE.FrontSide, kind = 'noise' } = {}) {
  return shared('env' + detail + scale + strength + side + kind, () => {
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side });
    if (detail) m.onBeforeCompile = (s) => addDetail(s, scale, strength, kind);
    m.customProgramCacheKey = () => 'env' + detail + scale + strength + kind;
    return m;
  });
}

// Textured material with a map (walls, roofs, floors).
export function texturedMaterial(map, { color = 0xffffff, side = THREE.FrontSide } = {}) {
  return new THREE.MeshLambertMaterial({ map, color, side });
}

export function terrainMaterial(paint) {
  const m = new THREE.MeshLambertMaterial({ map: paint });
  m.onBeforeCompile = (s) => addDetail(s, 0.45, 0.62, 'terrain');
  m.customProgramCacheKey = () => 'terrain';
  return m;
}

// Foliage: vertex colours + gentle wind sway (height weighted).
export function foliageMaterial({ sway = 1, detail = true } = {}) {
  return shared('foliage' + sway + detail, () => {
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    m.onBeforeCompile = (s) => {
      s.uniforms.uTime = globalUniforms.uTime;
      s.uniforms.uWind = globalUniforms.uWind;
      s.vertexShader = s.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vec3 basePos = vec3(0.0);
          #ifdef USE_INSTANCING
          basePos = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
          #endif
          float h = max(0.0, transformed.y);
          float ph = basePos.x * 0.37 + basePos.z * 0.29;
          float sw = sin(uTime * 1.7 + ph) * 0.5 + sin(uTime * 3.1 + ph * 1.7) * 0.18;
          transformed.x += sw * h * h * 0.012 * ${sway.toFixed(2)} * uWind;
          transformed.z += cos(uTime * 1.3 + ph) * h * h * 0.008 * ${sway.toFixed(2)} * uWind;`);
      if (detail) addDetail(s, 0.9, 0.3, 'foliage');
    };
    m.customProgramCacheKey = () => 'foliage' + sway + detail;
    return m;
  });
}

// Tall encounter grass: stronger sway, slight colour variation.
// carpet: Halme des Grasteppichs werden beidseitig wie der Boden beleuchtet.
export function grassMaterial({ carpet = false } = {}) {
  return shared('grass' + carpet, () => {
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    m.onBeforeCompile = (s) => {
      s.uniforms.uTime = globalUniforms.uTime;
      s.uniforms.uWind = globalUniforms.uWind;
      s.vertexShader = s.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vec3 bp = vec3(0.0);
          #ifdef USE_INSTANCING
          bp = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
          #endif
          float hh = max(0.0, transformed.y);
          float p2 = bp.x * 0.5 + bp.z * 0.43;
          transformed.x += sin(uTime * 2.3 + p2) * hh * 0.18 * uWind;
          transformed.z += cos(uTime * 1.9 + p2 * 1.3) * hh * 0.12 * uWind;`);
      if (carpet) s.fragmentShader = s.fragmentShader.replace('( gl_FrontFacing ) ? vLightFront : vLightBack', 'vLightFront').replace('( gl_FrontFacing ) ? vIndirectFront : vIndirectBack', 'vIndirectFront');
    };
    m.customProgramCacheKey = () => 'grass' + carpet;
    return m;
  });
}

export function toonMaterial(color, { emissive = 0x000000, transparent = false, opacity = 1 } = {}) {
  const key = 'toon' + color + '_' + emissive + transparent + opacity;
  return shared(key, () => new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), emissive, transparent, opacity }));
}
export function toonVertexMaterial() {
  return shared('toonV', () => new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient() }));
}
export function outlineMaterial(color = 0x1b2333) {
  return shared('outline' + color, () => new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }));
}

export function waterMaterial(color, { opacity = 0.82, deep = null } = {}) {
  const m = new THREE.MeshPhongMaterial({ color, shininess: 90, specular: 0xbfe8ff, transparent: true, opacity, depthWrite: false });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = globalUniforms.uTime;
    s.uniforms.uDeep = { value: new THREE.Color(deep ?? new THREE.Color(color).multiplyScalar(0.55)) };
    s.uniforms.uSky = { value: new THREE.Color(0xd6ecff) };
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying vec3 vWp;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wq = modelMatrix * vec4(transformed, 1.0);
        float wv = sin(wq.x * 0.35 + uTime * 1.2) * 0.06 + sin(wq.z * 0.5 + uTime * 0.9) * 0.05;
        transformed.y += wv;
        vWp = wq.xyz;`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        vec4 wn = modelMatrix * vec4(position, 1.0);
        objectNormal = normalize(vec3(-cos(wn.x * 0.35 + uTime * 1.2) * 0.02, 1.0, -cos(wn.z * 0.5 + uTime * 0.9) * 0.025));`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform vec3 uDeep;\nuniform vec3 uSky;\nvarying vec3 vWp;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float ripple = sin(vWp.x * 1.3 + uTime * 1.6) * sin(vWp.z * 1.1 - uTime * 1.2);
        float sparkle = smoothstep(0.92, 1.0, sin(vWp.x * 3.7 + uTime * 2.0) * sin(vWp.z * 3.1 + uTime * 1.7));
        diffuseColor.rgb = mix(uDeep, diffuseColor.rgb, 0.65 + ripple * 0.12) + sparkle * 0.25;`)
      // Spiegelung des Himmels zum flachen Blickwinkel hin (Fresnel) – wirkt wie echtes Wasser
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float wfr = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 3.0);
        totalEmissiveRadiance += uSky * wfr * 0.55;
        diffuseColor.a = mix(diffuseColor.a, 1.0, wfr * 0.6);`);
  };
  m.customProgramCacheKey = () => 'water';
  return m;
}

export function glowMaterial(color, opacity = 0.8) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
}

export function disposeSharedMaterials() { for (const m of cache.values()) m.dispose(); cache.clear(); }
