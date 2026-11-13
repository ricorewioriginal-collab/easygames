/* AnMaCha – Der Podcast · Stadtbus „AnMaCha-Linie 1“: Haltestellen in allen Vierteln, Bus fährt sichtbar seine Runde,
   an jeder Haltestelle kann man einsteigen und ohne Laufen in ein anderes Viertel fahren. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World;
  const TR = AMC.Transit = {};
  let C = null, T = null;
  // Haltestellen auf den Gehwegen an den Straßen (x, z, Blickrichtung der Haltestelle zur Straße)
  const STOPS = [
    { id: 'funk', name: 'Funkhaus', x: 30, z: -6.6, d: 'Funkhaus, Empfang, Arcade und Musikladen' },
    { id: 'park', name: 'Stadtpark', x: -22.5, z: 6.6, d: 'Park mit Brunnen und Bühne' },
    { id: 'mast', name: 'Sendemast', x: -60, z: -51.6, d: 'Der große Sendemast am Stadtrand' },
    { id: 'ring', name: 'Imbiss am Ring', x: -38.4, z: 30, d: 'Pommes, Currywurst und Klatsch' },
    { id: 'ost', name: 'Senderviertel Ost', x: 51.6, z: -22.5, d: 'Senderhäuser im Osten' },
    { id: 'camp', name: 'Campingplatz', x: 62, z: 38.4, d: 'Campingplatz-Shop und Festivalwiese' },
    { id: 'sued', name: 'Südstadt', x: 6.6, z: 62, d: 'Wohnviertel und Radio-Flohmarkt' },
    { id: 'west', name: 'Westend', x: -51.6, z: -12, d: 'Senderhäuser im Westen' }
  ];
  TR.STOPS = STOPS;
  // Runde des Busses über die Straßen (rechte Spur)
  const LOOP = [[-42.5, -42.5], [42.5, -42.5], [42.5, 42.5], [-42.5, 42.5]];

  TR.build = function (ctx) {
    C = ctx; T = root.THREE; const S = C.S; if (!S || S.mode !== 'free' || S.net) return;
    const g = S.group, M = (c, o) => W.mat(c, o || { r: 0.6 });
    S.busStops = [];
    STOPS.forEach((st, i) => {
      let x = st.x, z = st.z;
      for (let k = 0; k < 8 && C.solidAt(x, 1, z); k++) { if (Math.abs(x) % 45 < 8 || Math.abs(Math.abs(x) - 45) < 8) z += 3; else x += 3; }
      const s = new T.Group(); s.position.set(x, 0.16, z); g.add(s);
      W.box(0.12, 2.8, 0.12, M(0x444a55, { m: 0.6, r: 0.4 }), 0, 1.4, 0, s, true);
      const tex = W.textTex(['🚌 ' + st.name, 'AnMaCha-Linie 1'], { w: 512, h: 160, size: 52, accent: '#3aa7a0' });
      const sg = new T.Mesh(new T.PlaneGeometry(1.6, 0.5), new T.MeshBasicMaterial({ map: tex, toneMapped: false, side: T.DoubleSide })); sg.position.set(0, 2.6, 0); s.add(sg);
      sg.lookAt(x + (Math.abs(z) < 10 || Math.abs(Math.abs(z) - 45) < 10 ? 0 : 1), 2.6, z + (Math.abs(z) < 10 || Math.abs(Math.abs(z) - 45) < 10 ? 1 : 0));
      // Wartehäuschen mit Bank
      W.box(2.2, 0.08, 1.0, M(0x3aa7a0, { r: 0.4 }), 1.4, 2.3, 0, s, true);
      W.box(2.2, 2.2, 0.06, M(0xbfe8ff, { r: 0.1, m: 0.2 }), 1.4, 1.15, -0.5, s, false).material.transparent = true;
      W.box(1.6, 0.1, 0.4, M(0x8a6a48), 1.4, 0.5, -0.2, s, false);
      C.addStation('bus:' + st.id, '🚌 Bus nehmen: Haltestelle ' + st.name, x, z, 2.4);
      S.busStops.push({ st, x, z });
    });
    // Der Bus
    const bus = new T.Group(), B = (w, h, d, c, x, y, z, o) => W.box(w, h, d, M(c, o), x, y, z, bus, true);
    B(2.4, 2.4, 9, 0xff8a1e, 0, 1.6, 0, { r: 0.5 }); B(2.42, 0.7, 8.6, 0x223344, 0, 2.1, 0, { r: 0.1, m: 0.4 }); B(2.44, 0.18, 9.02, 0x3aa7a0, 0, 0.6, 0);
    B(2.3, 0.9, 0.06, 0x223344, 0, 2.0, 4.52, { r: 0.1, m: 0.4 });
    const ln = W.textTex(['1 · Funkhaus'], { w: 256, h: 64, size: 40, bg: '#111', fg: '#ffd23f', accent: '#111' }); const lm = new T.Mesh(new T.PlaneGeometry(1.6, 0.4), new T.MeshBasicMaterial({ map: ln, toneMapped: false })); lm.position.set(0, 2.65, 4.53); bus.add(lm);
    const side = W.textTex(['AnMaCha-Linie 1'], { w: 512, h: 96, size: 54, bg: '#ff8a1e', fg: '#fff', accent: '#ff8a1e' });
    [-1.23, 1.23].forEach(x => { const m = new T.Mesh(new T.PlaneGeometry(4.2, 0.6), new T.MeshBasicMaterial({ map: side, toneMapped: false })); m.position.set(x, 1.05, -0.5); m.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; bus.add(m); });
    [[-1.1, 3], [1.1, 3], [-1.1, -3], [1.1, -3]].forEach(([x, z]) => { const w = W.cyl(0.5, 0.5, 0.3, M(0x1a1a1a, { r: 0.8 }), x, 0.5, z, bus, 16); w.rotation.z = Math.PI / 2; });
    g.add(bus);
    S.bus = { g: bus, seg: 0, t: 0, wait: 0 };
  };

  TR.update = function (dt) {
    const S = C && C.S; if (!S || !S.bus) return;
    const b = S.bus; if (b.wait > 0) { b.wait -= dt; return; }
    const a = LOOP[b.seg], c = LOOP[(b.seg + 1) % LOOP.length], len = Math.hypot(c[0] - a[0], c[1] - a[1]);
    b.t += dt * 9 / len; if (b.t >= 1) { b.t = 0; b.seg = (b.seg + 1) % LOOP.length; b.wait = 1.5; }
    const x = a[0] + (c[0] - a[0]) * b.t, z = a[1] + (c[1] - a[1]) * b.t;
    b.g.position.set(x, 0, z); b.g.rotation.y = Math.atan2(c[0] - a[0], c[1] - a[1]);
  };
  TR.mapDots = () => { const S = C && C.S; if (!S || !S.bus) return []; return [{ x: S.bus.g.position.x, z: S.bus.g.position.z, c: '#ff8a1e', big: true }]; };

  // Fahrplan: Ziel wählen, kurze Busfahrt (Blende), an der Ziel-Haltestelle aussteigen
  TR.menu = function (fromId) {
    const S = C && C.S; if (!S || !S.busStops) return;
    const from = S.busStops.find(s => s.st.id === fromId.replace('bus:', ''));
    const rows = S.busStops.map(s => '<button type="button" class="st-item" data-nav data-b="' + s.st.id + '"' + (s === from ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + (s === from ? '📍' : '🚌') + '</span><span><b>' + U.esc(s.st.name) + (s === from ? ' · du bist hier' : '') + '</b><small>' + U.esc(s.st.d) + '</small></span></button>').join('');
    const ui = AMC.UI.open('<div class="panel glass"><header><h2>🚌 AnMaCha-Linie 1</h2><button class="btn small" data-nav id="trB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">Kostenlos für alle Podcast-Fans. Wohin soll es gehen?</p><div class="st-list" id="trL">' + rows + '</div></div>', { back: () => AMC.UI.close(ui) });
    ui.el.querySelector('#trB').onclick = () => AMC.UI.close(ui);
    ui.el.querySelector('#trL').addEventListener('click', e => { const bt = e.target.closest('[data-b]'); if (!bt) return; const to = S.busStops.find(s => s.st.id === bt.dataset.b); if (!to || to === from) return; AMC.UI.close(ui); ride(to); });
  };
  TR.ride = id => { const S = C && C.S; const to = S && S.busStops && S.busStops.find(s => s.st.id === id); if (to) ride(to, true); };
  function ride(to, fast) {
    const S = C.S, t = U.el('div', 'transition', '<b>🚌 Nächster Halt: ' + U.esc(to.st.name) + '</b>'); document.body.appendChild(t);
    AMC.Audio.sfx('horn'); requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => {
      if (C.S !== S) { t.remove(); return; }
      const p = S.pl, ox = to.x + (Math.abs(to.z) % 45 < 10 ? 2.4 : 0), oz = to.z + (Math.abs(to.z) % 45 < 10 ? 0 : 2.4);
      p.x = ox; p.z = oz; p.y = 0.16; p.vx = p.vz = p.vy = 0; if (S.fo) { S.fo.x = ox + 1.2; S.fo.z = oz + 1.2; S.fo.y = 0.16; }
      C.msg('🚌 Haltestelle ' + to.st.name + ' – ' + to.st.d, 3);
      t.classList.add('out'); setTimeout(() => t.remove(), 600);
    }, fast ? 50 : 900);
  }
})(typeof window !== 'undefined' ? window : globalThis);
