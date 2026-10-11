import * as THREE from 'three';
import { disposeTree, glow, toon } from '../materials';
import type { Decor, DecorContext, DecorFactory } from './common';

/**
 * NOVA NEXUS – Raumstation im tiefen All.
 * Sternenhimmel (Points), Nebel-Bänder (Shader-Ebenen), Ringplaneten, treibende Asteroiden (Instanzen),
 * Satelliten, Orbit-Ringe, Energiesäulen und ein riesiges rotierendes Nexus-Tor im Hintergrund.
 * Alles liegt außerhalb des Bretts (Abstand >= radius * 1.1) und braucht ca. 30 Draw Calls.
 */

const TAU = Math.PI * 2;

/** Eigenes Toon-Material ohne Nebel (für ferne Objekte, damit sie nicht im Dunst verschwinden). */
function farToon(color: number, opts: { emissive?: number; emissiveIntensity?: number; vertexColors?: boolean; side?: THREE.Side; opacity?: number } = {}): THREE.MeshToonMaterial {
  const base = toon(color, opts.emissive !== undefined ? { emissive: opts.emissive, emissiveIntensity: opts.emissiveIntensity ?? 1 } : {});
  const m = base.clone();
  m.userData = {};
  m.fog = false;
  if (opts.vertexColors) m.vertexColors = true;
  if (opts.side !== undefined) m.side = opts.side;
  if (opts.opacity !== undefined && opts.opacity < 1) {
    m.transparent = true;
    m.opacity = opts.opacity;
  }
  return m;
}

function noFog<T extends THREE.MeshBasicMaterial>(m: T): T {
  m.fog = false;
  return m;
}

/** Nebel-Ebene: weicher, wabernder Farbverlauf ganz ohne Textur. */
function nebulaMaterial(color: number, color2: number, seed: number, alpha: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      c1: { value: new THREE.Color(color) },
      c2: { value: new THREE.Color(color2) },
      uT: { value: 0 },
      uSeed: { value: seed },
      uA: { value: alpha },
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      uniform vec3 c1; uniform vec3 c2; uniform float uT; uniform float uSeed; uniform float uA; varying vec2 vUv;
      void main(){
        vec2 p = vUv * 2.0 - 1.0;
        float w = sin(p.x * 3.1 + uSeed + uT * 0.07) * 0.18 + sin(p.x * 7.3 - uSeed * 1.7 + uT * 0.05) * 0.07;
        float d = abs(p.y - w) * 1.8;
        float edge = 1.0 - smoothstep(0.0, 1.0, max(abs(p.x), 0.0));
        float band = pow(max(0.0, 1.0 - d), 2.0) * edge;
        float clouds = 0.65 + 0.35 * sin(p.x * 9.0 + uSeed * 3.0 + sin(p.y * 6.0 + uT * 0.1) * 2.0);
        float a = band * clouds * uA;
        float step4 = floor(a * 5.0) / 5.0;
        a = mix(a, step4 + 0.04, 0.35);
        vec3 col = mix(c1, c2, 0.5 + 0.5 * sin(p.x * 2.0 + uSeed));
        gl_FragColor = vec4(col * a, a);
      }`,
  });
}

/** Wirbel im Nexus-Tor. */
function portalMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      uniform float uT; varying vec2 vUv;
      void main(){
        vec2 p = vUv * 2.0 - 1.0;
        float d = length(p);
        if (d > 1.0) discard;
        float ang = atan(p.y, p.x);
        float s = sin(ang * 4.0 + d * 9.0 - uT * 1.6);
        float arms = smoothstep(0.1, 0.9, s * 0.5 + 0.5);
        float core = pow(1.0 - d, 1.5);
        float a = (0.18 + 0.5 * arms * (1.0 - d * 0.6)) * (1.0 - smoothstep(0.85, 1.0, d)) + core * 0.5;
        vec3 col = mix(vec3(0.1, 0.45, 1.0), vec3(0.2, 1.0, 0.85), arms);
        col = mix(col, vec3(1.0), core * 0.7);
        gl_FragColor = vec4(col * a, a);
      }`,
  });
}

