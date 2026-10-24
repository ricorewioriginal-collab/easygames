/* AnMaCha Podcast Tycoon 3D – prozedurale Oberflächen ohne Bilddateien (Three.js r128, global THREE).
   • detail(T, size): zwei kachelbare RGBA-Texturen, je Kanal ein Graustufen-Muster (einmal erzeugt, zwischengespeichert):
       A = Holzdielen | Fliesen | Ziegel | Putz,   B = Asphalt | Gras | Teppich | Kies.
   • surfMaterial(T, opts): EIN geteiltes Material für die ganze Stadt. Die Builder-Geometrie trägt pro Ecke eine
     Oberflächen-Nummer (Attribut "surf", siehe PT.Models.SURF); der Shader projiziert die Muster in Weltkoordinaten
     (Boden von oben, Wände von der Seite) und färbt damit die Eckfarbe – viele Texturen, ein Draw-Call.
   • linearColors(mat): Eckfarben (sRGB) im Shader linearisieren – für Ausgabe in sRGB mit Tonemapping.
   • blob(T): weicher runder Schatten (Alpha-Verlauf) für Figuren ohne Echtzeitschatten.
   Ohne document/WebGL (Node-Test) liefern die Textur-Funktionen null; Materialien funktionieren dann ohne Muster. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const X = PT.Tex = {};
  const cache = {};

  // ── kachelbares Rauschen ──────────────────────────────────
  function hash(x, y, s) { let h = Math.imul(x * 374761393 + y * 668265263 + s * 2147483647, 1274126177) ^ (s * 2654435761); h = Math.imul(h ^ (h >>> 13), 1103515245); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  /** Wertrauschen mit Periode p (Gitterzellen), Koordinaten in Zellen. */
  const lat = new Map();
  function lattice(p, s) { const k = p * 65536 + s; let L = lat.get(k); if (!L) { L = new Float32Array(p * p); for (let y = 0; y < p; y++) for (let x = 0; x < p; x++) L[y * p + x] = hash(x, y, s); lat.set(k, L); } return L; }
  function vnoise(x, y, p, s) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const x0 = ((xi % p) + p) % p, y0 = ((yi % p) + p) % p, x1 = (x0 + 1) % p, y1 = (y0 + 1) % p, L = lattice(p, s);
    const a = L[y0 * p + x0], b = L[y0 * p + x1], c = L[y1 * p + x0], d = L[y1 * p + x1];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  /** fbm über [0,1)²; base = Zellen der ersten Oktave (Periode bleibt ganzzahlig → kachelbar). */
  function fbm(u, v, base, oct, s) {
    let sum = 0, amp = 0.5, tot = 0, f = base;
    for (let o = 0; o < oct; o++) { sum += vnoise(u * f, v * f, f, s + o * 17) * amp; tot += amp; amp *= 0.5; f *= 2; }
    return sum / tot;
  }
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

  // ── Muster (Wert 0..1 je Pixel, u/v in [0,1)) ─────────────
  const PAT = {
    // Dielen: 10 Bretter quer, versetzte Stöße, Maserung längs, dunkle Fugen
    wood(N) {
      const out = new Float32Array(N * N), rows = 10, rh = N / rows;
      for (let y = 0; y < N; y++) {
        const r = Math.floor(y / rh), ry = (y % rh) / rh;
        const off = hash(r, 7, 3), len = 0.5 + hash(r, 9, 3) * 0.5;
        for (let x = 0; x < N; x++) {
          const u = x / N, v = y / N;
          const t = ((u + off) % 1) / len, seg = Math.floor(t), st = t - seg;
          const tone = 0.42 + hash(r, seg, 11) * 0.22;
          const grain = fbm(u * 0.5 + r * 0.31, v * 6, 4, 3, 21 + r) * 0.5 + Math.sin((v * rows * 6 + fbm(u, v, 8, 2, 5) * 6) * Math.PI) * 0.06;
          let val = tone + (grain - 0.25) * 0.5;
          const ey = Math.min(ry, 1 - ry) * rh, ex = Math.min(st, 1 - st) * len * N;
          if (ey < 1.2 || ex < 1.2) val *= 0.45; else if (ey < 2.4) val *= 0.85;
          out[y * N + x] = val;
        }
      }
      return out;
    },
    // Fliesen: 4×4 Platten, helle Fugen, leichte Farbschwankung je Platte
    tiles(N) {
      const out = new Float32Array(N * N), n = 4, ts = N / n, g = Math.max(1.5, N / 170);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const tx = Math.floor(x / ts), ty = Math.floor(y / ts), lx = x % ts, ly = y % ts;
        const e = Math.min(lx, ly, ts - 1 - lx, ts - 1 - ly);
        let val = 0.55 + (hash(tx, ty, 41) - 0.5) * 0.12 + (fbm(x / N, y / N, 16, 3, 43) - 0.5) * 0.12;
        if (e < g) val = 0.32; else if (e < g + 1.5) val *= 0.9; else if (e < g + 3) val *= 1.04;
        out[y * N + x] = val;
      }
      return out;
    },
    // Ziegel: 32 Reihen, 8 Steine je Reihe (versetzt), helle Mörtelfugen
    brick(N) {
      const out = new Float32Array(N * N), rows = 32, cols = 8, rh = N / rows, cw = N / cols, m = Math.max(1, N / 300);
      for (let y = 0; y < N; y++) {
        const r = Math.floor(y / rh), ly = y % rh;
        for (let x = 0; x < N; x++) {
          const xs = x + (r & 1 ? cw / 2 : 0), c = Math.floor(xs / cw) % cols, lx = xs % cw;
          const e = Math.min(ly, rh - 1 - ly, lx, cw - 1 - lx);
          let val = 0.48 + (hash(c, r, 61) - 0.5) * 0.3 + (fbm(x / N, y / N, 32, 3, 63) - 0.5) * 0.22;
          if (e < m) val = 0.85 + (fbm(x / N, y / N, 64, 2, 67) - 0.5) * 0.1; else if (e < m + 1) val *= 0.85;
          out[y * N + x] = val;
        }
      }
      return out;
    },
    // Putz: feine Körnung + große, weiche Flecken
    plaster(N) {
      const out = new Float32Array(N * N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = x / N, v = y / N;
        out[y * N + x] = fbm(u, v, 4, 3, 81) * 0.55 + fbm(u, v, 64, 3, 83) * 0.45 + (hash(x, y, 85) - 0.5) * 0.08;
      }
      return out;
    },
    // Asphalt: Körnung mit hellen und dunklen Splitt-Punkten, flickige Flächen
    asphalt(N) {
      const out = new Float32Array(N * N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = x / N, v = y / N, h = hash(x, y, 91);
        let val = 0.5 + (fbm(u, v, 64, 3, 93) - 0.5) * 0.35 + (fbm(u, v, 3, 3, 95) - 0.5) * 0.3;
        if (h > 0.985) val += 0.35; else if (h < 0.02) val -= 0.25;
        out[y * N + x] = val;
      }
      return out;
    },
    // Gras: Büschel, Halme (längliche Striche) und hellere/dunklere Flecken
    grass(N) {
      const out = new Float32Array(N * N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = x / N, v = y / N;
        out[y * N + x] = 0.5 + (fbm(u, v, 4, 3, 101) - 0.5) * 0.5 + (fbm(u, v, 32, 2, 103) - 0.5) * 0.45 + (vnoise(u * 128, v * 128, 128, 107) - 0.5) * 0.3 + (hash(x, y, 109) - 0.5) * 0.25;
      }
      return out;
    },
    // Teppich: feine Schlingen + leichte Wolken
    carpet(N) {
      const out = new Float32Array(N * N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = x / N, v = y / N, loop = Math.sin(x * Math.PI / 2) * Math.sin(y * Math.PI / 2);
        out[y * N + x] = 0.5 + loop * 0.08 + (hash(x, y, 121) - 0.5) * 0.3 + (fbm(u, v, 8, 3, 123) - 0.5) * 0.25;
      }
      return out;
    },
    // Kies/Dachpappe: runde Körner
    gravel(N) {
      const out = new Float32Array(N * N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = x / N, v = y / N;
        const k = vnoise(u * 96, v * 96, 96, 131), k2 = vnoise(u * 48, v * 48, 48, 133);
        out[y * N + x] = 0.5 + (k - 0.5) * 0.55 + (k2 - 0.5) * 0.3 + (fbm(u, v, 4, 2, 135) - 0.5) * 0.2;
      }
      return out;
    }
  };
  X.PAT = PAT;
  /** Mittelwert auf 0.5 schieben (Muster färbt die Grundfarbe nur um, ohne sie heller/dunkler zu machen). */
  function norm(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; const d = 0.5 - s / a.length; for (let i = 0; i < a.length; i++) a[i] = clamp01(a[i] + d); return a; }
  function pack(T, N, names) {
    const data = new Uint8Array(N * N * 4);
    names.forEach((nm, c) => { const a = norm(PAT[nm](N)); for (let i = 0; i < a.length; i++) data[i * 4 + c] = Math.round(a[i] * 255); });
    const t = new T.DataTexture(data, N, N, T.RGBAFormat, T.UnsignedByteType);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.magFilter = T.LinearFilter; t.minFilter = T.LinearMipmapLinearFilter; t.generateMipmaps = true;
    t.needsUpdate = true;
    return t;
  }
  const canTex = () => typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined';
  /** { a, b } – die beiden Muster-Texturen (Kantenlänge size, Zweierpotenz). */
  X.detail = function (T, size) {
    if (!canTex()) return null;
    const N = size >= 512 ? 512 : 256, k = 'detail' + N;
    if (!cache[k]) {
      try { cache[k] = { a: pack(T, N, ['wood', 'tiles', 'brick', 'plaster']), b: pack(T, N, ['asphalt', 'grass', 'carpet', 'gravel']), size: N }; }
      catch (e) { if (root.console) console.warn('[PT.Tex] Muster', e); return null; }
      finally { lat.clear(); }
    }
    return cache[k];
  };
  X.blob = function (T) {
    if (!canTex()) return null;
    if (!cache.blob) {
      const N = 64, d = new Uint8Array(N * N * 4);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const r = Math.hypot(x - N / 2 + 0.5, y - N / 2 + 0.5) / (N / 2), a = clamp01(1 - r); const i = (y * N + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = 0; d[i + 3] = Math.round(255 * a * a * (3 - 2 * a));
      }
      const t = new T.DataTexture(d, N, N, T.RGBAFormat, T.UnsignedByteType);
      t.magFilter = T.LinearFilter; t.minFilter = T.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
      cache.blob = t;
    }
    return cache.blob;
  };
  X.dispose = function () { Object.keys(cache).forEach(k => { const c = cache[k]; if (c.dispose) c.dispose(); else { if (c.a) c.a.dispose(); if (c.b) c.b.dispose(); } delete cache[k]; }); };

  // ── Shader-Erweiterungen ──────────────────────────────────
  const LIN = '\n#if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )\n vColor.rgb = pow( max( vColor.rgb, vec3( 0.0 ) ), vec3( 2.2 ) );\n#endif\n';
  /** Eckfarben (sRGB, wie bisher angegeben) im Vertex-Shader linearisieren. */
  X.linearColors = function (mat) {
    const prev = mat.onBeforeCompile;
    mat.onBeforeCompile = function (sh, r) { if (prev) prev.call(this, sh, r); sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>', '#include <color_vertex>' + LIN); };
    const key = mat.customProgramCacheKey ? mat.customProgramCacheKey() : '';
    mat.customProgramCacheKey = () => key + '|lin';
    return mat;
  };
  /** Stadt-Material: Lambert (low) oder Standard (mid/high), Eckfarben + Oberflächenmuster + Rauheit je Oberfläche. */
  X.surfMaterial = function (T, opts) {
    opts = opts || {};
    const M = PT.Models || {}, P = M.SURF_PARAMS || [[0, 0, 0, 0.85]];
    const std = !!opts.standard, tex = opts.textures || null;
    const mat = std ? new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 }) : new T.MeshLambertMaterial({ vertexColors: true });
    const n = P.length;
    const uS = { value: P.map(p => new T.Vector4(p[0], p[1], tex ? p[2] : 0, p[3])) };
    const uA = { value: tex ? tex.a : null }, uB = { value: tex ? tex.b : null };
    mat.userData.surf = { uS, uA, uB };
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.egS = uS; sh.uniforms.egTexA = uA; sh.uniforms.egTexB = uB;
      sh.vertexShader = 'attribute float surf;\nuniform vec4 egS[' + n + '];\nvarying vec4 vEgM;\nvarying vec3 vEgP;\nvarying vec3 vEgW;\nvarying vec3 vEgN;\n' +
        sh.vertexShader.replace('#include <color_vertex>', '#include <color_vertex>' + LIN).replace('#include <begin_vertex>', [
          '#include <begin_vertex>',
          'int egI = int( surf + 0.5 ); vec4 egQ = egS[ egI ];',
          'float egC = egQ.x; float egT = egC > 3.5 ? 1.0 : 0.0; float egCh = egC - egT * 4.0;',
          'vEgM = vec4( egCh < 0.5 ? 1.0 : 0.0, abs( egCh - 1.0 ) < 0.5 ? 1.0 : 0.0, abs( egCh - 2.0 ) < 0.5 ? 1.0 : 0.0, egCh > 2.5 ? 1.0 : 0.0 );',
          'vEgP = vec3( egT, egQ.z, egQ.w );',
          'vec4 egWp = vec4( transformed, 1.0 ); vec3 egWn = objectNormal;',
          '#ifdef USE_INSTANCING',
          ' egWp = instanceMatrix * egWp; egWn = mat3( instanceMatrix ) * egWn;',
          '#endif',
          'egWp = modelMatrix * egWp; vEgW = egWp.xyz * egQ.y; vEgN = mat3( modelMatrix ) * egWn;'
        ].join('\n'));
      let fs = 'uniform sampler2D egTexA;\nuniform sampler2D egTexB;\nvarying vec4 vEgM;\nvarying vec3 vEgP;\nvarying vec3 vEgW;\nvarying vec3 vEgN;\n' + sh.fragmentShader;
      if (tex) fs = fs.replace('#include <color_fragment>', [
        '#include <color_fragment>',
        'vec3 egAn = abs( vEgN );',
        'vec2 egUv = ( egAn.y > egAn.x && egAn.y > egAn.z ) ? vEgW.xz : ( egAn.x > egAn.z ? vEgW.zy : vEgW.xy );',
        'vec4 egTa = texture2D( egTexA, egUv ); vec4 egTb = texture2D( egTexB, egUv );',
        'float egD = dot( mix( egTa, egTb, vEgP.x ), vEgM );',
        'diffuseColor.rgb *= max( 0.0, 1.0 + ( egD - 0.5 ) * 2.0 * vEgP.y );'
      ].join('\n'));
      if (std) fs = fs.replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vEgP.z;');
      sh.fragmentShader = fs;
    };
    mat.customProgramCacheKey = () => 'egSurf' + n + (std ? 's' : 'l') + (tex ? 't' : '');
    return mat;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
