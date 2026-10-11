import * as THREE from 'three';
import { ARENA } from '@shared/sim/types';
import type { Palette } from './themes';
import { TEAM_COLORS } from './themes';

/** Gemeinsame Uniform-Objekte: Änderungen wirken sofort auf ALLE Materialien der Arena. */
export interface ArenaUniforms {
  uTime: { value: number };
  uBall: { value: THREE.Vector3 };
  /** x = Torraum bei z < 0, y = Torraum bei z > 0 (Blitz-Stärke 0…1) */
  uFlash: { value: THREE.Vector2 };
  uPulse: { value: number };
  uPulseCol: { value: THREE.Color };
  uCheer: { value: number };
  uFogCol: { value: THREE.Color };
  uFogD: { value: number };
  uT0: { value: THREE.Color };
  uT1: { value: THREE.Color };
  uScale: { value: number };
}

export function createUniforms(pal: Palette): ArenaUniforms {
  return {
    uTime: { value: 0 },
    uBall: { value: new THREE.Vector3(0, 5, 0) },
    uFlash: { value: new THREE.Vector2(0, 0) },
    uPulse: { value: 0 },
    uPulseCol: { value: new THREE.Color(1, 1, 1) },
    uCheer: { value: 0 },
    uFogCol: { value: new THREE.Color(pal.fog) },
    uFogD: { value: pal.fogDensity },
    uT0: { value: new THREE.Color(TEAM_COLORS[0]) },
    uT1: { value: new THREE.Color(TEAM_COLORS[1]) },
    uScale: { value: 600 },
  };
}

const col = (hex: number): { value: THREE.Color } => ({ value: new THREE.Color(hex) });

/** Gemeinsame GLSL-Bausteine */
const COMMON = /* glsl */ `
uniform float uTime;
uniform vec3 uBall;
uniform vec2 uFlash;
uniform float uPulse;
uniform vec3 uPulseCol;
uniform float uCheer;
uniform vec3 uFogCol;
uniform float uFogD;
uniform vec3 uT0;
uniform vec3 uT1;
float hash11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash31(vec3 p3){ p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5; float s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
vec3 fogMix(vec3 c, vec3 wp){ float d = distance(wp, cameraPosition); float f = 1.0 - exp(-uFogD * uFogD * d * d); return mix(c, uFogCol, f); }
float fogKeep(vec3 wp){ float d = distance(wp, cameraPosition); return exp(-uFogD * uFogD * d * d); }
`;

const AA = /* glsl */ `
float aa(float d, float w){ return 1.0 - smoothstep(w, w + fwidth(d) * 1.1 + 0.0005, d); }
float gridLine(float c, float sp, float w){ float d = abs(fract(c / sp + 0.5) - 0.5) * sp; return aa(d, w); }
float sdBox(vec2 p, vec2 b){ vec2 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0); }
`;

function merge(u: ArenaUniforms, own: Record<string, THREE.IUniform>): Record<string, THREE.IUniform> {
  return { ...u, ...own };
}

/* ------------------------------------------------------------------ Himmel */

