// Kampf- und Zauber-Effekte (Schwertspur, Treffer-Blitz, Zauberkreis, Lichtsäule, Seelenlicht) und RPG-Klänge (WebAudio, ohne Dateien).
// Alles läuft über kleine Pools: keine neuen Geometrien/Materialien pro Treffer, nichts wächst im Speicher.
export function createFX({ T, scene, emit, audio, sndOn }) {
  const keep = new Set(), add = o => { scene.add(o); keep.add(o); };
  const ADD = { transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false };
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; };

  /* ---------- Schwertspur: Band aus den letzten Positionen von Klingenwurzel und -spitze ---------- */
  const TN = 16, tPos = new Float32Array(TN * 2 * 3), tAl = new Float32Array(TN * 2);
  const tGeo = new T.BufferGeometry(); tGeo.setAttribute('position', new T.BufferAttribute(tPos, 3)); tGeo.setAttribute('al', new T.BufferAttribute(tAl, 1));
  { const idx = []; for (let i = 0; i < TN - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } tGeo.setIndex(idx); }
  const tMat = new T.ShaderMaterial({ uniforms: { col: { value: new T.Color(0xbfe4ff) }, op: { value: 0 } }, ...ADD,
    vertexShader: 'attribute float al;varying float va;void main(){va=al;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 col;uniform float op;varying float va;void main(){gl_FragColor=vec4(col*(.85+va*.7),va*va*op*.62);}' });
  const trailM = new T.Mesh(tGeo, tMat); trailM.frustumCulled = false; trailM.renderOrder = 4; trailM.visible = false; add(trailM);
  const hist = []; let tOn = false, tFade = 0; const vA = new T.Vector3(), vB = new T.Vector3();
  function trail(sword, active, col, dt) {
    if (active && sword && sword.visible) { sword.updateWorldMatrix(true, false); vA.set(0, .28, 0); vB.set(0, 1.02, 0); sword.localToWorld(vA); sword.localToWorld(vB);
      hist.unshift([vA.x, vA.y, vA.z, vB.x, vB.y, vB.z]); if (hist.length > TN) hist.length = TN; if (!tOn) { tOn = true; tMat.uniforms.col.value.setHex(col || 0xbfe4ff); } tFade = 1; }
    else if (tOn) { tFade -= dt * 7; if (hist.length > 1) hist.pop(); if (tFade <= 0 || hist.length < 2) { tOn = false; hist.length = 0; } }
    trailM.visible = tOn && hist.length > 1; if (!trailM.visible) return;
    for (let i = 0; i < TN; i++) { const h = hist[Math.min(i, hist.length - 1)], o = i * 6; tPos.set(h, o); const a = Math.max(0, 1 - i / (hist.length - 1 || 1)); tAl[i * 2] = a * .35; tAl[i * 2 + 1] = a; }
    tGeo.attributes.position.needsUpdate = true; tGeo.attributes.al.needsUpdate = true; tMat.uniforms.op.value = Math.max(0, tFade) * .95; tGeo.computeBoundingSphere();
  }

  /* ---------- Treffer-Blitz: Sternblitz-Billboards ---------- */
  const starTex = canvasTex(128, 128, (x, w) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.18, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w);
    x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 4; i++) { x.save(); x.translate(64, 64); x.rotate(i * Math.PI / 4); x.beginPath(); x.moveTo(-64, 0); x.lineTo(0, -3.5 + (i % 2)); x.lineTo(64, 0); x.lineTo(0, 3.5 - (i % 2)); x.fill(); x.restore(); } });
  const flashes = []; for (let i = 0; i < 10; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: starTex, color: 0xffffff, ...ADD })); s.visible = false; s.renderOrder = 6; add(s); flashes.push({ s, t: 0, d: 0, sz: 1 }); }
  let fi = 0;
  function impact(x, y, z, col, big) { const f = flashes[fi++ % flashes.length]; f.s.material.color.setHex(col || 0xfff0c0); f.s.position.set(x, y, z); f.s.material.rotation = Math.random() * 3; f.t = 0; f.d = big ? .26 : .16; f.sz = big ? 3.4 : 2; f.s.visible = true;
    emit(x, y, z, col || 0xffe0a0, big ? 22 : 12, big ? 9 : 6, .35, big ? .5 : .35, 9); }

  /* ---------- Zauberkreis am Boden ---------- */
  const runeTex = canvasTex(256, 256, (x) => { x.translate(128, 128); x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 120, 0, 6.283); x.stroke(); x.lineWidth = 2.5; x.beginPath(); x.arc(0, 0, 100, 0, 6.283); x.stroke(); x.beginPath(); x.arc(0, 0, 54, 0, 6.283); x.stroke();
    for (let k = 0; k < 2; k++) { x.beginPath(); for (let i = 0; i <= 3; i++) { const a = i * 2.094 + k * 1.047 - 1.57; x[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 100, Math.sin(a) * 100); } x.stroke(); }
    x.font = 'bold 20px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; const R = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊ'; for (let i = 0; i < 16; i++) { x.save(); x.rotate(i * .3927); x.fillText(R[i], 0, -110); x.restore(); } });
  const circs = []; for (let i = 0; i < 3; i++) { const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: runeTex, color: 0xffffff, ...ADD, opacity: 0 })); m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 3; add(m); circs.push({ m, t: 0, d: 0, r: 1 }); }
  let ci = 0;
  function circle(x, y, z, col, r, d) { const c = circs[ci++ % circs.length]; c.m.material.color.setHex(col); c.m.position.set(x, y + .06, z); c.t = 0; c.d = d || .9; c.r = r || 3; c.m.visible = true; }

  /* ---------- Lichtsäule (Stufenaufstieg, Heilung, Speichern, Truhe) ---------- */
  const beamTex = canvasTex(4, 128, (x) => { const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.6, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, 4, 128); });
  const beams = []; for (let i = 0; i < 2; i++) { const m = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 24, 1, true), new T.MeshBasicMaterial({ map: beamTex, color: 0xffffff, ...ADD, opacity: 0 })); m.visible = false; m.renderOrder = 3; add(m); beams.push({ m, t: 0, d: 0, r: 1, h: 1, ox: null }); }
  let bi = 0;
  function pillar(x, y, z, col, r, h, d, follow) { const b = beams[bi++ % beams.length]; b.m.material.color.setHex(col); b.m.position.set(x, y + h / 2, z); b.t = 0; b.d = d || 1.4; b.r = r || 1; b.h = h || 6; b.f = follow || null; b.y0 = y; b.m.visible = true;
    emit(x, y + .3, z, col, 26, 3.5, 1.1, .55, -4); }

  /* ---------- Seelenlicht beim Besiegen ---------- */
  const souls = []; for (let i = 0; i < 6; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: starTex, color: 0xffffff, ...ADD })); s.visible = false; add(s); souls.push({ s, t: 0 }); }
  let si = 0;
  function soul(x, y, z, col) { const o = souls[si++ % souls.length]; o.s.material.color.setHex(col || 0xbfd8ff); o.s.position.set(x, y, z); o.t = 0; o.s.visible = true; impact(x, y, z, col, true); }

  function update(dt, camera) {
    for (const f of flashes) if (f.s.visible) { f.t += dt; const k = f.t / f.d; if (k >= 1) { f.s.visible = false; continue; } const s = f.sz * (.5 + k * .9); f.s.scale.set(s, s, 1); f.s.material.opacity = 1 - k * k; }
    for (const c of circs) if (c.m.visible) { c.t += dt; const k = c.t / c.d; if (k >= 1) { c.m.visible = false; continue; } const s = c.r * 2 * (k < .2 ? k / .2 : 1) * (1 + k * .08); c.m.scale.set(s, s, 1); c.m.rotation.z += dt * 1.6; c.m.material.opacity = (k < .2 ? k / .2 : 1 - (k - .2) / .8) * .95; }
    for (const b of beams) if (b.m.visible) { b.t += dt; const k = b.t / b.d; if (k >= 1) { b.m.visible = false; continue; } if (b.f) b.m.position.set(b.f.x, b.y0 + b.h / 2, b.f.z); const w = b.r * (k < .15 ? k / .15 : 1 - (k - .15) * .7); b.m.scale.set(w, b.h * (k < .15 ? k / .15 : 1), w); b.m.rotation.y += dt * 2; b.m.material.opacity = (k < .15 ? 1 : 1 - (k - .15) / .85) * .38; }
    for (const o of souls) if (o.s.visible) { o.t += dt; if (o.t > 1.2) { o.s.visible = false; continue; } o.s.position.y += dt * 2.6; o.s.position.x += Math.sin(o.t * 9) * dt * .6; const s = .9 - o.t * .5; o.s.scale.set(s, s, 1); o.s.material.opacity = 1 - o.t / 1.2; }
  }

  /* ================= Klänge ================= */
  let NB = null, VERB = null, VIN = null, DRY = null;
  const A = () => { const a = audio(); if (!a.AC || !sndOn()) return null; const AC = a.AC;
    if (!VERB || VERB.context !== AC) { // kleiner Hall für Zauber, Fanfaren und Glocken
      VERB = AC.createConvolver(); const L = AC.sampleRate * 1.8 | 0, b = AC.createBuffer(2, L, AC.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 2.6); } VERB.buffer = b;
      VIN = AC.createGain(); VIN.gain.value = .5; const out = AC.createGain(); out.gain.value = .45; VIN.connect(VERB); VERB.connect(out); out.connect(a.master); DRY = a.master;
      NB = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const n = NB.getChannelData(0); for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1; }
    return AC; };
  const env = (AC, g, t, a, v, d) => { g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + d); };
  // Rauschen durch Filter mit Frequenzfahrt (Schwung, Wind, Puff, Knall)
  function nz(d, v, type, f0, f1, q, at, wet, delay) { const AC = A(); if (!AC) return; const t = AC.currentTime + (delay || 0), s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = NB; fl.type = type; fl.Q.value = q || 1; fl.frequency.setValueAtTime(f0, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + d); env(AC, g, t, at || .01, v, d);
    s.connect(fl); fl.connect(g); g.connect(DRY); if (wet) { const w = AC.createGain(); w.gain.value = wet; g.connect(w); w.connect(VIN); } s.start(t, Math.random() * .5); s.stop(t + d + .05); }
  function os(f, d, type, v, f1, at, wet, delay, det) { const AC = A(); if (!AC) return; const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + d); if (det) o.detune.value = det; env(AC, g, t, at || .005, v, d);
    o.connect(g); g.connect(DRY); if (wet) { const w = AC.createGain(); w.gain.value = wet; g.connect(w); w.connect(VIN); } o.start(t); o.stop(t + d + .05); }
  // weicher Blechbläser-Ton (Sägezahn durch sich öffnenden Tiefpass) für Fanfaren
  function brass(f, d, v, delay) { const AC = A(); if (!AC) return; const t = AC.currentTime + (delay || 0); for (const dt of [-6, 6]) { const o = AC.createOscillator(), fl = AC.createBiquadFilter(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt;
    fl.type = 'lowpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(f * 5, t + .08); fl.frequency.exponentialRampToValueAtTime(f * 2.2, t + d); env(AC, g, t, .03, v, d);
    o.connect(fl); fl.connect(g); g.connect(DRY); const w = AC.createGain(); w.gain.value = .5; g.connect(w); w.connect(VIN); o.start(t); o.stop(t + d + .05); } }
  let stepAlt = 0;
  const SND = {
    slash() { const p = .9 + Math.random() * .25; nz(.2, .32, 'bandpass', 500 * p, 4200 * p, 2.2, .05); nz(.12, .1, 'highpass', 5000, 0, .7, .02); },
    heavy() { nz(.32, .38, 'bandpass', 260, 2600, 1.6, .09); os(140, .3, 'sine', .12, 70, .05); },
    hit() { os(150 + Math.random() * 30, .14, 'sine', .42, 48); nz(.07, .38, 'lowpass', 2400, 500, .8, .002); nz(.03, .2, 'highpass', 3500, 0, .7, .001); },
    crit() { SND.hit(); for (const [f, v] of [[1320, .07], [1979, .05], [2797, .035]]) os(f, .5, 'sine', v, 0, .002, .7); nz(.18, .2, 'bandpass', 3000, 6000, 3, .003); },
    hurt() { os(320, .22, 'sawtooth', .07, 140, .01); nz(.16, .32, 'lowpass', 900, 200, 1, .003); os(90, .18, 'sine', .3, 45); },
    die() { nz(.5, .3, 'lowpass', 2600, 160, 1.2, .01, .3); os(260, .45, 'triangle', .12, 70, .01, .4); for (let i = 0; i < 3; i++) os(880 + i * 330, .35, 'sine', .04, 0, .01, .8, .12 + i * .06); },
    dodge() { nz(.28, .26, 'bandpass', 2600, 600, 1.4, .06); },
    jump() { nz(.18, .14, 'bandpass', 700, 2200, 1.5, .03); },
    land() { os(110, .12, 'sine', .22, 50); nz(.08, .12, 'lowpass', 600, 150, .7, .003); },
    step() { stepAlt ^= 1; nz(.06, .07, 'lowpass', stepAlt ? 340 : 280, 120, 1.2, .004); },
    pick() { os(1568, .12, 'triangle', .14); os(2093, .28, 'triangle', .12, 0, .005, .4, .07); },
    shard() { os(2349, .2, 'sine', .08, 0, .003, .6); os(3136, .25, 'sine', .06, 0, .003, .6, .05); },
    level() { const c = [[523, 0], [659, .13], [784, .26], [1047, .42]]; for (const [f, d] of c) brass(f, d === .42 ? 1.1 : .32, .11, d); brass(392, 1.4, .07, .42); for (let i = 0; i < 6; i++) os(2093 * (1 + i * .12), .5, 'sine', .035, 0, .01, .9, .5 + i * .05); },
    heal() { for (const [f, d] of [[784, 0], [988, .07], [1175, .14], [1568, .21]]) os(f, .7, 'sine', .1, 0, .01, .8, d); nz(.6, .05, 'highpass', 6000, 0, .7, .2, .6); },
    skill1() { nz(.55, .26, 'bandpass', 3200, 900, .8, .15, .3); for (let i = 0; i < 4; i++) os(330 + i * 110, .25, 'triangle', .05, 0, .01, .4, i * .05); },   // Natur: Rascheln und Zupfen
    skill2() { for (const f of [1568, 2093, 2637, 3136]) os(f, .9, 'sine', .05, 0, .002, 1, Math.random() * .08); nz(.3, .12, 'highpass', 4000, 9000, .7, .01, .5); },   // Eis/Wind: Klirren
    fire() { nz(.6, .34, 'lowpass', 300, 2600, 1.2, .08, .2); for (let i = 0; i < 6; i++) nz(.03, .12, 'highpass', 3000, 0, .7, .001, 0, .08 + Math.random() * .4); },
    thunder() { nz(.08, .5, 'highpass', 2000, 0, .7, .001); nz(1.1, .4, 'lowpass', 900, 60, .7, .02, .4, .05); },
    light() { for (let i = 0; i < 8; i++) os(1800 + Math.random() * 2200, .8, 'sine', .03, 0, .02, 1, i * .04, (Math.random() - .5) * 30); },
    cast() { os(220, .5, 'triangle', .08, 660, .1, .6); nz(.5, .1, 'bandpass', 800, 3000, 2, .2, .5); },
    roar() { const AC = A(); if (!AC) return; os(95, 1.1, 'sawtooth', .22, 48, .08, .3); os(142, 1, 'sawtooth', .12, 70, .1, .3); nz(1, .32, 'lowpass', 700, 150, 1.4, .1, .3); },
    quest() { brass(523, .25, .08); brass(784, .6, .09, .14); os(1568, .6, 'sine', .04, 0, .01, .8, .14); },
    chest() { os(130, .35, 'sawtooth', .04, 190, .05); nz(.25, .08, 'bandpass', 900, 500, 6, .05); for (let i = 0; i < 5; i++) os([1047, 1319, 1568, 2093, 2637][i], .5, 'sine', .07, 0, .005, .8, .25 + i * .07); },
    ui() { os(880, .05, 'triangle', .07); },
    ok() { os(988, .06, 'triangle', .08); os(1319, .1, 'triangle', .07, 0, .003, .2, .05); },
    back() { os(660, .06, 'triangle', .07); os(494, .1, 'triangle', .06, 0, .003, 0, .05); },
    bell() { for (const [f, v] of [[392, .14], [784, .08], [1176, .05], [1567, .03], [2350, .02]]) os(f, 2.4, 'sine', v, 0, .003, 1); },
    portal() { os(180, 1.4, 'sine', .12, 720, .3, .9); for (let i = 0; i < 6; i++) os(1200 + i * 240, 1, 'sine', .025, 0, .1, 1, .3 + i * .1); nz(1.2, .12, 'bandpass', 400, 4000, 2, .4, .7); },
  };
  function snd(n) { const f = SND[n]; if (!f) return false; try { f(); } catch (e) { } return true; }
  return { trail, impact, circle, pillar, soul, update, snd, keep };
}
