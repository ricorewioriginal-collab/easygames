/* Gemeinsame Materialien: wenige Shader-Programme, Wind für Pflanzen, Zeit-Uniform für Animationen. */
export const globalUniforms = {
  uTime: { value: 0 },
  uWind: { value: 1 }
};

const windChunk = `
  #ifdef USE_WIND
    float wph = dot(transformed.xz, vec2(0.13, 0.17));
    #ifdef USE_INSTANCING
      wph += instanceMatrix[3].x * 0.21 + instanceMatrix[3].z * 0.17;
    #endif
    float wk = max(0.0, transformed.y) * uWindAmp;
    transformed.x += sin(uTime * 1.7 + wph) * wk * uWind;
    transformed.z += cos(uTime * 1.3 + wph * 1.3) * wk * 0.6 * uWind;
  #endif
`;

function addWind(m: THREE.Material, amp: number): void {
  m.onBeforeCompile = shader => {
    shader.uniforms.uTime = globalUniforms.uTime;
    shader.uniforms.uWind = globalUniforms.uWind;
    shader.uniforms.uWindAmp = { value: amp };
    shader.vertexShader = 'uniform float uTime;\nuniform float uWind;\nuniform float uWindAmp;\n#define USE_WIND\n' +
      shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + windChunk);
  };
  m.customProgramCacheKey = () => 'wind' + amp;
}

let cache: ReturnType<typeof create> | null = null;
function create() {
  const std = (p: THREE.MaterialParams) => new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0, ...p });
  const vc = std({ vertexColors: true });
  const vcGlow = new THREE.MeshBasicMaterial({ vertexColors: true });
  const foliage = std({ vertexColors: true, roughness: 0.9 });
  addWind(foliage, 0.045);
  const grass = std({ vertexColors: true, roughness: 1, side: THREE.DoubleSide });
  addWind(grass, 0.32);
  const terrain = std({ vertexColors: true, roughness: 0.95 });
  const shiny = std({ vertexColors: true, roughness: 0.35, metalness: 0.25 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.45, depthWrite: false });
  const shadowBlob = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
  return { vc, vcGlow, foliage, grass, terrain, shiny, glass, shadowBlob };
}
export const mats = (): ReturnType<typeof create> => (cache ??= create());

const colorMats = new Map<string, THREE.MeshStandardMaterial>();
/** Einfarbiges Material aus dem Cache (für bewegliche Teile). */
export function colorMat(hex: number, opts?: { emissive?: number; rough?: number; transparent?: boolean; opacity?: number }): THREE.MeshStandardMaterial {
  const key = hex + '|' + (opts?.emissive ?? 0) + '|' + (opts?.rough ?? 0.8) + '|' + (opts?.opacity ?? 1);
  let m = colorMats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: hex, roughness: opts?.rough ?? 0.8, metalness: 0, emissive: opts?.emissive ?? 0, transparent: !!opts?.transparent || (opts?.opacity ?? 1) < 1, opacity: opts?.opacity ?? 1 });
    colorMats.set(key, m);
  }
  return m;
}
