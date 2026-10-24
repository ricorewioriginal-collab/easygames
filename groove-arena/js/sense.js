/* Groove Arena – Sensoren: Kamera mit Körper-Erkennung (MediaPipe Pose „lite“, lokal aus ../vendor/mediapipe-pose/ – es wird kein Bild
 * hochgeladen), Handy-Bewegung (Beschleunigungssensor) und Mikrofon-Takt (Onsets aus dem Spektrum für GACore.tempo). */
(function () {
  'use strict';
  const MP = '../vendor/mediapipe-pose/';
  /* ---------- Kamera + Körper-Erkennung ---------- */
  const Cam = { on: false, lm: null, at: 0, fps: 0, video: null, stream: null, err: '', busy: false, aspect: 4 / 3, frames: 0 };
  let pose = null, loadP = null;
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('script')); document.head.appendChild(s); }); }
  async function initPose() { if (pose) return pose; if (loadP) return loadP; loadP = (async () => { if (!window.Pose) await loadScript(MP + 'pose.js'); pose = new window.Pose({ locateFile: f => MP + f }); pose.setOptions({ modelComplexity: 0, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: .5, minTrackingConfidence: .5, selfieMode: false });
    pose.onResults(r => { Cam.busy = false; Cam.frames++; const now = performance.now(); if (Cam.at) Cam.fps = Cam.fps * .9 + 100 / Math.max(10, now - Cam.at); Cam.at = now; Cam.lm = r.poseLandmarks || null; if (Cam.onPose) Cam.onPose(Cam.lm); }); await pose.initialize(); return pose; })(); return loadP; }
  Cam.start = async function (videoEl) {
    Cam.err = ''; Cam.video = videoEl;
    try { Cam.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }); } catch (e) { Cam.err = e && e.name === 'NotAllowedError' ? 'Kamera nicht erlaubt' : 'Keine Kamera gefunden'; throw e; }
    videoEl.srcObject = Cam.stream; videoEl.muted = true; videoEl.playsInline = true; await videoEl.play().catch(() => { });
    await initPose(); Cam.on = true; const tick = async () => { if (!Cam.on) return; if (!Cam.busy && videoEl.readyState >= 2) { Cam.busy = true; Cam.aspect = (videoEl.videoWidth || 4) / (videoEl.videoHeight || 3); try { await pose.send({ image: videoEl }); } catch (e) { Cam.busy = false; } } setTimeout(tick, 33); }; tick();
  };
  Cam.stop = function () { Cam.on = false; Cam.lm = null; if (Cam.stream) Cam.stream.getTracks().forEach(t => t.stop()); Cam.stream = null; if (Cam.video) Cam.video.srcObject = null; };
  Cam.preload = () => initPose().catch(() => null);
  // Bewegungsstärke (für die Rhythmus-Bewertung)
  let prevLm = null; Cam.energy = function () { const lm = Cam.lm; if (!lm) { prevLm = null; return 0; } let e = 0; if (prevLm) for (const i of [13, 14, 15, 16, 25, 26, 27, 28, 0]) e += Math.hypot(lm[i].x - prevLm[i].x, lm[i].y - prevLm[i].y); prevLm = lm.map(p => ({ x: p.x, y: p.y })); return e; };

  /* ---------- Handy-Bewegung ---------- */
  const Motion = { on: false, buf: [], last: 0, perm: 'unknown' };
  function onMotion(e) { const a = e.acceleration && e.acceleration.x !== null ? e.acceleration : null, g = e.accelerationIncludingGravity; let m;
    if (a) m = Math.hypot(a.x || 0, a.y || 0, a.z || 0); else if (g) { m = Math.abs(Math.hypot(g.x || 0, g.y || 0, g.z || 0) - 9.81); } else return;
    const t = performance.now() / 1000; Motion.buf.push({ t, m }); Motion.last = t; if (Motion.buf.length > 600) Motion.buf.splice(0, 200); }
  Motion.start = async function () { if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') { try { Motion.perm = await DeviceMotionEvent.requestPermission(); } catch (e) { Motion.perm = 'denied'; } if (Motion.perm !== 'granted') throw new Error('perm'); } addEventListener('devicemotion', onMotion); Motion.on = true; };
  Motion.stop = function () { removeEventListener('devicemotion', onMotion); Motion.on = false; Motion.buf = []; };
  // Verlauf zwischen zwei Zeitpunkten (performance-Zeit, s) auf festes Raster (Hz) gebracht
  Motion.series = function (t0, t1, hz) { const o = [], b = Motion.buf; let j = 0; for (let t = t0; t <= t1 + 1e-9; t += 1 / hz) { while (j + 1 < b.length && b[j + 1].t <= t) j++; let m = 0, c = 0; for (let k = Math.max(0, j - 2); k < Math.min(b.length, j + 3); k++) if (Math.abs(b[k].t - t) < 1 / hz) { m += b[k].m; c++; } o.push(c ? m / c : 0); } return o; };
  Motion.alive = () => Motion.on && performance.now() / 1000 - Motion.last < 1.5;

  /* ---------- Mikrofon-Takt ---------- */
  const Mic = { on: false, samples: [], err: '', level: 0 };
  let ac = null, an = null, src = null, stream = null, prev = null, raf = 0, getT = null;
  Mic.start = async function (timeFn) {
    getT = timeFn; Mic.samples = []; prev = null;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false }); } catch (e) { Mic.err = 'Mikrofon nicht erlaubt'; throw e; }
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') await ac.resume().catch(() => { });
    src = ac.createMediaStreamSource(stream); an = ac.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = 0; src.connect(an); Mic.on = true;
    const bins = new Float32Array(an.frequencyBinCount), loop = () => { if (!Mic.on) return; an.getFloatFrequencyData(bins); let flux = 0, lvl = 0; const lim = Math.min(bins.length, 200);
      for (let i = 1; i < lim; i++) { const v = Math.pow(10, bins[i] / 20); lvl += v; if (prev) { const d = v - prev[i]; if (d > 0) flux += d * (i < 12 ? 2.2 : 1); } }
      prev = prev || new Float32Array(bins.length); for (let i = 1; i < lim; i++) prev[i] = Math.pow(10, bins[i] / 20);
      Mic.level = Mic.level * .9 + lvl * .1; const t = getT(); if (t > 0) Mic.samples.push({ t, v: flux }); if (Mic.samples.length > 60 * 20) Mic.samples.splice(0, 60 * 4); raf = requestAnimationFrame(loop); }; loop();
  };
  Mic.stop = function () { Mic.on = false; cancelAnimationFrame(raf); try { src && src.disconnect(); } catch (e) { } if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; };
  Mic.estimate = () => GACore.tempo(Mic.samples.filter(s => s.t > (Mic.samples.length ? Mic.samples[Mic.samples.length - 1].t - 14 : 0)));
  window.GASense = { Cam, Motion, Mic };
})();
