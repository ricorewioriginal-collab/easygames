/* AnMaCha UNDERCOVER 3D – Welt-Renderer (Three.js r128). Zeigt die Karte aus der Sicht (viewFor) einer Person und die Lounge.
   AMU.World.create(canvas, { quality }) → w
     w.loadMap(id) · w.loadLounge(themeMapId?) · w.setRoster([{id, n, look, sym}]) · w.update(view, dt, { meId, cam })
     w.updateLounge({ seats, speaker, out, dead, highlight, phase }, dt) · w.setZoom(z) · w.setQuality(q) · w.resize(w, h)
     w.stats() · w.worldToScreen(x, y, h) · w.onContextLost(fn) · w.onContextRestored(fn) · w.dispose()
   AMU.World.supported() → WebGL verfügbar?
   Benötigt: THREE, AMU.Grid, AMU.Actors, AMU.WorldKit, AMU.WorldMap, AMU.WorldLounge, AMU.COSMETICS, AMU.mapById.
   Im Bildpfad keine Allokationen: vorbelegte Vektoren, Zeitstempel statt neuer Mengen. Fehlende Felder der Sicht sind erlaubt. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const T = root.THREE;
  const PI = Math.PI;
  const PITCH = 57 * PI / 180, BASE_DIST = 15.5, MAXM = 64, MAXB = 48;
  const C = {
    task: new T.Color('#ffd23f'), sab: new T.Color('#ff3448'), ok: new T.Color('#3fe07a'), beaconOff: new T.Color('#ffae3a'),
    beaconOn: new T.Color('#3fe07a'), exit: new T.Color('#3fe07a'), cage: new T.Color('#ff9a2e'), clue: new T.Color('#c27cff'),
    clueDim: new T.Color('#4a3a66'), trail: new T.Color('#9fb4c8'), tamper: new T.Color('#ff5a8a')
  };

  function supported() {
    try {
      const c = root.document && root.document.createElement('canvas');
      return !!(c && root.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  function create(canvas, opts) {
    const K = AMU.WorldKit;
    opts = opts || {};
    let q = K.qOf(opts.quality);
    const renderer = new T.WebGLRenderer({ canvas, antialias: K.QUAL[q].aa, powerPreference: 'high-performance' });
    renderer.setClearColor(0x05070f, 1);
    let cssW = canvas.clientWidth || canvas.width || 300, cssH = canvas.clientHeight || canvas.height || 150;
    function applyQuality() {
      renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, K.QUAL[q].pr));
      renderer.shadowMap.enabled = K.QUAL[q].shadows;
      renderer.shadowMap.type = T.PCFShadowMap;
      renderer.setSize(cssW, cssH, false);
    }
    applyQuality();

    // ---------- Szenen, Kameras, Licht ----------
    const mapScene = new T.Scene(), loScene = new T.Scene();
    mapScene.fog = new T.Fog(0x000000, 30, 80); loScene.fog = new T.Fog(0x000000, 18, 40);
    const cam = new T.PerspectiveCamera(45, cssW / cssH, 0.5, 400), loCam = new T.PerspectiveCamera(42, cssW / cssH, 0.5, 200);
    const hemi = new T.HemisphereLight(0xffffff, 0x334466, 1), sun = new T.DirectionalLight(0xfff1dc, 0.6);
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0015;
    const sc = sun.shadow.camera; sc.left = -20; sc.right = 20; sc.top = 20; sc.bottom = -20; sc.near = 1; sc.far = 70;
    mapScene.add(hemi, sun, sun.target);
    const loHemi = new T.HemisphereLight(0xffffff, 0x334466, 0.9), loSun = new T.DirectionalLight(0xfff1dc, 0.7);
    loSun.position.set(4, 12, 6); loSun.shadow.mapSize.set(1024, 1024); loSun.shadow.bias = -0.0015;
    const lc = loSun.shadow.camera; lc.left = -8; lc.right = 8; lc.top = 8; lc.bottom = -8; lc.near = 1; lc.far = 40;
    loScene.add(loHemi, loSun);
    const layer = new T.Group(); layer.name = 'actors';   // Figuren – wandern zwischen den Szenen
    const lightBase = { hemi: 1, sun: 0.6 };

    // ---------- Dynamische Kartenobjekte (einmal angelegt, für alle Karten) ----------
    const M = K.mats();
    const dyn = new T.Group(); dyn.name = 'dyn'; mapScene.add(dyn);
    const ringGeo = new T.RingGeometry(0.4, 0.56, 28); ringGeo.rotateX(-PI / 2);
    const iconGeo = new T.OctahedronGeometry(0.2, 0);
    const beamGeo = new T.CylinderGeometry(0.28, 0.28, 3.2, 12, 1, true); beamGeo.translate(0, 1.6, 0);
    const blobGeo = new T.PlaneGeometry(1, 1); blobGeo.rotateX(-PI / 2);
    const beamMat = new T.MeshBasicMaterial({ transparent: true, opacity: 0.17, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
    function inst(geo, mat, n, order) {
      const m = new T.InstancedMesh(geo, mat, n); m.frustumCulled = false; m.renderOrder = order;
      const w = new T.Color(1, 1, 1); for (let i = 0; i < n; i++) m.setColorAt(i, w);   // vor count = 0 (Puffergröße = count)
      m.count = 0;
      dyn.add(m); return m;
    }
    const rings = inst(ringGeo, M.ring, MAXM, 2), icons = inst(iconGeo, M.icon, MAXM, 9), beams = inst(beamGeo, beamMat, MAXM, 9);
    const INST = [rings, icons, beams];
    const blobs = new T.InstancedMesh(blobGeo, M.blob, MAXB); blobs.count = 0; blobs.frustumCulled = false; blobs.renderOrder = 1; dyn.add(blobs);
    const selfMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, depthWrite: false });
    const selfRing = new T.Mesh(new T.RingGeometry(0.42, 0.52, 32), selfMat); selfRing.geometry.rotateX(-PI / 2); selfRing.renderOrder = 2; selfRing.visible = false; dyn.add(selfRing);
    const vision = K.visionMesh(); vision.visible = false; dyn.add(vision);

    // ---------- Zustand ----------
    let cur = null, lounge = null, loungeTheme = null, active = 'map', lost = false, disposed = false;
    let zoom = 1, time = 0, frame = 0, camInit = false, loAng = 0.6, dark = 1, visR = 6.5, sig = -1;
    let doorFlags = new Uint8Array(0);
    const roster = new Map();      // id → { n, look, sym, col }
    const ents = new Map();        // Schlüssel → Figur-Eintrag
    const lostFns = [], restFns = [];
    const camPos = new T.Vector3(), camTgt = new T.Vector3(), _v = new T.Vector3(), _v2 = new T.Vector3(), _m = new T.Matrix4(), _q = new T.Quaternion(), _s = new T.Vector3();
    const _up = new T.Vector3(0, 1, 0), _qId = new T.Quaternion(), _col = new T.Color();
    const meTrack = { x: 0, y: 0, ok: false, look: undefined };
    const seatA = [0, 0, 0, 0], seatB = [0, 0, 0, 0], bodyKey = new Map();

    // ---------- Figuren ----------
    function lookOf(id) { const r = roster.get(id); return r ? r.look : null; }
    function lookKey(l) { return l ? '' + l.body + l.skin + l.color + l.hair + l.hairColor + l.hat + l.face : '-'; }
    function colorOf(look) { return AMU.COSMETICS && look ? AMU.COSMETICS.colorHex(look.color) : '#ffffff'; }
    function entry(key, look, name, sym) {
      let e = ents.get(key);
      if (!e) {
        const a = AMU.Actors.create(look, { quality: q });
        e = { key, a, lookRef: look, lk: lookKey(look), x: 0, y: 0, dir: 0, init: false, stamp: -1, tag: null, tagKey: '', speed: 0, seated: false };
        layer.add(a.root); ents.set(key, e);
      } else if (e.lookRef !== look) {
        e.lookRef = look; const k = lookKey(look);
        if (k !== e.lk) { e.lk = k; e.a.setLook(look); e.tagKey = ''; }
      }
      if (name != null) {
        if (e.tagKey === '' || e.tagName !== name || e.tagSym !== sym) {
          dropTag(e);
          e.tag = K.nameTag(name, colorOf(look), sym); e.tagName = name; e.tagSym = sym; e.tagKey = 'x';
          e.a.root.add(e.tag.sprite);
        }
      }
      e.stamp = frame;
      return e;
    }
    function dropTag(e) { if (!e.tag) return; e.a.root.remove(e.tag.sprite); e.tag.tex.dispose(); e.tag.mat.dispose(); e.tag = null; }
    function dropEnt(e) { dropTag(e); e.a.dispose(); }
    function dropAll() { ents.forEach(dropEnt); ents.clear(); }
    function angLerp(a, b, k) { let d = (b - a) % (PI * 2); if (d > PI) d -= PI * 2; if (d < -PI) d += PI * 2; return a + d * k; }
    /** Weiche Positionsführung (Netz-Sichten kommen mit ~10 Hz). */
    function place(e, x, y, dir, dt, k) {
      if (!e.init || Math.abs(x - e.x) + Math.abs(y - e.y) > 4) { e.x = x; e.y = y; e.dir = dir; e.init = true; e.speed = 0; e.seated = false; return; }
      const f = 1 - Math.exp(-dt * k), px = e.x, py = e.y;
      e.x += (x - e.x) * f; e.y += (y - e.y) * f; e.dir = angLerp(e.dir, dir, 1 - Math.exp(-dt * 12));
      e.seated = false;
      const sp = dt > 0 ? Math.hypot(e.x - px, e.y - py) / dt : 0;
      e.speed += (sp - e.speed) * Math.min(1, dt * 10);
    }
    function pose(e, dt, anim, ghost, down, tagOn, hiOn) {
      const a = e.a;
      a.root.visible = true; a.root.position.set(e.x, 0, e.y); a.root.rotation.y = e.dir;
      a.setGhost(ghost); if (!ghost) a.setDown(down); a.setHighlight(hiOn); a.setAnim(anim);
      a.update(dt, anim === 'walk' ? Math.max(0.6, e.speed) : 0);
      if (e.tag) { e.tag.sprite.visible = tagOn; e.tag.sprite.position.y = e.seated ? a.height * 0.78 + 0.32 : a.height + 0.42; e.tag.mat.opacity = ghost ? 0.6 : 1; }
    }

    // ---------- Karte laden ----------
    function loadMap(id) {
      if (cur && cur.map.id === id) { active = 'map'; return; }
      if (cur) { cur.dispose(); cur = null; }
      const map = AMU.mapById(id); if (!map) return;
      cur = AMU.WorldMap.build(map, q);
      mapScene.add(cur.group);
      const th = map.theme;
      mapScene.background = new T.Color(th.sky);
      mapScene.fog.color.set(th.fog);
      hemi.color.set(K.mix(th.sky, '#ffffff', 0.72)); hemi.groundColor.set(K.mix(th.floor, '#000000', 0.2));
      lightBase.hemi = 0.95 + (th.amb || 0.55) * 0.7; lightBase.sun = map.outdoor ? 0.75 : 0.6;
      sun.castShadow = K.QUAL[q].shadows;
      beamMat.color.set(0xffffff);
      doorFlags = new Uint8Array(cur.grid.doors.length);
      cur.doors.forEach(d => { d.o = 1; }); writeDoors(true);
      sig = -1; camInit = false; active = 'map';
    }
    function writeDoors(all) {
      const dm = cur && cur.doorMesh; if (!dm) return false;
      let ch = all;
      for (let i = 0; i < cur.doors.length; i++) {
        const d = cur.doors[i];
        if (!all && !d.dirty) continue;
        d.dirty = false; ch = true;
        const half = (d.a1 - d.a0) / 2, L = half * (1 - d.o);
        for (let s = 0; s < 2; s++) {
          const c = s ? d.a1 - L / 2 : d.a0 + L / 2;
          if (L < 0.02) _s.set(0, 0, 0); else if (d.axis === 'x') _s.set(0.14, d.h, L); else _s.set(L, d.h, 0.14);
          if (d.axis === 'x') _v.set(d.line, d.h / 2, c); else _v.set(c, d.h / 2, d.line);
          _m.compose(_v, _qId, _s); dm.setMatrixAt(i * 2 + s, _m);
        }
      }
      if (ch) dm.instanceMatrix.needsUpdate = true;
      return ch;
    }

    // ---------- Lounge laden ----------
    function loadLounge(themeMapId) {
      const th = themeMapId && AMU.mapById ? AMU.mapById(themeMapId).theme : null;
      if (!lounge || loungeTheme !== (themeMapId || '')) {
        if (lounge) lounge.dispose();
        lounge = AMU.WorldLounge.build(th, q); loungeTheme = themeMapId || '';
        loScene.add(lounge.group);
        const t = lounge.theme;
        loScene.background = new T.Color(K.mix(t.sky, '#000000', 0.2)); loScene.fog.color.set(K.mix(t.sky, '#000000', 0.2));
        loHemi.color.set(K.mix(t.sky, '#ffffff', 0.75)); loHemi.groundColor.set(t.floor);
        loSun.castShadow = K.QUAL[q].shadows;
      }
      active = 'lounge';
    }

    // ---------- Kartenbild ----------
    function addMarker(x, z, col, ringScale, icon, beam, iconY) {
      const pulse = ringScale < 0;   // negativ = pulsierend mit Betrag als Größe
      const sc = pulse ? -ringScale * (1 + 0.15 * Math.sin(time * 4 + x)) : ringScale;
      if (rings.count < MAXM && sc > 0) {
        _s.set(sc, 1, sc); _v.set(x, 0.035, z); _m.compose(_v, _qId, _s);
        rings.setMatrixAt(rings.count, _m); rings.setColorAt(rings.count, col); rings.count++;
      }
      if (icon && icons.count < MAXM) {
        _q.setFromAxisAngle(_up, time * 2 + x); _s.set(1, 1.3, 1); _v.set(x, (iconY || 1.9) + Math.sin(time * 3 + z) * 0.1, z); _m.compose(_v, _q, _s);
        icons.setMatrixAt(icons.count, _m); icons.setColorAt(icons.count, col); icons.count++;
      }
      if (beam && beams.count < MAXM) {
        _s.set(1, 1, 1); _v.set(x, 0, z); _m.compose(_v, _qId, _s);
        beams.setMatrixAt(beams.count, _m); beams.setColorAt(beams.count, col); beams.count++;
      }
    }
    function addBlob(x, z, s) {
      if (blobs.count >= MAXB) return;
      _s.set(s, 1, s); _v.set(x, 0.012, z); _m.compose(_v, _qId, _s); blobs.setMatrixAt(blobs.count++, _m);
    }
    function has(arr, id) { return !!arr && arr.indexOf(id) >= 0; }

    function update(view, dt, o) {
      if (disposed) return;
      dt = Math.max(0, Math.min(0.1, +dt || 0)); time += dt; frame++;
      if (active !== 'map') { active = 'map'; camInit = false; }
      if (layer.parent !== mapScene) mapScene.add(layer);
      if (view && view.map && (!cur || cur.map.id !== view.map)) loadMap(view.map);
      if (!cur) { draw(); return; }
      const map = cur.map, me = view && view.me && view.me.id != null ? view.me : null;
      const ext = (view && view.ext) || null, mode = view && view.mode;
      if (view && Array.isArray(view.roster)) for (let i = 0; i < view.roster.length; i++) { const r = view.roster[i]; const old = roster.get(r.id); if (!old || old.look !== r.look || old.n !== r.n) roster.set(r.id, { n: r.n, look: r.look, sym: r.sym }); }
      rings.count = icons.count = beams.count = blobs.count = 0;

      // Eigene Figur
      meTrack.ok = false; selfRing.visible = false;
      if (me && !me.escaped) {
        const r = roster.get(me.id), lk = (me.disguise && lookOf(me.disguise)) || (r && r.look) || null;
        const e = entry(me.id, lk, r ? r.n : '', r ? r.sym : '');
        const x = +me.x || 0, y = +me.y || 0;
        place(e, x, y, +me.dir || 0, dt, 20);
        const ghost = !!me.ghost, mv = e.speed > 0.35;
        const anim = me.caught ? 'sad' : me.busy ? 'interact' : mv ? 'walk' : 'idle';
        pose(e, dt, anim, ghost, false, true, false);
        if (me.hidden && !ghost) e.a.root.visible = false;
        if (!ghost) addBlob(e.x, e.y, 1.1);
        meTrack.x = e.x; meTrack.y = e.y; meTrack.ok = true;
        selfRing.visible = true; selfRing.position.set(e.x, 0.025, e.y);
        if (meTrack.look !== lk) { meTrack.look = lk; selfMat.color.set(colorOf(lk)); }
        selfMat.opacity = me.hidden ? 0.5 + 0.4 * Math.sin(time * 5) : 0.7;
      }
      // Andere sichtbare Personen (Gestaltwandler können dieselbe id zeigen → zweiter Schlüssel)
      const pl = view && Array.isArray(view.players) ? view.players : null;
      if (pl) for (let i = 0; i < pl.length; i++) {
        const p = pl[i]; if (!p || p.id == null) continue;
        let key = p.id, e0 = ents.get(key);
        if (e0 && e0.stamp === frame) { key = p.id + '#2'; e0 = ents.get(key); if (e0 && e0.stamp === frame) continue; }
        const r = roster.get(p.id), lk = p.look || (r && r.look) || null;
        const e = entry(key, lk, p.n != null ? p.n : (r ? r.n : ''), p.sym != null ? p.sym : (r ? r.sym : ''));
        place(e, +p.x || 0, +p.y || 0, +p.dir || 0, dt, 10);
        const ghost = !!p.ghost, anim = p.caught ? 'sad' : p.busy ? 'interact' : (p.mv || e.speed > 0.4) ? 'walk' : 'idle';
        pose(e, dt, anim, ghost, false, true, false);
        if (!ghost) addBlob(e.x, e.y, 1.1);
      }
      // Ausgeknipste (liegende Figur)
      const bd = view && Array.isArray(view.bodies) ? view.bodies : null;
      if (bd) for (let i = 0; i < bd.length; i++) {
        const b = bd[i]; if (!b || b.id == null) continue;
        let bk = bodyKey.get(b.id); if (!bk) { bk = 'b:' + b.id; bodyKey.set(b.id, bk); }
        const r = roster.get(b.id), e = entry(bk, b.look || (r && r.look) || null, null, null);
        if (!e.init) e.dir = (K.hash(String(b.id)) % 628) / 100;
        e.x = +b.x || 0; e.y = +b.y || 0; e.init = true; e.speed = 0;
        pose(e, dt, 'idle', false, true, false, false);
        addBlob(e.x, e.y, 1.6);
      }
      ents.forEach(hideStale);

      // Türen und Tore
      doorFlags.fill(0);
      const dl = view && Array.isArray(view.doors) ? view.doors : null;
      if (dl) for (let i = 0; i < dl.length; i++) { const d = dl[i]; if (d >= 0 && d < doorFlags.length) doorFlags[d] = 1; }
      for (let i = 0; i < cur.doors.length; i++) {
        const d = cur.doors[i], t = doorFlags[d.id] ? 0 : 1;
        if (d.o !== t) { d.o = t > d.o ? Math.min(t, d.o + dt * 3.5) : Math.max(t, d.o - dt * 3.5); d.dirty = true; }
      }
      writeDoors(false);
      for (let i = 0; i < cur.gates.length; i++) {
        const g = cur.gates[i], t = doorFlags[g.id] ? 0 : 1;
        if (g.o !== t) g.o = t > g.o ? Math.min(t, g.o + dt * 2) : Math.max(t, g.o - dt * 2);
        const h = g.mesh.userData.h * (1 - g.o);
        g.mesh.visible = h > 0.02; g.mesh.scale.y = Math.max(0.001, h); g.mesh.position.y = h / 2 - (g.water ? 0.03 : 0);
        if (!g.water) g.mesh.material.opacity = 0.32 + 0.12 * Math.sin(time * 6);
      }

      // Stationen: eigene offene Aufgaben hervorheben
      const tasks = me && Array.isArray(me.tasks) && mode !== 'jagen' ? me.tasks : null;
      let h = 7;
      if (tasks) for (let i = 0; i < tasks.length; i++) { const t = tasks[i]; h = (h * 31 + (t.sid | 0) * 3 + (t.done ? 1 : 2)) | 0; }
      if (h !== sig) {
        sig = h;
        for (let s = 0; s < map.stations.length; s++) K.recolor(cur.glowGeo, 's' + s, cur.accDim);
        if (tasks) for (let i = 0; i < tasks.length; i++) { const t = tasks[i]; if (map.stations[t.sid]) K.recolor(cur.glowGeo, 's' + t.sid, t.done ? '#2c5a40' : '#ffe27a'); }
      }
      const canTask = me && (me.alive || me.ghost) && me.team !== 'traitor';
      if (tasks && (canTask || me.team === 'traitor')) for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i], st = map.stations[t.sid]; if (!st || t.done) continue;
        addMarker(st.at[0], st.at[1], C.task, -1.7, true, false, 1.75);
      }
      // Sabotage-Reparaturpunkte
      const sl = view && view.sab && Array.isArray(view.sab.list) ? view.sab.list : null;
      let lights = false;
      if (sl) for (let i = 0; i < sl.length; i++) {
        const s = sl[i]; if (!s) continue; if (s.type === 'lights') lights = true;
        const pts = s.pts; if (!pts) continue;
        for (let k = 0; k < pts.length; k++) { const p = pts[k]; if (p.done) addMarker(p.x, p.y, C.ok, 0.8, false, false); else addMarker(p.x, p.y, C.sab, -1, true, true, 2.2); }
      }
      // Moduszusätze
      const jg = mode === 'jagen';
      cur.jagen.visible = jg;
      if (ext) {
        if (Array.isArray(ext.beacons)) for (let i = 0; i < ext.beacons.length; i++) { const b = ext.beacons[i]; if (b.on) addMarker(b.x, b.y, C.beaconOn, 1, false, true); else addMarker(b.x, b.y, C.beaconOff, -1, true, false, 1.75); }
        if (ext.exits && Array.isArray(ext.exitPts)) for (let i = 0; i < ext.exitPts.length; i++) { const p = ext.exitPts[i]; addMarker(p[0], p[1], C.exit, -1, true, true, 2.4); }
        if (Array.isArray(ext.cage) && ext.caught && ext.caught.length) addMarker(ext.cage[0], ext.cage[1], C.cage, 2.2, true, true, 2.3);
        if (Array.isArray(ext.spots)) for (let i = 0; i < ext.spots.length; i++) { const s = ext.spots[i]; if (s.found) addMarker(s.x, s.y, C.clueDim, 0.7, false, false); else addMarker(s.x, s.y, s.t ? C.tamper : C.clue, -1, true, false, 1.2); }
        if (Array.isArray(ext.trails)) for (let i = 0; i < ext.trails.length; i++) { const t = ext.trails[i]; addMarker(t[0], t[1], C.trail, Math.max(0.2, 0.55 - (t[3] || 0) * 0.04), false, false); }
      }
      if (cur.jagen.visible && cur.jagen.userData.glowGeo) {
        const ex = !!(ext && ext.exits);
        if (cur.exitOpen !== ex) { cur.exitOpen = ex; K.recolor(cur.jagen.userData.glowGeo, 'exitSign', ex ? '#3fe07a' : '#3a4a40'); K.recolor(cur.jagen.userData.glowGeo, 'exitFloor', ex ? '#2a8f55' : '#1a2a22'); }
      }
      for (let i = 0; i < INST.length; i++) { const m = INST[i]; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
      blobs.instanceMatrix.needsUpdate = true;

      // Sicht & Licht
      const vr = me ? +me.vision : NaN;
      if (me && !me.ghost && vr > 0 && vr < 60 && !(o && o.cam === 'overview')) {
        visR += (vr - visR) * Math.min(1, dt * 3);
        vision.visible = true; vision.position.set(meTrack.x, 2.35, meTrack.y);
        vision.material.uniforms.uC.value.set(meTrack.x, meTrack.y); vision.material.uniforms.uR.value = visR;
      } else vision.visible = false;
      const dTarget = (view && view.feat && view.feat.dark) || lights ? 0.62 : 1;
      dark += (dTarget - dark) * Math.min(1, dt * 2.5);
      hemi.intensity = lightBase.hemi * dark; sun.intensity = lightBase.sun * dark;

      // Kamera
      const over = (o && o.cam === 'overview') || !meTrack.ok;
      const asp = cssW / Math.max(1, cssH), af = asp < 1 ? Math.pow(1 / asp, 0.55) : 1;
      let dist, tx, tz;
      if (over) {
        const tanH = Math.tan(cam.fov * PI / 360);
        dist = Math.max((map.size[1] * Math.sin(PITCH) + 3) / (2 * tanH), (map.size[0] + 2) / (2 * tanH * asp)) * 1.02;
        tx = map.size[0] / 2; tz = map.size[1] / 2 + 0.5;
      } else { dist = BASE_DIST * zoom * af; tx = meTrack.x; tz = meTrack.y; }
      _v.set(tx, Math.sin(PITCH) * dist, tz + Math.cos(PITCH) * dist);
      _v2.set(tx, 0.4, tz);
      if (!camInit) { camPos.copy(_v); camTgt.copy(_v2); camInit = true; }
      else { const k = 1 - Math.exp(-dt * (over ? 3 : 7)); camPos.lerp(_v, k); camTgt.lerp(_v2, k); }
      cam.position.copy(camPos); cam.lookAt(camTgt);
      const cd = camPos.distanceTo(camTgt);
      mapScene.fog.near = cd * 1.15; mapScene.fog.far = cd * 2.4 + 25;
      sun.target.position.copy(camTgt); sun.position.set(camTgt.x + 8, 22, camTgt.z + 6);
      sun.target.updateMatrixWorld();
      draw();
    }
    function hideStale(e) { if (e.stamp !== frame) e.a.root.visible = false; }

    // ---------- Lounge-Bild ----------
    function updateLounge(st, dt) {
      if (disposed) return;
      dt = Math.max(0, Math.min(0.1, +dt || 0)); time += dt; frame++;
      if (!lounge) loadLounge(cur ? cur.map.id : null);
      active = 'lounge';
      if (layer.parent !== loScene) loScene.add(layer);
      st = st || {};
      const seats = Array.isArray(st.seats) ? st.seats : [], n = Math.min(seats.length, lounge.MAXSEAT);
      const L = lounge, cards = L.cards, stools = L.stools;
      cards.count = n; stools.count = n;
      let spk = -1;
      for (let i = 0; i < n; i++) {
        const id = seats[i], r = roster.get(id), out = has(st.out, id), dead = has(st.dead, id);
        const s = L.seat(i, n, false, seatA), a = s[3];
        // Hocker & Karte
        _s.set(0.55, 0.32, 0.55); _v.set(s[0], 0.16, s[1]); _m.compose(_v, _qId, _s); stools.setMatrixAt(i, _m);
        _q.setFromAxisAngle(_up, -a + PI / 2); _s.set(0.34, 0.014, 0.48); _v.set(Math.cos(a) * L.CARD_R, L.TABLE_H + 0.06, Math.sin(a) * L.CARD_R); _m.compose(_v, _q, _s);
        cards.setMatrixAt(i, _m); _col.setRGB(1, 1, 1); if (out || dead) _col.setRGB(0.35, 0.35, 0.4); cards.setColorAt(i, _col);
        const e = entry(id, r ? r.look : null, r ? r.n : String(id), r ? r.sym : '');
        const p = out ? L.seat(i, n, true, seatB) : s;
        if (!e.init || Math.abs(p[0] - e.x) + Math.abs(p[1] - e.y) > 4) { e.x = p[0]; e.y = p[1]; e.dir = p[2]; e.init = true; }
        else { const f = 1 - Math.exp(-dt * 6); e.x += (p[0] - e.x) * f; e.y += (p[1] - e.y) * f; e.dir = angLerp(e.dir, p[2], f); }
        e.speed = 0; e.seated = !out;
        const speaking = st.speaker != null && st.speaker === id;
        if (speaking) spk = i;
        const anim = out ? 'sad' : speaking ? 'talk' : 'sit';
        pose(e, dt, anim, dead, false, true, st.highlight != null && st.highlight === id);
        if (speaking) e.a.root.position.y = Math.abs(Math.sin(time * 5)) * 0.05;
      }
      cards.instanceMatrix.needsUpdate = true; if (cards.instanceColor) cards.instanceColor.needsUpdate = true; stools.instanceMatrix.needsUpdate = true;
      ents.forEach(hideStale);
      ents.forEach(clearSeat);
      // Sprecher-Licht
      L.ring.visible = L.cone.visible = spk >= 0;
      if (spk >= 0) {
        const s = L.seat(spk, n, false, seatA);
        L.ring.position.set(s[0], 0.03, s[1]); const sc = 1 + 0.08 * Math.sin(time * 5); L.ring.scale.set(sc, 1, sc);
        L.cone.position.set(s[0], 0, s[1]);
      }
      L.holo.rotation.set(PI / 2 + Math.sin(time * 0.7) * 0.25, time * 0.9, 0);
      const vote = st.phase === 'vote' || st.phase === 'voting';
      L.stripMat.color.set(vote ? '#ff3448' : L.theme.accent);
      // Kamera kreist langsam
      loAng += dt * 0.07;
      const asp = cssW / Math.max(1, cssH), R = 10.5 * zoom * (asp < 1 ? Math.pow(1 / asp, 0.7) : 1), hgt = R * 0.72;
      loCam.position.set(Math.cos(loAng) * R, hgt, Math.sin(loAng) * R); loCam.lookAt(0, 0.5, 0);
      draw();
    }
    function clearSeat(e) { if (e.stamp !== frame) e.seated = false; }

    function draw() {
      if (lost || disposed) return;
      if (active === 'lounge') renderer.render(loScene, loCam); else renderer.render(mapScene, cam);
    }

    // ---------- Kontextverlust ----------
    function onLost(ev) { ev.preventDefault(); lost = true; lostFns.forEach(f => { try { f(); } catch (e) { /* App */ } }); }
    function onRestored() {
      lost = false;
      const mid = cur && cur.map.id, lid = lounge ? loungeTheme : null, was = active;
      // GPU-Objekte sind mit dem alten Kontext verloren → nur abhängen (dispose würde fremde Puffer löschen)
      if (cur) { cur.group.parent && cur.group.parent.remove(cur.group); cur = null; }
      if (lounge) { lounge.group.parent && lounge.group.parent.remove(lounge.group); lounge = null; }
      ents.forEach(e => { if (e.tag) e.tag.tex.needsUpdate = true; });
      if (lid != null) loadLounge(lid || null);
      if (mid) loadMap(mid);
      active = was;
      restFns.forEach(f => { try { f(); } catch (e) { /* App */ } });
    }
    canvas.addEventListener('webglcontextlost', onLost, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);

    function setQuality(nq) {
      nq = K.qOf(nq); if (nq === q) return;
      q = nq; applyQuality();
      dropAll();
      const mid = cur && cur.map.id, lid = lounge ? loungeTheme : null, was = active;
      if (cur) { cur.dispose(); cur = null; }
      if (lounge) { lounge.dispose(); lounge = null; }
      if (lid != null) loadLounge(lid || null);
      if (mid) loadMap(mid);
      active = was;
      [mapScene, loScene].forEach(s => s.traverse(o => { if (o.material) o.material.needsUpdate = true; }));
      Object.values(M).forEach(m => { m.needsUpdate = true; });
    }

    const w = {
      loadMap, loadLounge, update, updateLounge, setQuality,
      setRoster(list) {
        if (!Array.isArray(list)) return;
        const ids = new Set();
        list.forEach(r => { if (r && r.id != null) { ids.add(String(r.id)); roster.set(r.id, { n: r.n, look: r.look, sym: r.sym }); } });
        // Figuren von Personen, die nicht mehr dabei sind, freigeben
        ents.forEach((e, k) => { const id = String(k).replace(/^b:/, '').replace(/#2$/, ''); if (!ids.has(id)) { dropEnt(e); ents.delete(k); } });
        roster.forEach((r, id) => { if (!ids.has(String(id))) roster.delete(id); });
      },
      setZoom(z) { zoom = Math.max(0.7, Math.min(1.6, +z || 1)); },
      resize(wPx, hPx) {
        cssW = Math.max(1, wPx | 0); cssH = Math.max(1, hPx | 0);
        renderer.setSize(cssW, cssH, false);
        cam.aspect = loCam.aspect = cssW / cssH; cam.updateProjectionMatrix(); loCam.updateProjectionMatrix();
      },
      stats() {
        const i = renderer.info;
        return { calls: i.render.calls, tris: i.render.triangles, geoms: i.memory.geometries, tex: i.memory.textures };
      },
      worldToScreen(x, y, h) {
        const c = active === 'lounge' ? loCam : cam;
        _v.set(+x || 0, +h || 0, +y || 0).project(c);
        return { x: (_v.x + 1) / 2 * cssW, y: (1 - _v.y) / 2 * cssH, visible: _v.z > -1 && _v.z < 1 && Math.abs(_v.x) <= 1.05 && Math.abs(_v.y) <= 1.05 };
      },
      onContextLost(fn) { if (typeof fn === 'function') lostFns.push(fn); },
      onContextRestored(fn) { if (typeof fn === 'function') restFns.push(fn); },
      get quality() { return q; },
      get renderer() { return renderer; },
      get _debug() { return { mapScene, loScene, cam, loCam, rings, icons, beams, blobs, vision, ents, get cur() { return cur; } }; },
      dispose() {
        if (disposed) return;
        disposed = true;
        canvas.removeEventListener('webglcontextlost', onLost, false);
        canvas.removeEventListener('webglcontextrestored', onRestored, false);
        dropAll();
        if (cur) cur.dispose(); if (lounge) lounge.dispose(); cur = lounge = null;
        [ringGeo, iconGeo, beamGeo, blobGeo, selfRing.geometry, vision.geometry].forEach(g => g.dispose());
        [beamMat, selfMat, vision.material].forEach(m => m.dispose());
        [rings, icons, beams, blobs].forEach(m => m.dispose());
        renderer.dispose();
      }
    };
    w.resize(cssW, cssH);
    return w;
  }

  AMU.World = { create, supported };
})(typeof window !== 'undefined' ? window : globalThis);
