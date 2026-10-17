/* AnMaCha Podcast Tycoon 3D – 3D-Welt: Stadt mit 8 Bezirken und Funkplatz, begehbare Gebäude, eigenes Studio aus dem Bau-Modell,
   Spielerfigur mit Kollision, NPC-Tagesablauf mit A*, Kamera (Folgen/Bauen/Kamerafahrt/Minispiel), Tag/Nacht und Minikarte.
   Schnittstelle: PT.World.create(canvas, { quality, headless }) – siehe README/Bericht. Nur der übergebene Canvas wird benutzt. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const W = PT.World = {};
  const HP = Math.PI / 2, TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
  const QUAL = {
    low: { pr: 1, far: 140, fog: [42, 135], shadows: false, aa: false },
    mid: { pr: 1.5, far: 190, fog: [70, 185], shadows: false, aa: true },
    high: { pr: 2, far: 260, fog: [100, 250], shadows: true, aa: true }
  };
  const WALL_H = 3.2, LOT_H = 2.8, SPLIT_Y = 1.0, WT = 0.16;
  const PLAYER_R = 0.3, WALK = 4.3, RUN = 7.2, NPC_SPEED = 1.6;

  W.create = function (canvas, opts) {
    opts = opts || {};
    const T = root.THREE; if (!T) throw new Error('PT.World: THREE (vendor/three-r128.min.js) fehlt.');
    const D = PT.DATA || {}, B = PT.Build, M = PT.Models, NAV = PT.Nav;
    if (!M || !NAV) throw new Error('PT.World: models.js und nav.js zuerst laden.');
    const HALF = (D.world && D.world.half) || 112;
    const AVES = (D.world && D.world.avenues) || [-40, 40];
    const headless = !!opts.headless || !canvas;
    let quality = QUAL[opts.quality] ? opts.quality : 'mid';
    const size = { w: (canvas && canvas.clientWidth) || 1280, h: (canvas && canvas.clientHeight) || 720 };
    let renderer = null, lost = false;
    const cbLost = [], cbRest = [];
    const onLost = e => { if (e && e.preventDefault) e.preventDefault(); lost = true; cbLost.forEach(f => { try { f(); } catch (x) { console.error(x); } }); };
    const onRest = () => { lost = false; if (atlas.tex) atlas.tex.needsUpdate = true; cbRest.forEach(f => { try { f(); } catch (x) { console.error(x); } }); };
    if (!headless) {
      renderer = new T.WebGLRenderer({ canvas, antialias: QUAL[quality].aa, powerPreference: 'high-performance', alpha: false });
      renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, QUAL[quality].pr));
      renderer.setSize(size.w, size.h);
      renderer.shadowMap.type = T.PCFShadowMap;
      canvas.addEventListener('webglcontextlost', onLost, false);
      canvas.addEventListener('webglcontextrestored', onRest, false);
    }
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(55, size.w / size.h, 0.3, QUAL[quality].far);
    scene.background = new T.Color('#8fd3ff');
    scene.fog = new T.Fog(0x8fd3ff, QUAL[quality].fog[0], QUAL[quality].fog[1]);
    const hemi = new T.HemisphereLight(0xffffff, 0xa89a80, 0.8); scene.add(hemi);
    const sun = new T.DirectionalLight(0xffffff, 0.75); sun.position.set(30, 60, 20); scene.add(sun); scene.add(sun.target);
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 160 });
    sun.shadow.bias = -0.0008;

    // ── Materialien (wenige, geteilt) ──
    const mats = {
      v: new T.MeshLambertMaterial({ vertexColors: true }),
      glow: new T.MeshBasicMaterial({ vertexColors: true }),
      glass: new T.MeshBasicMaterial({ vertexColors: true, color: '#a8d8f0' }),
      lamp: new T.MeshBasicMaterial({ vertexColors: true, color: '#fff1b0' }),
      sign: new T.MeshBasicMaterial({ color: 0xffffff }),
      shadow: new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }),
      ghost: new T.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.6, depthWrite: false }),
      ghostFoot: new T.MeshBasicMaterial({ color: '#4be08a', transparent: true, opacity: 0.35, depthWrite: false }),
      edge: new T.MeshBasicMaterial({ color: '#4be08a', transparent: true, opacity: 0.55, depthWrite: false }),
      hl: new T.MeshBasicMaterial({ color: '#ffb02e', transparent: true, opacity: 0.35, depthWrite: false }),
      grid: new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }),
      marker: new T.MeshBasicMaterial({ vertexColors: true }),
      pool: new T.MeshBasicMaterial({ color: '#ffc04a', transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })
    };
    const nav = NAV.create(HALF);
    const distMap = new Uint8Array(nav.size).fill(255);
    const world = new T.Group(); world.name = 'world'; scene.add(world);
    const dyn = new T.Group(); dyn.name = 'dynamic'; scene.add(dyn);

    let st = null, loaded = false, mode = 'follow', time = 0, curMin = -1;
    const dists = [];            // { d, idx, rect, group, barrier, bus: [x,z], color }
    const lotsR = {};            // lotId → gerenderte Daten
    const roofs = [];            // { mesh, rect, lot, h }
    const inter = [];            // { kind, id, label, x, z, r, cond, color }
    const buildingRects = [];    // für Minikarte
    let staticSigns = [];        // Schilder der Stadt
    let signMesh = null, figSys = null, treeMesh = null, lampMesh = null, bulbMesh = null, markerMesh = null, poolMesh = null;
    let player = null; const npcs = []; const remotes = {};
    let unlockKey = '';
    const lotVer = {};
    const cam = { yaw: Math.PI, dist: 9, h: 6.2, pos: new T.Vector3(), look: new T.Vector3(), snap: true };
    const bstate = { lot: 'studio', panX: 0, panZ: 0, zoom: 0, rot: 0 };
    const cine = { on: false, t: 0, dur: 4, x: 0, z: 0, prev: 'follow' };
    let lastInfo = { calls: 0, tris: 0 };

    // ── Hilfen ──
    const cellOf = v => Math.floor(v + HALF);
    const blockRange = c => c < -20 ? [-HALF, -45] : c > 20 ? [45, HALF] : [-35, 35];
    const floorCols = (D.buildParts && D.buildParts.floors || []).map(f => [M.col(T, f.color), M.shade(T, f.color, 0.93)]);
    const isLockedIdx = i => i < 8 && dists[i] && st && st.unlocks && st.unlocks.districts && st.unlocks.districts[dists[i].d.id] === false;
    const lockedCell = (gx, gz) => nav.inb(gx, gz) && isLockedIdx(distMap[gz * nav.S + gx]);
    const playerExtra = (nx, nz, fx, fz) => lockedCell(nx, nz) && !lockedCell(fx, fz);
    const distById = id => dists.find(x => x.d.id === id);
    function mesh(geo, mat, parent, name) {
      if (!geo) return null;
      const m = new T.Mesh(geo, mat); m.name = name || ''; m.matrixAutoUpdate = false; m.updateMatrix();
      if (parent) parent.add(m);
      return m;
    }
    function disposeObj(o) {
      if (!o) return;
      o.traverse(x => { if (x.geometry && !(x.geometry.userData && x.geometry.userData.shared)) x.geometry.dispose(); });
      if (o.parent) o.parent.remove(o);
    }
    function applyShadowFlags(o, cast, recv) {
      const sh = QUAL[quality].shadows;
      o.traverse(x => { if (x.isMesh) { x.castShadow = sh && cast; x.receiveShadow = sh && recv; } });
    }

    // ── Schrift-Atlas (eine kleine CanvasTexture für alle Schilder) ──
    const atlas = { S: 1024, sw: 256, sh: 64, cols: 4, max: 64, n: 0, slots: {}, canvas: null, g: null, tex: null };
    (function initAtlas() {
      if (headless) return;
      try {
        const c = (typeof document !== 'undefined' && document.createElement) ? document.createElement('canvas') : (typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1024, 1024) : null);
        if (!c) return;
        c.width = c.height = atlas.S; atlas.canvas = c; atlas.g = c.getContext('2d');
        atlas.tex = new T.CanvasTexture(c); atlas.tex.anisotropy = 2;
        mats.sign.map = atlas.tex; mats.sign.needsUpdate = true;
      } catch (e) { atlas.g = null; }
    })();
    function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function fitFont(g, text, maxW, px, weight) {
      let s = px; g.font = weight + ' ' + s + 'px "Trebuchet MS", "Segoe UI", Arial, sans-serif';
      while (s > 8 && g.measureText(text).width > maxW) { s -= 1; g.font = weight + ' ' + s + 'px "Trebuchet MS", "Segoe UI", Arial, sans-serif'; }
      return s;
    }
    function drawLabel(i, spec, rw, rh) {
      const g = atlas.g; if (!g) return;
      const x0 = (i % atlas.cols) * atlas.sw, y0 = Math.floor(i / atlas.cols) * atlas.sh;
      g.save(); g.translate(x0, y0); g.clearRect(0, 0, atlas.sw, atlas.sh);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (spec.round) {
        g.fillStyle = spec.bg || '#ffd36b'; g.beginPath(); g.arc(rw / 2, rh / 2, rh / 2 - 2, 0, TAU); g.fill();
        g.lineWidth = 5; g.strokeStyle = spec.border || '#2a7a3a'; g.stroke();
        g.fillStyle = spec.fg || '#2a7a3a'; fitFont(g, spec.text, rw - 12, Math.round(rh * 0.62), 'bold'); g.fillText(spec.text, rw / 2, rh / 2 + 2);
      } else {
        g.fillStyle = spec.bg || '#fff4dc'; rr(g, 1, 1, rw - 2, rh - 2, Math.min(10, rh / 4)); g.fill();
        if (spec.border) { g.lineWidth = 3; g.strokeStyle = spec.border; rr(g, 2.5, 2.5, rw - 5, rh - 5, Math.min(9, rh / 4)); g.stroke(); }
        if (spec.logo) {
          const r = rh * 0.36, cx = rh * 0.52, cy = rh / 2;
          g.fillStyle = '#ff8a1e'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
          g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx - r * 0.35, cy - r * 0.5); g.lineTo(cx - r * 0.35, cy + r * 0.5); g.lineTo(cx + r * 0.55, cy); g.closePath(); g.fill();
          const s = fitFont(g, 'AnMaCha', rw - rh * 1.2, Math.round(rh * 0.6), 'bold'); g.textAlign = 'left';
          const tx = rh * 1.0, a = g.measureText('AnMa').width;
          g.fillStyle = '#ffffff'; g.fillText('AnMa', tx, cy + 2); g.fillStyle = '#ff8a1e'; g.fillText('Cha', tx + a, cy + 2);
          void s;
        } else {
          const has = !!spec.sub, main = String(spec.text || '');
          g.fillStyle = spec.fg || '#2b2f3a';
          fitFont(g, main, rw - 14, Math.round(rh * (has ? 0.46 : 0.6)), 'bold');
          g.fillText(main, rw / 2, has ? rh * 0.38 : rh / 2 + 1);
          if (has) { g.globalAlpha = 0.9; fitFont(g, spec.sub, rw - 14, Math.round(rh * 0.24), '600'); g.fillText(spec.sub, rw / 2, rh * 0.76); g.globalAlpha = 1; }
        }
      }
      g.restore();
      if (atlas.tex) atlas.tex.needsUpdate = true;
    }
    /** UV-Rechteck für ein Schild (Seitenverhältnis aspect = Breite/Höhe). */
    function labelUV(key, spec, aspect) {
      const k = key + '|' + aspect.toFixed(2);
      let s = atlas.slots[k];
      if (!s) {
        const i = atlas.n < atlas.max ? atlas.n++ : (atlas.max - 1);
        let rw = atlas.sw, rh = atlas.sh;
        if (aspect > rw / rh) rh = Math.max(8, Math.round(rw / aspect)); else rw = Math.max(8, Math.round(rh * aspect));
        drawLabel(i, spec, rw, rh);
        const x0 = (i % atlas.cols) * atlas.sw, y0 = Math.floor(i / atlas.cols) * atlas.sh, S = atlas.S;
        s = atlas.slots[k] = [x0 / S, 1 - (y0 + rh) / S, (x0 + rw) / S, 1 - y0 / S];
      }
      return s;
    }
    function buildSigns() {
      if (signMesh) { disposeObj(signMesh); signMesh = null; }
      const list = staticSigns.concat(Object.keys(lotsR).reduce((a, k) => a.concat(lotsR[k].signs || []), []));
      const pos = [], uv = [];
      const quad = (cx, cy, cz, rx, rz, ux, uy, uz, w, h, u) => {
        const hw = w / 2, hh = h / 2;
        const P = (sx, sy) => [cx + rx * sx * hw + ux * sy * hh, cy + uy * sy * hh, cz + rz * sx * hw + uz * sy * hh];
        const a = P(-1, -1), b = P(1, -1), c = P(1, 1), d = P(-1, 1);
        pos.push(...a, ...b, ...c, ...a, ...c, ...d);
        uv.push(u[0], u[1], u[2], u[1], u[2], u[3], u[0], u[1], u[2], u[3], u[0], u[3]);
      };
      list.forEach(s => {
        const uvr = labelUV(s.key, s.spec || { text: s.key }, s.w / s.h);
        const nx = Math.sin(s.ry), nz = Math.cos(s.ry), rx = Math.cos(s.ry), rz = -Math.sin(s.ry);
        const ct = Math.cos(s.tilt || 0), stt = Math.sin(s.tilt || 0);
        // Neigung um die eigene Querachse (wie rotation.x): oben → (0, cos, sin), vorne → (0, -sin, cos)
        const ux = nx * stt, uy = ct, uz = nz * stt, fx = nx * ct, fy = -stt, fz = nz * ct;
        const off = s.off == null ? 0.07 : s.off;
        quad(s.x + fx * off, s.y + fy * off, s.z + fz * off, rx, rz, ux, uy, uz, s.w, s.h, uvr);
        if (s.both) quad(s.x - fx * off, s.y - fy * off, s.z - fz * off, -rx, -rz, ux, uy, uz, s.w, s.h, uvr);
      });
      if (!pos.length) return;
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      g.computeBoundingSphere();
      signMesh = mesh(g, mats.sign, world, 'signs');
      signMesh.frustumCulled = false;
    }

    // ── Gebäude/Grundstück aus Raster-Modell ──
    function surfTops(lot) {
      const tops = {};
      (lot.objs || []).forEach(o => {
        const d = D.objectById && D.objectById[o.id]; if (!d || !d.surface) return;
        const top = M.objectGeo(T, o.id).top;
        B.cells(o).forEach(c => { tops[c[0] + ',' + c[1]] = top; });
      });
      return tops;
    }
    const tmpM = new T.Matrix4(), tmpQ = new T.Quaternion(), tmpV = new T.Vector3(), tmpS = new T.Vector3(1, 1, 1), YAX = new T.Vector3(0, 1, 0);
    /** Lage eines Objekts im Raster (Mitte, Drehung, Höhe). */
    function objPlacement(lot, o, ox, oz, tops, stack) {
      const d = D.objectById[o.id], sz = B.size(o), ry = -(o.r & 3) * HP;
      let cx = ox + o.x + sz[0] / 2, cz = oz + o.z + sz[1] / 2, y = 0;
      if (d && d.layer === 'top') {
        const k = o.x + ',' + o.z, top = tops ? tops[k] : null;
        y = top != null ? top - 0.75 : -0.72;
        if (stack) { const n = stack[k] = (stack[k] || 0) + 1, tot = stack['#' + k] || 1; if (tot > 1) cx += (n === 1 ? -0.2 : 0.2); }
      }
      return { cx, cz, ry, y };
    }
    function emitLot(lot, ox, oz, o) {
      const H = o.wallH, F = floorCols, b = o.b, up = o.up || o.b;
      const wallCol = M.col(T, o.wallCol || '#f3e6d0'), capCol = M.mix(T, o.wallCol || '#f3e6d0', '#ffffff', 0.35), frameCol = M.shade(T, o.wallCol || '#f3e6d0', 0.72);
      // Böden (nur Oberseite, leicht kariert für gute Lesbarkeit)
      for (let z = 0; z < lot.d; z++) for (let x = 0; x < lot.w; x++) {
        const fi = lot.floor[z * lot.w + x]; if (!fi || !F[fi - 1]) continue;
        b.flat(ox + x + 0.5, 0.045, oz + z + 0.5, 1, 1, F[fi - 1][(x + z) & 1]);
      }
      const part = (cx, cz, sx, sz, y0, y1, col) => {
        if (y1 <= y0) return;
        if (o.split && y0 < SPLIT_Y && y1 > SPLIT_Y) { b.box(cx, (y0 + SPLIT_Y) / 2, cz, sx, SPLIT_Y - y0, sz, col); up.box(cx, (SPLIT_Y + y1) / 2, cz, sx, y1 - SPLIT_Y, sz, col); }
        else (o.split && y0 >= SPLIT_Y ? up : b).box(cx, (y0 + y1) / 2, cz, sx, y1 - y0, sz, col);
      };
      Object.keys(lot.walls || {}).forEach(k => {
        const m = /^([hv]):(-?\d+),(-?\d+)$/.exec(k); if (!m) return;
        const kind = lot.walls[k], hor = m[1] === 'h', x = +m[2], z = +m[3];
        const cx = hor ? ox + x + 0.5 : ox + x, cz = hor ? oz + z : oz + z + 0.5;
        const L = 1 + WT, sx = hor ? L : WT, sz = hor ? WT : L;
        if (kind === 'wall') part(cx, cz, sx, sz, 0, H, wallCol);
        else if (kind === 'window') {
          part(cx, cz, sx, sz, 0, 0.9, wallCol); part(cx, cz, sx, sz, 2.1, H, wallCol);
          b.box(cx, 0.93, cz, hor ? 1.0 : WT + 0.1, 0.06, hor ? WT + 0.1 : 1.0, '#ffffff');
          o.gs.box(cx, 1.5, cz, hor ? 0.96 : 0.05, 1.18, hor ? 0.05 : 0.96, '#ffffff');
          (o.split ? up : b).box(cx, 1.5, cz, hor ? 0.06 : WT * 0.7, 1.2, hor ? WT * 0.7 : 0.06, '#ffffff');
        } else if (kind === 'door') {
          part(cx, cz, sx, sz, 2.25, H, wallCol);
          const ax = hor ? 0.46 : 0, az = hor ? 0 : 0.46;
          (o.split ? up : b).box(cx - ax, 1.125, cz - az, hor ? 0.08 : WT + 0.04, 2.25, hor ? WT + 0.04 : 0.08, frameCol);
          (o.split ? up : b).box(cx + ax, 1.125, cz + az, hor ? 0.08 : WT + 0.04, 2.25, hor ? WT + 0.04 : 0.08, frameCol);
          b.box(cx, 0.05, cz, hor ? 0.9 : WT + 0.1, 0.03, hor ? WT + 0.1 : 0.9, frameCol);
        }
        if (kind === 'wall' || kind === 'window') up.box(cx, H + 0.02, cz, sx + 0.02, 0.04, sz + 0.02, capCol);
        if (o.stamp && (kind === 'wall' || kind === 'window')) {
          if (hor) nav.wallH(ox + x, ox + x + 1, oz + z); else nav.wallV(ox + x, oz + z, oz + z + 1);
        }
      });
      // Objekte
      const tops = surfTops(lot), stack = {};
      (lot.objs || []).forEach(ob => { const d = D.objectById && D.objectById[ob.id]; if (d && d.layer === 'top') { const k = '#' + ob.x + ',' + ob.z; stack[k] = (stack[k] || 0) + 1; } });
      (lot.objs || []).forEach(ob => {
        const d = D.objectById && D.objectById[ob.id]; if (!d) return;
        const geo = M.objectGeo(T, ob.id), p = objPlacement(lot, ob, ox, oz, tops, stack);
        tmpQ.setFromAxisAngle(YAX, p.ry); tmpM.compose(tmpV.set(p.cx, p.y, p.cz), tmpQ, tmpS);
        const tgt = d.layer === 'ceil' && o.split ? up : b;
        if (geo.opaque) tgt.add(geo.opaque, tmpM);
        if (geo.glow) o.gl.add(geo.glow, tmpM);
        if (o.stamp && d.layer === 'floor') B.cells(ob).forEach(c => nav.setSolid(cellOf(ox + c[0] + 0.5), cellOf(oz + c[1] + 0.5), 1));
      });
    }

    // ── Stadt aufbauen ──
    function propCtx(b, g, glass, color, out, gates, distName) { return { T, b, g, glass, color, out, gates, distName }; }
    function stampOut(out) {
      out.solids.forEach(s => { if (s.rot) nav.solidRot.apply(null, s.rot); else if (s.circle) nav.solidCircle.apply(null, s.circle); });
      out.fences.forEach(f => nav.wallH(Math.round(f[0]), Math.round(f[1]), Math.round(f[2])));
      out.heights.forEach(h => { for (let z = cellOf(h[1]); z < cellOf(h[3]); z++) for (let x = cellOf(h[0]); x < cellOf(h[2]); x++) nav.setHeight(x, z, h[4]); });
      out.signs.forEach(s => staticSigns.push(s));
    }
    function buildGround(trees, lamps) {
      const b = M.builder(T), gs = M.builder(T), g = M.builder(T), out = { solids: [], fences: [], signs: [], heights: [] };
      const E = HALF + 48;
      b.flat(0, 0, 0, E * 2, E * 2, '#6cb35c');
      // Blöcke der Bezirke (leicht in Bezirksfarbe getönt) und Funkplatz
      D.districts.forEach(d => { const xr = blockRange(d.cx), zr = blockRange(d.cz); b.flat((xr[0] + xr[1]) / 2, 0.012, (zr[0] + zr[1]) / 2, xr[1] - xr[0], zr[1] - zr[0], M.mix(T, '#74bb62', d.color, 0.1)); });
      b.flat(0, 0.012, 0, 70, 70, '#eadfc4');
      for (let r = 7; r < 34; r += 6) b.ring(0, 0.016, 0, r, r + 0.6, '#d9caa6', 48);
      [[0, 1], [1, 0]].forEach(([ax, az]) => b.box(0, 0.017, 0, ax ? 70 : 3, 0.004, az ? 70 : 3, '#d9caa6'));
      // Alleen mit Gehwegen, Mittelstreifen und Zebrastreifen
      const segs = [[-HALF, AVES[0] - 5], [AVES[0] + 5, AVES[1] - 5], [AVES[1] + 5, HALF]];
      AVES.forEach(a => {
        b.box(a, 0.02, 0, 6, 0.04, HALF * 2, '#4a4f5d'); b.box(0, 0.02, a, HALF * 2, 0.04, 6, '#4a4f5d');
        segs.forEach(s => {
          const c = (s[0] + s[1]) / 2, L = s[1] - s[0];
          [-4, 4].forEach(o => { b.box(a + o, 0.035, c, 2, 0.07, L, '#bab3a6'); b.box(c, 0.035, a + o, L, 0.07, 2, '#bab3a6'); });
          for (let t = s[0] + 2; t < s[1] - 1; t += 4) { b.box(a, 0.043, t + 1, 0.16, 0.01, 2, '#f2efe6'); b.box(t + 1, 0.043, a, 2, 0.01, 0.16, '#f2efe6'); }
          // Straßenbäume und Laternen am Gehweg
          for (let t = s[0] + 6; t < s[1] - 4; t += 13) { trees.push([a + 4.2, t, 1]); trees.push([t + 6, a - 4.2, 1]); lamps.push([a - 4.2, t + 6, Math.PI]); lamps.push([t, a + 4.2, -HP]); }
        });
      });
      AVES.forEach(a => AVES.forEach(c => {
        for (let k = -2.5; k <= 2.6; k += 1) { b.box(a + k, 0.044, c - 4.6, 0.5, 0.01, 2.4, '#ffffff'); b.box(a + k, 0.044, c + 4.6, 0.5, 0.01, 2.4, '#ffffff'); b.box(a - 4.6, 0.044, c + k, 2.4, 0.01, 0.5, '#ffffff'); b.box(a + 4.6, 0.044, c + k, 2.4, 0.01, 0.5, '#ffffff'); }
      }));
      // Weltgrenze: Hecke rundum, dahinter bunte Häuser als Kulisse
      const hb = HALF + 0.6;
      [[0, -hb, HALF * 2 + 2, 1.2], [0, hb, HALF * 2 + 2, 1.2], [-hb, 0, 1.2, HALF * 2 + 2], [hb, 0, 1.2, HALF * 2 + 2]].forEach(h => { b.box(h[0], 0.7, h[1], h[2], 1.4, h[3], '#3e8a49'); b.box(h[0], 1.45, h[1], h[2] * 0.98 + 0.01, 0.12, h[3] * 0.98 + 0.01, '#4f9e57'); });
      const HC = ['#ffd8a8', '#ffb3c6', '#bde0fe', '#caffbf', '#fdffb6', '#e0c3fc', '#ffc6a5', '#f2efe6'], RC = ['#c0392b', '#2a6a8a', '#7a3a2a', '#3e6b3a', '#4a4f5d'];
      const rnd = PT.rng ? PT.rng(4242) : Math.random;
      const ctx = propCtx(b, g, gs, '#ff8a1e', out, [], '');
      for (let side = 0; side < 4; side++) {
        for (let t = -HALF - 10; t < HALF + 10; t += 9 + rnd() * 3) {
          const w = 6 + rnd() * 3, d = 6 + rnd() * 2, h = 5 + rnd() * 9, off = HALF + 6 + d / 2 + rnd() * 2;
          const x = side === 0 ? t : side === 1 ? t : side === 2 ? -off : off, z = side === 0 ? -off : side === 1 ? off : t;
          const ry = side === 0 ? 0 : side === 1 ? Math.PI : side === 2 ? HP : -HP;
          M.PROPS.house(ctx, x, z, w, d, h, HC[Math.floor(rnd() * HC.length)], RC[Math.floor(rnd() * RC.length)], ry);
        }
      }
      const grp = new T.Group(); grp.name = 'ground'; world.add(grp);
      const gm = mesh(b.build(), mats.v, grp, 'ground'); applyShadowFlags(gm, false, true);
      mesh(gs.build(), mats.glass, grp, 'groundGlass');
      stampOut(out);
    }
    function buildDistrict(d, idx, trees, lamps) {
      const xr = blockRange(d.cx), zr = blockRange(d.cz);
      const rec = { d, idx, rect: [xr[0], zr[0], xr[1], zr[1]], group: new T.Group(), barrier: null, color: d.color || '#ff8a1e' };
      rec.group.name = 'district_' + d.id; world.add(rec.group);
      for (let z = cellOf(zr[0]); z < cellOf(zr[1]); z++) for (let x = cellOf(xr[0]); x < cellOf(xr[1]); x++) if (nav.inb(x, z)) distMap[z * nav.S + x] = idx;
      const b = M.builder(T), g = M.builder(T), gs = M.builder(T), out = { solids: [], fences: [], signs: [], heights: [] };
      // Gebäude (begehbar)
      (d.buildings || []).forEach(bp => {
        let lot; try { lot = B.fromBlueprint(bp); } catch (e) { return; }
        const ox = d.cx + bp.x, oz = d.cz + bp.z;
        emitLot(lot, ox, oz, { b, gl: g, gs, wallH: WALL_H, wallCol: bp.wall, stamp: true });
        // Sockel außen (leicht dunkler) für klare Kontur
        b.box(ox + bp.w / 2, 0.025, oz + bp.d / 2, bp.w + 0.5, 0.05, bp.d + 0.5, M.shade(T, bp.wall || '#ddd', 0.6));
        const rb = M.builder(T), rc = bp.roof || '#7a3a2a';
        rb.box(ox + bp.w / 2, WALL_H + 0.14, oz + bp.d / 2, bp.w + 0.5, 0.28, bp.d + 0.5, rc);
        const rim = M.mix(T, rc, '#ffffff', 0.25);
        rb.box(ox + bp.w / 2, WALL_H + 0.42, oz - 0.15, bp.w + 0.5, 0.3, 0.2, rim); rb.box(ox + bp.w / 2, WALL_H + 0.42, oz + bp.d + 0.15, bp.w + 0.5, 0.3, 0.2, rim);
        rb.box(ox - 0.15, WALL_H + 0.42, oz + bp.d / 2, 0.2, 0.3, bp.d + 0.5, rim); rb.box(ox + bp.w + 0.15, WALL_H + 0.42, oz + bp.d / 2, 0.2, 0.3, bp.d + 0.5, rim);
        rb.box(ox + bp.w * 0.3, WALL_H + 0.65, oz + bp.d * 0.35, 1.4, 0.8, 1.0, '#b8bcc6');
        const rm = mesh(rb.build(), mats.v, rec.group, 'roof_' + bp.id); applyShadowFlags(rm, true, false);
        roofs.push({ mesh: rm, rect: [ox, oz, ox + bp.w, oz + bp.d], h: WALL_H });
        buildingRects.push({ rect: [ox, oz, ox + bp.w, oz + bp.d], col: rc, dist: d.id });
        // Namensschild über der Tür
        const dr = (bp.doors && bp.doors[0]) || ['s', Math.floor(bp.w / 2)], side = dr[0], len = side === 'n' || side === 's' ? bp.w : bp.d;
        const along = clamp(dr[1] + 0.5, Math.min(1.5, len / 2), Math.max(len - 1.5, len / 2));
        const sp = side === 's' ? [ox + along, oz + bp.d, 0] : side === 'n' ? [ox + along, oz, Math.PI] : side === 'w' ? [ox, oz + along, -HP] : [ox + bp.w, oz + along, HP];
        out.signs.push({ key: 'bld:' + d.id + ':' + bp.id, spec: { text: bp.name, bg: rc, fg: '#ffffff', border: bp.wall }, x: sp[0], y: 2.72, z: sp[1], w: 2.8, h: 0.7, ry: sp[2], both: false, off: 0.16 });
      });
      // Requisiten
      const gates = (d.props || []).filter(p => p[0] === 'gate').map(p => [d.cx + p[1], d.cz + p[2]]);
      const ctx = propCtx(b, g, gs, rec.color, out, gates, String(d.name || '').toUpperCase());
      (d.props || []).forEach(p => {
        const t = p[0], x = d.cx + (+p[1] || 0), z = d.cz + (+p[2] || 0);
        if (t === 'tree') trees.push([x, z, 0]);
        else if (t === 'lamp') lamps.push([x, z, 0]);
        else M.prop(ctx, t, x, z, p[3], p[4], p[5]);
      });
      // Büsche und Blumen (Deko, nur auf freien Feldern abseits von Wegen und Orten)
      decorate(d, rec, b);
      // Bushaltestelle + Bezirksschild am Schnellreise-Punkt
      const sp = d.spawn || { x: 0, z: 14, ry: Math.PI }, sry = sp.ry || 0;
      const fx = Math.sin(sry), fz = Math.cos(sry), rx = -fz, rz = fx;
      const bx = d.cx + sp.x + rx * 4.5, bz = d.cz + sp.z + rz * 4.5;
      M.prop(ctx, 'busstop', bx, bz, sry + Math.PI);
      rec.bus = [bx, bz];
      const nx = d.cx + sp.x - rx * 4.2, nz = d.cz + sp.z - rz * 4.2;
      b.box(nx, 1.3, nz, 0.14, 2.6, 0.14, '#3a3f4d'); b.at(nx, 0, nz, sry + Math.PI); b.box(0, 2.45, 0, 2.7, 0.75, 0.12, rec.color); b.at(null);
      out.signs.push({ key: 'dist:' + d.id, spec: { text: d.name, sub: d.desc ? 'Bezirk' : '', bg: rec.color, fg: '#1d1f26', border: '#ffffff' }, x: nx, y: 2.45, z: nz, w: 2.6, h: 0.65, ry: sry + Math.PI, both: true, off: 0.08 });
      nav.solidCircle(nx, nz, 0.1);
      inter.push({ kind: 'travel', id: d.id, label: 'Bushaltestelle – Schnellreise', x: bx, z: bz, r: 2.6, color: '#4bb8ff' });
      // Lot-Grundstück: Platz für Bau-Terminal/Schilder kommt in buildLot()
      const sm = mesh(b.build(), mats.v, rec.group, 'static_' + d.id); if (sm) applyShadowFlags(sm, true, true);
      mesh(g.build(), mats.glow, rec.group, 'glow_' + d.id);
      mesh(gs.build(), mats.glass, rec.group, 'glass_' + d.id);
      stampOut(out);
      dists.push(rec);
      return rec;
    }
    function decorate(d, rec, b) {
      const rnd = PT.rng ? PT.rng(PT.hash ? PT.hash('deko' + d.id) : 9) : Math.random;
      const spots = Object.keys(d.spots || {}).map(k => [d.cx + d.spots[k][0], d.cz + d.spots[k][1]]).concat([[d.cx + (d.spawn ? d.spawn.x : 0), d.cz + (d.spawn ? d.spawn.z : 0)]]);
      const FL = ['#ff7ad9', '#ffd36b', '#ff4d6d', '#c58bff', '#ffffff', '#6ef0ff'];
      let placed = 0;
      for (let tries = 0; tries < 120 && placed < 16; tries++) {
        const x = Math.round(lerp(rec.rect[0] + 3, rec.rect[2] - 3, rnd())) + 0.5, z = Math.round(lerp(rec.rect[1] + 3, rec.rect[3] - 3, rnd())) + 0.5;
        if (spots.some(p => Math.hypot(p[0] - x, p[1] - z) < 6)) continue;
        if ((d.buildings || []).some(bp => x > d.cx + bp.x - 3 && x < d.cx + bp.x + bp.w + 3 && z > d.cz + bp.z - 3 && z < d.cz + bp.z + bp.d + 3)) continue;
        if (d.lot && x > d.cx + d.lot.x - 3 && x < d.cx + d.lot.x + d.lot.w + 3 && z > d.cz + d.lot.z - 3 && z < d.cz + d.lot.z + d.lot.d + 4) continue;
        let free = true; for (let dz = -2; dz <= 2 && free; dz++) for (let dx = -2; dx <= 2; dx++) if (nav.solid(cellOf(x) + dx, cellOf(z) + dz)) { free = false; break; }
        if (!free || (d.props || []).some(p => (p[0] === 'road' || p[0] === 'platform' || p[0] === 'tracks' || p[0] === 'track' || p[0] === 'fence') && Math.abs(d.cz + (+p[2] || 0) - z) < ((p[0] === 'road' || p[0] === 'platform') ? (+p[4] || 6) / 2 + 2 : p[0] === 'track' ? 12 : 3) && Math.abs(d.cx + (+p[1] || 0) - x) < ((p[0] === 'road' || p[0] === 'platform') ? (+p[3] || 6) / 2 + 2 : p[0] === 'track' ? 12 : (+p[3] || 40) / 2 + 2))) continue;
        if (rnd() < 0.55) { const r = 0.55 + rnd() * 0.35; b.sphere(x, r * 0.75, z, r, M.mix(T, '#3e8a49', '#5cc45f', rnd()), null, 7, 0.85); b.sphere(x + r * 0.6, r * 0.55, z + 0.2, r * 0.7, '#4f9e57', null, 6, 0.85); nav.solidCircle(x, z, 0.5); }
        else { b.cyl(x, 0.12, z, 0.9, 0.24, 0.95, '#8a6a4a', null, 10); b.cyl(x, 0.25, z, 0.82, 0.04, 0.82, '#5a3e2a', null, 10); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rnd(); b.sphere(x + Math.cos(a) * 0.45, 0.38, z + Math.sin(a) * 0.45, 0.17, FL[Math.floor(rnd() * FL.length)], null, 6); } nav.solidCircle(x, z, 0.6); }
        placed++;
      }
    }
    function buildPlaza(trees, lamps) {
      const P = D.plaza || { props: [] };
      for (let z = cellOf(-35); z < cellOf(35); z++) for (let x = cellOf(-35); x < cellOf(35); x++) distMap[z * nav.S + x] = 8;
      const b = M.builder(T), g = M.builder(T), gs = M.builder(T), out = { solids: [], fences: [], signs: [], heights: [] };
      const ctx = propCtx(b, g, gs, '#ff8a1e', out, [], 'FUNKPLATZ');
      (P.props || []).forEach(p => { const t = p[0]; if (t === 'tree') trees.push([p[1], p[2], 0]); else if (t === 'lamp') lamps.push([p[1], p[2], 0]); else M.prop(ctx, t, p[1], p[2], p[3], p[4], p[5]); });
      // Blumenbeete an den Ecken
      [[-24, -24], [24, -24], [-24, 24], [24, 24]].forEach(([x, z]) => { b.cyl(x, 0.25, z, 2.6, 0.5, 2.7, '#c9c4b8', null, 16); b.cyl(x, 0.52, z, 2.4, 0.06, 2.4, '#6b4f3a', null, 16); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; b.sphere(x + Math.cos(a) * 1.4, 0.75, z + Math.sin(a) * 1.4, 0.32, ['#ff7ad9', '#ffd36b', '#ff4d6d', '#c58bff'][i % 4], null, 6); } nav.solidCircle(x, z, 2.6); });
      M.prop(ctx, 'sign', 0, 12.5, 'FUNKPLATZ');
      const grp = new T.Group(); grp.name = 'plaza'; world.add(grp);
      const sm = mesh(b.build(), mats.v, grp, 'plaza'); if (sm) applyShadowFlags(sm, true, true);
      mesh(g.build(), mats.glow, grp, 'plazaGlow');
      stampOut(out);
    }
    function buildInstanced(trees, lamps) {
      const rnd = PT.rng ? PT.rng(77) : Math.random, o = new T.Object3D(), c = new T.Color();
      const tg = M.treeGeo(T); tg.userData.shared = true;
      treeMesh = new T.InstancedMesh(tg, mats.v, Math.max(1, trees.length)); treeMesh.name = 'trees'; treeMesh.frustumCulled = false;
      trees.forEach((t, i) => {
        const s = 0.85 + rnd() * 0.4; o.position.set(t[0], 0, t[1]); o.rotation.set(0, rnd() * TAU, 0); o.scale.set(s, s * (0.9 + rnd() * 0.25), s); o.updateMatrix();
        treeMesh.setMatrixAt(i, o.matrix); const k = 0.85 + rnd() * 0.3; treeMesh.setColorAt(i, c.setRGB(k * (0.95 + rnd() * 0.1), k, k * (0.9 + rnd() * 0.15)));
        nav.solidCircle(t[0], t[1], 0.35);
      });
      if (!trees.length) treeMesh.setColorAt(0, c.set(1, 1, 1));
      treeMesh.count = trees.length; world.add(treeMesh); applyShadowFlags(treeMesh, true, false);
      const lg = M.lampGeo(T), bg = M.lampBulbGeo(T); lg.userData.shared = bg.userData.shared = true;
      lampMesh = new T.InstancedMesh(lg, mats.v, Math.max(1, lamps.length)); lampMesh.name = 'lamps'; lampMesh.frustumCulled = false;
      bulbMesh = new T.InstancedMesh(bg, mats.lamp, Math.max(1, lamps.length)); bulbMesh.name = 'bulbs'; bulbMesh.frustumCulled = false;
      lamps.forEach((l, i) => { o.position.set(l[0], 0, l[1]); o.rotation.set(0, l[2] || 0, 0); o.scale.set(1, 1, 1); o.updateMatrix(); lampMesh.setMatrixAt(i, o.matrix); bulbMesh.setMatrixAt(i, o.matrix); lampMesh.setColorAt(i, c.set(1, 1, 1)); bulbMesh.setColorAt(i, c); nav.solidCircle(l[0], l[1], 0.15); });
      lampMesh.count = bulbMesh.count = lamps.length; world.add(lampMesh); world.add(bulbMesh);
      // Lichtkegel auf dem Boden (nur nachts sichtbar)
      const pg = new T.CircleGeometry(3.2, 16); pg.rotateX(-HP);
      poolMesh = new T.InstancedMesh(pg, mats.pool, Math.max(1, lamps.length)); poolMesh.name = 'pools'; poolMesh.frustumCulled = false; poolMesh.renderOrder = 2;
      lamps.forEach((l, i) => { const r = l[2] || 0; o.position.set(l[0] + Math.cos(r) * 0.7, 0.07, l[1] - Math.sin(r) * 0.7); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); o.updateMatrix(); poolMesh.setMatrixAt(i, o.matrix); });
      poolMesh.count = lamps.length; poolMesh.visible = false; world.add(poolMesh);
    }
    /** Absperrungen gesperrter Bezirke (neu aufbauen). */
    function buildBarriers() {
      staticSigns = staticSigns.filter(s => !s.lock);
      dists.forEach(rec => {
        if (rec.barrier) { disposeObj(rec.barrier); rec.barrier = null; }
        if (!isLockedIdx(rec.idx)) return;
        const b = M.builder(T), g = M.builder(T), out = { solids: [], fences: [], signs: [], heights: [] }, ctx = propCtx(b, g, null, rec.color, out, [], '');
        const [x0, z0, x1, z1] = rec.rect, i = 0.6;
        const sides = [[x0 + i, z0 + i, x1 - i, z0 + i, 0, -1], [x0 + i, z1 - i, x1 - i, z1 - i, 0, 1], [x0 + i, z0 + i, x0 + i, z1 - i, -1, 0], [x1 - i, z0 + i, x1 - i, z1 - i, 1, 0]];
        sides.forEach(s => {
          M.PROPS.barrier(ctx, s[0], s[1], s[2], s[3]);
          const atEdge = (s[4] && Math.abs(s[0]) > HALF - 2) || (s[5] && Math.abs(s[1]) > HALF - 2);
          if (atEdge) return;
          const mx = (s[0] + s[2]) / 2 + s[4] * 1.4, mz = (s[1] + s[3]) / 2 + s[5] * 1.4, ry = Math.atan2(s[4], s[5]);
          b.at(mx, 0, mz, ry); b.box(-1.6, 1.15, 0, 0.12, 2.3, 0.12, '#3a3f4d'); b.box(1.6, 1.15, 0, 0.12, 2.3, 0.12, '#3a3f4d'); b.box(0, 1.85, 0, 3.5, 0.95, 0.1, '#3a3f4d'); b.at(null);
          staticSigns.push({ lock: true, key: 'lock:' + rec.d.id, spec: { text: 'Gesperrt: ' + rec.d.name, sub: rec.d.unlockText || 'Wird später freigeschaltet.', bg: '#2b2f3a', fg: '#ffffff', border: '#ff4d6d' }, x: mx, y: 1.85, z: mz, w: 3.4, h: 0.85, ry, both: true, off: 0.07 });
        });
        rec.barrier = new T.Group(); rec.barrier.name = 'barrier_' + rec.d.id; world.add(rec.barrier);
        mesh(b.build(), mats.v, rec.barrier, 'barrier');
      });
      unlockKey = lockKey();
    }
    const lockKey = () => st && st.unlocks && st.unlocks.districts ? Object.keys(st.unlocks.districts).map(k => k + (st.unlocks.districts[k] ? 1 : 0)).join(',') : '';

    // ── Eigene Grundstücke ──
    function lotDef(lotId) { const d = D.districts.find(x => x.lot && x.lot.id === lotId); return d ? { d, l: d.lot } : null; }
    function findPult(lot) {
      const pri = o => { const d = D.objectById[o.id]; if (!d) return 9; if (/^mx_/.test(o.id)) return 0; if (d.use === 'record') return 1; if (d.use === 'edit') return 2; if (d.surface) return 3; return 9; };
      let best = null; (lot.objs || []).forEach(o => { const p = pri(o); if (p < 9 && (!best || p < best.p)) best = { o, p }; });
      return best ? best.o : null;
    }
    function buildLot(lotId) {
      const ld = lotDef(lotId); if (!ld || !st) return;
      const old = lotsR[lotId]; if (old) { disposeObj(old.group); for (let i = roofs.length - 1; i >= 0; i--) if (roofs[i].lot === lotId) roofs.splice(i, 1); for (let i = inter.length - 1; i >= 0; i--) if (inter[i].lot === lotId) inter.splice(i, 1); }
      const { d, l } = ld, ox = d.cx + l.x, oz = d.cz + l.z;
      const lot = (st.lots && st.lots[lotId]) || (B ? B.createLot(lotId, l.w, l.d, false) : null); if (!lot) return;
      const gx0 = cellOf(ox), gz0 = cellOf(oz);
      nav.clearArea(gx0, gz0, gx0 + lot.w, gz0 + lot.d);
      const R = { id: lotId, ox, oz, w: lot.w, d: lot.d, group: new T.Group(), upper: null, grid: null, signs: [], ver: lot.ver, owned: !!lot.owned };
      R.group.name = 'lot_' + lotId; world.add(R.group);
      const b = M.builder(T), up = M.builder(T), g = M.builder(T), gs = M.builder(T), rf = M.builder(T), out = { solids: [], fences: [], signs: [], heights: [] };
      // Grundstücksfläche und Rand
      b.flat(ox + lot.w / 2, 0.02, oz + lot.d / 2, lot.w, lot.d, lot.owned ? '#8fd16f' : '#b9c98a');
      [[ox + lot.w / 2, oz, lot.w + 0.2, 0.14], [ox + lot.w / 2, oz + lot.d, lot.w + 0.2, 0.14], [ox, oz + lot.d / 2, 0.14, lot.d], [ox + lot.w, oz + lot.d / 2, 0.14, lot.d]].forEach(s => b.box(s[0], 0.04, s[1], s[2], 0.08, s[3], lot.owned ? '#f2efe6' : '#ffd36b'));
      if (!lot.owned) [[ox, oz], [ox + lot.w, oz], [ox, oz + lot.d], [ox + lot.w, oz + lot.d]].forEach(p => b.box(p[0], 0.5, p[1], 0.18, 1.0, 0.18, '#ff4d6d'));
      emitLot(lot, ox, oz, { b, up, gl: g, gs, wallH: LOT_H, wallCol: lotId === 'studio' ? '#f6e7cf' : '#e3eef8', split: true, stamp: true });
      // Dach über allen umschlossenen Räumen
      let hasRoof = false;
      try {
        const reg = B.regions(lot), rc = lotId === 'studio' ? '#d0563b' : '#2a6a8a';
        reg.list.filter(r => r.enclosed).forEach(r => {
          const rows = {}; r.cells.forEach(c => { (rows[c[1]] = rows[c[1]] || []).push(c[0]); });
          Object.keys(rows).forEach(z => { const xs = rows[z].sort((a, e) => a - e); let s = xs[0], p = xs[0]; for (let i = 1; i <= xs.length; i++) { if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; } rf.box(ox + (s + p + 1) / 2, LOT_H + 0.12, oz + (+z) + 0.5, p - s + 1 + 0.2, 0.24, 1.02, rc); hasRoof = true; if (i < xs.length) { s = p = xs[i]; } } });
        });
      } catch (e) { /* Dach optional */ }
      // Bau-Terminal / Pachtschild / Logo
      const ctx = propCtx(b, g, gs, '#ff8a1e', out, [], '');
      const fx = ox + lot.w / 2, fz = oz + lot.d + 1.5;
      if (lot.owned) {
        M.prop(ctx, 'terminal', fx + 4, fz, 0);
        inter.push({ kind: 'build', id: lotId, label: 'Bau-Terminal', x: fx + 4, z: fz, r: 2.2, lot: lotId, color: '#4be08a' });
      } else {
        M.prop(ctx, 'leasesign', fx - 3, fz, 0);
        inter.push({ kind: 'lot', id: lotId, label: 'Grundstück pachten', x: fx - 3, z: fz, r: 2.6, lot: lotId, color: '#ffd36b' });
      }
      if (lotId === 'studio') M.prop(ctx, 'logosign', fx - 5, fz - 0.3, 0);
      // Produktionspult
      const po = findPult(lot);
      if (po && lot.owned) {
        const p = objPlacement(lot, po, ox, oz, null, null);
        R.pult = [p.cx, p.cz];
        inter.push({ kind: 'studio', id: lotId, label: 'Produktionspult', x: p.cx, z: p.cz, r: 2.0, lot: lotId, color: '#ff8a1e' });
      } else R.pult = null;
      // Meshes
      R.static = mesh(b.build(), mats.v, R.group, 'lotStatic'); if (R.static) applyShadowFlags(R.static, true, true);
      R.upper = mesh(up.build(), mats.v, R.group, 'lotUpper'); if (R.upper) applyShadowFlags(R.upper, true, true);
      mesh(g.build(), mats.glow, R.group, 'lotGlow');
      R.glass = mesh(gs.build(), mats.glass, R.group, 'lotGlass');
      if (hasRoof) { R.roof = mesh(rf.build(), mats.v, R.group, 'lotRoof'); applyShadowFlags(R.roof, true, false); roofs.push({ mesh: R.roof, rect: [ox, oz, ox + lot.w, oz + lot.d], lot: lotId, h: LOT_H }); }
      // Raster (nur im Bau-Modus sichtbar)
      const gp = [];
      for (let x = 0; x <= lot.w; x++) gp.push(ox + x, 0.07, oz, ox + x, 0.07, oz + lot.d);
      for (let z = 0; z <= lot.d; z++) gp.push(ox, 0.07, oz + z, ox + lot.w, 0.07, oz + z);
      const gg = new T.BufferGeometry(); gg.setAttribute('position', new T.Float32BufferAttribute(gp, 3));
      R.grid = new T.LineSegments(gg, mats.grid); R.grid.name = 'lotGrid'; R.grid.visible = mode === 'build' && bstate.lot === lotId; R.group.add(R.grid);
      R.signs = out.signs; out.signs = [];
      stampOut(out);
      lotsR[lotId] = R; lotVer[lotId] = lot.ver + (lot.owned ? 'o' : '');
      if (lotId === 'studio') placeHosts();
      // Figuren, die jetzt in einem belegten Feld stehen, herausschieben
      if (player) unstick(player);
      npcs.forEach(n => { n.path = null; n.needPath = true; if (n.host) return; unstick(n); });
      updateVisibility();
    }
    function unstick(f) {
      const gx = cellOf(f.x), gz = cellOf(f.z);
      if (!nav.solid(gx, gz)) return;
      const c = nav.nearestFree(gx, gz, 10); if (c) { f.x = nav.center(c[0]); f.z = nav.center(c[1]); }
    }

    // ── Figuren ──
    const HOST_DEFS = () => (D.hosts || []);
    function resolveSpot(key) {
      if (!key) return null;
      const parts = String(key).split('.'), dId = parts[0], sp = parts[1];
      if (dId === 'plaza') { const s = D.plaza && D.plaza.spots && D.plaza.spots[sp]; return s ? [s[0], s[1]] : [0, 8]; }
      const d = D.districts.find(x => x.id === dId); if (!d) return null;
      const s = d.spots && d.spots[sp]; return s ? [d.cx + s[0], d.cz + s[1]] : [d.cx + (d.spawn ? d.spawn.x : 0), d.cz + (d.spawn ? d.spawn.z : 0)];
    }
    function freeNear(x, z) {
      const gx = cellOf(x), gz = cellOf(z);
      if (nav.inb(gx, gz) && !nav.solid(gx, gz)) return [x, z];
      const c = nav.nearestFree(gx, gz, 12);
      return c ? [nav.center(c[0]), nav.center(c[1])] : [x, z];
    }
    function placeHosts() {
      const R = lotsR.studio; if (!R) return;
      const base = R.pult || [R.ox + R.w / 2, R.oz + R.d / 2];
      const used = {};
      ['marco', 'andrew'].forEach((id, k) => {
        const n = npcs.find(x => x.id === id); if (!n) return;
        let best = null, bd = 1e9;
        for (let r = 1; r <= 4 && !best; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
          const gx = cellOf(base[0]) + dx, gz = cellOf(base[1]) + dz, key = gx + ',' + gz;
          if (used[key] || nav.solid(gx, gz)) continue;
          const wx = nav.center(gx), wz = nav.center(gz);
          if (wx < R.ox || wz < R.oz || wx > R.ox + R.w || wz > R.oz + R.d) continue;
          const dd = Math.hypot(wx - base[0], wz - base[1]) + (k ? (wx < base[0] ? 0.4 : 0) : (wx > base[0] ? 0.4 : 0));
          if (dd < bd) { bd = dd; best = [wx, wz, key]; }
        }
        if (!best) best = [base[0] + (k ? 1 : -1), base[1] + 1, 'x'];
        used[best[2]] = 1; n.home = [best[0], best[1]]; n.x = best[0]; n.z = best[1]; n.path = null;
        n.faceTo = base;
      });
    }
    function addNpc(def, host) {
      const fi = figSys.add(def.look || {});
      const n = { id: def.id, def, host: !!host, fig: fi, x: 0, z: 0, ry: 0, phase: 0, amt: 0, path: null, pi: 0, goal: null, goalKey: '', needPath: false, off: [0, 0], name: def.name || def.id };
      const h = PT.hash ? PT.hash(def.id) : 1, a = (h % 628) / 100; n.off = [Math.cos(a) * 0.9, Math.sin(a) * 0.9];
      npcs.push(n); return n;
    }
    function npcGoal(n) {
      if (n.host) return { key: 'home', pos: n.home || [n.x, n.z] };
      const hour = st && st.time ? Math.floor(st.time.min / 60) : 12;
      const staff = st && st.staff && st.staff.find(s => s.id === n.id);
      if (staff && hour >= 9 && hour < 18 && lotsR.studio && !staff.training) {
        let p = null;
        if (staff.station) { const L = st.lots[staff.stationLot || 'studio'], R = lotsR[staff.stationLot || 'studio']; const o = L && R && L.objs.find(x => x.u === staff.station); if (o) { const q = objPlacement(L, o, R.ox, R.oz, null, null); p = [q.cx, q.cz + 1]; } }
        if (!p) { const R = lotsR.studio; p = R.pult ? [R.pult[0] + 1.5, R.pult[1] + 1.5] : [R.ox + R.w / 2, R.oz + R.d - 1]; }
        return { key: 'staff:' + (staff.station || 'x'), pos: p };
      }
      const rt = n.def.routine || []; if (!rt.length) return { key: 'none', pos: [n.x, n.z] };
      let r = rt[rt.length - 1]; rt.forEach(e => { if (e[0] <= hour) r = e; });
      const p = resolveSpot(r[1]) || [n.x, n.z];
      return { key: r[1], pos: [p[0] + n.off[0], p[1] + n.off[1]] };
    }
    function initNpcs() {
      (D.npcs || []).forEach(def => addNpc(def, false));
      HOST_DEFS().forEach(def => addNpc(def, true));
      npcs.forEach(n => { if (n.host) return; const g = npcGoal(n), p = freeNear(g.pos[0], g.pos[1]); n.x = p[0]; n.z = p[1]; n.goal = p; n.goalKey = g.key; n.ry = (PT.hash ? PT.hash(n.id) % 628 : 0) / 100; });
    }
    let pathBudget = 2;
    function updateNpcs(dt) {
      pathBudget = 2;
      npcs.forEach(n => {
        const g = npcGoal(n);
        if (g.key !== n.goalKey || !n.goal) {
          n.goalKey = g.key; const p = n.host ? g.pos : freeNear(g.pos[0], g.pos[1]); n.goal = p; n.path = null; n.needPath = Math.hypot(p[0] - n.x, p[1] - n.z) > 0.6;
          // weit weg vom Spieler und vom Ziel: direkt hin (spart Rechenzeit)
          if (player && Math.hypot(p[0] - n.x, p[1] - n.z) > 70 && Math.hypot(player.x - n.x, player.z - n.z) > 45 && Math.hypot(player.x - p[0], player.z - p[1]) > 45) { n.x = p[0]; n.z = p[1]; n.needPath = false; }
        }
        if (n.needPath && !n.path && pathBudget > 0) {
          pathBudget--; n.needPath = false;
          n.path = nav.findPath(n.x, n.z, n.goal[0], n.goal[1], { maxIter: 30000, partial: true }); n.pi = 0;
          if (!n.path) n.path = null;
        }
        let moving = false;
        if (n.path && n.pi < n.path.length) {
          const t = n.path[n.pi], dx = t[0] - n.x, dz = t[1] - n.z, dd = Math.hypot(dx, dz), step = NPC_SPEED * dt;
          // außer Sichtweite eilen die Figuren (kommen schneller zu ihren Orten)
          const fast = player && Math.hypot(player.x - n.x, player.z - n.z) > 45 ? 3 : 1;
          if (dd <= step * fast) { n.x = t[0]; n.z = t[1]; n.pi++; if (n.pi >= n.path.length) n.path = null; }
          else { n.x += dx / dd * step * fast; n.z += dz / dd * step * fast; }
          if (dd > 0.01) n.ry += angDiff(n.ry, Math.atan2(dx, dz)) * Math.min(1, dt * 8);
          moving = true; n.phase += dt * NPC_SPEED * 2.6;
        } else if (player) {
          const pd = Math.hypot(player.x - n.x, player.z - n.z);
          const ft = pd < 4 ? [player.x, player.z] : n.faceTo;
          if (ft) n.ry += angDiff(n.ry, Math.atan2(ft[0] - n.x, ft[1] - n.z)) * Math.min(1, dt * 4);
        }
        n.amt = lerp(n.amt, moving ? 1 : 0, Math.min(1, dt * 8));
      });
    }

    // ── Spieler-Bewegung mit Kollision (gleiten an Wänden) ──
    const pPass = (ax, az, bx, bz) => nav.passable(ax, az, bx, bz, playerExtra);
    function moveAxis(f, d, axis, depth) {
      if (!d) return;
      const s = Math.sign(d), r = PLAYER_R;
      const pos = axis ? f.z : f.x, other = axis ? f.x : f.z, np = pos + d;
      const c0 = cellOf(pos + s * r), c1 = cellOf(np + s * r);
      if (c0 === c1 || np + s * r <= -HALF || np + s * r >= HALF) {
        if (Math.abs(np) < HALF - 0.6) { if (axis) f.z = np; else f.x = np; }
        return;
      }
      const probes = [-r * 0.8, 0, r * 0.8];
      let blockedMid = false, blocked = false, side = 0;
      for (let k = 0; k < 3; k++) {
        const oc = cellOf(other + probes[k]);
        const ok = axis ? pPass(oc, c0, oc, c1) : pPass(c0, oc, c1, oc);
        if (!ok) { blocked = true; if (k === 1) blockedMid = true; else side += k === 0 ? -1 : 1; }
      }
      if (!blocked) { if (axis) f.z = np; else f.x = np; return; }
      const boundary = (s > 0 ? c1 : c0) - HALF;
      const lim = boundary - s * (r + 0.001);
      if (axis) f.z = s > 0 ? Math.min(np, lim) : Math.max(np, lim); else f.x = s > 0 ? Math.min(np, lim) : Math.max(np, lim);
      // Ecke: nur ein Randprüfpunkt hängt → seitlich zur Öffnung schieben
      if (!blockedMid && side && !depth) {
        const push = -side * Math.min(Math.abs(d), 0.05);
        moveAxis(f, push, axis ? 0 : 1, 1);
      }
    }
    function movePlayer(dx, dz) {
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / 0.25));
      for (let i = 0; i < n; i++) { moveAxis(player, dx / n, 0); moveAxis(player, dz / n, 1); }
    }

    // ── Sichtbarkeit (Dächer, Bau-Modus) ──
    function inRect(x, z, r, m) { return x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m; }
    function updateVisibility() {
      const px = player ? player.x : 0, pz = player ? player.z : 0;
      const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
      roofs.forEach(r => {
        let hide = false;
        if (mode === 'build' && r.lot && r.lot === bstate.lot) hide = true;
        else if (mode !== 'mg' && player) {
          if (inRect(px, pz, r.rect, 0.2)) hide = true;
          else if (mode === 'follow') for (let t = 0.2; t < 0.95 && !hide; t += 0.2) { const x = lerp(px, cx, t), z = lerp(pz, cz, t), y = lerp(1.4, cy, t); if (y < r.h + 0.6 && inRect(x, z, r.rect, 0)) hide = true; }
        }
        r.mesh.visible = !hide;
      });
      Object.keys(lotsR).forEach(k => { const R = lotsR[k]; const bm = mode === 'build' && bstate.lot === k; if (R.upper) R.upper.visible = !bm; if (R.glass) R.glass.visible = !bm; if (R.grid) R.grid.visible = bm; });
      // Bezirke außerhalb der Sichtweite ganz ausblenden (spart Frustum-Tests und Draw-Calls)
      const far = camera.far + 40;
      dists.forEach(rec => { const mx = (rec.rect[0] + rec.rect[2]) / 2, mz = (rec.rect[1] + rec.rect[3]) / 2; rec.group.visible = Math.hypot(mx - cx, mz - cz) < far + 40; });
    }

    // ── Markierungen über Interaktionspunkten ──
    function buildMarkers() {
      if (markerMesh) { dyn.remove(markerMesh); markerMesh.dispose(); }
      const mg = M.markerGeo(T); mg.userData.shared = true;
      markerMesh = new T.InstancedMesh(mg, mats.marker, 48); for (let i = 0; i < 48; i++) markerMesh.setColorAt(i, mc.set(1, 1, 1)); markerMesh.frustumCulled = false; markerMesh.name = 'markers'; dyn.add(markerMesh);
    }
    const mo = new T.Object3D(), mc = new T.Color();
    function updateMarkers() {
      if (!markerMesh) return;
      let n = 0;
      inter.forEach((it, i) => {
        if (n >= 48) return;
        if (it.kind === 'travel' && player && Math.hypot(player.x - it.x, player.z - it.z) > 60) return;
        mo.position.set(it.x, 3.3 + Math.sin(time * 2 + i) * 0.15, it.z); mo.rotation.set(0, time * 1.5 + i, 0); mo.scale.setScalar(it.kind === 'travel' ? 0.8 : 1); mo.updateMatrix();
        markerMesh.setMatrixAt(n, mo.matrix); markerMesh.setColorAt(n, mc.set(it.color || '#ff8a1e')); n++;
      });
      markerMesh.count = n; markerMesh.instanceMatrix.needsUpdate = true; if (markerMesh.instanceColor) markerMesh.instanceColor.needsUpdate = true;
    }

    // ── Laden ──
    function clearWorld() {
      [...world.children].forEach(c => disposeObj(c));
      if (figSys) { figSys.dispose(); dyn.remove(figSys.group); figSys = null; if (mats.figure) { mats.figure.dispose(); mats.figure = null; } }
      if (markerMesh) { dyn.remove(markerMesh); markerMesh.dispose(); markerMesh = null; }
      dists.length = 0; roofs.length = 0; inter.length = 0; buildingRects.length = 0; staticSigns = []; npcs.length = 0;
      Object.keys(lotsR).forEach(k => delete lotsR[k]); Object.keys(remotes).forEach(k => delete remotes[k]);
      nav.bits.fill(0); nav.hgt.fill(0); distMap.fill(255);
      signMesh = treeMesh = lampMesh = bulbMesh = poolMesh = null; player = null;
    }
    function load(state) {
      st = state || st || {};
      clearWorld();
      const trees = [], lamps = [];
      buildGround(trees, lamps);
      (D.districts || []).forEach((d, i) => { try { buildDistrict(d, i, trees, lamps); } catch (e) { console.error('[PT.World] Bezirk', d && d.id, e); } });
      buildPlaza(trees, lamps);
      buildInstanced(trees, lamps);
      // Nebenjob-Pulte dort, wo die Job-Figur arbeitet
      const usedJob = {}, jb = M.builder(T), jg = M.builder(T), jout = { solids: [], fences: [], signs: [], heights: [] };
      (D.jobs || []).forEach(j => {
        const npc = (D.npcs || []).find(n => n.id === j.npc);
        const ent = npc && (npc.routine || []).find(r => String(r[1]).split('.')[0] === j.dist);
        let p = ent ? resolveSpot(ent[1]) : null; const dd = D.districts.find(x => x.id === j.dist);
        if (!p && dd) p = [dd.cx, dd.cz];
        if (!p) return;
        let c = null;
        for (let r = 1; r <= 6 && !c; r++) for (const [dx, dz] of [[r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, r]]) { const gx = cellOf(p[0] + dx * 1.2), gz = cellOf(p[1] + dz * 1.2), k = gx + ',' + gz; if (!nav.solid(gx, gz) && !usedJob[k] && !c) { c = [nav.center(gx), nav.center(gz)]; usedJob[k] = 1; } }
        if (!c) return;
        M.prop(propCtx(jb, jg, null, '#ff8a1e', jout, [], ''), 'jobboard', c[0], c[1], 0);
        stampOut(jout); jout.solids = []; jout.signs = [];
        inter.push({ kind: 'job', id: j.id, label: 'Nebenjob: ' + (j.name || j.id), x: c[0], z: c[1], r: 2.0, color: '#ff8a1e' });
      });
      const jm = mesh(jb.build(), mats.v, world, 'jobs'); if (jm) jm.frustumCulled = false;
      // Figuren
      figSys = M.figureSystem(T, 48, { body: new T.MeshLambertMaterial({ vertexColors: true }), shadow: mats.shadow });
      mats.figure = figSys.meshes.torso.material; dyn.add(figSys.group); applyShadowFlags(figSys.group, true, false);
      figSys.meshes.shadow.castShadow = false;
      initNpcs();
      buildBarriers();
      ['studio', 'campus'].forEach(id => buildLot(id));
      const pl = st.player || {};
      player = { x: +pl.x || 0, z: +pl.z || 0, ry: pl.ry == null ? Math.PI : +pl.ry, phase: 0, amt: 0, fig: figSys.add(Object.assign({ badge: '#ff8a1e', hairStyle: 'short' }, st.look || {})) };
      if (!isFinite(player.x) || !isFinite(player.z) || Math.abs(player.x) > HALF - 1 || Math.abs(player.z) > HALF - 1 || nav.solid(cellOf(player.x), cellOf(player.z))) {
        const d0 = distById('altstudio') || dists[0]; if (d0) { const sp = d0.d.spawn || { x: 0, z: 14 }; player.x = d0.d.cx + sp.x; player.z = d0.d.cz + sp.z; }
        unstick(player);
      }
      cam.yaw = player.ry; cam.snap = true;
      buildMarkers();
      buildSigns();
      loaded = true; curMin = -1;
      if (st.time) setTime(st.time.min);
      setQuality(quality);
      updateFigures();
      updateCamera(0);
      updateVisibility();
    }
    function refreshLot(lotId) { if (!loaded) return; if (!lotId) { ['studio', 'campus'].forEach(buildLot); } else buildLot(lotId); buildSigns(); }
    function refreshUnlocks() { if (!loaded) return; buildBarriers(); buildSigns(); }

    // ── Kamera ──
    function setCamMode(m, o) {
      o = o || {};
      if (m === 'build') {
        const lot = o.lot || bstate.lot || 'studio';
        if (lot !== bstate.lot || mode !== 'build') { bstate.panX = 0; bstate.panZ = 0; bstate.zoom = 0; }
        bstate.lot = lot; mode = 'build';
      } else if (m === 'mg') mode = 'mg';
      else if (m === 'cine') { cineStart(o.dist || o.distId || (player ? districtAt(player.x, player.z) : 'altstudio'), o.seconds || 4); }
      else { mode = 'follow'; cam.snap = true; ghost(null); ghostEdge(null); }
      cam.snap = true;
      updateVisibility();
    }
    function buildTarget() {
      const R = lotsR[bstate.lot]; if (!R) return null;
      const yaw = Math.PI + bstate.rot * HP, base = Math.max(R.w, R.d) * 1.25 + 6;
      if (!bstate.zoom) bstate.zoom = base;
      const tx = R.ox + R.w / 2 + bstate.panX, tz = R.oz + R.d / 2 + bstate.panZ, pitch = 1.0, dist = bstate.zoom;
      return { tx, tz, yaw, x: tx - Math.sin(yaw) * dist * Math.cos(pitch), y: dist * Math.sin(pitch), z: tz - Math.cos(yaw) * dist * Math.cos(pitch) };
    }
    function buildPan(dx, dz) {
      const R = lotsR[bstate.lot]; if (!R) return;
      const yaw = Math.PI + bstate.rot * HP, fx = Math.sin(yaw), fz = Math.cos(yaw), rx = -fz, rz = fx;
      bstate.panX = clamp(bstate.panX + rx * dx - fx * dz, -R.w / 2 - 8, R.w / 2 + 8);
      bstate.panZ = clamp(bstate.panZ + rz * dx - fz * dz, -R.d / 2 - 8, R.d / 2 + 8);
    }
    // Verschieben in Weltmetern (für „Greifen“ mit Finger/Maus: der Punkt unter dem Finger bleibt unter dem Finger)
    function buildPanWorld(dx, dz) {
      const R = lotsR[bstate.lot]; if (!R) return;
      bstate.panX = clamp(bstate.panX + (+dx || 0), -R.w / 2 - 8, R.w / 2 + 8);
      bstate.panZ = clamp(bstate.panZ + (+dz || 0), -R.d / 2 - 8, R.d / 2 + 8);
    }
    function buildZoom(f) { const t = buildTarget(); if (!t) return; f = +f || 1; bstate.zoom = clamp(bstate.zoom / f, 7, 70); }
    function buildRotate(dir) { bstate.rot = ((bstate.rot + (dir < 0 ? -1 : 1)) % 4 + 4) % 4; }
    function cineStart(distId, sec) {
      const d = distId === 'plaza' ? { cx: 0, cz: 0 } : (D.districts.find(x => x.id === distId) || { cx: 0, cz: 0 });
      cine.on = true; cine.t = 0; cine.dur = Math.max(1, +sec || 4); cine.x = d.cx; cine.z = d.cz; if (mode !== 'cine') cine.prev = mode === 'mg' ? 'follow' : mode; mode = 'cine';
    }
    function updateCamera(dt) {
      const k = cam.snap ? 1 : 1 - Math.exp(-dt * (mode === 'build' ? 14 : 6));
      let px, py, pz, lx, ly, lz, fov = 55;
      if (mode === 'build') {
        const t = buildTarget(); if (!t) { mode = 'follow'; return updateCamera(dt); }
        px = t.x; py = t.y; pz = t.z; lx = t.tx; ly = 0; lz = t.tz; fov = 40;
      } else if (mode === 'cine') {
        cine.t += dt; const u = cine.t / cine.dur, a = -2.4 + u * 1.2;
        px = cine.x + Math.sin(a) * 46; pz = cine.z + Math.cos(a) * 46; py = 26 - u * 6; lx = cine.x; ly = 2; lz = cine.z; fov = 50;
        if (cine.t >= cine.dur) { cine.on = false; mode = cine.prev || 'follow'; cam.snap = true; }
      } else {
        if (!player) return;
        const fx = Math.sin(cam.yaw), fz = Math.cos(cam.yaw);
        px = player.x - fx * cam.dist; pz = player.z - fz * cam.dist; py = cam.h + nav.heightAt(player.x, player.z);
        lx = player.x + fx * 1.5; ly = 1.2; lz = player.z + fz * 1.5;
      }
      if (cam.snap) { cam.pos.set(px, py, pz); cam.look.set(lx, ly, lz); cam.snap = false; }
      else { cam.pos.x = lerp(cam.pos.x, px, k); cam.pos.y = lerp(cam.pos.y, py, k); cam.pos.z = lerp(cam.pos.z, pz, k); cam.look.x = lerp(cam.look.x, lx, k); cam.look.y = lerp(cam.look.y, ly, k); cam.look.z = lerp(cam.look.z, lz, k); }
      camera.position.copy(cam.pos); camera.lookAt(cam.look);
      if (camera.fov !== fov) { camera.fov = lerp(camera.fov, fov, Math.min(1, k * 2 + (Math.abs(camera.fov - fov) < 0.2 ? 1 : 0))); camera.updateProjectionMatrix(); }
      camera.updateMatrixWorld();
      if (QUAL[quality].shadows && player) { sun.target.position.set(player.x, 0, player.z); sun.position.set(player.x + sunDir.x * 60, sunDir.y * 60, player.z + sunDir.z * 60); sun.target.updateMatrixWorld(); }
    }

    // ── Zeit, Tag/Nacht ──
    const sunDir = new T.Vector3(0.4, 0.8, 0.3);
    const C = { daySky: new T.Color('#8fd3ff'), nightSky: new T.Color('#1b2347'), dusk: new T.Color('#ffa86b'), tmp: new T.Color(), glassDay: new T.Color('#a8d8f0'), glassNight: new T.Color('#ffcf6b'), lampOff: new T.Color('#9a9580'), lampOn: new T.Color('#fff1b0'), sunDay: new T.Color('#fff6e8'), sunDusk: new T.Color('#ffb070'), moon: new T.Color('#8fa8ff') };
    let nightF = 0;
    function setTime(min) {
      min = ((+min || 0) % 1440 + 1440) % 1440; curMin = min;
      const h = min / 60, e = clamp(Math.sin((h - 6) / 14 * Math.PI), -0.5, 1);
      const day = smooth(-0.12, 0.3, e), dusk = clamp(1 - Math.abs(e - 0.05) / 0.25, 0, 1);
      nightF = 1 - day;
      C.tmp.copy(C.nightSky).lerp(C.daySky, day).lerp(C.dusk, dusk * 0.45);
      scene.background.copy(C.tmp); scene.fog.color.copy(C.tmp);
      const az = (h - 6) / 14 * Math.PI;
      sunDir.set(Math.cos(az) * 0.7, Math.max(0.3, e), 0.6).normalize();
      sun.position.set((player ? player.x : 0) + sunDir.x * 60, sunDir.y * 60, (player ? player.z : 0) + sunDir.z * 60);
      sun.intensity = 0.16 + 0.56 * day; sun.color.copy(day > 0.05 ? C.sunDay : C.moon).lerp(C.sunDusk, dusk * 0.6);
      hemi.intensity = 0.5 + 0.2 * day; hemi.color.setRGB(lerp(0.62, 1, day), lerp(0.68, 1, day), lerp(0.95, 1, day));
      mats.glass.color.copy(C.glassDay).lerp(C.glassNight, smooth(0.35, 0.8, nightF));
      mats.lamp.color.copy(C.lampOff).lerp(C.lampOn, smooth(0.3, 0.7, nightF));
      mats.pool.opacity = 0.42 * smooth(0.35, 0.8, nightF); if (poolMesh) poolMesh.visible = mats.pool.opacity > 0.02;
    }
    function setQuality(q) {
      if (QUAL[q]) quality = q; const Q = QUAL[quality];
      camera.far = Q.far; camera.updateProjectionMatrix(); scene.fog.near = Q.fog[0]; scene.fog.far = Q.fog[1];
      if (renderer) {
        renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, Q.pr)); renderer.setSize(size.w, size.h);
        if (renderer.shadowMap.enabled !== Q.shadows) { renderer.shadowMap.enabled = Q.shadows; scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); }); }
      }
      sun.castShadow = Q.shadows;
      world.traverse(o => { if (o.isMesh) { const cast = !/^(ground|groundGlass|glass_|glow_|plazaGlow|lotGlass|lotGlow|signs)/.test(o.name); o.castShadow = Q.shadows && cast && o.name !== 'bulbs'; o.receiveShadow = Q.shadows && /^(ground|static_|plaza$|lotStatic|lotUpper)/.test(o.name); } });
      if (figSys) { figSys.group.traverse(o => { if (o.isMesh) o.castShadow = Q.shadows && o.name !== 'fig_shadow'; }); figSys.meshes.shadow.visible = !Q.shadows; }
    }

    // ── Haupt-Update ──
    function districtAt(x, z) {
      const gx = cellOf(x), gz = cellOf(z);
      if (nav.inb(gx, gz)) { const v = distMap[gz * nav.S + gx]; if (v < 8 && dists[v]) return dists[v].d.id; if (v === 8) return 'plaza'; }
      let best = 'plaza', bd = Math.max(Math.abs(x), Math.abs(z));
      dists.forEach(r => { const d = Math.max(Math.abs(x - r.d.cx), Math.abs(z - r.d.cz)); if (d < bd) { bd = d; best = r.d.id; } });
      return best;
    }
    function updateFigures() {
      if (!figSys) return;
      if (player) figSys.set(player.fig, player.x, nav.heightAt(player.x, player.z), player.z, player.ry, player.phase, player.amt, true);
      npcs.forEach(n => figSys.set(n.fig, n.x, nav.heightAt(n.x, n.z), n.z, n.ry, n.phase, n.amt, true));
      Object.keys(remotes).forEach(k => { const r = remotes[k]; figSys.set(r.fig, r.x, nav.heightAt(r.x, r.z), r.z, r.ry, r.phase, r.amt, true); });
      figSys.update(time);
    }
    function computeNear() {
      if (!player) return null;
      let best = null;
      // Figuren haben Vorrang vor Geräten in der Nähe (Gespräche sind meist das Missionsziel)
      const take = (kind, id, label, x, z, r) => { const d = Math.hypot(player.x - x, player.z - z); if (d <= r && (!best || d - (kind === 'npc' ? 0.8 : 0) < best.dist - (best.kind === 'npc' ? 0.8 : 0))) best = { kind, id, label, dist: Math.round(d * 100) / 100 }; };
      npcs.forEach(n => take('npc', n.id, n.name, n.x, n.z, 2.3));
      inter.forEach(it => take(it.kind, it.id, it.label, it.x, it.z, it.r));
      return best;
    }
    let checkT = 0;
    function update(dt, input) {
      dt = clamp(+dt || 0, 0, 0.1); input = input || {}; time += dt;
      if (!loaded) return { near: null, district: null };
      // Zustand beobachten: Bauänderungen, Freischaltungen, Uhrzeit
      checkT -= dt;
      if (checkT <= 0) {
        checkT = 0.4;
        if (st && st.lots) Object.keys(lotsR).forEach(k => { const L = st.lots[k]; if (L && lotVer[k] !== L.ver + (L.owned ? 'o' : '')) refreshLot(k); });
        if (lockKey() !== unlockKey) refreshUnlocks();
      }
      if (st && st.time && Math.abs(st.time.min - curMin) >= 1) setTime(st.time.min);
      if (typeof input.yaw === 'number' && mode === 'follow') cam.yaw += input.yaw;
      let mx = +input.mx || 0, mz = +input.mz || 0; const len = Math.hypot(mx, mz);
      if (len > 1) { mx /= len; mz /= len; }
      let moving = false;
      if (player && mode === 'follow' && len > 0.08) {
        const fx = Math.sin(cam.yaw), fz = Math.cos(cam.yaw), rx = -fz, rz = fx;
        const dx = rx * mx - fx * mz, dz = rz * mx - fz * mz, dl = Math.hypot(dx, dz) || 1;
        const sp = (input.run ? RUN : WALK) * Math.min(1, len);
        movePlayer(dx / dl * sp * dt, dz / dl * sp * dt);
        player.ry += angDiff(player.ry, Math.atan2(dx, dz)) * Math.min(1, dt * 12);
        player.phase += dt * sp * 2.2; moving = true;
      }
      if (player) {
        player.amt = lerp(player.amt, moving ? 1 : 0, Math.min(1, dt * 10));
        if (st && st.player) { st.player.x = Math.round(player.x * 100) / 100; st.player.z = Math.round(player.z * 100) / 100; st.player.ry = Math.round(player.ry * 1000) / 1000; }
      }
      updateNpcs(dt);
      Object.keys(remotes).forEach(k => { const r = remotes[k]; r.x = lerp(r.x, r.tx, Math.min(1, dt * 10)); r.z = lerp(r.z, r.tz, Math.min(1, dt * 10)); r.ry += angDiff(r.ry, r.tr) * Math.min(1, dt * 10); r.amt = lerp(r.amt, r.moving ? 1 : 0, Math.min(1, dt * 8)); r.phase += dt * 9 * r.amt; });
      updateFigures();
      updateCamera(dt);
      updateVisibility();
      updateMarkers();
      return { near: mode === 'follow' ? computeNear() : null, district: player ? districtAt(player.x, player.z) : null };
    }
    function teleport(distId) {
      if (!player) return;
      let x, z, ry;
      if (distId === 'plaza') { x = 0; z = 10; ry = Math.PI; }
      else { const d = D.districts.find(q => q.id === distId); if (!d) return; const sp = d.spawn || { x: 0, z: 14, ry: Math.PI }; x = d.cx + sp.x; z = d.cz + sp.z; ry = sp.ry || 0; }
      player.x = x; player.z = z; player.ry = ry; unstick(player);
      cam.yaw = ry; cam.snap = true; if (mode !== 'follow' && mode !== 'build') mode = 'follow';
      updateFigures(); updateCamera(0); updateVisibility();
    }

    // ── Bau-Modus: Auswahl, Vorschau, Markierung ──
    const raycaster = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(new T.Vector3(0, 1, 0), -0.05), hit = new T.Vector3();
    function groundAt(clientX, clientY) {
      const r = canvas && canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: size.w, height: size.h };
      const w = r.width || size.w, h = r.height || size.h;
      ndc.set(((clientX - r.left) / w) * 2 - 1, -((clientY - r.top) / h) * 2 + 1);
      camera.updateMatrixWorld(); raycaster.setFromCamera(ndc, camera);
      return raycaster.ray.intersectPlane(plane, hit) ? { x: hit.x, z: hit.z } : null;
    }
    function pick(clientX, clientY) {
      const R = lotsR[bstate.lot]; if (!R) return null;
      const r = canvas && canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: size.w, height: size.h };
      const w = r.width || size.w, h = r.height || size.h;
      ndc.set(((clientX - r.left) / w) * 2 - 1, -((clientY - r.top) / h) * 2 + 1);
      camera.updateMatrixWorld(); raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(plane, hit)) return null;
      const fx = hit.x - R.ox, fz = hit.z - R.oz;
      if (fx < -1.5 || fz < -1.5 || fx > R.w + 1.5 || fz > R.d + 1.5) return null;
      const x = Math.floor(fx), z = Math.floor(fz);
      const dv = Math.abs(fx - Math.round(fx)), dh = Math.abs(fz - Math.round(fz));
      const edge = dh < dv ? 'h:' + clamp(x, 0, R.w - 1) + ',' + clamp(Math.round(fz), 0, R.d) : 'v:' + clamp(Math.round(fx), 0, R.w) + ',' + clamp(z, 0, R.d - 1);
      return { lot: bstate.lot, x, z, edge, fx: Math.round(fx * 1000) / 1000, fz: Math.round(fz * 1000) / 1000, inside: x >= 0 && z >= 0 && x < R.w && z < R.d };
    }
    let ghostMesh = null, ghostFoot = null, ghostId = null, edgeMesh = null, hlMesh = null;
    function ghost(objId, o) {
      if (!objId || !D.objectById || !D.objectById[objId]) { if (ghostMesh) ghostMesh.visible = false; if (ghostFoot) ghostFoot.visible = false; ghostId = null; return; }
      const R = lotsR[bstate.lot]; if (!R) return;
      o = o || {};
      if (!ghostMesh) { ghostMesh = new T.Mesh(new T.BufferGeometry(), mats.ghost); ghostMesh.renderOrder = 5; dyn.add(ghostMesh); const fg = new T.PlaneGeometry(1, 1); fg.rotateX(-HP); ghostFoot = new T.Mesh(fg, mats.ghostFoot); ghostFoot.renderOrder = 4; dyn.add(ghostFoot); }
      if (ghostId !== objId) { const g = M.objectGeo(T, objId).all; if (g) { g.userData.shared = true; ghostMesh.geometry = g; } ghostId = objId; }
      const ob = { id: objId, x: o.x | 0, z: o.z | 0, r: (o.r | 0) & 3 }, lot = st && st.lots && st.lots[bstate.lot];
      const p = objPlacement(lot || { objs: [] }, ob, R.ox, R.oz, lot ? surfTops(lot) : null, null), sz = B.size(ob);
      ghostMesh.position.set(p.cx, p.y + 0.01, p.cz); ghostMesh.rotation.set(0, p.ry, 0); ghostMesh.visible = true;
      ghostFoot.position.set(p.cx, 0.08, p.cz); ghostFoot.scale.set(sz[0] - 0.06, 1, sz[1] - 0.06); ghostFoot.visible = true;
      const ok = o.ok !== false; mats.ghost.color.set(ok ? '#9dffb0' : '#ff7a7a'); mats.ghostFoot.color.set(ok ? '#4be08a' : '#ff4d6d');
    }
    function ghostEdge(key, kind, ok) {
      if (!key) { if (edgeMesh) edgeMesh.visible = false; return; }
      const R = lotsR[bstate.lot]; if (!R) return;
      const m = /^([hv]):(-?\d+),(-?\d+)$/.exec(String(key)); if (!m) { if (edgeMesh) edgeMesh.visible = false; return; }
      if (!edgeMesh) { edgeMesh = new T.Mesh(new T.BoxGeometry(1, 1, 1), mats.edge); edgeMesh.renderOrder = 5; dyn.add(edgeMesh); }
      const hor = m[1] === 'h', x = +m[2], z = +m[3];
      const h = kind === 'door' ? 0.14 : kind === 'none' || kind === 'erase' ? 0.3 : SPLIT_Y + 0.05, th = kind === 'door' ? 0.5 : 0.24;
      edgeMesh.position.set(hor ? R.ox + x + 0.5 : R.ox + x, h / 2, hor ? R.oz + z : R.oz + z + 0.5);
      edgeMesh.scale.set(hor ? 1.1 : th, h, hor ? th : 1.1); edgeMesh.visible = true;
      mats.edge.color.set(ok === false ? '#ff4d6d' : kind === 'window' ? '#6ef0ff' : kind === 'door' ? '#ffd36b' : kind === 'none' || kind === 'erase' ? '#ff9a3c' : '#4be08a');
    }
    function highlightCells(cells, color) {
      if (hlMesh) { dyn.remove(hlMesh); hlMesh.geometry.dispose(); hlMesh = null; }
      const R = lotsR[bstate.lot]; if (!cells || !cells.length || !R) return;
      const b = M.builder(T);
      cells.forEach(c => { if (c && c.length >= 2) b.flat(R.ox + c[0] + 0.5, 0.075, R.oz + c[1] + 0.5, 0.96, 0.96, '#ffffff'); });
      const g = b.build(); if (!g) return;
      mats.hl.color.set(color || '#ffb02e'); hlMesh = new T.Mesh(g, mats.hl); hlMesh.renderOrder = 3; dyn.add(hlMesh);
    }

    // ── Minispiel-Szene ──
    let mg = null;
    function mgScene() {
      if (!mg) mg = { THREE: T, scene: new T.Scene(), camera: new T.PerspectiveCamera(50, 16 / 9, 0.1, 500) };
      else { for (let i = mg.scene.children.length - 1; i >= 0; i--) mg.scene.remove(mg.scene.children[i]); mg.scene.background = null; mg.scene.fog = null; }
      mg.camera.aspect = 16 / 9; mg.camera.updateProjectionMatrix();
      return mg;
    }
    function renderMg() {
      if (!renderer || lost || !mg) return;
      const w = size.w, h = size.h; let vw = w, vh = Math.round(w * 9 / 16);
      if (vh > h) { vh = h; vw = Math.round(h * 16 / 9); }
      const vx = Math.floor((w - vw) / 2), vy = Math.floor((h - vh) / 2);
      renderer.setScissorTest(false); renderer.setViewport(0, 0, w, h); renderer.setClearColor(0x000000, 1); renderer.clear();
      renderer.setScissorTest(true); renderer.setScissor(vx, vy, vw, vh); renderer.setViewport(vx, vy, vw, vh);
      mg.camera.aspect = 16 / 9; mg.camera.updateProjectionMatrix();
      renderer.render(mg.scene, mg.camera);
      renderer.setScissorTest(false); renderer.setViewport(0, 0, w, h);
      lastInfo = { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
    }
    function render() {
      if (!loaded && mode !== 'mg') return;
      if (mode === 'mg') return renderMg();
      if (!renderer || lost) return;
      renderer.setScissorTest(false); renderer.setViewport(0, 0, size.w, size.h);
      renderer.render(scene, camera);
      lastInfo = { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
    }
    function resize(w, h) {
      size.w = Math.max(1, w | 0); size.h = Math.max(1, h | 0);
      camera.aspect = size.w / size.h; camera.updateProjectionMatrix();
      if (renderer) renderer.setSize(size.w, size.h);
    }

    // ── Minikarte ──
    function minimap(g, Wd, Ht, o) {
      if (!g || !loaded) return;
      o = o || {};
      const big = !!o.big, view = big ? HALF * 2 + 6 : 110, s = Math.min(Wd, Ht) / view;
      const cx = big || !player ? 0 : player.x, cz = big || !player ? 0 : player.z;
      const X = x => Wd / 2 + (x - cx) * s, Y = z => Ht / 2 + (z - cz) * s;
      g.save();
      g.fillStyle = '#5f9e52'; g.fillRect(0, 0, Wd, Ht);
      dists.forEach(r => { const lk = isLockedIdx(r.idx); g.fillStyle = lk ? '#8a8f99' : r.color; g.globalAlpha = lk ? 0.85 : 0.55; g.fillRect(X(r.rect[0]), Y(r.rect[1]), (r.rect[2] - r.rect[0]) * s, (r.rect[3] - r.rect[1]) * s); });
      g.globalAlpha = 1; g.fillStyle = '#eadfc4'; g.fillRect(X(-35), Y(-35), 70 * s, 70 * s);
      g.fillStyle = '#4a4f5d'; AVES.forEach(a => { g.fillRect(X(a - 3), Y(-HALF), 6 * s, HALF * 2 * s); g.fillRect(X(-HALF), Y(a - 3), HALF * 2 * s, 6 * s); });
      buildingRects.forEach(b => { g.fillStyle = b.col; g.fillRect(X(b.rect[0]), Y(b.rect[1]), (b.rect[2] - b.rect[0]) * s, (b.rect[3] - b.rect[1]) * s); });
      Object.keys(lotsR).forEach(k => { const R = lotsR[k]; g.strokeStyle = R.owned ? '#ff8a1e' : '#ffd36b'; g.lineWidth = Math.max(1, s * 0.8); g.strokeRect(X(R.ox), Y(R.oz), R.w * s, R.d * s); });
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(X(0), Y(0), Math.max(2, 4 * s), 0, TAU); g.fill();
      // Bushaltestellen
      dists.forEach(r => { if (!r.bus) return; const x = X(r.bus[0]), y = Y(r.bus[1]), rad = Math.max(4, 1.8 * s); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill(); g.strokeStyle = '#2a7a3a'; g.lineWidth = 1.5; g.stroke(); g.fillStyle = '#2a7a3a'; g.font = 'bold ' + Math.round(rad * 1.3) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', x, y + 0.5); });
      // Namen
      g.textAlign = 'center'; g.textBaseline = 'middle';
      const fs = big ? Math.max(9, Math.round(Math.min(Wd, Ht) / 32)) : Math.max(8, Math.round(Math.min(Wd, Ht) / 18));
      g.font = 'bold ' + fs + 'px sans-serif';
      dists.forEach(r => { const x = X(r.d.cx), y = Y(r.d.cz - (big ? 0 : 0)); if (x < -60 || y < -20 || x > Wd + 60 || y > Ht + 20) return; const lk = isLockedIdx(r.idx); g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.55)'; const t = (lk ? '🔒 ' : '') + r.d.name, maxW = Wd / 3.4;
        // Lange Namen umbrechen, damit sich benachbarte Bezirke nicht überlappen
        let lines = [t]; if (g.measureText(t).width > maxW && t.indexOf(' ') > 0) { const w = t.split(' '), h = Math.ceil(w.length / 2); lines = [w.slice(0, h).join(' '), w.slice(h).join(' ')]; }
        lines.forEach((ln, i) => { const yy = y + (i - (lines.length - 1) / 2) * fs * 1.1; g.strokeText(ln, x, yy, maxW); g.fillStyle = lk ? '#e8e8e8' : '#ffffff'; g.fillText(ln, x, yy, maxW); }); });
      if (big) { g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.strokeText('Funkplatz', X(0), Y(-14)); g.fillStyle = '#fff'; g.fillText('Funkplatz', X(0), Y(-14)); }
      // Ziel (blinkend)
      if (o.target) {
        let tp = null;
        const d = D.districts.find(q => q.id === o.target); if (d) tp = [d.cx, d.cz]; else if (o.target === 'plaza') tp = [0, 0];
        else { const n = npcs.find(q => q.id === o.target); if (n) tp = [n.x, n.z]; }
        if (tp) {
          const blink = 0.5 + 0.5 * Math.sin((Date.now() / 1000) * 6);
          let x = X(tp[0]), y = Y(tp[1]); const m = 10, inside = x > m && y > m && x < Wd - m && y < Ht - m;
          if (!inside) { const ax = Wd / 2, ay = Ht / 2, dx = x - ax, dy = y - ay, k = Math.min((Wd / 2 - m) / Math.abs(dx || 1e-6), (Ht / 2 - m) / Math.abs(dy || 1e-6)); x = ax + dx * k; y = ay + dy * k; }
          g.globalAlpha = 0.35 + 0.65 * blink; g.strokeStyle = '#ff2a6a'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, inside ? 7 + blink * 4 : 6, 0, TAU); g.stroke();
          g.fillStyle = '#ff2a6a'; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); g.globalAlpha = 1;
        }
      }
      // Spielerpfeil
      if (player) {
        const x = X(player.x), y = Y(player.z), a = player.ry, sz = Math.max(6, Math.min(Wd, Ht) / 22);
        const fx = Math.sin(a), fy = Math.cos(a), rx = -fy, ry = fx;
        g.fillStyle = '#ff8a1e'; g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath();
        g.moveTo(x + fx * sz, y + fy * sz); g.lineTo(x - fx * sz * 0.6 + rx * sz * 0.6, y - fy * sz * 0.6 + ry * sz * 0.6); g.lineTo(x - fx * sz * 0.25, y - fy * sz * 0.25); g.lineTo(x - fx * sz * 0.6 - rx * sz * 0.6, y - fy * sz * 0.6 - ry * sz * 0.6); g.closePath(); g.fill(); g.stroke();
      }
      g.restore();
    }

    // ── Weitere Spieler (optional, z. B. Online-Modus) ──
    function setRemotePlayers(list) {
      if (!figSys) return;
      const seen = {};
      (list || []).forEach(p => {
        if (!p || p.id == null) return; const k = String(p.id); seen[k] = 1;
        let r = remotes[k];
        if (!r) { const fi = figSys.add(Object.assign({ hairStyle: 'short' }, p.look || {})); if (fi < 0) return; r = remotes[k] = { fig: fi, x: +p.x || 0, z: +p.z || 0, ry: +p.ry || 0, phase: 0, amt: 0 }; }
        r.tx = +p.x || 0; r.tz = +p.z || 0; r.tr = +p.ry || 0; r.moving = !!p.moving;
      });
      Object.keys(remotes).forEach(k => { if (!seen[k]) { figSys.remove(remotes[k].fig); delete remotes[k]; } });
    }

    function stats() {
      if (renderer) return { calls: lastInfo.calls, tris: lastInfo.tris, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures };
      // ohne WebGL: sichtbare Meshes zählen (Schätzung)
      let calls = 0, tris = 0;
      scene.traverseVisible(o => { if (o.isMesh || o.isLineSegments) { const g = o.geometry; if (!g || !g.attributes.position) return; const n = (g.index ? g.index.count : g.attributes.position.count) / 3; const inst = o.isInstancedMesh ? o.count : 1; if (!inst) return; calls++; tris += n * inst; } });
      return { calls, tris: Math.round(tris) };
    }
    function dispose() {
      const all = new Set(); scene.traverse(o => { if (o.geometry) all.add(o.geometry); });
      clearWorld();
      all.forEach(g => g.dispose());
      [ghostMesh, ghostFoot, edgeMesh, hlMesh].forEach(m => { if (m) { dyn.remove(m); if (m.geometry && !(m.geometry.userData && m.geometry.userData.shared)) m.geometry.dispose(); } });
      ghostMesh = ghostFoot = edgeMesh = hlMesh = null;
      Object.keys(mats).forEach(k => { if (mats[k] && mats[k].dispose) mats[k].dispose(); });
      if (atlas.tex) atlas.tex.dispose();
      if (mg) { mg.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); mg = null; }
      M.clearCache();
      if (renderer) { canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRest); renderer.dispose(); }
      loaded = false; st = null;
    }

    const api = {
      THREE: T, renderer, scene, camera,
      load, refreshLot, refreshUnlocks, update, teleport, setCamMode, buildPan, buildZoom, buildRotate, buildDist: () => bstate.zoom, buildPanWorld, groundAt, pick, ghost, ghostEdge, highlightCells,
      cine: (distId, seconds) => { if (loaded) cineStart(distId, seconds); },
      mgScene, renderMg, render, resize, minimap, setTime, setQuality, dispose,
      onContextLost: cb => { if (typeof cb === 'function') cbLost.push(cb); },
      onContextRestored: cb => { if (typeof cb === 'function') cbRest.push(cb); },
      stats, playerPos: () => player ? { x: player.x, z: player.z, ry: player.ry, district: districtAt(player.x, player.z) } : null,
      setRemotePlayers,
      camMode: () => mode,
      // für Tests/Fehlersuche
      debug: { nav, npcs, inter, lotsR, roofs, dists, distMap, districtAt, get player() { return player; }, get figSys() { return figSys; }, mats, atlas, bstate, cam }
    };
    return api;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = W;
})(typeof window !== 'undefined' ? window : globalThis);