/** Kugel mit Streifen/Flecken per Vertexfarbe (Cartoon-Planet). */
function planetGeometry(R: number, fn: (x: number, y: number, z: number, c: THREE.Color) => void): THREE.SphereGeometry {
  const g = new THREE.SphereGeometry(R, 28, 18);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    fn(pos.getX(i) / R, pos.getY(i) / R, pos.getZ(i) / R, c);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

interface Planet {
  group: THREE.Group;
  spin: number;
  bob: number;
  ph: number;
  baseY: number;
  ringMesh?: THREE.Mesh;
}

interface Satellite {
  g: THREE.Group;
  R: number;
  ang: number;
  speed: number;
  tilt: number;
  yOff: number;
  spin: number;
}

export const createDecor: DecorFactory = (ctx: DecorContext): Decor => {
  const rng = ctx.rng;
  const q = Math.max(0.15, Math.min(1, ctx.quality.particles));
  const R = Math.max(ctx.radius, 10);
  const group = new THREE.Group();
  group.position.copy(ctx.center);

  const bandCol = new THREE.Color();
  const dummyM = new THREE.Matrix4();
  const dummyQ = new THREE.Quaternion();
  const dummyE = new THREE.Euler();
  const dummyP = new THREE.Vector3();
  const dummyS = new THREE.Vector3();
  const unit = new THREE.Vector3(1, 1, 1);

  // ---------- Sternenhimmel ----------
  const starN = Math.round(2200 * q);
  const starPos = new Float32Array(starN * 3);
  const starCol = new Float32Array(starN * 3);
  const palette = [0xffffff, 0xcfe6ff, 0xfff0c0, 0x9fd6ff, 0xffb8f0, 0x9ffff0];
  for (let i = 0; i < starN; i++) {
    const u = rng.float(-1, 1);
    const a = rng.next() * TAU;
    const s = Math.sqrt(1 - u * u);
    const d = rng.float(250, 310);
    starPos[i * 3] = Math.cos(a) * s * d;
    starPos[i * 3 + 1] = u * d;
    starPos[i * 3 + 2] = Math.sin(a) * s * d;
    bandCol.setHex(palette[rng.int(palette.length)] ?? 0xffffff).multiplyScalar(rng.float(0.55, 1));
    starCol[i * 3] = bandCol.r;
    starCol[i * 3 + 1] = bandCol.g;
    starCol[i * 3 + 2] = bandCol.b;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false }));
  stars.frustumCulled = false;
  stars.renderOrder = -9;
  // Große, helle Zierstern-Funkel (wenige, größere Punkte)
  const sparkN = Math.round(60 * q);
  const sparkPos = new Float32Array(sparkN * 3);
  for (let i = 0; i < sparkN; i++) {
    const u = rng.float(-0.95, 0.95);
    const a = rng.next() * TAU;
    const s = Math.sqrt(1 - u * u);
    sparkPos[i * 3] = Math.cos(a) * s * 280;
    sparkPos[i * 3 + 1] = u * 280;
    sparkPos[i * 3 + 2] = Math.sin(a) * s * 280;
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ size: 6, sizeAttenuation: false, color: 0xffffff, fog: false, depthWrite: false, transparent: true, opacity: 0.9 }));
  sparks.frustumCulled = false;
  sparks.renderOrder = -9;
  const starRoot = new THREE.Group();
  starRoot.add(stars, sparks);
  group.add(starRoot);

  // ---------- Nebel-Bänder ----------
  const nebulae: { mat: THREE.ShaderMaterial; mesh: THREE.Mesh; drift: number; baseA: number }[] = [];
  const nebDefs: [number, number][] = [
    [0x6a3cff, 0x35d0ff],
    [0xff4fb0, 0x8a5cff],
    [0x20e0c0, 0x2a6aff],
    [0xb04cff, 0xff7ac8],
    [0x2a8aff, 0x5af0d0],
  ];
  const nebGeo = new THREE.PlaneGeometry(1, 1);
  const nebCount = Math.max(3, Math.round(5 * (0.5 + q * 0.5)));
  for (let i = 0; i < nebCount; i++) {
    const [c1, c2] = nebDefs[i % nebDefs.length] as [number, number];
    const mat = nebulaMaterial(c1, c2, rng.float(0, 10), 0.95);
    const mesh = new THREE.Mesh(nebGeo, mat);
    const yaw = (i / nebCount) * TAU + rng.float(-0.3, 0.3);
    const dist = rng.float(190, 225);
    const elev = rng.float(-0.25, 0.5);
    mesh.position.set(Math.cos(yaw) * dist, Math.sin(elev) * dist * 0.8 + 10, Math.sin(yaw) * dist);
    mesh.scale.set(rng.float(240, 340), rng.float(70, 120), 1);
    mesh.lookAt(0, 0, 0);
    mesh.rotateZ(rng.float(-0.5, 0.5));
    mesh.renderOrder = -8;
    mesh.frustumCulled = false;
    group.add(mesh);
    nebulae.push({ mat, mesh, drift: rng.float(0.004, 0.01) * (i % 2 ? 1 : -1), baseA: 0.5 });
  }

  // ---------- Ferne Planeten ----------
  const planets: Planet[] = [];
  const planetDist = Math.max(R * 2.7, 120);

  const makePlanet = (yaw: number, elev: number, rad: number, geo: THREE.BufferGeometry, ring: [number, number, number] | null, tilt: number): void => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(geo, farToon(0xffffff, { vertexColors: true }));
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.12, 20, 12), noFog(new THREE.MeshBasicMaterial({ color: 0x6fb4ff, transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false })));
    g.add(body, atmo);
    const p: Planet = { group: g, spin: rng.float(0.01, 0.04), bob: rng.float(0.8, 1.6), ph: rng.float(0, TAU), baseY: 0 };
    if (ring) {
      const rg = new THREE.Mesh(new THREE.RingGeometry(rad * ring[0], rad * ring[1], 56, 1), farToon(ring[2], { side: THREE.DoubleSide, opacity: 0.85 }));
      rg.rotation.x = Math.PI / 2 + tilt;
      g.add(rg);
      p.ringMesh = rg;
    }
    g.position.set(Math.cos(yaw) * planetDist, Math.sin(elev) * planetDist * 0.7 + 8, Math.sin(yaw) * planetDist);
    p.baseY = g.position.y;
    group.add(g);
    planets.push(p);
  };

  const baseYaw = rng.next() * TAU;
  // Gasriese mit Streifen und breitem Ring
  makePlanet(
    baseYaw,
    0.12,
    24,
    planetGeometry(24, (_x, y, _z, c) => {
      const b = Math.floor((y * 0.5 + 0.5) * 7 + Math.sin(y * 9) * 0.4);
      c.setHex([0xffc46a, 0xff9a52, 0xffe0a0, 0xe87a4a, 0xffd28a, 0xf2a860, 0xffe8b8][((b % 7) + 7) % 7] ?? 0xffc46a);
    }),
    [1.45, 2.3, 0xffe2a8],
    0.35,
  );
  // Eis-/Neonplanet mit Flecken
  makePlanet(
    baseYaw + 2.2,
    0.35,
    13,
    planetGeometry(13, (x, y, z, c) => {
      const n = Math.sin(x * 5 + z * 3) * Math.sin(y * 6 + x * 2) + Math.sin(z * 7 - y * 3) * 0.5;
      c.setHex(n > 0.55 ? 0xffffff : n > -0.1 ? 0x62e0d8 : 0x2c8fc8);
    }),
    [1.35, 1.8, 0x9ff6ff],
    -0.5,
  );
  // Magenta-Planet, ohne Ring
  makePlanet(
    baseYaw + 4.1,
    -0.05,
    17,
    planetGeometry(17, (x, y, z, c) => {
      const n = Math.sin(x * 4.5 + 1) * Math.cos(z * 4 + y * 3) + Math.sin(y * 8) * 0.35;
      c.setHex(n > 0.5 ? 0xffa0d8 : n > -0.3 ? 0xc04ad0 : 0x7a2fb0);
    }),
    null,
    0,
  );

  // ---------- Asteroiden (Instanzen) ----------
  const astN = Math.round(70 * q);
  const astGeo = new THREE.IcosahedronGeometry(1, 0);
  const astMat = toon(0xffffff);
  const asteroids = new THREE.InstancedMesh(astGeo, astMat, astN);
  asteroids.frustumCulled = false;
  const ast = new Float32Array(astN * 8); // ang, rad, y, speed, scale, tumbleX, tumbleY, phase
  const astPal = [0x8a8fb8, 0x6d73a0, 0xa7a0c8, 0x5a6aa8, 0x9a8ab8, 0x4fa3b8];
  for (let i = 0; i < astN; i++) {
    const o = i * 8;
    const bandPick = rng.next();
    ast[o] = rng.next() * TAU;
    ast[o + 1] = R * (bandPick < 0.65 ? rng.float(1.3, 1.65) : rng.float(1.9, 2.5));
    ast[o + 2] = bandPick < 0.65 ? rng.gaussian() * 3.2 - 1 : rng.float(-22, 24);
    ast[o + 3] = rng.float(0.012, 0.045) * (bandPick < 0.65 ? 1 : -0.7);
    ast[o + 4] = rng.chance(0.15) ? rng.float(1.6, 2.6) : rng.float(0.4, 1.3);
    ast[o + 5] = rng.float(-0.6, 0.6);
    ast[o + 6] = rng.float(-0.6, 0.6);
    ast[o + 7] = rng.float(0, TAU);
    asteroids.setColorAt(i, bandCol.setHex(rng.pick(astPal)));
  }
  if (asteroids.instanceColor) asteroids.instanceColor.needsUpdate = true;
  group.add(asteroids);

  // ---------- Satelliten ----------
  const sats: Satellite[] = [];
  const satBody = new THREE.BoxGeometry(1.6, 1.2, 1.6);
  const satPanel = new THREE.BoxGeometry(3.6, 0.08, 1.3);
  const satDish = new THREE.ConeGeometry(0.7, 0.5, 10, 1, true);
  const satMats = [toon(0xdfe8ff), toon(0x2a5acc, { emissive: 0x1a3a99, emissiveIntensity: 0.4 }), toon(0xffd04a)];
  const satN = q < 0.3 ? 2 : 3;
  for (let i = 0; i < satN; i++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(satBody, satMats[0] as THREE.Material);
    const panels = new THREE.Mesh(satPanel, satMats[1] as THREE.Material);
    panels.scale.set(2.2, 1, 1);
    panels.position.y = 0.0;
    const dish = new THREE.Mesh(satDish, satMats[2] as THREE.Material);
    dish.position.set(0, 1.05, 0);
    dish.rotation.x = Math.PI;
    g.add(body, panels, dish);
    g.scale.setScalar(rng.float(1.3, 1.9));
    group.add(g);
    sats.push({ g, R: R * rng.float(1.45, 1.9) + 4, ang: rng.next() * TAU, speed: rng.float(0.03, 0.06) * (i % 2 ? -1 : 1), tilt: rng.float(0.1, 0.35), yOff: rng.float(-4, 10), spin: rng.float(0.2, 0.6) });
  }

  // ---------- Orbit-Ringe ----------
  const orbitRings: { m: THREE.Mesh; sx: number; sz: number }[] = [];
  const ringDefs: [number, number, number][] = [
    [R * 1.55, 0x59e0ff, 0.22],
    [R * 1.95, 0xb077ff, 0.3],
    [R * 2.45, 0x35f0c8, 0.17],
  ];
  const ringN = q < 0.3 ? 2 : 3;
  for (let i = 0; i < ringN; i++) {
    const [rr, col, o] = ringDefs[i] as [number, number, number];
    const m = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.16 + i * 0.05, 5, 120), noFog(glow(col, 0.6)));
    m.rotation.set(Math.PI / 2 + rng.float(-0.18, 0.18), rng.float(0, TAU), rng.float(-0.12, 0.12));
    m.position.y = -3 + i * 9 + o * 4;
    group.add(m);
    orbitRings.push({ m, sx: rng.float(-0.012, 0.012), sz: rng.float(0.01, 0.025) * (i % 2 ? -1 : 1) });
  }

  // ---------- Energiesäulen ----------
  const beamN = Math.round(12 * q);
  const beamGeo = new THREE.CylinderGeometry(0.28, 0.28, 1, 6, 1, true);
  const beams = new THREE.InstancedMesh(beamGeo, noFog(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })), Math.max(1, beamN));
  beams.count = beamN;
  beams.frustumCulled = false;
  const beamData = new Float32Array(beamN * 5); // x, z, hoehe, phase, speed
  const beamPal = [0x59e0ff, 0x35f0c8, 0xb077ff, 0x6aa0ff];
  for (let i = 0; i < beamN; i++) {
    const a = (i / Math.max(1, beamN)) * TAU + rng.float(-0.15, 0.15);
    const d = R * rng.float(2.8, 3.8);
    beamData[i * 5] = Math.cos(a) * d;
    beamData[i * 5 + 1] = Math.sin(a) * d;
    beamData[i * 5 + 2] = rng.float(35, 80);
    beamData[i * 5 + 3] = rng.float(0, TAU);
    beamData[i * 5 + 4] = rng.float(0.6, 1.4);
    beams.setColorAt(i, bandCol.setHex(rng.pick(beamPal)));
  }
  if (beams.instanceColor) beams.instanceColor.needsUpdate = true;
  group.add(beams);

  // ---------- Nexus-Tor ----------
  const gateR = Math.max(R * 0.95, 26);
  const gateDist = Math.max(R * 3.4, 150);
  const gate = new THREE.Group();
  const gYaw = baseYaw + 1.0;
  gate.position.set(Math.cos(gYaw) * gateDist, gateR * 0.55 + 12, Math.sin(gYaw) * gateDist);
  gate.lookAt(0, gate.position.y * 0.3, 0);
  const gateSpin = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.TorusGeometry(gateR, gateR * 0.07, 10, 64), farToon(0x3a56b8, { emissive: 0x1a2a80, emissiveIntensity: 0.6 }));
  const inner = new THREE.Mesh(new THREE.TorusGeometry(gateR * 0.78, gateR * 0.03, 8, 64), noFog(glow(0x59e0ff)));
  const pDisk = new THREE.Mesh(new THREE.CircleGeometry(gateR * 0.76, 40), portalMaterial());
  pDisk.renderOrder = -7;
  const segN = 16;
  const segs = new THREE.InstancedMesh(new THREE.BoxGeometry(gateR * 0.16, gateR * 0.22, gateR * 0.2), farToon(0xffffff, { emissive: 0x2a3a99, emissiveIntensity: 0.5 }), segN);
  segs.frustumCulled = false;
  for (let i = 0; i < segN; i++) {
    const a = (i / segN) * TAU;
    dummyQ.setFromAxisAngle(dummyP.set(0, 0, 1), a);
    dummyP.set(Math.cos(a) * gateR, Math.sin(a) * gateR, 0);
    dummyM.compose(dummyP, dummyQ, unit);
    segs.setMatrixAt(i, dummyM);
    segs.setColorAt(i, bandCol.setHex(i % 4 === 0 ? 0xffd84a : i % 2 ? 0xcfe6ff : 0x7de8ff));
  }
  if (segs.instanceColor) segs.instanceColor.needsUpdate = true;
  gateSpin.add(outer, segs);
  const innerSpin = new THREE.Group();
  innerSpin.add(inner);
  // vier Zacken am inneren Ring
  gate.add(gateSpin, innerSpin, pDisk);
  group.add(gate);

  // ---------- Update ----------
  const portalMat = pDisk.material as THREE.ShaderMaterial;

  function update(dt: number, t: number): void {
    starRoot.rotation.y += dt * 0.004;
    starRoot.rotation.x = Math.sin(t * 0.02) * 0.03;
    (sparks.material as THREE.PointsMaterial).opacity = 0.75 + Math.sin(t * 1.7) * 0.2;

    for (const n of nebulae) {
      const u = n.mat.uniforms.uT as { value: number };
      u.value = t;
      n.mesh.rotateZ(n.drift * dt);
    }

    for (const p of planets) {
      p.group.rotation.y += p.spin * dt;
      p.group.position.y = p.baseY + Math.sin(t * 0.25 * p.bob + p.ph) * 1.8;
    }

    for (let i = 0; i < astN; i++) {
      const o = i * 8;
      const a = (ast[o] as number) + (ast[o + 3] as number) * t;
      const r = ast[o + 1] as number;
      const ph = ast[o + 7] as number;
      dummyP.set(Math.cos(a) * r, (ast[o + 2] as number) + Math.sin(t * 0.3 + ph) * 0.9, Math.sin(a) * r);
      dummyE.set(t * (ast[o + 5] as number) + ph, t * (ast[o + 6] as number), ph * 0.5);
      dummyQ.setFromEuler(dummyE);
      dummyS.setScalar(ast[o + 4] as number);
      dummyM.compose(dummyP, dummyQ, dummyS);
      asteroids.setMatrixAt(i, dummyM);
    }
    asteroids.instanceMatrix.needsUpdate = true;

    for (const s of sats) {
      const a = s.ang + s.speed * t;
      s.g.position.set(Math.cos(a) * s.R, s.yOff + Math.sin(a) * s.R * s.tilt, Math.sin(a) * s.R);
      s.g.rotation.y = t * s.spin;
      s.g.rotation.z = Math.sin(t * 0.4 + s.ang) * 0.3;
    }

    for (const r of orbitRings) {
      r.m.rotation.x += r.sx * dt;
      r.m.rotation.z += r.sz * dt;
    }

    for (let i = 0; i < beamN; i++) {
      const o = i * 5;
      const ph = beamData[o + 3] as number;
      const pulse = 0.55 + 0.45 * Math.sin(t * (beamData[o + 4] as number) + ph);
      const h = (beamData[o + 2] as number) * (0.7 + 0.3 * pulse);
      dummyP.set(beamData[o] as number, -20 + h * 0.5, beamData[o + 1] as number);
      dummyS.set(0.5 + pulse * 0.8, h, 0.5 + pulse * 0.8);
      dummyM.compose(dummyP, dummyQ.identity(), dummyS);
      beams.setMatrixAt(i, dummyM);
    }
    beams.instanceMatrix.needsUpdate = true;

    gateSpin.rotation.z += dt * 0.12;
    innerSpin.rotation.z -= dt * 0.28;
    (portalMat.uniforms.uT as { value: number }).value = t;
    const br = 1 + Math.sin(t * 0.8) * 0.015;
    pDisk.scale.set(br, br, 1);
  }

  return {
    group,
    update,
    dispose(): void {
      asteroids.dispose();
      beams.dispose();
      segs.dispose();
      nebGeo.dispose();
      astGeo.dispose();
      beamGeo.dispose();
      satBody.dispose();
      satPanel.dispose();
      satDish.dispose();
      disposeTree(group);
    },
  };
};
