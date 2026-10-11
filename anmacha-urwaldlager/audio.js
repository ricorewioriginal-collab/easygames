/* Urwaldlager – Klänge werden im Browser erzeugt (Web Audio): Effekte + Dschungel-Ambiente (Tag/Nacht, Regen, Feuer).
   Keine Audiodateien, keine fremde Musik. Lautstärken getrennt für Effekte und Ambiente. */
(function (root) {
  'use strict';
  let ac = null, master = null, fxBus = null, ambBus = null, wind = null, rainG = null, on = true, ambOn = false, tm = null;
  const vol = { fx: .8, amb: .7 }, env = { night: 0, rain: 0, fire: 0 };
  try { on = localStorage.getItem('ul_snd') !== '0'; const v = JSON.parse(localStorage.getItem('ul_vol') || 'null'); if (v) Object.assign(vol, v); } catch (e) { }
  function ctx() {
    if (!ac) {
      const A = root.AudioContext || root.webkitAudioContext; if (!A) return null;
      try { ac = new A(); master = ac.createGain(); master.gain.value = on ? .8 : 0; master.connect(ac.destination); fxBus = ac.createGain(); fxBus.gain.value = vol.fx; fxBus.connect(master); ambBus = ac.createGain(); ambBus.gain.value = vol.amb; ambBus.connect(master); } catch (e) { ac = null; return null; }
    }
    if (ac.state === 'suspended') { try { ac.resume(); } catch (e) { } }
    return ac;
  }
  function tone(f, d, type, v, when, f2, bus) {
    const c = ctx(); if (!c || !on) return; const t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || .12, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(bus || fxBus); o.start(t); o.stop(t + d + .05);
  }
  let nbuf = null;
  function noiseBuf() { if (!nbuf) { const n = ac.sampleRate * 2; nbuf = ac.createBuffer(1, n, ac.sampleRate); const a = nbuf.getChannelData(0); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1; } return nbuf; }
  function noise(d, v, f0, f1, when, bus) {
    const c = ctx(); if (!c || !on) return; const t = c.currentTime + (when || 0);
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = noiseBuf(); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0 || 800, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + d);
    g.gain.setValueAtTime(v || .15, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(g); g.connect(bus || fxBus); s.start(t); s.stop(t + d + .05);
  }
  function loopNoise(type, freq, gain) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf(); s.loop = true; f.type = type; f.frequency.value = freq; g.gain.value = gain; s.connect(f); f.connect(g); g.connect(ambBus); s.start(); return g; }
  const PADS = [[620, 'square', 880], [150, 'square', 120], [110, 'sawtooth', 70], [420, 'triangle', 640]];
  const S = {
    unlock() { ctx(); },
    isOn() { return on; },
    toggle() { on = !on; try { localStorage.setItem('ul_snd', on ? '1' : '0'); } catch (e) { } if (master) master.gain.value = on ? .8 : 0; if (on) S.ambience(true); return on; },
    vol(k, v) { if (v == null) return vol[k]; vol[k] = Math.max(0, Math.min(1, v)); try { localStorage.setItem('ul_vol', JSON.stringify(vol)); } catch (e) { } if (k === 'fx' && fxBus) fxBus.gain.value = vol.fx; if (k === 'amb' && ambBus) ambBus.gain.value = vol.amb; },
    // Umgebung fürs Ambiente: Nacht 0–1, Regen 0–1, Nähe zum Feuer 0–1
    env(night, rain, fire) { env.night = night; env.rain = rain; env.fire = fire; if (!ac) return; const t = ac.currentTime; if (wind) wind.gain.setTargetAtTime(.03 + rain * .02, t, .5); if (rainG) rainG.gain.setTargetAtTime(rain * .09, t, .8); },
    click() { tone(660, .06, 'triangle', .07); },
    star() { tone(880, .09, 'triangle', .13); tone(1320, .14, 'triangle', .11, .07); },
    bad() { tone(160, .22, 'sawtooth', .13, 0, 70); },
    gag() { noise(.5, .16, 400, 120); tone(130, .4, 'sawtooth', .09, 0, 60); },
    swallow() { tone(300, .12, 'sine', .14, 0, 120); noise(.12, .1, 600, 300); },
    thud() { tone(90, .16, 'sine', .22, 0, 40); },
    splash() { noise(.35, .14, 1800, 300); },
    step() { noise(.07, .04, 500, 300); },
    thunder() { noise(1.6, .22, 180, 50); tone(55, 1.2, 'sine', .12, .05, 35); },
    pad(i) { const p = PADS[i % 4]; tone(p[0], .32, p[1], .1, 0, p[2]); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'triangle', .14, i * .11)); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, .34, 'sawtooth', .09, i * .15)); },
    drum() { tone(120, .18, 'sine', .22, 0, 55); noise(.06, .08, 2000, 900); },
    reveal() { tone(520, .08, 'square', .06); },
    fan() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, .4, 'triangle', .13, i * .1)); },
    ambience(force) {
      if (!ctx() || !on) return; if (ambOn && !force) return; ambOn = true; if (tm) clearTimeout(tm);
      if (!wind) { wind = loopNoise('lowpass', 520, .03); rainG = loopNoise('highpass', 2400, 0); }
      const A = ambBus;
      const loop = () => {
        if (!on) { ambOn = false; return; }
        if (!document.hidden) {
          const r = Math.random();
          if (env.night > .5) { // Grillen und ein Käuzchen
            if (r < .7) for (let i = 0; i < 4; i++) tone(4200 + Math.random() * 200, .05, 'sine', .012, i * .09, 0, A);
            else tone(420, .35, 'sine', .025, 0, 360, A);
          } else if (env.rain < .5) { // Vögel, Frösche, Affenruf
            if (r < .5) { const f = 1800 + Math.random() * 1800; tone(f, .1, 'sine', .035, 0, 0, A); tone(f * 1.25, .12, 'sine', .03, .12, 0, A); if (Math.random() < .5) tone(f * .9, .1, 'sine', .03, .26, 0, A); }
            else if (r < .75) for (let i = 0; i < 3; i++) tone(180 + Math.random() * 30, .09, 'square', .018, i * .13, 140, A);
            else tone(700 + Math.random() * 300, .5, 'sine', .02, 0, 300 + Math.random() * 200, A);
          }
          if (env.fire > .2) for (let i = 0; i < 3; i++) if (Math.random() < env.fire) noise(.04, .06 * env.fire, 2500 + Math.random() * 2000, 0, Math.random() * .8, A);
        }
        tm = setTimeout(loop, env.fire > .2 ? 900 + Math.random() * 900 : 1800 + Math.random() * 3200);
      };
      loop();
    }
  };
  root.USnd = S;
})(typeof window !== 'undefined' ? window : globalThis);
