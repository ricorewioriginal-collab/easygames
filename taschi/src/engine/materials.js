// Shared materials. Environment uses Lambert (cheap, mobile friendly) with a
// world-space detail texture; characters and creatures use toon shading.
import { THREE } from './three.js';
import { detailTexture, toonGradient } from './textures.js';

export const globalUniforms = { uTime: { value: 0 }, uWind: { value: 1 } };
const cache = new Map();
function shared(key, make) { if (!cache.has(key)) { const m = make(); m.userData.shared = true; cache.set(key, m); } return cache.get(key); }

function addDetail(shader, scale = 0.35, strength = 0.55) {
  shader.uniforms.tDetail = { value: detailTexture() };
  shader.uniforms.uDetailScale = { value: scale };
  shader.uniforms.uDetailStrength = { value: strength };
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPosD;')
    .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvec4 wpd = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nwpd = instanceMatrix * wpd;\n#endif\nvWorldPosD = (modelMatrix * wpd).xyz;');
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPosD;\nuniform sampler2D tDetail;\nuniform float uDetailScale;\nuniform float uDetailStrength;')
    .replace('#include <color_fragment>', '#include <color_fragment>\nfloat dtl = texture2D(tDetail, vWorldPosD.xz * uDetailScale).r * 0.6 + texture2D(tDetail, vWorldPosD.xz * uDetailScale * 0.23 + vWorldPosD.y * 0.05).r * 0.4;\ndiffuseColor.rgb *= mix(1.0, dtl * 1.28, uDetailStrength);');
}

// Vertex-coloured environment material (buildings, props, rocks).
export function envMaterial({ detail = true, scale = 0.6, strength = 0.35, side = THREE.FrontSide } = {}) {
  return shared('env' + detail + scale + strength + side, () => {
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side });
    if (detail) m.onBeforeCompile = (s) => addDetail(s, scale, strength);
    m.customProgramCacheKey = () => 'env' + detail + scale + strength;
    return m;
  });
}

// Textured material with a map (walls, roofs, floors).
export function texturedMaterial(map, { color = 0xffffff, side = THREE.FrontSide } = {}) {
  return new THREE.MeshLambertMaterial({ map, color, side });
}

export function terrainMaterial(paint) {
  const m = new THREE.MeshLambertMaterial({ map: paint });
  m.onBeforeCompile = (s) => addDetail(s, 0.45, 0.62);
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
      if (detail) addDetail(s, 0.9, 0.3);
    };
    m.customProgramCacheKey = () => 'foliage' + sway + detail;
    return m;
  });
}

// Tall encounter grass: stronger sway, slight colour variation.
export function grassMaterial() {
  return shared('grass', () => {
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
    };
    m.customProgramCacheKey = () => 'grass';
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
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform vec3 uDeep;\nvarying vec3 vWp;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float ripple = sin(vWp.x * 1.3 + uTime * 1.6) * sin(vWp.z * 1.1 - uTime * 1.2);
        float sparkle = smoothstep(0.92, 1.0, sin(vWp.x * 3.7 + uTime * 2.0) * sin(vWp.z * 3.1 + uTime * 1.7));
        diffuseColor.rgb = mix(uDeep, diffuseColor.rgb, 0.65 + ripple * 0.12) + sparkle * 0.25;`);
  };
  m.customProgramCacheKey = () => 'water';
  return m;
}

export function glowMaterial(color, opacity = 0.8) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
}

export function disposeSharedMaterials() { for (const m of cache.values()) m.dispose(); cache.clear(); }
