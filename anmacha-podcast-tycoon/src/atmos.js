/* AnMaCha – Der Podcast · Tag und Nacht nach der Spieluhr, Wetter je Tag (Sonne, Wolken, Regen), Laternen, Regen-Partikel.
   Nur in der freien Stadt: der Himmel wandert von Morgenrot über Tag und Abendrot in die Nacht. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World;
  const AT = AMC.Atmos = {};
  // Stützpunkte über den Tag (Minuten) → Himmels-Voreinstellung
  const KEYS = [[0, 'night'], [5 * 60, 'night'], [6.5 * 60, 'sunset'], [8.5 * 60, 'day'], [17.5 * 60, 'day'], [19.5 * 60, 'sunset'], [21 * 60, 'night'], [24 * 60, 'night']];
  const WEATHER = [['sun', '☀️', 'Sonnig'], ['cloud', '⛅', 'Bewölkt'], ['rain', '🌧️', 'Regen']];
  let V = null, T = null;
  const day = () => AMC.Career ? AMC.Career.state() : { day: 1, min: 12 * 60 };
  // Wetter je Spieltag (fest pro Tag, gleiche Folge bei jedem Spielstand)
  AT.weather = function (d) { d = d || day().day; const r = Math.abs(Math.sin(d * 91.7 + 3.1) * 43758.5) % 1; const w = r < 0.55 ? WEATHER[0] : r < 0.8 ? WEATHER[1] : WEATHER[2]; return { id: w[0], icon: w[1], name: w[2] }; };
  AT.bonus = () => AT.weather().id === 'rain' ? 0.05 : 0;   // bei Regen hören mehr Leute zu Hause
  AT.night = () => !!(V && V.nightK > 0.5);

  AT.start = function (S) {
    AT.stop(); T = root.THREE; if (!S || S.mode !== 'free' || S.net || !S.env) return;
    V = { S, t: 0, nightK: 0, c: {} };
    ['top', 'hor', 'bot', 'sun', 'h0', 'h1', 'fog'].forEach(k => (V.c[k] = new T.Color()));
    V.tmp = new T.Color(); V.tmp2 = new T.Color(); V.grey = new T.Color(0x7d8796);
    // Regen: Tropfen in einer Box um die Kamera
    const n = 1400, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = U.rand(-22, 22); pos[i * 3 + 1] = U.rand(0, 22); pos[i * 3 + 2] = U.rand(-22, 22); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    V.rain = new T.Points(geo, new T.PointsMaterial({ color: 0xd6e8ff, size: 0.12, transparent: true, opacity: 0.85, depthWrite: false })); V.rain.frustumCulled = false; V.rain.visible = false; S.scene.add(V.rain);
    AT.apply(true);
  };
  AT.stop = function () { if (V && V.wet && V.S) wet(V.S, false); if (V && V.rain) { V.rain.parent && V.rain.parent.remove(V.rain); V.rain.geometry.dispose(); } V = null; if (W.renderer) W.renderer.toneMappingExposure = 1.08; };

  function mix(a, b, k, out) { return out.set(a).lerp(V.tmp2.set(b), k); }
  // Himmel, Licht und Nebel für die aktuelle Uhrzeit setzen
  AT.apply = function () {
    if (!V) return; const S = V.S, env = S.env, m = (day().min || 0) % (24 * 60);
    let i = 0; while (i < KEYS.length - 2 && m >= KEYS[i + 1][0]) i++;
    const a = W.SKIES[KEYS[i][1]], b = W.SKIES[KEYS[i + 1][1]], k = U.clamp((m - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]), 0, 1), L = (x, y) => x + (y - x) * k;
    const w = AT.weather(), wk = w.id === 'rain' ? 0.55 : w.id === 'cloud' ? 0.3 : 0, c = V.c;
    mix(a.top, b.top, k, c.top).lerp(V.grey, wk); mix(a.hor, b.hor, k, c.hor).lerp(V.grey, wk); mix(a.bot, b.bot, k, c.bot);
    mix(a.sun, b.sun, k, c.sun); mix(a.hemi[0], b.hemi[0], k, c.h0); mix(a.hemi[1], b.hemi[1], k, c.h1); mix(a.fog, b.fog, k, c.fog).lerp(V.grey, wk * 0.8);
    const u = env.sky.material.uniforms; u.top.value.copy(c.top); u.hor.value.copy(c.hor); u.bot.value.copy(c.bot); u.sunC.value.copy(c.sun).multiplyScalar(1 - wk);
    u.stars.value = L(a.stars || 0, b.stars || 0) * (1 - wk);
    const sp = [0, 1, 2].map(j => L(a.sunPos[j], b.sunPos[j])); S.sunPos = sp; u.sunDir.value.set(sp[0], sp[1], sp[2]).normalize();
    S.scene.fog.color.copy(c.fog); S.scene.background = c.fog; S.scene.fog.near = L(a.fogD[0], b.fogD[0]) * (1 - wk * 0.5); S.scene.fog.far = L(a.fogD[1], b.fogD[1]) * (1 - wk * 0.35);
    env.hemi.color.copy(c.h0); env.hemi.groundColor.copy(c.h1); env.hemi.intensity = L(a.hemi[2], b.hemi[2]) * (1 - wk * 0.25);
    env.sun.color.copy(c.sun); env.sun.intensity = L(a.sunI, b.sunI) * (w.id === 'rain' ? 0.25 : w.id === 'cloud' ? 0.6 : 1);
    W.renderer.toneMappingExposure = L(a.exp, b.exp) * (1.03 - wk * 0.2) * (1 - V.nightK * 0.12);
    V.nightK = m < 6 * 60 || m > 20 * 60 ? 1 : m < 7 * 60 ? (7 * 60 - m) / 60 : m > 19 * 60 ? (m - 19 * 60) / 60 : 0;
    if (S.lampMat) { S.lampMat.emissive.setHex(V.nightK > 0.3 ? 0xffd890 : 0x222222); S.lampMat.emissiveIntensity = 0.2 + V.nightK * 1.8; }
    if (S.lampGlow) S.lampGlow.visible = V.nightK > 0.3;
    if (V.rain) V.rain.visible = w.id === 'rain';
    if (!!V.wet !== (w.id === 'rain')) wet(S, w.id === 'rain');
  };
  // Nasse Straßen bei Regen: dunkle, matte Flächen (Asphalt, Gehwege) glänzen; nach dem Regen wieder matt
  function wet(S, on) {
    V.wet = on; const seen = new Set();
    S.group.traverse(o => {
      const m = o.isMesh && !o.isSkinnedMesh && o.material; if (!m || Array.isArray(m) || seen.has(m) || m.roughness == null) return; seen.add(m);
      if (on) { if (m.roughness >= 0.8 && m.color && m.color.r + m.color.g + m.color.b < 0.5 && !m.userData.dry) { m.userData.dry = [m.roughness, m.metalness]; m.roughness = 0.22; m.metalness = 0.35; } }
      else if (m.userData.dry) { m.roughness = m.userData.dry[0]; m.metalness = m.userData.dry[1]; delete m.userData.dry; }
    });
  }
  AT.update = function (dt) {
    if (!V) return;
    V.t -= dt; if (V.t <= 0) { V.t = 0.25; AT.apply(); }
    if (V.rain && V.rain.visible && (V.splT = (V.splT || 0) - dt) <= 0 && W.particles) {
      // Pfützen-Spritzer rund um die Kamera
      V.splT = 0.07; const cam = W.camera.position, a = Math.random() * 6.28, r = 2 + Math.random() * 9;
      W.particles.burst(cam.x + Math.cos(a) * r, 0.2, cam.z + Math.sin(a) * r, 0xdfe9ff, 3, { speed: 1.2, life: 0.3, size: 0.18 });
    }
    if (V.rain && V.rain.visible) {
      const p = V.rain.geometry.attributes.position, a = p.array, cam = W.camera.position; V.rain.position.set(cam.x, 0, cam.z);
      for (let i = 1; i < a.length; i += 3) { a[i] -= dt * 18; if (a[i] < 0) a[i] += 22; }
      p.needsUpdate = true;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
