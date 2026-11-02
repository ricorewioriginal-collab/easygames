/* Funk-Survivor – Ton: alle Klänge und die Musik entstehen live mit WebAudio (keine Dateien).
 * Musik: 128 BPM Synthwave mit Kick, Hi-Hat, Bass, Akkorden und Melodie; wird mit der Spannung (Zeit, Boss) dichter. */
(function (root) {
  'use strict';
  const S = { sfxOn: true, musicOn: true, vol: .9 };
  let unlocked = false, AC = null, master = null, comp = null, sfxBus = null, musBus = null, nb = null, mus = null, last = {}, inten = 0, sidechain = null;

  function ctx() {
    if (!unlocked) return null;
    if (!AC) {
      const C = root.AudioContext || root.webkitAudioContext; if (!C) return null; AC = new C();
      comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5; comp.attack.value = .004; comp.release.value = .18;
      master = AC.createGain(); master.gain.value = S.vol; master.connect(comp); comp.connect(AC.destination);
      sfxBus = AC.createGain(); sfxBus.gain.value = .9; sfxBus.connect(master); musBus = AC.createGain(); musBus.gain.value = .5; musBus.connect(master);
      sidechain = AC.createGain(); sidechain.connect(musBus);
    }
    if (AC.state === 'suspended') AC.resume(); return AC;
  }
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function noiseBuf() { if (nb) return nb; const n = AC.sampleRate * 1.5, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return (nb = b); }
  function tone(f, d, vol, type, f2, at, dest, att) {
    const t = AC.currentTime + (at || 0), o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || .004)); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(dest || sfxBus); o.start(t); o.stop(t + d + .03);
  }
  function noise(d, f, vol, f2, at, type, dest, q) {
    const t = AC.currentTime + (at || 0), s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = noiseBuf(); fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + d); if (q) fl.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(g); g.connect(dest || sfxBus); s.start(t, Math.random()); s.stop(t + d + .03);
  }
  const gate = (k, ms) => { const n = performance.now(); if (last[k] && n - last[k] < ms) return false; last[k] = n; return true; };

  S.unlock = function () { unlocked = true; ctx(); };
  S.sfx = function (k, p) {
    if (!S.sfxOn || !ctx()) return; p = p || 0;
    try {
      switch (k) {
        case 'move': tone(720, .04, .05, 'square'); break;
        case 'ok': tone(520, .07, .08, 'square'); tone(780, .1, .07, 'square', 0, .05); break;
        case 'back': tone(380, .09, .06, 'square', 240); break;
        case 'bump': tone(160, .09, .1, 'triangle', 100); break;
        case 'shoot': if (gate('sh', 70)) { tone(900, .08, .05, 'sawtooth', 300); noise(.05, 4000, .04, 1500, 0, 'highpass'); } break;
        case 'rakete': if (gate('rk', 120)) { noise(.35, 900, .12, 3000, 0, 'bandpass', null, 2); tone(220, .3, .06, 'sawtooth', 600); } break;
        case 'hit': if (gate('hit', 45)) tone(200 + Math.random() * 80, .05, .035, 'triangle', 90); break;
        case 'kill': if (gate('kill', 35)) { noise(.1, 1800, .05, 300); tone(300 + Math.random() * 120, .08, .04, 'square', 90); } break;
        case 'gem': if (gate('gem', 30)) tone(780 * Math.pow(2, Math.min(12, p) / 12), .09, .035, 'sine', 0, 0, null, .003); break;
        case 'coin': tone(988, .06, .07, 'square'); tone(1319, .16, .07, 'square', 0, .06); break;
        case 'heal': [0, 4, 7, 12].forEach((s, i) => tone(hz(72 + s), .2, .06, 'triangle', 0, i * .06)); break;
        case 'magnet': tone(300, .5, .12, 'sawtooth', 1200); noise(.5, 500, .1, 3000, 0, 'bandpass', null, 3); break;
        case 'dash': noise(.22, 800, .18, 4500, 0, 'bandpass', null, 1.5); tone(260, .18, .07, 'sine', 700); break;
        case 'nova': if (gate('nv', 120)) { tone(130, .5, .22, 'sine', 40); noise(.4, 3000, .12, 300); tone(520, .35, .05, 'sawtooth', 130); } break;
        case 'bolt': if (gate('bl', 80)) { noise(.16, 6000, .1, 1200, 0, 'highpass'); tone(1400, .14, .06, 'sawtooth', 200); } break;
        case 'lob': if (gate('lb', 100)) tone(180, .4, .08, 'sine', 500); break;
        case 'boom': tone(90, .6, .3, 'sine', 30); noise(.55, 1600, .3, 120); break;
        case 'bigboom': tone(70, 1, .4, 'sine', 24); noise(1, 2200, .4, 90); tone(140, .7, .2, 'sawtooth', 40); break;
        case 'disc': if (gate('dc', 60)) tone(1500, .05, .03, 'triangle', 800); break;
        case 'eshoot': if (gate('es', 90)) tone(420, .1, .04, 'square', 180); break;
        case 'hurt': tone(140, .3, .22, 'sawtooth', 50); noise(.25, 1200, .2, 200); break;
        case 'warn': for (let i = 0; i < 3; i++) tone(880, .1, .07, 'square', 0, i * .2); break;
        case 'roar': tone(80, 1, .22, 'sawtooth', 50); tone(120, 1, .12, 'square', 70); noise(.9, 600, .16, 120); break;
        case 'quake': tone(60, .8, .3, 'sine', 25); noise(.7, 700, .22, 100); break;
        case 'boss': [0, -3, -5].forEach((s, i) => tone(hz(45 + s), .8, .2, 'sawtooth', hz(45 + s) * .7, i * .35)); break;
        case 'levelup': [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(hz(72 + s), .26, .07, 'triangle', 0, i * .055)); break;
        case 'pick': [0, 7, 12].forEach((s, i) => tone(hz(76 + s), .18, .07, 'square', 0, i * .05)); break;
        case 'chest': [0, 4, 7, 12, 16, 19, 24, 28].forEach((s, i) => tone(hz(67 + s), .35, .07, 'triangle', 0, i * .07)); noise(.5, 5000, .08, 2000, 0, 'highpass'); break;
        case 'revive': tone(100, 1, .3, 'sine', 800); [0, 4, 7, 12].forEach((s, i) => tone(hz(60 + s), .6, .08, 'triangle', 0, .4 + i * .08)); break;
        case 'win': [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((s, i) => tone(hz(64 + s), .4, .09, 'square', 0, i * .12)); break;
        case 'lose': [7, 4, 0, -5].forEach((s, i) => tone(hz(60 + s), .45, .09, 'sawtooth', hz(60 + s) * .9, i * .22)); break;
        case 'buy': [0, 4, 7, 12, 16].forEach((s, i) => tone(hz(72 + s), .16, .08, 'square', 0, i * .06)); break;
      }
    } catch (e) { }
  };

  /* ---------- Musik ---------- */
  const BPM = 128, STEP = 60 / BPM / 4;
  const CH = [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -2, 2]], ROOT = [45, 41, 43, 38];   // a-Moll, F, G, D (Bässe)
  function kick(t) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .14); g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.001, t + .26); o.connect(g); g.connect(musBus); o.start(t); o.stop(t + .3); sidechain.gain.cancelScheduledValues(t); sidechain.gain.setValueAtTime(.35, t); sidechain.gain.linearRampToValueAtTime(1, t + .22); }
  function hat(t, o, v) { const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = noiseBuf(); fl.type = 'highpass'; fl.frequency.value = 7000; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + (o ? .12 : .04)); s.connect(fl); fl.connect(g); g.connect(musBus); s.start(t, Math.random()); s.stop(t + .15); }
  function snare(t) { const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = noiseBuf(); fl.type = 'bandpass'; fl.frequency.value = 1900; g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .2); s.connect(fl); fl.connect(g); g.connect(musBus); s.start(t, Math.random()); s.stop(t + .24); const o = AC.createOscillator(), g2 = AC.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(110, t + .1); g2.gain.setValueAtTime(.3, t); g2.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g2); g2.connect(musBus); o.start(t); o.stop(t + .15); }
  function syn(f, t, d, vol, type, cut, dest) { const o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), fl = AC.createBiquadFilter(); o.type = o2.type = type; o.frequency.value = f; o2.frequency.value = f * 1.006; fl.type = 'lowpass'; fl.frequency.setValueAtTime(cut, t); fl.frequency.exponentialRampToValueAtTime(Math.max(200, cut * .3), t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(dest || sidechain); o.start(t); o2.start(t); o.stop(t + d + .05); o2.stop(t + d + .05); }
  const MEL = [12, -1, 7, -1, 10, 7, -1, 3, 12, -1, 15, 12, 10, -1, 7, -1, 8, -1, 12, -1, 15, 12, -1, 8, 7, -1, 10, 7, 3, -1, 0, -1];
  function sched() {
    if (!mus) return; const now = AC.currentTime;
    while (mus.next < now + .25) {
      const t = mus.next, s = mus.step, bar = Math.floor(s / 16) % 4, st = s % 16, game = mus.mode === 'game', I = inten, boss = I > .85;
      if (game) {
        if (st % 4 === 0) kick(t); if (st % 4 === 2) hat(t, true, .12 + I * .08); if (I > .25 && st % 2 === 1) hat(t, false, .05); if (I > .4 && (st === 4 || st === 12)) snare(t);
        const rt = ROOT[bar]; if (st % 2 === 0 || I > .6) syn(hz(rt + (st % 4 === 3 ? 12 : 0)), t, STEP * 1.8, .32, 'sawtooth', 700 + I * 900, sidechain);
        if (st === 0) CH[bar].forEach(n => syn(hz(57 + n), t, STEP * 15, .075, 'sawtooth', 1400 + I * 1600));
        if (I > .2 && st % 2 === 0) { const a = [0, 7, 12, 7][st / 2 % 4 | 0]; syn(hz(69 + CH[bar][0] + a), t, STEP * 1.5, .06, 'square', 2600 + I * 2000); }
        if (I > .5) { const m = MEL[(s % 32)]; if (m >= 0) syn(hz(72 + m - 12 + (boss ? 0 : 0)), t, STEP * 2.2, .085, 'sawtooth', 3600); }
      } else {
        if (st === 0) { CH[bar].forEach(n => syn(hz(57 + n), t, STEP * 15, .09, 'sawtooth', 1100)); syn(hz(ROOT[bar] + 12), t, STEP * 15, .12, 'sine', 800); }
        if (st % 4 === 0) { const a = [0, 7, 12, 15][(st / 4 + bar) % 4 | 0]; syn(hz(69 + CH[bar][0] + a), t, STEP * 3, .06, 'triangle', 2400); }
        if (st === 0 || st === 8) kick(t);
      }
      mus.next += STEP; mus.step++;
    }
  }
  S.music = function (mode) {
    if (!S.musicOn || !ctx()) { if (!S.musicOn) S.stopMusic(); return; }
    if (mus && mus.mode === mode) return; S.stopMusic();
    mus = { mode, step: 0, next: AC.currentTime + .08, timer: setInterval(sched, 80) }; sched();
  };
  S.stopMusic = function () { if (mus) { clearInterval(mus.timer); mus = null; } };
  S.intensity = function (x) { inten = Math.max(0, Math.min(1, x)); };
  S.duck = function (on) { if (musBus) musBus.gain.setTargetAtTime(on ? .22 : .5, AC.currentTime, .1); };
  S.setVolume = function (v) { S.vol = v; if (master) master.gain.value = v; };

  root.FSSound = S;
})(typeof window !== 'undefined' ? window : globalThis);
