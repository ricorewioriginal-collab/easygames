/* Animiertes Meer: sanfte Wellen im Vertex-Shader, Glitzern, Fresnel, Nebel. Die Fläche wandert mit der Kamera mit. */
import { globalUniforms } from './materials.ts';
import type { QualityProfile } from './renderer.ts';

const vert = `
uniform float uTime; uniform float uWaves;
varying vec3 vWorld; varying float vWave;
#include <fog_pars_vertex>
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  float a = sin(w.x * 0.08 + uTime * 0.9) * 0.22 + sin(w.z * 0.11 + uTime * 1.2) * 0.18 + sin((w.x + w.z) * 0.05 + uTime * 0.6) * 0.25;
  w.y += a * uWaves;
  vWave = a; vWorld = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const frag = `
uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform float uNight;
varying vec3 vWorld; varying float vWave;
#include <fog_pars_fragment>
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec3 v = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(v.y, 0.0), 3.0);
  vec3 c = mix(uShallow, uDeep, 0.55 + vWave * 0.6);
  c = mix(c, uSky, fres * 0.55);
  vec2 g = floor(vWorld.xz * 1.6);
  float sp = step(0.985, h(g + floor(uTime * 2.0))) * (1.0 - uNight * 0.6);
  float band = smoothstep(0.35, 0.55, vWave) * 0.12;
  c += vec3(sp * 0.7 + band);
  gl_FragColor = vec4(c, 0.93);
  #include <fog_fragment>
}`;

export class Water {
  readonly mesh: THREE.Mesh;
  readonly mat: THREE.ShaderMaterial;
  level = 0;
  constructor(profile: QualityProfile) {
    const seg = profile.water === 'waves' ? 140 : 36;
    const g = new THREE.PlaneGeometry(1800, 1800, seg, seg).rotateX(-Math.PI / 2);
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: globalUniforms.uTime, uWaves: { value: profile.water === 'waves' ? 1 : 0.4 },
        uDeep: { value: new THREE.Color(0x1f8fd6) }, uShallow: { value: new THREE.Color(0x3fd3e0) }, uSky: { value: new THREE.Color(0xc8ecff) }, uNight: { value: 0 },
        fogColor: { value: new THREE.Color() }, fogNear: { value: 1 }, fogFar: { value: 1000 }
      },
      vertexShader: vert, fragmentShader: frag, transparent: true, fog: true, depthWrite: true
    });
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.renderOrder = 1;
    this.mesh.frustumCulled = false;
  }
  update(cam: THREE.Vector3, sky: THREE.Color, night: boolean): void {
    this.mesh.position.set(Math.round(cam.x / 12) * 12, this.level, Math.round(cam.z / 12) * 12);
    (this.mat.uniforms.uSky.value as THREE.Color).copy(sky);
    this.mat.uniforms.uNight.value = night ? 1 : 0;
    const deep = this.mat.uniforms.uDeep.value as THREE.Color, sh = this.mat.uniforms.uShallow.value as THREE.Color;
    if (night) { deep.setHex(0x173a7a); sh.setHex(0x2a6a9a); } else { deep.setHex(0x1f8fd6); sh.setHex(0x3fd3e0); }
  }
}