export function skyMaterial(u: ArenaUniforms, pal: Palette, mode: number): THREE.ShaderMaterial {
  const sd = new THREE.Vector3(...pal.skySunDir).normalize();
  return new THREE.ShaderMaterial({
    uniforms: merge(u, {
      uTop: col(pal.skyTop),
      uMid: col(pal.skyMid),
      uBot: col(pal.skyBottom),
      uSunCol: col(pal.skySunCol),
      uSunDir: { value: sd },
      uSunSize: { value: pal.skySunSize },
      uMode: { value: mode },
    }),
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_Position.z = gl_Position.w * 0.99995; // immer ganz hinten, unabhängig von der Kamera-Ferne
      }`,
    fragmentShader: /* glsl */ `
      ${COMMON}
      varying vec3 vDir;
      uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBot; uniform vec3 uSunCol; uniform vec3 uSunDir;
      uniform float uSunSize; uniform float uMode;
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 c = mix(uBot, uMid, smoothstep(0.0, 0.3, h));
        c = mix(c, uTop, smoothstep(0.2, 0.9, h));
        c = mix(c, uBot * 0.6, smoothstep(0.0, -0.3, h));
        float ang = acos(clamp(dot(d, uSunDir), -1.0, 1.0));
        float halo = exp(-ang * ang / (2.0 * 0.2 * 0.2));
        float hs = uMode < 0.5 ? 0.45 : (uMode < 1.5 ? 0.18 : 0.7);
        c += uSunCol * halo * hs * smoothstep(-0.1, 0.1, h + 0.1);
        float disc = 1.0 - smoothstep(uSunSize - 0.004, uSunSize, ang);
        vec3 sunC = uSunCol;
        if (uMode < 0.5) {
          // Synthwave-Sonne: Farbverlauf und waagrechte Lücken, nach unten breiter
          float t = clamp((uSunDir.y - d.y) / uSunSize, -1.0, 1.0);
          sunC = mix(uSunCol, vec3(1.0, 0.08, 0.45), clamp(t * 0.5 + 0.5, 0.0, 1.0));
          float k = fract(t * 5.0);
          float gap = 0.1 + 0.55 * clamp(t, 0.0, 1.0);
          disc *= mix(1.0, step(gap, k), step(0.12, t));
        }
        c = mix(c, sunC * 1.4, disc);
        // Sterne (Neon, Eis)
        if (uMode < 1.5) {
          vec3 sp = d * 110.0;
          vec3 cell = floor(sp);
          float hv = hash31(cell);
          vec3 f = fract(sp) - 0.5;
          float st = step(0.985, hv) * (1.0 - smoothstep(0.0, 0.32, length(f)));
          st *= 0.55 + 0.45 * sin(uTime * (1.5 + hv * 4.0) + hv * 90.0);
          c += vec3(0.85, 0.9, 1.0) * st * smoothstep(0.06, 0.35, h) * (uMode < 0.5 ? 1.2 : 0.7);
        }
        if (uMode < 0.5) {
          c += vec3(1.0, 0.12, 0.6) * exp(-max(h, 0.0) * 12.0) * 0.28 * step(-0.05, h);
        } else if (uMode < 1.5) {
          // Polarlicht
          float band = smoothstep(0.12, 0.4, h) * (1.0 - smoothstep(0.55, 0.95, h));
          float az = atan(d.z, d.x);
          float w = sin(az * 3.0 + uTime * 0.15 + sin(h * 9.0 + uTime * 0.25) * 1.6) * 0.5 + 0.5;
          float w2 = sin(az * 5.0 - uTime * 0.1 + h * 6.0) * 0.5 + 0.5;
          float a = pow(w, 3.0) * (0.5 + 0.5 * w2) * band;
          vec3 ac = mix(vec3(0.1, 1.0, 0.55), vec3(0.45, 0.35, 1.0), smoothstep(0.25, 0.8, h));
          c += ac * a * 0.8;
        } else {
          // Wolkenbänder im Abendlicht
          vec2 cp = d.xz / (abs(d.y) + 0.12) * 0.9;
          float cl = smoothstep(0.52, 0.82, fbm(cp + vec2(uTime * 0.01, 0.0)));
          cl *= smoothstep(0.02, 0.18, h) * (1.0 - smoothstep(0.35, 0.8, h));
          vec3 cc = mix(vec3(0.95, 0.35, 0.28), vec3(1.0, 0.75, 0.45), exp(-ang * 1.4));
          c = mix(c, cc, cl * 0.7);
        }
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

/* ------------------------------------------------------------------ Boden der Umgebung */

export function groundMaterial(u: ArenaUniforms, pal: Palette, mode: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: merge(u, {
      uGround: col(pal.ground),
      uLineA: col(pal.lineA),
      uLineB: col(pal.lineB),
      uMode: { value: mode },
    }),
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${COMMON}${AA}
      varying vec3 vW;
      uniform vec3 uGround; uniform vec3 uLineA; uniform vec3 uLineB; uniform float uMode;
      void main(){
        vec2 p = vW.xz;
        float dist = length(p);
        vec3 c = uGround;
        if (uMode < 0.5) {
          // Synthwave-Gitter bis zum Horizont
          float g1 = max(gridLine(p.x, 12.0, 0.09 + dist * 0.0009), gridLine(p.y, 12.0, 0.09 + dist * 0.0009));
          float g2 = max(gridLine(p.x, 60.0, 0.2 + dist * 0.002), gridLine(p.y, 60.0, 0.2 + dist * 0.002));
          vec3 lc = mix(uLineA, uLineB, smoothstep(-80.0, 80.0, p.x));
          c += lc * (g1 * 0.55 + g2 * 0.9) * exp(-dist * 0.0022);
          c += uLineA * 0.05 * exp(-dist * 0.006);
        } else if (uMode < 1.5) {
          // Schnee mit Glitzern
          float n = fbm(p * 0.04) * 0.35 + fbm(p * 0.3) * 0.12;
          c = uGround * (0.55 + n);
          vec2 cell = floor(p * 3.0);
          float h = hash21(cell);
          float sp = step(0.985, h) * (0.5 + 0.5 * sin(uTime * 2.0 + h * 80.0));
          c += vec3(1.0) * sp * exp(-dist * 0.004) * 0.7;
        } else {
          // Sand mit Dünenrillen
          float n = fbm(p * 0.02);
          float rip = sin((p.x * 0.12 + n * 14.0) + p.y * 0.05) * 0.5 + 0.5;
          c = mix(uGround * 0.55, uGround * 1.05, n * 0.7 + rip * 0.3);
          c += uLineB * 0.05 * hash21(floor(p * 2.0)) ;
        }
        c = fogMix(c, vW);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

/* ------------------------------------------------------------------ Hülle (Glaswand) */

export function hullMaterial(u: ArenaUniforms, pal: Palette): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: merge(u, {
      uColA: col(pal.lineA),
      uColB: col(pal.lineB),
      uGlass: col(pal.glass),
      uAlpha: { value: pal.glassAlpha },
      uHalf: { value: new THREE.Vector3(ARENA.halfWidth, ARENA.height, ARENA.halfLength) },
      uGoalTop: { value: ARENA.goalHeight },
    }),
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${COMMON}${AA}
      varying vec3 vW; varying vec3 vN;
      uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uGlass; uniform float uAlpha; uniform vec3 uHalf; uniform float uGoalTop;
      void main(){
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float ndv = abs(dot(N, V));
        float fres = pow(1.0 - ndv, 3.0);
        float roof = smoothstep(-0.45, -0.85, N.y);
        float horiz = abs(N.x) > abs(N.z) ? vW.z : vW.x;
        vec2 gp = mix(vec2(horiz, vW.y), vW.xz, step(0.6, abs(N.y)));
        float mn = max(gridLine(gp.x, 5.0, 0.022), gridLine(gp.y, 5.0, 0.022));
        float mj = max(gridLine(gp.x, 20.0, 0.07), gridLine(gp.y, 20.0, 0.07));
        float band = aa(abs(vW.y - uGoalTop), 0.09) + aa(abs(vW.y - (uHalf.y - 0.6)), 0.07) * 0.7;
        band *= 1.0 - roof;
        vec3 lineC = mix(uColA, uColB, 0.5 + 0.5 * sin(gp.x * 0.045 + 1.3));
        float side = smoothstep(uHalf.z * 0.55, uHalf.z, abs(vW.z));
        vec3 tc = vW.z < 0.0 ? uT0 : uT1;
        lineC = mix(lineC, tc, side * (1.0 - roof) * 0.85);
        float pul = 0.5 + 0.5 * sin(gp.x * 0.14 - gp.y * 0.11 - uTime * 1.3);
        float e = mn * (0.35 + 0.9 * pow(pul, 3.0)) + mj * 1.0 + band * 1.5;
        float foot = exp(-vW.y * 0.55);
        float db = distance(vW, uBall);
        float bg = exp(-db * db / 110.0);
        float fz = (vW.z < 0.0 ? uFlash.x : uFlash.y) * smoothstep(uHalf.z * 0.25, uHalf.z, abs(vW.z));
        vec3 fcol = vW.z < 0.0 ? uT1 : uT0;
        vec3 c = uGlass * 1.5;
        c += lineC * e * (1.0 - 0.55 * roof);
        c += lineC * (fres * 0.55 + foot * 0.45);
        c += mix(lineC, vec3(1.0), 0.5) * bg * 0.65;
        c += fcol * fz * 1.3 + vec3(fz * 0.25);
        c += uPulseCol * uPulse * (0.25 + e * 0.8);
        float a = uAlpha * (1.0 - 0.45 * roof) + clamp(e, 0.0, 1.0) * 0.75 + fres * 0.38 + foot * 0.2 + bg * 0.3 + fz * 0.55 + uPulse * 0.18;
        gl_FragColor = vec4(c, clamp(a, 0.0, 0.96));
        #include <colorspace_fragment>
      }`,
  });
}

/* ------------------------------------------------------------------ Boden (Lambert mit Schatten + Leuchtmarkierungen) */

export function floorMaterial(u: ArenaUniforms, pal: Palette): THREE.MeshLambertMaterial {
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const own = {
    uFloorA: col(pal.floorA),
    uFloorB: col(pal.floorB),
    uLineCol: col(pal.floorLine),
    uGridCol: col(pal.floorGrid),
    uColA: col(pal.lineA),
    uSkyGlow: col(pal.skyBottom),
  };
  const glsl = /* glsl */ `
    varying vec3 vFW;
    uniform float uTime; uniform vec3 uBall; uniform vec2 uFlash; uniform float uPulse; uniform vec3 uPulseCol;
    uniform vec3 uT0; uniform vec3 uT1;
    uniform vec3 uFloorA; uniform vec3 uFloorB; uniform vec3 uLineCol; uniform vec3 uGridCol; uniform vec3 uColA; uniform vec3 uSkyGlow;
    ${AA}
    vec3 floorColor(vec3 p, out vec3 glow){
      vec2 q = p.xz;
      float az = abs(q.y);
      float ax = abs(q.x);
      vec3 tint = q.y < 0.0 ? uT0 : uT1;
      vec2 tile = floor(q / 10.0);
      vec3 base = mix(uFloorA, uFloorB, mod(tile.x + tile.y, 2.0));
      base = mix(base, base * 0.7 + tint * 0.07, smoothstep(14.0, 50.0, az));
      glow = vec3(0.0);
      float g = max(gridLine(q.x, 5.0, 0.02), gridLine(q.y, 5.0, 0.02));
      float g2 = max(gridLine(q.x, 10.0, 0.035), gridLine(q.y, 10.0, 0.035));
      glow += uGridCol * (g * 0.22 + g2 * 0.5);
      float wl = 0.12;
      float lm = max(max(aa(abs(q.y), wl), aa(abs(length(q) - 10.0), wl)), 1.0 - smoothstep(0.5, 0.7, length(q)));
      float pen = aa(abs(sdBox(vec2(q.x, az - 37.0), vec2(20.0, 13.0))), wl);
      float gar = aa(abs(sdBox(vec2(q.x, az - 44.0), vec2(12.0, 6.0))), wl);
      float gl = aa(abs(az - 50.0), 0.3) * step(ax, 8.3);
      glow += uLineCol * lm * 1.1 + mix(uLineCol, tint, 0.75) * max(pen, gar) * 1.1 + tint * gl * 2.4;
      float ex = 34.0 - ax;
      float ez = 44.0 - az;
      float e = mix(min(ex, ez), ex, step(ax, 8.0) * step(38.0, az));
      float edge = exp(-max(e, 0.0) * 0.5);
      glow += mix(uColA, tint, smoothstep(30.0, 46.0, az) * 0.7) * edge * 0.4;
      float bd = distance(q, uBall.xz);
      float pool = exp(-bd * bd / 70.0) / (1.0 + uBall.y * 0.15);
      glow += (uColA * 0.5 + vec3(0.5)) * pool * 0.5;
      vec3 V = normalize(cameraPosition - p);
      float fr = pow(1.0 - clamp(V.y, 0.0, 1.0), 3.0);
      glow += uSkyGlow * fr * 0.3 * (0.6 + edge);
      glow += uPulseCol * uPulse * (0.08 + 0.45 * g2 + 0.3 * edge);
      float fl = q.y < 0.0 ? uFlash.x : uFlash.y;
      glow += (q.y < 0.0 ? uT1 : uT0) * fl * smoothstep(10.0, 50.0, az) * 0.9;
      return base;
    }`;
  m.customProgramCacheKey = () => 'tk-floor-v1';
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, {
      uTime: u.uTime,
      uBall: u.uBall,
      uFlash: u.uFlash,
      uPulse: u.uPulse,
      uPulseCol: u.uPulseCol,
      uT0: u.uT0,
      uT1: u.uT1,
      ...own,
    });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvFW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + glsl)
      .replace('#include <color_fragment>', '#include <color_fragment>\nvec3 floorGlow; diffuseColor.rgb = floorColor(vFW, floorGlow);')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += floorGlow;');
  };
  return m;
}

/* ------------------------------------------------------------------ Tornetz */

export function netMaterial(u: ArenaUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: merge(u, {}),
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${COMMON}
      varying vec3 vW; varying vec3 vN;
      void main(){
        vec3 N = normalize(vN);
        vec2 g = abs(N.z) > 0.6 ? vW.xy : (abs(N.x) > 0.6 ? vW.zy : vW.xz);
        vec2 r = vec2(g.x + g.y, g.x - g.y) / 0.9;
        vec2 f = abs(fract(r) - 0.5);
        vec2 w = fwidth(r) * 1.2;
        float d = min(0.5 - f.x, 0.5 - f.y);
        float net = 1.0 - smoothstep(0.035, 0.035 + max(w.x, w.y) + 0.01, d);
        net = mix(net, 0.3, smoothstep(0.2, 0.55, max(w.x, w.y)));
        bool neg = vW.z < 0.0;
        vec3 tc = neg ? uT0 : uT1;
        float depth = clamp((abs(vW.z) - 50.0) / 8.0, 0.0, 1.0);
        float fl = neg ? uFlash.x : uFlash.y;
        vec3 sc = neg ? uT1 : uT0;
        vec3 c = vec3(0.01, 0.015, 0.03) + tc * (0.1 + 0.4 * depth);
        c += mix(tc, vec3(1.0), 0.45) * net * (0.55 + 0.6 * depth);
        c += sc * fl * (0.4 + net * 1.6);
        c += uPulseCol * uPulse * net * 0.6;
        float a = 0.3 + net * 0.62 + depth * 0.15 + fl * 0.4;
        gl_FragColor = vec4(c, clamp(a, 0.0, 0.97));
        #include <colorspace_fragment>
      }`,
  });
}

/* ------------------------------------------------------------------ Leucht-Material (Rahmen, Strahlen, Heiligenschein) */

/** mode 0 = voll leuchtend (Vertexfarbe), 1 = Lichtstrahl (additiv, nach unten ausblendend), 2 = additiver Schein */
export function glowMaterial(u: ArenaUniforms, mode: 0 | 1 | 2, gain = 1, alpha = 1): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: merge(u, { uGain: { value: gain }, uAlpha: { value: alpha } }),
    transparent: mode !== 0,
    depthWrite: mode === 0,
    blending: mode === 0 ? THREE.NormalBlending : THREE.AdditiveBlending,
    side: mode === 1 ? THREE.DoubleSide : THREE.FrontSide,
    defines: { MODE: mode },
    vertexShader: /* glsl */ `
      attribute vec3 color;
      varying vec3 vC; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vC = color; vUv = uv; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${COMMON}
      uniform float uGain; uniform float uAlpha;
      varying vec3 vC; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){
        float fl = vW.z < 0.0 ? uFlash.x : uFlash.y;
        vec3 c = vC * uGain * (1.0 + 1.6 * fl) + vec3(fl * 0.5) + uPulseCol * uPulse * 0.4;
        float a = 1.0;
        #if MODE == 1
          vec3 V = normalize(cameraPosition - vW);
          float soft = pow(abs(dot(normalize(vN), V)), 1.4);
          a = uAlpha * pow(clamp(vUv.y, 0.0, 1.0), 1.3) * soft * (0.8 + 0.2 * sin(uTime * 0.7 + vW.x * 0.1)) * (1.0 + fl * 2.0 + uCheer);
          c *= a;
          a = 1.0;
        #elif MODE == 2
          c *= uAlpha;
        #endif
        c *= fogKeep(vW);
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }`,
  });
}

