/* Urwaldlager – Wetter: Sonne, Tropenregen oder Gewitter, jeden Tag neu ausgewürfelt.
   Regen und Gewitter zeigen sich im Dschungel (Regenstreifen, dunklere Lichter, Blitze, Donner, Regenrauschen),
   machen Prüfungen schwerer (weniger Zeit, rutschig) und stören den Schlaf – außer jemand spannt die Plane. */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R;
  const W = UL.Weather = {};
  W.KINDS = {
    sonne: { icon: '☀️', name: 'Sonne', say: 'Heute knallt die Sonne – perfektes Prüfungswetter!', time: 1, sleep: 0, rain: 0 },
    regen: { icon: '🌧️', name: 'Tropenregen', say: 'Tropenregen! Alles wird nass und rutschig – und die Nacht wird ungemütlich.', time: 0.9, sleep: 8, rain: 0.6 },
    gewitter: { icon: '⛈️', name: 'Gewitter', say: 'Ein Gewitter zieht auf! Blitz, Donner, Platzregen – wer heute nicht die Plane spannt, schläft schlecht.', time: 0.85, sleep: 15, rain: 1 }
  };
  W.get = () => { const S = UL.Show && UL.Show.S; return (S && W.KINDS[S.weather]) || null; };
  // jeden Morgen neu (Tag 1 immer Sonne zum Einzug)
  W.roll = (S) => {
    if (S.wday === S.day) return;
    S.wday = S.day; S.tarp = false;
    const r = Math.random();
    S.weather = S.day === 1 || S.theme === 'studio' ? 'sonne' : r < 0.5 ? 'sonne' : r < 0.85 ? 'regen' : 'gewitter';
    const f = UL.query && UL.query.get('wx'); if (f && W.KINDS[f] && S.theme !== 'studio') S.weather = f;   // Test: &wx=regen|gewitter
  };
  // Wetter auf eine Bühne legen (nur draußen)
  W.attach = (stage, kind, opts = {}) => {
    const K = W.KINDS[kind]; if (!K || !K.rain) return null;
    const sc = stage.scene, low = R.quality && R.quality() === 'low', N = low ? 320 : 700, BX = 22, BY = 14;
    // Lichter dämpfen, Nebel grauer und näher
    const dim = kind === 'gewitter' ? 0.42 : 0.58;
    sc.traverse(o => { if (o.isLight && !o.isSpotLight && !o.isPointLight) o.intensity *= dim; });
    if (sc.fog) { sc.fog.color.lerp(new T.Color(0x5a6a72).convertSRGBToLinear(), 0.6); sc.fog.near *= 0.4; sc.fog.far *= 0.45; }
    // Regenstreifen als ein Liniennetz (eine Zeichnung)
    const pos = new Float32Array(N * 6), sp = new Float32Array(N), len = kind === 'gewitter' ? 0.7 : 0.5;
    for (let i = 0; i < N; i++) { const x = (Math.random() - 0.5) * BX, y = Math.random() * BY, z = (Math.random() - 0.5) * BX; pos.set([x, y, z, x + 0.05, y + len, z], i * 6); sp[i] = 13 + Math.random() * 6; }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
    const rain = new T.LineSegments(g, new T.LineBasicMaterial({ color: 0xb8d4e8, transparent: true, opacity: kind === 'gewitter' ? 0.62 : 0.5, depthWrite: false }));
    rain.frustumCulled = false; sc.add(rain);
    const flash = new T.AmbientLight(0xdfe8ff, 0); sc.add(flash);
    let thunder = UL.rand(3, 7), fl = 0;
    stage.rainLvl = K.rain; UL.Audio.rain && UL.Audio.rain(K.rain);
    const cam = stage.camera;
    stage.updaters.push(dt => {
      const c = cam.position, a = g.attributes.position.array;
      rain.position.set(c.x, Math.max(0, c.y - BY * 0.55), c.z);
      for (let i = 0; i < N; i++) { const k = i * 6, d = sp[i] * dt; a[k + 1] -= d; a[k + 4] -= d; if (a[k + 1] < 0) { const x = (Math.random() - 0.5) * BX, z = (Math.random() - 0.5) * BX; a[k] = x; a[k + 2] = z; a[k + 3] = x + 0.05; a[k + 5] = z; a[k + 1] = BY; a[k + 4] = BY + len; } }
      g.attributes.position.needsUpdate = true;
      if (kind === 'gewitter') {
        thunder -= dt;
        if (thunder <= 0) { thunder = UL.rand(6, 13); fl = 0.45; UL.after(UL.rand(0.3, 1.2), () => { UL.Audio.sfx('thunder'); if (opts.shake) R.shake = Math.max(R.shake, 0.35); }); }
        if (fl > 0) { fl -= dt; flash.intensity = fl > 0.3 || (fl < 0.2 && fl > 0.1) ? 2.2 : 0; } else flash.intensity = 0;
      }
    });
    return K;
  };
})();
