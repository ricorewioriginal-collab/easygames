/* Spinwelten 3D – Insel-Diorama: schwebende Insel aus Welt-Daten (Silhouette, Schichten, Terrassen, Nebeninseln),
 * Himmel, Untergrund (Wasser/Wolken/Lava/Eis/Sand/Sternenleere/Zucker), Licht nach Tageszeit, Deko per Instancing,
 * animierte Details, Bewohner, 5 Bauwerke mit Bauanimation, Kamerasteuerung (Ziehen/Pinch/Rad/Tasten) und Raycast-Auswahl. */
(function (SW) {
  'use strict';
  const T = () => globalThis.THREE;
  const Mo = () => SW.Models;
  // ---------- Shader: Himmel und Untergrund ----------
  function skyMat(top, hor, night) {
    const THREE = T();
    return new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color(top) }, hor: { value: new THREE.Color(hor) }, night: { value: night ? 1 : 0 } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 hor; uniform float night; varying vec3 vP; float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }\n' +
        'void main(){ float y = clamp(vP.y*1.6+0.15, 0.0, 1.0); vec3 c = mix(hor, top, pow(y, 0.7)); c += (1.0-abs(vP.y))*0.06;\n' +
        ' if(night>0.5){ vec3 q = floor(vP*220.0); float s = step(0.9965, h(q)); c += vec3(s)*smoothstep(0.0,0.4,vP.y+0.1); }\n gl_FragColor = vec4(c,1.0); }'
    });
  }
  function seaMat(kind, c1, c2) {
    const THREE = T();
    const mode = { water: 0, clouds: 1, lava: 2, ice: 3, sand: 4, void: 5, candy: 6 }[kind] || 0;
    return new THREE.ShaderMaterial({
      transparent: mode === 1 || mode === 5, fog: true, depthWrite: mode !== 1,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { t: { value: 0 }, c1: { value: new THREE.Color(c1) }, c2: { value: new THREE.Color(c2) }, mode: { value: mode } }]),
      vertexShader: 'uniform float t; uniform float mode; varying vec2 vU; varying float vH;\n#include <fog_pars_vertex>\nvoid main(){ vU = position.xy; vec3 p = position; float w = sin(p.x*0.08+t*0.9)*0.6+cos(p.y*0.07+t*0.7)*0.6; if(mode>2.5&&mode<3.5) w*=0.1; if(mode>3.5&&mode<4.5) w = sin(p.x*0.05)*1.2+cos(p.y*0.06)*1.0; p.z += w; vH = w;\n vec4 mvPosition = modelViewMatrix * vec4(p,1.0); gl_Position = projectionMatrix * mvPosition;\n#include <fog_vertex>\n}',
      fragmentShader: 'uniform float t; uniform float mode; uniform vec3 c1; uniform vec3 c2; varying vec2 vU; varying float vH;\n#include <fog_pars_fragment>\n' +
        'float n2(vec2 p){ return sin(p.x)*sin(p.y); }\n' +
        'void main(){ vec3 c = mix(c1, c2, 0.5+0.5*vH); float a = 1.0;\n' +
        ' if(mode<0.5){ float s = n2(vU*0.35+vec2(t*0.6,t*0.4))*n2(vU*0.21-vec2(t*0.3,0.0)); c += vec3(0.25)*smoothstep(0.55,0.9,s); }\n' +
        ' else if(mode<1.5){ float s = 0.5+0.5*n2(vU*0.06+vec2(t*0.05,0.0)); c = mix(c1, vec3(1.0), 0.55+0.35*s); a = 0.92; }\n' +
        ' else if(mode<2.5){ float s = 0.5+0.5*n2(vU*0.2+vec2(t*0.3,-t*0.2))*n2(vU*0.13); c = mix(c1*0.6, c2*1.6, smoothstep(0.3,0.9,s)); }\n' +
        ' else if(mode<3.5){ float s = step(0.6, fract(n2(vU*0.12)*3.0)); c = mix(c1, vec3(0.92,0.97,1.0), 0.4+0.3*s); }\n' +
        ' else if(mode<5.5 && mode>4.5){ c = c1*0.3; a = 0.0; }\n' +
        ' else if(mode>5.5){ float s = 0.5+0.5*sin(vU.x*0.15+vU.y*0.1+t*0.5); c = mix(c1, c2, s); }\n' +
        ' gl_FragColor = vec4(c, a);\n#include <fog_fragment>\n}'
    });
  }
  // ---------- Inselkörper ----------
  // Glatter Wertrausch-Ersatz aus Sinus-Summen (billig, ohne Textur): weiche Flecken und Hügel
  function noise2(x, z, ph) { return (Math.sin(x * 0.37 + ph) * Math.cos(z * 0.41 - ph * 0.7) + Math.sin(x * 0.83 - z * 0.67 + ph * 1.3) * 0.5 + Math.sin((x + z) * 1.7 + ph * 2.1) * 0.22) / 1.72; }
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // Profil der Unterseite (radialer Anteil, Höhe in Einheiten von r) vom Rand bis zur Spitze
  const UNDER = [[1.0, -0.06], [0.99, -0.14], [0.95, -0.24], [0.88, -0.36], [0.78, -0.5], [0.64, -0.68], [0.48, -0.88], [0.32, -1.06], [0.17, -1.24], [0.06, -1.36], [0, -1.42]];
  function islandGeo(r, sh, pal, seed, cliffMul) {
    const THREE = T(), rng = SW.rng.seeded(seed), seg = 72;
    const lob = sh.lobes || 0, ph = rng.next() * 6.28, ph2 = rng.next() * 6.28;
    const Rfun = a => 1 + 0.07 * Math.sin(a * 3 + ph) + 0.05 * Math.sin(a * 5 + ph2) + (lob ? 0.08 * Math.max(0, Math.sin(a * Math.max(2, lob) + ph)) : 0);
    const C = c => new THREE.Color(c);
    // Farben leicht entsättigen: wirkt weniger grell und hochwertiger
    const soft = c => { const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; return c.lerp(new THREE.Color(l, l, l), 0.1).multiplyScalar(0.92); };
    const grass = soft(C(pal.grass || '#6fcf7a')), grass2 = soft(C(pal.grass2 || '#4fae63')), light = grass.clone().lerp(C('#fff2a8'), 0.28);
    const rock = C(pal.rock || '#9a8470'), rock2 = C(pal.rock2 || '#6d5b4c'), dirt = rock.clone().lerp(C('#5b3d2a'), 0.5);
    const cliff = (sh.cliff || 1) * (cliffMul || 1), hill = sh.flat !== undefined ? (1.2 - sh.flat) : 0.6;
    // Oberfläche: flache Mitte (Bauplätze), sanfte Hügel zum Rand hin
    const H = (x, z) => { const pr = Math.hypot(x, z) / r; return noise2(x, z, ph) * 0.55 * hill * smooth(0.62, 0.8, pr) * (1 - smooth(0.9, 1.0, pr)) + noise2(x * 2.3, z * 2.3, ph2) * 0.05; };
    const TOP = [0, 0.06, 0.14, 0.24, 0.34, 0.44, 0.54, 0.63, 0.71, 0.78, 0.84, 0.89, 0.93, 0.965, 0.985];
    const pos = [], colA = [], idx = [];
    const rows = [];
    for (const pr of TOP) rows.push({ pr, top: true });
    rows.push({ pr: 1.0, y: 0.0, lip: 1 });            // Rasenkante
    rows.push({ pr: 1.012, y: -0.06 * r, lip: 2 });    // Erdkante
    for (const [pr, py] of UNDER) rows.push({ pr, y: py });
    rows.forEach((row, j) => {
      for (let i = 0; i <= seg; i++) {
        const a = i / seg * Math.PI * 2, R = r * Rfun(a);
        let rad = row.pr * R, y, c;
        if (row.top) {
          const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
          y = H(x, z);
          const n1 = noise2(x * 1.9, z * 1.9, ph2) * 0.5 + 0.5, n2 = noise2(x * 3.4, z * 3.4, ph) * 0.5 + 0.5;
          c = grass.clone().lerp(grass2, smooth(0.3, 0.75, n1)).lerp(grass2.clone().multiplyScalar(0.8), smooth(0.7, 0.95, n1) * 0.6).lerp(light, smooth(0.55, 0.9, n2) * 0.5);
          c.lerp(grass2, smooth(0.86, 0.985, row.pr) * 0.55);           // Rand etwas dunkler
          c.multiplyScalar(0.94 + y * 0.18);                              // Kuppen heller, Mulden dunkler
        } else if (row.lip === 1) { y = -0.02 * r; c = grass2.clone().multiplyScalar(0.85); }
        else if (row.lip === 2) { y = row.y; c = dirt.clone(); }
        else {
          const jit = row.pr > 0 && row.pr < 1 ? (rng.next() - 0.5) * 0.08 * r * (1 - row.pr * 0.3) : 0;
          rad += jit; y = row.y * r * cliff;
          const band = (Math.floor(j * 1.3 + Math.sin(a * 3) * 0.6) % 2) === 0;
          c = (band ? rock : rock2).clone().multiplyScalar(1 - (j - TOP.length) * 0.035);
          c.lerp(dirt, row.pr > 0.9 ? 0.4 : 0);
        }
        pos.push(Math.cos(a) * rad, y, Math.sin(a) * rad);
        colA.push(c.r, c.g, c.b);
      }
    });
    for (let j = 0; j < rows.length - 1; j++) for (let i = 0; i < seg; i++) {
      const a = j * (seg + 1) + i, b = a + seg + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colA, 3));
    g.setIndex(idx); g.computeVertexNormals();
    // Mitte: alle Normalen nach oben (kein Fächer-Muster am Pol)
    const nor = g.getAttribute('normal'); for (let i = 0; i <= seg; i++) nor.setXYZ(i, 0, 1, 0);
    // Naht bei Winkel 0: Normalen beider Seiten mitteln
    for (let j = 1; j < rows.length; j++) { const a = j * (seg + 1), b = a + seg; const x = nor.getX(a) + nor.getX(b), y = nor.getY(a) + nor.getY(b), z = nor.getZ(a) + nor.getZ(b), l = Math.hypot(x, y, z) || 1; nor.setXYZ(a, x / l, y / l, z / l); nor.setXYZ(b, x / l, y / l, z / l); }
    g.userData.R = Rfun; g.userData.H = H;
    return g;
  }
  // ---------- Deko (Instancing) ----------
  function decorParts(type, pal) {
    const M = Mo(), green = pal.grass2 || '#4fae63', ac = pal.accent || '#ff7a6b', glow = pal.glow || '#fff4c2';
    const trunk = M.mat('#8a5a35', { rough: 0.95 });
    const leaf = M.mat(M.mix(green, '#1d5a3a', 0.25), { flat: true }), leaf2 = M.mat(M.mix(green, '#c8f07a', 0.2), { flat: true });
    const P = (g, m, x, y, z, sx, sy, sz, rx, rz) => ({ g, m, x: x || 0, y: y || 0, z: z || 0, sx: sx || 1, sy: sy || sx || 1, sz: sz || sx || 1, rx: rx || 0, rz: rz || 0 });
    switch (type) {
      case 'pine': return [P(M.cyl(0.11, 0.16, 0.55, 7), trunk, 0, 0.27), P(M.cone(0.75, 1.0, 8), leaf, 0, 0.9), P(M.cone(0.58, 0.85, 8), M.mat(M.mix(green, '#1d5a3a', 0.12), { flat: true }), 0, 1.4), P(M.cone(0.4, 0.7, 8), leaf2, 0, 1.85)];
      case 'round_tree': return [P(M.cyl(0.12, 0.18, 0.8, 7), trunk, 0, 0.4), P(M.ico(0.72, 1), leaf2, 0, 1.3), P(M.ico(0.5, 1), leaf, 0.42, 1.05, 0.18), P(M.ico(0.48, 1), leaf, -0.38, 1.12, -0.22), P(M.ico(0.4, 1), M.mat(M.mix(green, '#e8f59a', 0.3), { flat: true }), 0.05, 1.75, 0.1)];
      case 'palm': {
        const fr = M.mat(M.mix(green, '#c8f07a', 0.12), { flat: true, side: 1 }), out = [P(M.cyl(0.09, 0.14, 1.7, 7), trunk, 0.12, 0.85, 0, 1, 1, 1, 0, -0.14)];
        for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; out.push(P(M.cone(0.2, 1.15, 4), fr, 0.24 + Math.cos(a) * 0.45, 1.62, Math.sin(a) * 0.45, 1, 1, 0.3, Math.sin(a) * 1.25, -Math.cos(a) * 1.25)); }
        out.push(P(M.sph(0.12, 8, 6), M.mat('#8a5a35'), 0.24, 1.66, 0.08)); return out;
      }
      case 'bamboo': return [P(M.cyl(0.05, 0.05, 2.2, 6), M.mat('#9fcf5a'), 0, 1.1), P(M.cyl(0.05, 0.05, 1.7, 6), M.mat('#8ac24a'), 0.2, 0.85, 0.1), P(M.cyl(0.05, 0.05, 1.9, 6), M.mat('#a9d968'), -0.15, 0.95, -0.15)];
      case 'mushroom': return [P(M.cyl(0.08, 0.11, 0.45, 8), M.mat('#fff2df'), 0, 0.22), P(M.sph(0.3, 12, 6, 0, Math.PI / 2), M.mat(ac), 0, 0.42, 0, 1, 0.7, 1)];
      case 'crystal': return [P(M.oct(0.25), M.mat(glow, { em: glow, emi: 0.25, rough: 0.2, flat: true }), 0, 0.45, 0, 0.6, 1.9, 0.6), P(M.oct(0.16), M.mat(glow, { em: glow, emi: 0.25, rough: 0.2, flat: true }), 0.22, 0.25, 0.1, 0.6, 1.6, 0.6, 0, -0.4)];
      case 'rock': return [P(M.ico(0.35, 0), M.mat(pal.rock || '#9a8470', { flat: true }), 0, 0.15, 0, 1.2, 0.7, 1)];
      case 'flower': return [P(M.sph(0.09, 6, 4), M.mat(ac), 0, 0.18), P(M.sph(0.08, 6, 4), M.mat('#fff1a8'), 0.18, 0.14, 0.05), P(M.sph(0.08, 6, 4), M.mat(pal.accent2 || '#c58bff'), -0.12, 0.16, -0.12), P(M.ico(0.16, 0), leaf2, 0, 0.05, 0, 1.4, 0.5, 1.4)];
      case 'coral': return [P(M.cone(0.12, 0.8, 6), M.mat(ac), 0, 0.4), P(M.cone(0.09, 0.6, 6), M.mat(pal.accent2 || '#ff9e8a'), 0.15, 0.3, 0, 1, 1, 1, 0, -0.5), P(M.cone(0.09, 0.55, 6), M.mat(ac), -0.12, 0.28, 0.05, 1, 1, 1, 0, 0.5)];
      case 'cactus': return [P(M.cyl(0.14, 0.16, 1.0, 8), M.mat('#5fae5a'), 0, 0.5), P(M.cyl(0.08, 0.08, 0.45, 8), M.mat('#5fae5a'), 0.2, 0.6, 0, 1, 1, 1, 0, -0.9)];
      case 'ice': return [P(M.oct(0.35), M.mat('#dff6ff', { op: 0.85, rough: 0.1, flat: true }), 0, 0.45, 0, 0.7, 1.6, 0.7)];
      case 'lantern': return [P(M.cyl(0.05, 0.07, 0.75, 6), M.mat('#3b3550'), 0, 0.37), P(M.cyl(0.14, 0.14, 0.05, 8), M.mat('#3b3550'), 0, 0.77), P(M.sph(0.15, 10, 8), M.mat(glow, { em: glow, emi: 1.3 }), 0, 0.92)];
      case 'gear': return [P(M.cyl(0.4, 0.4, 0.1, 10), M.mat('#d8b26a', { metal: 0.7, rough: 0.35 }), 0, 0.3, 0, 1, 1, 1, 1.2)];
      case 'lava_rock': return [P(M.ico(0.38, 0), M.mat('#2c2328', { flat: true, em: '#ff5a1f', emi: 0.25 }), 0, 0.18, 0, 1.2, 0.8, 1)];
      case 'cloud_puff': return [P(M.sph(0.4, 10, 8), M.mat('#ffffff', { rough: 1 }), 0, 0.35), P(M.sph(0.3, 10, 8), M.mat('#ffffff', { rough: 1 }), 0.35, 0.28, 0.1), P(M.sph(0.28, 10, 8), M.mat('#f4f7ff', { rough: 1 }), -0.32, 0.26, -0.08)];
      case 'book_stack': return [P(M.box(0.5, 0.12, 0.35), M.mat(ac), 0, 0.06), P(M.box(0.45, 0.12, 0.32), M.mat(pal.accent2 || '#3fd8e8'), 0.03, 0.18, 0, 1, 1, 1, 0, 0), P(M.box(0.4, 0.11, 0.3), M.mat('#f2d08a'), -0.02, 0.3)];
      case 'candy': return [P(M.cyl(0.03, 0.03, 0.8, 6), M.mat('#ffffff'), 0, 0.4), P(M.sph(0.22, 12, 8), M.mat(ac, { rough: 0.3 }), 0, 0.85, 0, 1, 1, 0.45)];
      case 'pillar': return [P(M.cyl(0.18, 0.2, 1.1, 10), M.mat(pal.rock || '#c9b49a'), 0, 0.55), P(M.box(0.5, 0.12, 0.5), M.mat(pal.rock2 || '#9a8470'), 0, 0.06)];
      case 'reed': return [P(M.cone(0.04, 0.9, 4), M.mat('#9ab85a'), 0, 0.45), P(M.cone(0.04, 0.7, 4), M.mat('#b0c86a'), 0.1, 0.35, 0.05, 1, 1, 1, 0, -0.2), P(M.cone(0.04, 0.8, 4), M.mat('#8aa84a'), -0.08, 0.4, -0.05, 1, 1, 1, 0, 0.2)];
      case 'willow': return [P(M.cyl(0.09, 0.14, 1.0, 6), trunk, 0, 0.5), P(M.sph(0.7, 10, 8), leaf, 0, 1.1, 0, 1, 1.2, 1)];
      case 'fern': return [P(M.cone(0.35, 0.5, 5), leaf2, 0, 0.25, 0, 1, 1, 1, 0.3), P(M.cone(0.3, 0.45, 5), leaf, 0.1, 0.22, 0.1, 1, 1, 1, -0.3)];
      case 'tuft': return [P(M.cone(0.07, 0.32, 3), leaf2, 0, 0.14), P(M.cone(0.06, 0.26, 3), leaf, 0.08, 0.11, 0.04, 1, 1, 1, 0, -0.35), P(M.cone(0.06, 0.24, 3), leaf2, -0.07, 0.1, -0.03, 1, 1, 1, 0, 0.35)];
      case 'pebble': return [P(M.ico(0.2, 0), M.mat(M.mix(pal.rock || '#9a8470', '#ffffff', 0.15), { flat: true }), 0, 0.06, 0, 1.3, 0.55, 1)];
      case 'bush': default: return [P(M.ico(0.45, 1), leaf2, 0, 0.3, 0, 1.1, 0.8, 1), P(M.ico(0.3, 1), leaf, 0.3, 0.22, 0.1, 1, 0.8, 1), P(M.ico(0.28, 1), M.mat(M.mix(green, '#e8f59a', 0.3), { flat: true }), -0.25, 0.25, -0.1, 1, 0.8, 1)];
    }
  }
  // ---------- Bewohner und Kivi ----------
  function npcModel(kind, pal) {
    const M = Mo(), g = M.grp(), ac = pal.accent || '#ff7a6b';
    const body = { golem: '#9aa7b4', sprite: '#bff4ff', sproutling: '#8fd47a', robot: '#d8b26a', fox: '#ff9d5c', owl: '#9a7bd8', yeti: '#f4f8ff', fish: '#3fd8e8', dragonling: '#7bd88f', jester: '#ff8ae0' }[kind] || '#ffd98a';
    g.add(M.mesh(M.sph(0.22, 12, 10), M.mat(body), 0, 0.3, 0));
    g.add(M.mesh(M.sph(0.17, 12, 10), M.mat(M.mix(body, '#ffffff', 0.2)), 0, 0.62, 0));
    const eye = M.mat('#1d2340', { rough: 0.3 });
    g.add(M.mesh(M.sph(0.035, 6, 4), eye, 0.07, 0.66, 0.15, false)); g.add(M.mesh(M.sph(0.035, 6, 4), eye, -0.07, 0.66, 0.15, false));
    if (kind === 'fox' || kind === 'owl') { g.add(M.mesh(M.cone(0.06, 0.16, 5), M.mat(body), 0.1, 0.8, 0)); g.add(M.mesh(M.cone(0.06, 0.16, 5), M.mat(body), -0.1, 0.8, 0)); }
    else if (kind === 'sproutling') M.put(g, M.mesh(M.sph(0.1, 6, 4, 0, Math.PI / 2), M.mat('#5fae5a'), 0, 0.78, 0)).scale.set(1.5, 0.5, 0.7);
    else if (kind === 'robot' || kind === 'golem') g.add(M.mesh(M.cyl(0.02, 0.02, 0.2, 5), M.mat('#3b3550'), 0, 0.85, 0));
    else g.add(M.mesh(M.cone(0.12, 0.25, 8), M.mat(ac), 0, 0.85, 0));
    return g;
  }
  function kivi() {
    const M = Mo(), g = M.grp();
    g.add(M.mesh(M.sph(0.36, 20, 14), M.mat('#d8f6ff', { op: 0.45, rough: 0.05, metal: 0.1 }), 0, 0, 0, false));
    g.add(M.mesh(M.sph(0.26, 16, 12), M.mat('#3fd8e8', { em: '#3fd8e8', emi: 0.35, rough: 0.4 }), 0, -0.04, 0));
    const needle = M.mesh(M.cone(0.06, 0.34, 4), M.mat('#ff7a6b', { em: '#ff7a6b', emi: 0.3 }), 0, -0.02, 0, false); needle.rotation.z = Math.PI / 2; needle.userData.needle = 1; g.add(needle);
    M.put(g, M.mesh(M.tor(0.37, 0.035, 6, 30), M.mat('#f2d08a', { metal: 0.7, rough: 0.3 }), 0, 0, 0)).rotation.x = Math.PI / 2;
    const eyeW = M.mat('#ffffff', { em: '#ffffff', emi: 0.6 }), eyeB = M.mat('#14204a');
    for (const s of [-1, 1]) { g.add(M.mesh(M.sph(0.075, 10, 8), eyeW, s * 0.11, 0.06, 0.28, false)); g.add(M.mesh(M.sph(0.04, 8, 6), eyeB, s * 0.11, 0.06, 0.34, false)); }
    for (const s of [-1, 1]) { const w = M.mesh(M.sph(0.22, 10, 6), M.mat('#7bd88f', { side: 1 }), s * 0.42, 0.08, 0, false); w.scale.set(1, 0.18, 0.55); w.userData.wing = s; g.add(w); }
    return g;
  }
  // ---------- Szene ----------
  class Island {
    constructor(opts) {
      const THREE = T();
      this.q = opts.quality || { decor: 1, shadow: true };
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, 1, 0.5, 900);
      this.cam = { yaw: 0.6, pitch: 0.52, dist: 34, tx: 0, ty: 0, tz: 0, vy: 0, vp: 0 };
      this.camGoal = null;
      this.mode = 'diorama';
      this.t = 0; this.items = []; this.slots = []; this.bgroups = []; this.hit = []; this.anims = [];
      this.root = new THREE.Group(); this.scene.add(this.root);
      this.fx = SW.VFX ? new SW.VFX(this.scene) : null;
    }
    clear() {
      const THREE = T();
      while (this.root.children.length) this.root.remove(this.root.children[0]);
      for (const o of this.items) { if (o.geometry && o.userData.own) o.geometry.dispose(); if (o.material && o.userData.ownMat) o.material.dispose(); }
      this.items = []; this.slots = []; this.bgroups = []; this.hit = []; this.anims = []; this.decor = [];
      void THREE;
    }
    own(o, mat) { o.userData.own = true; if (mat) o.userData.ownMat = true; this.items.push(o); return o; }
    load(wdef, stages, damaged, opts) {
      opts = opts || {};
      const THREE = T(), M = Mo(), pal = wdef.pal, sh = wdef.shape || { r: 12 }, r = sh.r || 12;
      this.clear(); this.w = wdef; this.r = r; this.rng = SW.rng.seeded('isl' + (sh.seed || wdef.n));
      const night = wdef.time === 'night';
      // Himmel, Nebel, Licht
      const sky = this.own(new THREE.Mesh(new THREE.SphereGeometry(420, 24, 14), skyMat(pal.sky, pal.horizon, night)), true);
      this.root.add(sky);
      this.scene.fog = new THREE.Fog(new THREE.Color(pal.fog || pal.horizon), 70, 330);
      const tod = { day: [0.95, 0.5], dusk: [0.75, 0.45], night: [0.45, 0.45], dawn: [0.8, 0.48] }[wdef.time] || [0.95, 0.5];
      const hemi = new THREE.HemisphereLight(new THREE.Color(pal.sky), new THREE.Color(pal.grass2 || '#406040'), tod[1]);
      this.root.add(hemi);
      const sun = new THREE.DirectionalLight(new THREE.Color(pal.sun || '#ffffff'), tod[0] * 1.15);
      const sa = wdef.time === 'dusk' ? 0.25 : wdef.time === 'dawn' ? 0.3 : wdef.time === 'night' ? 0.8 : 0.9;
      sun.position.set(Math.cos(sa) * 40, 30 + sa * 20, Math.sin(sa) * 40 + 20);
      if (this.q.shadow) {
        sun.castShadow = true; const S = sun.shadow; S.mapSize.set(this.q.shadowSize || 1024, this.q.shadowSize || 1024);
        S.camera.left = -r * 1.3; S.camera.right = r * 1.3; S.camera.top = r * 1.3; S.camera.bottom = -r * 1.3; S.camera.near = 5; S.camera.far = 120; S.bias = -0.0008; S.normalBias = 0.03; S.radius = 3;
      }
      this.root.add(sun); this.root.add(sun.target); this.sun = sun;
      // Kühles Gegenlicht von hinten: Konturen heben sich vom Himmel ab
      const rim = new THREE.DirectionalLight(new THREE.Color(pal.sky).lerp(new THREE.Color('#ffffff'), 0.4), 0.35); rim.position.set(-sun.position.x, 18, -sun.position.z); this.root.add(rim);
      // Untergrund
      const seaK = wdef.sea || 'water';
      const sea = this.own(new THREE.Mesh(new THREE.PlaneGeometry(900, 900, 60, 60), seaMat(seaK, pal.sea || '#2e8fd1', M.mix(pal.sea || '#2e8fd1', pal.horizon || '#ffffff', 0.4))), true);
      sea.rotation.x = -Math.PI / 2; sea.position.y = seaK === 'clouds' ? -r * 1.6 : -r * 2.0; this.root.add(sea); this.sea = sea;
      if (seaK === 'void' || night) this.addStars(night ? 500 : 900);
      // Insel
      const ig = this.own(islandGeo(r, sh, pal, sh.seed || wdef.n));
      const island = new THREE.Mesh(ig, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: false }));
      island.userData.ownMat = true; this.items.push(island);
      island.receiveShadow = true; island.castShadow = true; this.root.add(island); this.islandMesh = island;
      // Hängende Wurzeln/Kristalle unter der Insel
      const cm = M.mat(pal.glow || '#bfefff', { em: pal.glow || '#bfefff', emi: 0.5, rough: 0.2, flat: true });
      for (let i = 0; i < 9; i++) { const a = i * 0.7 + this.rng.next(), rr = r * (0.2 + this.rng.next() * 0.45); const c = M.mesh(M.oct(0.6 + this.rng.next() * 0.5), cm, Math.cos(a) * rr, -r * (0.8 + this.rng.next() * 0.35) * (sh.cliff || 1) * (1 - rr / r) - 0.5, Math.sin(a) * rr, false); c.scale.set(0.5, 1.6, 0.5); c.rotation.x = Math.PI; this.root.add(c); }
      // Terrassen
      this.tiers = [];
      const tiers = Math.max(1, sh.tiers || 1);
      for (let k = 1; k < tiers; k++) {
        const tr = r * (0.42 - (k - 1) * 0.12), a = 2.2 + k * 2.1, d = r * 0.35;
        const tg = this.own(islandGeo(tr, { lobes: 0, cliff: 0.35, flat: 0.8 }, pal, (sh.seed || 1) + k * 7, 0.3));
        const tm = new THREE.Mesh(tg, island.material); tm.position.set(Math.cos(a) * d, 1.1 * k, Math.sin(a) * d); tm.castShadow = tm.receiveShadow = true;
        this.root.add(tm); this.tiers.push({ x: tm.position.x, z: tm.position.z, y: tm.position.y + 0.05, r: tr });
      }
      // Nebeninseln
      for (let k = 0; k < (sh.lobes || 0); k++) {
        const a = k * 2.3 + 0.9, d = r * (1.45 + this.rng.next() * 0.3), sr = r * (0.16 + this.rng.next() * 0.08);
        const sg = this.own(islandGeo(sr, { lobes: 0, cliff: 1.2, flat: 0.5 }, pal, (sh.seed || 1) + 50 + k, 1));
        const sm = new THREE.Mesh(sg, island.material); sm.position.set(Math.cos(a) * d, -1.5 - this.rng.next() * 3, Math.sin(a) * d); sm.castShadow = true;
        sm.userData.float = { base: sm.position.y, ph: k }; this.root.add(sm); this.anims.push(sm);
        const tr = new THREE.Group(); for (const p of decorParts(wdef.decor && wdef.decor[0] ? wdef.decor[0][0] : 'round_tree', pal)) { const m = new THREE.Mesh(p.g, p.m); m.position.set(p.x, p.y, p.z); m.scale.set(p.sx, p.sy, p.sz); tr.add(m); }
        tr.position.y = 0.05; sm.add(tr);
      }
      // Bauplätze: Kreis auf dem Hauptplateau, letztes Bauwerk ggf. auf der Terrasse
      const slots = [];
      for (let b = 0; b < 5; b++) {
        if (b === 4 && this.tiers.length) { const t0 = this.tiers[this.tiers.length - 1]; slots.push({ x: t0.x, y: t0.y, z: t0.z }); continue; }
        const a = -0.6 + b * (Math.PI * 2 / (this.tiers.length ? 4 : 5)) + 0.3, d = r * (b % 2 ? 0.58 : 0.5);
        slots.push({ x: Math.cos(a) * d, y: 0.03, z: Math.sin(a) * d });
      }
      // Terrassen dürfen keine Bauplätze überdecken: kollidierende Plätze etwas verschieben
      for (const s of slots) for (const t0 of this.tiers) { const dx = s.x - t0.x, dz = s.z - t0.z, dd = Math.hypot(dx, dz); if (s.y < 0.5 && dd < t0.r + 1.8) { const k = (t0.r + 2.0) / Math.max(0.01, dd); s.x = t0.x + dx * k; s.z = t0.z + dz * k; } }
      this.slots = slots;
      // Wegsteine von der Mitte zu den Bauplätzen
      const stoneM = M.mat(M.mix(pal.rock || '#c9b49a', '#ffffff', 0.25), { rough: 0.95 });
      const stones = new THREE.InstancedMesh(M.cyl(0.32, 0.36, 0.08, 8), stoneM, 60); let si = 0; const mm = new THREE.Matrix4();
      for (const s of slots) { if (s.y > 0.5) continue; const n = Math.floor(Math.hypot(s.x, s.z) / 0.95); for (let k = 1; k < n - 1 && si < 60; k++) { const f = k / n; mm.makeTranslation(s.x * f + (this.rng.next() - 0.5) * 0.2, 0.05, s.z * f + (this.rng.next() - 0.5) * 0.2); stones.setMatrixAt(si++, mm); } }
      stones.count = si; stones.receiveShadow = true; this.root.add(stones);
      this.root.add(M.mesh(M.cyl(1.4, 1.5, 0.12, 20), stoneM, 0, 0.05, 0, false)).receiveShadow = true;
      // Bauwerke
      for (let b = 0; b < 5; b++) this.setBuilding(b, stages[b], damaged[b], false);
      // Deko
      this.placeDecor(wdef, r);
      // Animierte Details
      this.det = SW.Details ? SW.Details.add(this, wdef) : [];
      // Bewohner & Kivi
      this.npcs = [];
      const nn = this.q.decor < 0.6 ? 2 : 3;
      for (let i = 0; i < nn; i++) { const n = npcModel(wdef.npc, pal); n.userData.walk = { a: i * 2.1, sp: 0.12 + i * 0.03, rad: r * (0.3 + i * 0.12) }; n.traverse(o => { if (o.isMesh) o.castShadow = true; }); this.root.add(n); this.npcs.push(n); }
      this.kivi = kivi(); this.kivi.position.set(2, 4, 3); this.root.add(this.kivi);
      if (opts.mode) this.setMode(opts.mode);
    }
    addStars(n) {
      const THREE = T(), p = new Float32Array(n * 3), rng = SW.rng.seeded('stars');
      for (let i = 0; i < n; i++) { const a = rng.next() * 6.283, y = rng.next() * 1.4 - 0.5, rr = 380; p[i * 3] = Math.cos(a) * rr * Math.sqrt(1 - Math.min(0.9, y * y)); p[i * 3 + 1] = y * rr; p[i * 3 + 2] = Math.sin(a) * rr * Math.sqrt(1 - Math.min(0.9, y * y)); }
      const g = this.own(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      const m = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 });
      const pts = new THREE.Points(g, m); pts.userData.ownMat = true; this.items.push(pts); this.root.add(pts);
    }
    placeDecor(wdef, r) {
      const THREE = T(), mm = new THREE.Matrix4(), pm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
      const R = this.islandMesh.geometry.userData.R, rng = SW.rng.seeded('dec' + wdef.n);
      const placed = [];
      const free = (x, z, rad) => {
        for (const sl of this.slots) if (Math.hypot(sl.x - x, sl.z - z) < 2.3 * Island.BS + rad) return false;
        for (const t0 of this.tiers) if (Math.hypot(t0.x - x, t0.z - z) < t0.r + 0.6) return false;
        if (Math.hypot(x, z) < 1.8) return false;
        for (const p of placed) if (Math.hypot(p[0] - x, p[1] - z) < 0.75) return false;
        return true;
      };
      const H = this.islandMesh.geometry.userData.H || (() => 0), BS = Island.BS;
      const extra = [['tuft', Math.round(90 * (this.q.decor || 1))], ['pebble', 16], ['bush', 10], ['flower', 12]];
      for (const [type, n0] of (wdef.decor || []).concat(extra)) {
        const n = Math.max(1, Math.round(n0 * (this.q.decor || 1) * (type === 'tuft' || type === 'pebble' ? 1 : 1.35)));
        const pos = [];
        for (let k = 0, tries = 0; k < n && tries < n * 30; tries++) {
          const a = rng.next() * Math.PI * 2, d = Math.sqrt(rng.next()) * 0.86 * r * R(a), x = Math.cos(a) * d, z = Math.sin(a) * d;
          if (!free(x, z, type === 'tuft' || type === 'pebble' ? -0.4 : 0.2)) continue; if (type !== 'tuft' && type !== 'pebble') placed.push([x, z]); pos.push([x, z, rng.next() * 6.28, 0.75 + rng.next() * 0.6]); k++;
        }
        if (!pos.length) continue;
        for (const p of decorParts(type, wdef.pal)) {
          const im = new THREE.InstancedMesh(p.g, p.m, pos.length);
          e.set(p.rx, 0, p.rz); q.setFromEuler(e); pm.compose(v.set(p.x, p.y, p.z), q, s.set(p.sx, p.sy, p.sz));
          pos.forEach((o, i) => { e.set(0, o[2], 0); q.setFromEuler(e); mm.compose(v.set(o[0], H(o[0], o[1]) + 0.02, o[1]), q, s.set(o[3], o[3], o[3])); mm.multiply(pm); im.setMatrixAt(i, mm); });
          im.castShadow = this.q.decor >= 1; im.receiveShadow = true;
          this.root.add(im);
        }
      }
    }
    setBuilding(b, stage, damaged, animate) {
      const THREE = T(), M = Mo(), sl = this.slots[b]; if (!sl || !this.w) return;
      const old = this.bgroups[b]; if (old) this.root.remove(old);
      const def = this.w.buildings[b];
      const g = M.building(def, stage, this.w.pal, b, damaged);
      g.position.set(sl.x, sl.y, sl.z); g.scale.setScalar(Island.BS);
      g.rotation.y = Math.atan2(sl.x, sl.z);   // Eingang zeigt nach außen, zur Kamera
      this.root.add(g); this.bgroups[b] = g;
      if (!this.hit[b]) { const h = new THREE.Mesh(M.cyl(1.8 * Island.BS, 1.8 * Island.BS, 4 * Island.BS, 10), new THREE.MeshBasicMaterial({ visible: false })); h.userData.b = b; h.userData.ownMat = true; this.items.push(h); this.root.add(h); this.hit[b] = h; }
      this.hit[b].position.set(sl.x, sl.y + 2 * Island.BS, sl.z);
      if (animate) {
        g.scale.set(0.6 * Island.BS, 0.2 * Island.BS, 0.6 * Island.BS); g.userData.grow = 0;
        if (this.fx) { this.fx.burst(new THREE.Vector3(sl.x, sl.y + 1, sl.z), { n: 60, color: this.w.pal.glow, speed: 5, up: 4, life: 1.2 }); this.fx.ring(new THREE.Vector3(sl.x, sl.y + 0.15, sl.z), this.w.pal.accent2 || '#ffffff'); }
      }
    }
    slotPos(b) { const s = this.slots[b]; return s ? new (T().Vector3)(s.x, s.y, s.z) : new (T().Vector3)(); }
    pick(ndc) {
      const THREE = T(), rc = new THREE.Raycaster(); rc.setFromCamera(ndc, this.camera);
      const h = rc.intersectObjects(this.hit.filter(Boolean), false);
      return h.length ? h[0].object.userData.b : -1;
    }
    setMode(m) {
      this.mode = m;
      const r = this.r || 12;
      if (m === 'backdrop') this.camGoal = { yaw: this.cam.yaw, pitch: 0.36, dist: r * 3.6, tx: 0, ty: -r * 0.75, tz: 0 };
      else if (m === 'diorama') this.camGoal = { yaw: this.cam.yaw, pitch: 0.55, dist: r * 2.55, tx: 0, ty: 0, tz: 0 };
      else if (m === 'target') this.camGoal = { yaw: 0.9, pitch: 0.62, dist: r * 2.4, tx: 0, ty: 0, tz: 0 };
    }
    focus(b) { const p = this.slotPos(b); this.camGoal = { yaw: Math.atan2(p.x, p.z) , pitch: 0.42, dist: 15, tx: p.x, ty: p.y + 1.5, tz: p.z }; }
    // Kamerasteuerung
    orbit(dx, dy) { this.cam.yaw -= dx * 0.006; this.cam.pitch = Math.max(0.12, Math.min(1.25, this.cam.pitch + dy * 0.004)); this.camGoal = null; }
    zoom(f) { const r = this.r || 12; this.cam.dist = Math.max(r * 0.9, Math.min(r * 4.2, this.cam.dist * f)); this.camGoal = null; }
    pan(dx, dz) { const c = Math.cos(this.cam.yaw), s = Math.sin(this.cam.yaw), lim = (this.r || 12) * 0.8; this.cam.tx = Math.max(-lim, Math.min(lim, this.cam.tx + c * dx + s * dz)); this.cam.tz = Math.max(-lim, Math.min(lim, this.cam.tz - s * dx + c * dz)); this.camGoal = null; }
    resize(w, h) { this.camera.aspect = w / h; const portrait = h > w; this.camera.fov = portrait ? 58 : 45; this.camera.updateProjectionMatrix(); this.portrait = portrait; }
    update(dt, t) {
      this.t = t;
      const c = this.cam, gl = this.camGoal;
      if (gl) { const k = Math.min(1, dt * 2.4); for (const key of ['yaw', 'pitch', 'dist', 'tx', 'ty', 'tz']) c[key] += (gl[key] - c[key]) * k; }
      if (this.mode === 'backdrop') c.yaw += dt * 0.03;
      const d = c.dist * (this.portrait && this.mode !== 'backdrop' ? 1.25 : 1);
      this.camera.position.set(c.tx + Math.sin(c.yaw) * Math.cos(c.pitch) * d, c.ty + Math.sin(c.pitch) * d, c.tz + Math.cos(c.yaw) * Math.cos(c.pitch) * d);
      this.camera.lookAt(c.tx, c.ty, c.tz);
      if (this.sea) this.sea.material.uniforms.t.value = t;
      for (const g of this.bgroups) if (g) {
        if (g.userData.grow !== undefined) { const u = g.userData.grow = Math.min(1, g.userData.grow + dt * 1.6); const e = 1 + Math.sin(u * Math.PI) * 0.12; const B = Island.BS; g.scale.set(B * (0.6 + 0.4 * u * e), B * (0.2 + 0.8 * u * e), B * (0.6 + 0.4 * u * e)); if (u >= 1) { g.scale.setScalar(B); delete g.userData.grow; } }
        Mo().animate(g, t, dt);
      }
      for (const a of this.anims) if (a.userData.float) a.position.y = a.userData.float.base + Math.sin(t * 0.6 + a.userData.float.ph) * 0.4;
      for (const n of this.npcs || []) { const w = n.userData.walk; w.a += dt * w.sp; let x = Math.cos(w.a) * w.rad, z = Math.sin(w.a) * w.rad; n.position.set(x, 0.05 + Math.abs(Math.sin(t * 6 + w.a * 10)) * 0.05, z); n.rotation.y = -w.a; }
      if (this.kivi) { const k = this.kivi; k.position.set(Math.cos(t * 0.35) * 5, 4.2 + Math.sin(t * 1.3) * 0.5, Math.sin(t * 0.35) * 5); k.rotation.y = -t * 0.35 - Math.PI / 2; k.traverse(o => { if (o.userData.wing) o.rotation.z = o.userData.wing * (0.3 + Math.sin(t * 14) * 0.45); if (o.userData.needle) o.rotation.y = Math.sin(t * 0.7) * 1.2; }); }
      if (this.det) for (const d0 of this.det) d0.update(dt, t);
      if (this.fx) this.fx.update(dt);
    }
    dispose() { this.clear(); if (this.fx) this.fx.dispose(); }
  }
  Island.BS = 1.45;   // Maßstab der Bauwerke auf der Insel
  SW.Island = Island;
  SW.islandParts = { decorParts, npcModel, kivi, islandGeo, skyMat, seaMat };
})(globalThis.SW = globalThis.SW || {});