/* ------------------------------------------------------------------ Kulisse (Gebäude, Eis, Fels, Tribüne) */

/** mode 0 = Stadtfenster, 1 = Eis, 2 = Fels, 3 = schlicht */
export function sceneryMaterial(u: ArenaUniforms, pal: Palette, mode: number): THREE.ShaderMaterial {
  const sd = new THREE.Vector3(...pal.lightDir).normalize();
  return new THREE.ShaderMaterial({
    uniforms: merge(u, {
      uSunDir: { value: sd },
      uSunCol: col(pal.lightCol),
      uAmb: col(pal.hemiSky),
      uAccent: col(pal.lineA),
      uAccent2: col(pal.lineB),
      uMode: { value: mode },
    }),
    vertexShader: /* glsl */ `
      attribute vec3 color;
      varying vec3 vC; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vC = color; vUv = uv; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${COMMON}
      varying vec3 vC; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
      uniform vec3 uSunDir; uniform vec3 uSunCol; uniform vec3 uAmb; uniform vec3 uAccent; uniform vec3 uAccent2; uniform float uMode;
      void main(){
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float ndl = max(dot(N, uSunDir), 0.0);
        float rim = pow(1.0 - abs(dot(N, V)), 3.0);
        vec3 lit = uAmb * (0.35 + 0.25 * N.y) + uSunCol * ndl * 0.55;
        vec3 c = vC * lit;
        vec3 em = vec3(0.0);
        if (uMode < 0.5) {
          if (abs(N.y) < 0.5) {
            vec2 gp = abs(N.x) > abs(N.z) ? vec2(vW.z, vW.y) : vec2(vW.x, vW.y);
            vec2 cs = vec2(2.6, 3.6);
            vec2 cell = floor(gp / cs);
            vec2 f = fract(gp / cs);
            float h = hash21(cell + vUv.x * 17.0);
            float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.3, f.y) * step(f.y, 0.78);
            float on = step(0.6, h) * win;
            vec3 wc = h > 0.92 ? uAccent : (h > 0.82 ? uAccent2 : vec3(1.0, 0.72, 0.38));
            em += wc * on * 0.9 * (0.75 + 0.25 * sin(uTime * 0.6 + h * 50.0));
            float top = vUv.y - vW.y;
            em += mix(uAccent, uAccent2, step(0.5, hash11(vUv.x))) * (1.0 - smoothstep(0.0, 0.8, top)) * step(0.0, top) * 1.6;
          }
        } else if (uMode < 1.5) {
          c = vC * (0.35 + 0.9 * ndl) + uAmb * 0.1;
          em += uAccent * rim * 0.9 + uAccent2 * pow(rim, 2.0) * 0.5;
          float sp = pow(max(dot(reflect(-V, N), uSunDir), 0.0), 18.0);
          em += uSunCol * sp * 1.4;
          em += uAccent * 0.1 * smoothstep(0.0, 60.0, vW.y);
        } else if (uMode < 2.5) {
          float b = vW.y * 0.2 + vnoise(vW.xz * 0.04) * 2.5;
          float s = floor(b);
          c *= mix(0.6, 1.2, hash11(s)) * (0.88 + 0.2 * step(0.5, fract(b)));
          c *= 0.7 + 0.5 * fbm(vW.xz * 0.15 + vW.y * 0.1);
          c += uAccent * pow(max(dot(N, uSunDir), 0.0), 2.0) * 0.12 * vC;
          em += uAccent * rim * 0.12;
        } else {
          c += vC * rim * 0.25;
        }
        c = fogMix(c + em, vW);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

/* ------------------------------------------------------------------ Publikum (Instanzen, Wippen per GPU) */

export function crowdMaterial(u: ArenaUniforms, pal: Palette): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: merge(u, { uAmb: col(pal.hemiSky), uAccent: col(pal.lineA) }),
    vertexShader: /* glsl */ `
      ${COMMON}
      varying vec3 vC; varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 base = vec3(instanceMatrix[3]);
        float ph = hash21(base.xz * 1.37 + base.y);
        float bob = 0.012 * sin(uTime * 1.6 + ph * 30.0) + uCheer * 0.38 * abs(sin(uTime * (5.0 + ph * 3.5) + ph * 40.0));
        vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
        w.y += bob * (0.4 + 0.6 * ph);
        vW = w.xyz;
        vec3 skin = mix(vec3(0.55, 0.38, 0.28), vec3(0.9, 0.7, 0.55), fract(ph * 7.0));
        float head = uv.x;
        vec3 shirt = instanceColor * (1.0 + uCheer * 0.5 * step(0.5, fract(ph * 5.0)));
        vC = mix(shirt, skin * 0.55, head);
        vN = normalize(mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${COMMON}
      varying vec3 vC; varying vec3 vN; varying vec3 vW;
      uniform vec3 uAmb;
      void main(){
        vec3 N = normalize(vN);
        float l = 0.45 + 0.35 * N.y + 0.2 * max(dot(N, normalize(vec3(0.0, 0.3, 1.0) * sign(-vW.z + 0.001))), 0.0);
        float near = 1.0 / (1.0 + length(vW.xz) * 0.006);
        vec3 c = vC * uAmb * l * (0.75 + near) * 1.1;
        c = fogMix(c, vW);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

/* ------------------------------------------------------------------ Punkte (Schnee, Staub, Funken, Handylichter) */

export interface PointsOpts {
  /** Blinkgeschwindigkeit (0 = kein Blinken) – Phase kommt aus dem Attribut „phase“ */
  blink?: boolean;
  /** Aufsteigende Flamme: Größe flackert */
  flicker?: boolean;
  alpha?: number;
  fog?: boolean;
}

export function pointsMaterial(u: ArenaUniforms, o: PointsOpts = {}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: merge(u, { uAlpha: { value: o.alpha ?? 1 } }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    defines: { BLINK: o.blink ? 1 : 0, FLICKER: o.flicker ? 1 : 0 },
    vertexShader: /* glsl */ `
      ${COMMON}
      attribute vec3 color; attribute float size; attribute float phase;
      uniform float uScale;
      varying vec3 vC; varying vec3 vW;
      void main(){
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 mv = viewMatrix * w;
        float k = 1.0;
        #if BLINK
          k = 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * (1.2 + phase * 2.0 + uCheer * 6.0) + phase * 60.0), 2.0);
          k *= 1.0 + uCheer * 1.5;
        #endif
        #if FLICKER
          k = 0.7 + 0.3 * sin(uTime * (9.0 + phase * 7.0) + phase * 50.0) + 0.15 * sin(uTime * 23.0 + phase * 90.0);
        #endif
        vC = color * k;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(size * uScale / max(-mv.z, 0.1), 0.0, 96.0);
      }`,
    fragmentShader: /* glsl */ `
      ${COMMON}
      uniform float uAlpha;
      varying vec3 vC; varying vec3 vW;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(max(1.0 - d, 0.0), 1.7);
        vec3 c = vC * a * uAlpha * fogKeep(vW);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

/** Setzt vor jedem Zeichnen die Punktgrößen-Skalierung (Pixelhöhe × cot(fov/2) / 2) – ohne Allokation */
export function attachPointScale(points: THREE.Points, u: ArenaUniforms): void {
  const size = new THREE.Vector2();
  points.onBeforeRender = (renderer, _scene, camera): void => {
    renderer.getDrawingBufferSize(size);
    u.uScale.value = size.y * 0.5 * (camera as THREE.PerspectiveCamera).projectionMatrix.elements[5] as number;
  };
}
